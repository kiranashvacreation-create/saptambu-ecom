import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { getDb } from "@/lib/db";
import { toNumber } from "@/lib/money";

export type ProductSummary = {
  id: string;
  title: string;
  slug: string;
  description: string;
  sku: string | null;
  price: number;
  salePrice: number | null;
  compareAtPrice: number | null;
  stock: number;
  lowStockThreshold: number;
  status: string;
  showWhenSoldOut: boolean;
  tags: string[];
  image: string | null;
  categories: { title: string; slug: string }[];
};

export type CategorySummary = {
  id: string;
  title: string;
  slug: string;
  description: string;
  productCount: number;
};

const productInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  categories: { include: { category: true } },
};

type DbProduct = {
  id: string;
  title: string;
  slug: string;
  description: string;
  sku: string | null;
  price: unknown;
  salePrice: unknown | null;
  compareAtPrice: unknown | null;
  stock: number;
  lowStockThreshold: number;
  status: string;
  showWhenSoldOut: boolean;
  tags: string[];
  images?: { url: string }[];
  categories?: { category: { title: string; slug: string } }[];
};

function mapProduct(product: DbProduct): ProductSummary {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    sku: product.sku,
    price: toNumber(product.price),
    salePrice: product.salePrice == null ? null : toNumber(product.salePrice),
    compareAtPrice: product.compareAtPrice == null ? null : toNumber(product.compareAtPrice),
    stock: product.stock,
    lowStockThreshold: product.lowStockThreshold,
    status: product.status,
    showWhenSoldOut: product.showWhenSoldOut,
    tags: product.tags || [],
    image: product.images?.[0]?.url || null,
    categories: (product.categories || []).map((entry) => ({
      title: entry.category.title,
      slug: entry.category.slug,
    })),
  };
}

export async function listProducts(options?: {
  categorySlug?: string;
  includeInactive?: boolean;
  query?: string;
}) {
  noStore();
  const db = getDb();
  if (!db) return [];

  const products = await db.product
    .findMany({
      where: {
        ...(options?.includeInactive ? {} : { status: "ACTIVE" }),
        ...(options?.query
          ? {
              OR: [
                { title: { contains: options.query, mode: "insensitive" } },
                { description: { contains: options.query, mode: "insensitive" } },
                { tags: { has: options.query } },
              ],
            }
          : {}),
        ...(options?.categorySlug
          ? { categories: { some: { category: { slug: options.categorySlug } } } }
          : {}),
      },
      include: productInclude,
      orderBy: [{ status: "asc" }, { title: "asc" }],
    })
    .catch(() => []);

  return products.map(mapProduct);
}

export async function getProduct(slug: string, includeInactive = false) {
  noStore();
  const db = getDb();
  if (!db) return null;

  const product = await db.product
    .findUnique({
      where: { slug },
      include: productInclude,
    })
    .catch(() => null);

  if (!product || (!includeInactive && product.status !== "ACTIVE")) return null;
  return mapProduct(product);
}

export async function listCategories() {
  noStore();
  const db = getDb();
  if (!db) return [];

  const categories = await db.category
    .findMany({
      include: { _count: { select: { products: true } } },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    })
    .catch(() => []);

  return categories.map((category) => ({
    id: category.id,
    title: category.title,
    slug: category.slug,
    description: category.description,
    productCount: category._count.products,
  }));
}

export async function getCategory(slug: string) {
  noStore();
  const db = getDb();
  if (!db) return null;

  const category = await db.category
    .findUnique({
      where: { slug },
      include: { _count: { select: { products: true } } },
    })
    .catch(() => null);

  if (!category) return null;

  return {
    id: category.id,
    title: category.title,
    slug: category.slug,
    description: category.description,
    productCount: category._count.products,
  };
}

export function currentPrice(product: ProductSummary) {
  return product.salePrice ?? product.price;
}
