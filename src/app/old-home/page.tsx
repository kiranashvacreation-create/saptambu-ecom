import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ProductCard } from "@/components/product-card";
import { SaptambuScrollJourney } from "@/components/saptambu-scroll-journey";
import { listCategories, listProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function OldHomePage() {
  const [products, categories] = await Promise.all([listProducts(), listCategories()]);
  const featured = products.slice(0, 8);
  const collectionPreview = categories.slice(0, 4);

  return (
    <>
      <SaptambuScrollJourney />

      <section id="shop" className="container-page mt-16 scroll-mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b2f22]">Collections</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Shop by ritual need</h2>
          </div>
          <Link href="/collections/all" className="inline-flex items-center gap-2 font-semibold text-[#1c6d62]">
            View all products
            <ArrowRight size={17} />
          </Link>
        </div>
        {collectionPreview.length ? (
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {collectionPreview.map((category, index) => (
              <Link
                key={category.slug}
                href={`/collections/${category.slug}`}
                className="focus-ring group relative min-h-44 overflow-hidden rounded-lg border border-[#e1d4bf] bg-white p-5 shadow-sm"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-[#c58a2b]" />
                <div className="absolute bottom-0 right-0 h-24 w-24 translate-x-8 translate-y-8 rounded-full border border-[#d5a04d]/35" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9b2f22]">0{index + 1}</p>
                <p className="mt-8 text-xl font-semibold leading-tight">{category.title}</p>
                <p className="mt-3 text-sm text-[#7a6a5a]">{category.productCount} products</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#1c6d62]">
                  Explore <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      <section className="container-page mt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b2f22]">Featured</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Ready for worship</h2>
          </div>
        </div>
        {featured.length ? (
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState
              title="Catalog is waiting for setup"
              message="Connect Railway PostgreSQL and run the seed command to import the scanned 55 products."
              action={{ href: "/admin", label: "Open admin" }}
            />
          </div>
        )}
      </section>
    </>
  );
}
