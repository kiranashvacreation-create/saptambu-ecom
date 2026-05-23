import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedMediaArticle } from "@/lib/media";

export const dynamic = "force-dynamic";

function formatDate(value: Date | null) {
  return value
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "long",
      }).format(value)
    : null;
}

export default async function MediaArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getPublishedMediaArticle(slug);

  if (!article) notFound();

  return (
    <article className="container-page py-12">
      <Link href="/pages/media-coverage-1" className="text-sm font-semibold text-[#1c6d62]">
        Back to media
      </Link>
      <div className="mt-6 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b2f22]">
          {[article.sourceName, formatDate(article.publishedAt)].filter(Boolean).join(" · ") || "Media"}
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">{article.title}</h1>
        {article.excerpt ? <p className="mt-5 text-lg leading-8 text-[#6d5f52]">{article.excerpt}</p> : null}
        {article.sourceUrl ? (
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[#1c6d62]"
          >
            Open original source
          </a>
        ) : null}
      </div>
      {article.coverImageUrl ? (
        <div className="mt-8 overflow-hidden rounded-xl border border-[var(--border)] bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={article.coverImageUrl} alt={article.coverImageAlt || article.title} className="max-h-[560px] w-full object-cover" />
        </div>
      ) : null}
      <div className="prose-lite mt-10 max-w-3xl text-[#4e443c]" dangerouslySetInnerHTML={{ __html: article.bodyHtml }} />
    </article>
  );
}
