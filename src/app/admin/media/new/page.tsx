import { AdminShell } from "@/components/admin-shell";
import { MediaArticleForm } from "@/components/media-article-form";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NewMediaArticlePage() {
  await requireAdmin();

  return (
    <AdminShell>
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b2f22]">Media</p>
        <h2 className="mt-1 text-2xl font-semibold">New media article</h2>
      </div>
      <MediaArticleForm />
    </AdminShell>
  );
}
