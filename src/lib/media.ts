import { getDb } from "@/lib/db";

export async function listPublishedMediaArticles() {
  const db = getDb();
  if (!db) return [];

  return db.mediaArticle.findMany({
    orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
    where: {
      publishedAt: { lte: new Date() },
      status: "PUBLISHED",
    },
  });
}

export async function getPublishedMediaArticle(slug: string) {
  const db = getDb();
  if (!db) return null;

  return db.mediaArticle.findFirst({
    where: {
      publishedAt: { lte: new Date() },
      slug,
      status: "PUBLISHED",
    },
  });
}
