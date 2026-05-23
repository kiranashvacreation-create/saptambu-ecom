import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { hash } from "bcryptjs";

const shop = "https://www.kiranashvacreation.com";
const defaultStock = Number(process.env.DEFAULT_SEED_STOCK || 10);

const categories = [
  {
    title: "Daily Puja Essentials",
    slug: "daily-puja-essentials",
    description: "Diyas, agarbatti, kapoor, chandan, thalis, bells, and daily worship items.",
    sortOrder: 1,
  },
  {
    title: "Sacred Waters",
    slug: "sacred-waters",
    description: "Holy river waters for puja, abhishek, havan, and life ceremonies.",
    sortOrder: 2,
  },
  {
    title: "Spiritual, Wellness & Japmala",
    slug: "spiritual-wellness-japmala",
    description: "Rudraksha, Tulsi Mala, crystals, yantras, and spiritual wellness products.",
    sortOrder: 3,
  },
  {
    title: "Sale / Combo Offers & Gifts",
    slug: "sale-combo-offers-gifts",
    description: "Combo offers, festival gifts, and curated spiritual sets.",
    sortOrder: 4,
  },
];

type ShopifyProduct = {
  title: string;
  handle: string;
  body_html?: string;
  vendor?: string;
  product_type?: string;
  tags?: string[];
  images?: { src: string; alt?: string | null }[];
  variants?: { sku?: string | null; price: string; compare_at_price?: string | null; available?: boolean }[];
};

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${shop}${path}`, {
    headers: { "user-agent": "Saptambu custom store seed" },
  });
  if (!response.ok) throw new Error(`Failed to fetch ${path}: ${response.status}`);
  return response.json() as Promise<T>;
}

function cleanHtml(html = "") {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&ndash;/g, "-")
    .replace(/\s+\n/g, "\n")
    .trim();
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required to seed.");

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@saptambu.local").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    create: { email: adminEmail, passwordHash: await hash(adminPassword, 12) },
    update: {},
  });

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      create: category,
      update: category,
    });
  }

  const productsResponse = await fetchJson<{ products: ShopifyProduct[] }>("/products.json?limit=250");
  const products = productsResponse.products;
  const categoryProductHandles = new Map<string, Set<string>>();

  for (const category of categories) {
    try {
      const response = await fetchJson<{ products: ShopifyProduct[] }>(
        `/collections/${category.slug}/products.json?limit=250`,
      );
      categoryProductHandles.set(category.slug, new Set(response.products.map((product) => product.handle)));
    } catch {
      categoryProductHandles.set(category.slug, new Set());
    }
  }

  for (const product of products) {
    const variant = product.variants?.[0];
    const price = Number(variant?.price || 0);
    const compareAt = variant?.compare_at_price ? Number(variant.compare_at_price) : null;

    const saved = await prisma.product.upsert({
      where: { slug: product.handle },
      create: {
        title: product.title,
        slug: product.handle,
        description: cleanHtml(product.body_html || ""),
        sku: variant?.sku || null,
        price,
        compareAtPrice: compareAt,
        stock: defaultStock,
        lowStockThreshold: 5,
        status: "ACTIVE",
        showWhenSoldOut: true,
        tags: product.tags || [],
      },
      update: {
        title: product.title,
        description: cleanHtml(product.body_html || ""),
        sku: variant?.sku || null,
        price,
        compareAtPrice: compareAt,
        tags: product.tags || [],
      },
    });

    await prisma.productImage.deleteMany({ where: { productId: saved.id } });
    if (product.images?.length) {
      await prisma.productImage.createMany({
        data: product.images.map((image, index) => ({
          productId: saved.id,
          url: image.src,
          alt: image.alt || product.title,
          sortOrder: index,
        })),
      });
    }

    await prisma.productCategory.deleteMany({ where: { productId: saved.id } });
    for (const category of categories) {
      if (categoryProductHandles.get(category.slug)?.has(product.handle)) {
        const savedCategory = await prisma.category.findUniqueOrThrow({ where: { slug: category.slug } });
        await prisma.productCategory.create({
          data: { productId: saved.id, categoryId: savedCategory.id },
        });
      }
    }
  }

  await prisma.pageContent.upsert({
    where: { slug: "media-coverage-1" },
    create: {
      slug: "media-coverage-1",
      title: "Media Coverage",
      body: "Media coverage content can be edited from admin settings.",
    },
    update: {},
  });

  await prisma.$disconnect();
  console.log(`Seeded ${products.length} products and ${categories.length} categories.`);
  console.log(`Admin login: ${adminEmail}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
