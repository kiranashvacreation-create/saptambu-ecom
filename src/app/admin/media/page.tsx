import Link from "next/link";
import { deleteMediaArticleAction } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin-shell";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
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
        <div className="grid grid-cols-[90px_1fr_120px_120px_90px] gap-4 border-b border-[var(--border)] bg-[#f7f0e8] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#6d5f52]">
          <span>Image</span>
          <span>Title</span>
          <span>Status</span>
          <span>Published</span>
          <span>Action</span>
        </div>
        {articles.length ? (
          articles.map((article) => (
            <div
              key={article.id}
              className="grid grid-cols-[90px_1fr_120px_120px_90px] gap-4 border-b border-[var(--border)] px-4 py-4 text-sm transition hover:bg-[#fbf7f1]"
            >
              <span className="block h-14 overflow-hidden rounded-md bg-[#eee4d7]">
                {article.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={article.coverImageUrl} alt="" className="h-full w-full object-cover" />
                ) : null}
              </span>
              <Link href={`/admin/media/${article.id}`} className="transition hover:text-[#9b2f22]">
                <span className="block font-semibold">{article.title}</span>
                <span className="mt-1 block truncate text-[#6d5f52]">{article.excerpt || article.slug}</span>
              </Link>
              <span>{article.status}</span>
              <span>{formatDate(article.publishedAt)}</span>
              <form action={deleteMediaArticleAction}>
                <input type="hidden" name="id" value={article.id} />
                <ConfirmSubmitButton
                  className="focus-ring h-8 rounded-md border border-red-200 bg-red-50 px-2 text-xs font-semibold text-red-800"
                  confirmMessage={`Permanently delete "${article.title}"?`}
                >
                  Delete
                </ConfirmSubmitButton>
              </form>
            </div>
          ))
        ) : (
          <div className="px-4 py-10 text-center text-sm text-[#6d5f52]">No media articles yet.</div>
        )}
      </div>
    </AdminShell>
  );
}
