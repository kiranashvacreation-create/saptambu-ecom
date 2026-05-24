import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { currentPrice, listRecentProducts } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import { getPublishedMediaArticle, listRecentPublishedMediaArticles } from "@/lib/media";

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
  const [article, recentMedia, recentProducts] = await Promise.all([
    getPublishedMediaArticle(slug),
    listRecentPublishedMediaArticles({ excludeSlug: slug, limit: 4 }),
    listRecentProducts(3),
  ]);

  if (!article) notFound();

  const publishedLabel = formatDate(article.publishedAt);

  return (
    <main className="relative overflow-hidden bg-[#fbfaf6] text-[#1f1812]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_4%,rgba(197,138,43,0.22),transparent_30%),radial-gradient(circle_at_86%_16%,rgba(28,109,98,0.12),transparent_28%),linear-gradient(180deg,#fffaf0_0%,#fbfaf6_48%,#f2eadb_100%)]" />
      <article className="container-page py-10 sm:py-14">
        <Link href="/pages/media-coverage-1" className="focus-ring inline-flex items-center gap-2 text-sm font-semibold text-[#1c6d62]">
          <ArrowLeft size={16} />
          Back to media
        </Link>

        <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div>
            <div className="overflow-hidden rounded-[2rem] border border-[#ead8b8] bg-white/78 p-4 shadow-[0_30px_90px_rgba(57,34,18,0.1)] backdrop-blur-xl">
              {article.coverImageUrl ? (
                <div className="relative aspect-[16/9] overflow-hidden rounded-[1.45rem] bg-[#f1ece2]">
                  <Image
                    src={article.coverImageUrl}
                    alt={article.coverImageAlt || article.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 760px"
                    className="object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="grid aspect-[16/9] place-items-center rounded-[1.45rem] bg-[linear-gradient(135deg,#fff2cb,#ead0a1)] text-[#9b2f22]">
                  Media Feature
                </div>
              )}

              <div className="p-2 pt-7 sm:p-5 sm:pt-8">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9b2f22]">
                  {[article.sourceName, publishedLabel].filter(Boolean).join(" · ") || "Media"}
                </p>
                <h1 className="mt-4 text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.035em] text-[#1c1510] sm:text-5xl lg:text-6xl">
                  {article.title}
                </h1>
                {article.excerpt ? <p className="mt-6 max-w-3xl text-lg leading-8 text-[#66584a]">{article.excerpt}</p> : null}
                {article.sourceUrl ? (
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring mt-7 inline-flex items-center gap-2 rounded-full border border-[#d9c8aa] bg-white/75 px-5 py-3 text-sm font-semibold text-[#1c6d62] shadow-sm hover:-translate-y-0.5 hover:border-[#1c6d62]/35"
                  >
                    Open original source
                    <ArrowUpRight size={15} />
                  </a>
                ) : null}
              </div>
            </div>

            <div className="prose-lite mt-8 rounded-[1.5rem] border border-[#ead8b8] bg-white/72 p-6 text-[#4e443c] shadow-[0_22px_60px_rgba(57,34,18,0.07)] sm:p-8" dangerouslySetInnerHTML={{ __html: article.bodyHtml }} />
          </div>

          <aside className="grid gap-5 lg:sticky lg:top-24">
            <section className="rounded-[1.5rem] border border-[#ead8b8] bg-white/78 p-5 shadow-[0_22px_60px_rgba(57,34,18,0.08)] backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9b2f22]">Recent Media</p>
              <div className="mt-5 grid gap-4">
                {recentMedia.length ? (
                  recentMedia.map((item) => (
                    <Link key={item.id} href={`/media/${item.slug}`} className="group block rounded-2xl border border-[#ead8b8]/75 bg-[#fffaf0]/72 p-4 hover:-translate-y-0.5 hover:border-[#d9bb83]">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b6534]">{item.sourceName || "Saptambu Media"}</p>
                      <h2 className="mt-2 line-clamp-2 font-semibold leading-snug text-[#241a14]">{item.title}</h2>
                      <p className="mt-2 text-xs leading-5 text-[#756756]">{formatDate(item.publishedAt) || "Media feature"}</p>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-[#756756]">More media stories will appear here as they are published.</p>
                )}
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-[#201712] bg-[#17110e] p-5 text-[#fff8e7] shadow-[0_28px_70px_rgba(31,24,18,0.18)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#dfb45f]">Recently Added Products</p>
              <div className="mt-5 grid gap-4">
                {recentProducts.length ? (
                  recentProducts.map((product) => (
                    <Link key={product.id} href={`/products/${product.slug}`} className="group grid grid-cols-[76px_1fr] gap-3 rounded-2xl border border-white/10 bg-white/8 p-3 hover:-translate-y-0.5 hover:bg-white/12">
                      <div className="relative aspect-square overflow-hidden rounded-xl bg-[#2d2219]">
                        {product.image ? (
                          <Image src={product.image} alt={product.title} fill sizes="76px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="grid h-full place-items-center text-[0.65rem] text-[#d8c8af]">No image</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h2 className="line-clamp-2 text-sm font-semibold leading-snug">{product.title}</h2>
                        <p className="mt-1 text-xs text-[#d8c8af]">{product.categories[0]?.title || "Saptambu"}</p>
                        <p className="mt-2 text-sm font-semibold text-[#dfb45f]">{formatMoney(currentPrice(product))}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-[#d8c8af]">Products will appear here after they are published.</p>
                )}
              </div>
            </section>
          </aside>
        </section>
      </article>
    </main>
  );
}
