import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { requireDb } from "@/lib/db";

export const dynamic = "force-dynamic";

function formatDate(value: Date | null) {
  return value
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
      }).format(value)
    : "Unscheduled";
}

export default async function AdminMediaPage() {
  await requireAdmin();
  const articles = await requireDb().mediaArticle.findMany({
    orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }, { updatedAt: "desc" }],
  });

  return (
    <AdminShell>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Media collection</h2>
          <p className="mt-1 text-sm text-[#6d5f52]">Publish press stories, images, and rich article pages.</p>
        </div>
        <Link href="/admin/media/new" className="focus-ring rounded-md bg-[#1c6d62] px-4 py-2 text-sm font-semibold text-white">
          New media article
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-white">
        <div className="grid grid-cols-[90px_1fr_120px_120px] gap-4 border-b border-[var(--border)] bg-[#f7f0e8] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#6d5f52]">
          <span>Image</span>
          <span>Title</span>
          <span>Status</span>
          <span>Published</span>
        </div>
        {articles.length ? (
          articles.map((article) => (
            <Link
              key={article.id}
              href={`/admin/media/${article.id}`}
              className="grid grid-cols-[90px_1fr_120px_120px] gap-4 border-b border-[var(--border)] px-4 py-4 text-sm transition hover:bg-[#fbf7f1]"
            >
              <span className="block h-14 overflow-hidden rounded-md bg-[#eee4d7]">
                {article.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={article.coverImageUrl} alt="" className="h-full w-full object-cover" />
                ) : null}
              </span>
              <span>
                <span className="block font-semibold">{article.title}</span>
                <span className="mt-1 block truncate text-[#6d5f52]">{article.excerpt || article.slug}</span>
              </span>
              <span>{article.status}</span>
              <span>{formatDate(article.publishedAt)}</span>
            </Link>
          ))
        ) : (
          <div className="px-4 py-10 text-center text-sm text-[#6d5f52]">No media articles yet.</div>
        )}
      </div>
    </AdminShell>
  );
}
