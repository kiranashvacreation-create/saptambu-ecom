import { PrismaPg } from "@prisma/adapter-pg";
import { v2 as cloudinary } from "cloudinary";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { Prisma, PrismaClient } from "../src/generated/prisma/client";
import { fallbackMediaCoverageItems } from "../src/lib/media-coverage";

type UploadPlanItem = {
  source: "product" | "media" | "fallback-media";
  id: string;
  currentUrl: string;
  publicId: string;
  folder: string;
  label: string;
};

type UploadResult = UploadPlanItem & {
  newUrl: string;
};

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const force = args.has("--force");
const root = resolve(__dirname, "..");
const fallbackMediaPath = resolve(root, "src/lib/media-coverage.ts");

function loadDotEnv() {
  const envPath = resolve(root, ".env");
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;

    process.env[key] = rawValue.trim().replace(/^['"]|['"]$/g, "");
  }
}

function envValue(key: string) {
  const value = (process.env[key] || "").trim().replace(/^['"]|['"]$/g, "").trim();
  if (!value || value.startsWith("your-")) return "";
  return value;
}

function requireEnv(key: string) {
  const value = envValue(key);
  if (!value) throw new Error(`${key} is not configured.`);
  return value;
}

function isCloudinaryUrl(url: string | null | undefined) {
  return !!url && /\/\/res\.cloudinary\.com\//.test(url);
}

function isRemoteImageUrl(url: string | null | undefined) {
  return !!url && /^https?:\/\//i.test(url) && !isCloudinaryUrl(url);
}

function slugPart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function uniqueByUrl(items: UploadPlanItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.currentUrl)) return false;
    seen.add(item.currentUrl);
    return true;
  });
}

async function uploadItem(item: UploadPlanItem): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(item.currentUrl, {
    folder: item.folder,
    public_id: item.publicId,
    overwrite: true,
    resource_type: "image",
  });

  return { ...item, newUrl: result.secure_url };
}

function updateFallbackMediaUrls(results: UploadResult[]) {
  const fallbackResults = results.filter((result) => result.source === "fallback-media");
  if (!fallbackResults.length) return;

  let source = readFileSync(fallbackMediaPath, "utf8");
  for (const result of fallbackResults) {
    source = source.replaceAll(result.currentUrl, result.newUrl);
  }
  writeFileSync(fallbackMediaPath, source);
}

async function runDbUpdates(prisma: PrismaClient, updates: Prisma.PrismaPromise<unknown>[]) {
  const batchSize = 25;

  for (let index = 0; index < updates.length; index += batchSize) {
    await prisma.$transaction(updates.slice(index, index + batchSize), { timeout: 30_000 });
  }
}

