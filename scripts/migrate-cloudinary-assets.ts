import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";
import { existsSync, readFileSync } from "node:fs";
import { extname, resolve } from "node:path";

type AssetResourceType = "raw" | "video";

type StaticAsset = {
  localPath: string;
  publicId: string;
  resourceType: AssetResourceType;
};

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const force = args.has("--force");
const modelsOnly = args.has("--models-only");
const root = resolve(__dirname, "..");

const staticAssets: StaticAsset[] = [
  {
    localPath: "public/models/saptambu-bottle.glb",
    publicId: "saptambu/models/saptambu-bottle.glb",
    resourceType: "raw",
  },
  {
    localPath: "public/models/saptambu-bottle-web.glb",
    publicId: "saptambu/models/saptambu-bottle-web.glb",
    resourceType: "raw",
  },
  {
    localPath: "public/videos/home-sequence/scene-01.mp4",
    publicId: "saptambu/videos/home-sequence/scene-01",
    resourceType: "video",
  },
  {
    localPath: "public/videos/home-sequence/scene-02.mp4",
    publicId: "saptambu/videos/home-sequence/scene-02",
    resourceType: "video",
  },
  {
    localPath: "public/videos/home-sequence/scene-03.mp4",
    publicId: "saptambu/videos/home-sequence/scene-03",
    resourceType: "video",
  },
  {
    localPath: "public/videos/home-sequence/scene-04.mp4",
    publicId: "saptambu/videos/home-sequence/scene-04",
    resourceType: "video",
  },
  {
    localPath: "public/videos/saptambu-firefly-journey-desktop.mp4",
    publicId: "saptambu/videos/saptambu-firefly-journey-desktop",
    resourceType: "video",
  },
  {
    localPath: "public/videos/saptambu-firefly-journey-mobile.mp4",
    publicId: "saptambu/videos/saptambu-firefly-journey-mobile",
    resourceType: "video",
  },
  {
    localPath: "public/videos/saptambu-river-journey-desktop.mp4",
    publicId: "saptambu/videos/saptambu-river-journey-desktop",
    resourceType: "video",
  },
  {
    localPath: "public/videos/saptambu-river-journey-desktop.webm",
    publicId: "saptambu/videos/saptambu-river-journey-desktop-webm",
    resourceType: "video",
  },
  {
    localPath: "public/videos/saptambu-river-journey-mobile.mp4",
    publicId: "saptambu/videos/saptambu-river-journey-mobile",
    resourceType: "video",
  },
  {
    localPath: "public/videos/saptambu-river-journey-mobile.webm",
    publicId: "saptambu/videos/saptambu-river-journey-mobile-webm",
    resourceType: "video",
  },
];

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

function expectedDeliveryUrl(cloudName: string, asset: StaticAsset) {
  const base = `https://res.cloudinary.com/${cloudName}/${asset.resourceType}/upload/${asset.publicId}`;
  if (asset.resourceType === "raw" || extname(asset.publicId)) return base;
  return `${base}${extname(asset.localPath)}`;
}

async function verifyUrl(url: string) {
  const response = await fetch(url, { method: "HEAD" });
  return {
    contentType: response.headers.get("content-type"),
    ok: response.ok,
    status: response.status,
    url,
  };
}

async function uploadAsset(asset: StaticAsset & { absolutePath: string }) {
  const options = {
    overwrite: true,
    public_id: asset.publicId,
    resource_type: asset.resourceType,
  } as const;

  if (asset.resourceType === "raw") {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload_large(
        asset.absolutePath,
        {
          ...options,
          chunk_size: 6_000_000,
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          if (!result) {
            reject(new Error(`Cloudinary returned no result for ${asset.localPath}`));
            return;
          }
          resolve(result);
        },
      );
    });
  }

  return cloudinary.uploader.upload(asset.absolutePath, options);
}

async function main() {
  loadDotEnv();

  const cloudName = requireEnv("CLOUDINARY_CLOUD_NAME");
  const apiKey = requireEnv("CLOUDINARY_API_KEY");
  const apiSecret = requireEnv("CLOUDINARY_API_SECRET");

  cloudinary.config({
    api_key: apiKey,
    api_secret: apiSecret,
    cloud_name: cloudName,
  });

  const selectedAssets = modelsOnly ? staticAssets.filter((asset) => asset.resourceType === "raw") : staticAssets;
  const plan = selectedAssets.map((asset) => ({
    ...asset,
    absolutePath: resolve(root, asset.localPath),
    expectedUrl: expectedDeliveryUrl(cloudName, asset),
  }));

  const missingFiles = plan.filter((asset) => !existsSync(asset.absolutePath));
  if (missingFiles.length) {
    throw new Error(`Missing static assets: ${missingFiles.map((asset) => asset.localPath).join(", ")}`);
  }

  console.log(
    JSON.stringify(
      {
        dryRun,
        totals: {
          assets: plan.length,
          raw: plan.filter((asset) => asset.resourceType === "raw").length,
          video: plan.filter((asset) => asset.resourceType === "video").length,
        },
        uploads: plan.map((asset) => ({
          expectedUrl: asset.expectedUrl,
          localPath: asset.localPath,
          publicId: asset.publicId,
          resourceType: asset.resourceType,
        })),
      },
      null,
      2,
    ),
  );

  if (dryRun) return;
  if (!force) {
    throw new Error("Refusing to upload static assets without --force. Run dry-run first, then add --force.");
  }

  const uploaded = [];
  const failures = [];

  for (const asset of plan) {
    try {
      const result = await uploadAsset(asset);
      uploaded.push({
        localPath: asset.localPath,
        publicId: asset.publicId,
        resourceType: asset.resourceType,
        secureUrl: result.secure_url,
        expectedUrl: asset.expectedUrl,
      });
      console.log(`Uploaded ${asset.localPath} -> ${result.secure_url}`);
    } catch (error) {
      failures.push({
        localPath: asset.localPath,
        error: error instanceof Error ? error.message : String(error),
      });
      console.warn(`Failed ${asset.localPath}`, error);
    }
  }

  const verifications = [];
  for (const asset of uploaded) {
    verifications.push(await verifyUrl(asset.expectedUrl));
  }

  console.log(JSON.stringify({ uploaded, verifications, failures }, null, 2));

  if (failures.length || verifications.some((item) => !item.ok)) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
