import Link from "next/link";
import { listPublishedMediaArticles } from "@/lib/media";

export const dynamic = "force-dynamic";

function formatDate(value: Date | null) {
  return value
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
      }).format(value)
    : "Media";
}

export default async function MediaCoveragePage() {
  const articles = await listPublishedMediaArticles();

  return (
    <section className="container-page py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b2f22]">Media</p>
      <h1 className="mt-2 text-4xl font-semibold">Media Coverage</h1>
      <div className="prose-lite mt-6 max-w-3xl text-[#4e443c]">
        <p>
          Saptambu brings together sacred waters and ritual essentials for modern homes while preserving devotional
          authenticity. Media links and quotes can be edited from the admin content settings.
        </p>
      </div>
      {articles.length ? (
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/media/${article.slug}`}
              className="group overflow-hidden rounded-lg border border-[var(--border)] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="aspect-[16/10] bg-[#eee4d7]">
                {article.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={article.coverImageUrl} alt={article.coverImageAlt || article.title} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9b2f22]">
                  {article.sourceName || formatDate(article.publishedAt)}
                </p>
                <h2 className="mt-3 text-2xl font-semibold leading-tight group-hover:text-[#1c6d62]">{article.title}</h2>
                {article.excerpt ? <p className="mt-3 text-sm leading-6 text-[#6d5f52]">{article.excerpt}</p> : null}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-lg border border-dashed border-[var(--border)] bg-white p-8 text-sm text-[#6d5f52]">
          Media stories will appear here after they are published from admin.
        </div>
      )}
    </section>
  );
}