async function main() {
  loadDotEnv();

  const cloudName = requireEnv("CLOUDINARY_CLOUD_NAME");
  const apiKey = requireEnv("CLOUDINARY_API_KEY");
  const apiSecret = requireEnv("CLOUDINARY_API_SECRET");
  const databaseUrl = requireEnv("DATABASE_URL");

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

  try {
    const [productImages, mediaArticles, orderItems] = await Promise.all([
      prisma.productImage.findMany({
        include: { product: { select: { slug: true, title: true } } },
        orderBy: [{ productId: "asc" }, { sortOrder: "asc" }],
      }),
      prisma.mediaArticle.findMany({ orderBy: [{ slug: "asc" }] }),
      prisma.orderItem.findMany({
        where: { imageUrl: { not: null } },
        select: { id: true, imageUrl: true },
      }),
    ]);

    const plan: UploadPlanItem[] = [
      ...productImages.filter((image) => isRemoteImageUrl(image.url)).map((image) => ({
        source: "product" as const,
        id: image.id,
        currentUrl: image.url,
        publicId: `${slugPart(image.product.slug || image.product.title)}-${image.sortOrder}-${image.id}`,
        folder: "saptambu/products",
        label: `${image.product.title} #${image.sortOrder + 1}`,
      })),
      ...mediaArticles.filter((article) => isRemoteImageUrl(article.coverImageUrl)).map((article) => ({
        source: "media" as const,
        id: article.id,
        currentUrl: article.coverImageUrl || "",
        publicId: `${slugPart(article.slug)}-cover`,
        folder: "saptambu/media",
        label: article.title,
      })),
      ...fallbackMediaCoverageItems.filter((item) => isRemoteImageUrl(item.imageUrl)).map((item) => ({
        source: "fallback-media" as const,
        id: item.id,
        currentUrl: item.imageUrl || "",
        publicId: `${slugPart(item.id)}-cover`,
        folder: "saptambu/media",
        label: item.sourceName,
      })),
    ];

    const uniquePlan = uniqueByUrl(plan);
    const orderItemUrls = new Set(orderItems.map((item) => item.imageUrl).filter(Boolean));

    console.log(
      JSON.stringify(
        {
          dryRun,
          totals: {
            uploadCandidates: uniquePlan.length,
            productImages: productImages.length,
            productImagesAlreadyCloudinary: productImages.filter((image) => isCloudinaryUrl(image.url)).length,
            mediaArticles: mediaArticles.length,
            mediaCoversAlreadyCloudinary: mediaArticles.filter((article) => isCloudinaryUrl(article.coverImageUrl)).length,
            orderItemImageSnapshots: orderItems.length,
            orderItemSnapshotsMatchingCandidates: uniquePlan.filter((item) => orderItemUrls.has(item.currentUrl)).length,
          },
          uploads: uniquePlan.map((item) => ({
            source: item.source,
            label: item.label,
            folder: item.folder,
            publicId: item.publicId,
            currentUrl: item.currentUrl,
          })),
        },
        null,
        2,
      ),
    );

    if (dryRun) return;
    if (!force && uniquePlan.length > 100) {
      throw new Error(`Refusing to upload ${uniquePlan.length} assets without --force. Run with --dry-run first, then add --force.`);
    }

    const results: UploadResult[] = [];
    const failures: { item: UploadPlanItem; error: string }[] = [];

    for (const item of uniquePlan) {
      try {
        const result = await uploadItem(item);
        results.push(result);
        console.log(`Uploaded ${item.source}: ${item.label} -> ${result.newUrl}`);
      } catch (error) {
        failures.push({ item, error: error instanceof Error ? error.message : String(error) });
        console.warn(`Failed ${item.source}: ${item.label}`, error);
      }
    }

    const urlMap = new Map(results.map((result) => [result.currentUrl, result.newUrl]));
    const dbUpdates = [];

    for (const image of productImages) {
      const newUrl = urlMap.get(image.url);
      if (newUrl) dbUpdates.push(prisma.productImage.update({ where: { id: image.id }, data: { url: newUrl } }));
    }

    for (const article of mediaArticles) {
      const newUrl = article.coverImageUrl ? urlMap.get(article.coverImageUrl) : null;
      if (newUrl) dbUpdates.push(prisma.mediaArticle.update({ where: { id: article.id }, data: { coverImageUrl: newUrl } }));
    }

    for (const item of orderItems) {
      const newUrl = item.imageUrl ? urlMap.get(item.imageUrl) : null;
      if (newUrl) dbUpdates.push(prisma.orderItem.update({ where: { id: item.id }, data: { imageUrl: newUrl } }));
    }

    if (dbUpdates.length) {
      await runDbUpdates(prisma, dbUpdates);
    }

    updateFallbackMediaUrls(results);

    console.log(
      JSON.stringify(
        {
          uploaded: results.length,
          dbRowsUpdated: dbUpdates.length,
          fallbackUrlsUpdated: results.filter((result) => result.source === "fallback-media").length,
          failures: failures.map((failure) => ({
            source: failure.item.source,
            label: failure.item.label,
            error: failure.error,
          })),
        },
        null,
        2,
      ),
    );

    if (failures.length) process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
