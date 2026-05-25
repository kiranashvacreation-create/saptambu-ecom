import { getDb } from "@/lib/db";

export async function listPublishedMediaArticles() {
  const db = getDb();
  if (!db) return [];

  try {
    return await db.mediaArticle.findMany({
      orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
      where: {
        publishedAt: { lte: new Date() },
        status: "PUBLISHED",
      },
    });
  } catch (error) {
    console.warn("Unable to load published media articles; using fallback media coverage.", error);
    return [];
  }
}

export async function listRecentPublishedMediaArticles(options?: { excludeSlug?: string; limit?: number }) {
  const db = getDb();
  if (!db) return [];

  try {
    return await db.mediaArticle.findMany({
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: options?.limit ?? 4,
      where: {
        ...(options?.excludeSlug ? { NOT: { slug: options.excludeSlug } } : {}),
        publishedAt: { lte: new Date() },
        status: "PUBLISHED",
      },
    });
  } catch (error) {
    console.warn("Unable to load recent media articles.", error);
    return [];
  }
}

export async function getPublishedMediaArticle(slug: string) {
  const db = getDb();
  if (!db) return null;

  try {
    return await db.mediaArticle.findFirst({
      where: {
        publishedAt: { lte: new Date() },
        slug,
        status: "PUBLISHED",
      },
    });
  } catch (error) {
    console.warn("Unable to load media article; checking fallback media coverage.", error);
    return null;
  }
}
