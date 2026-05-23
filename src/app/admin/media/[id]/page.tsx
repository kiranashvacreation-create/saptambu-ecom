import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { MediaArticleForm } from "@/components/media-article-form";
import { requireAdmin } from "@/lib/auth";
import { requireDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditMediaArticlePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const article = await requireDb().mediaArticle.findUnique({ where: { id } });

  if (!article) notFound();

  return (
    <AdminShell>
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b2f22]">Media</p>
        <h2 className="mt-1 text-2xl font-semibold">Edit media article</h2>
      </div>
      <MediaArticleForm article={article} />
    </AdminShell>
  );
}
