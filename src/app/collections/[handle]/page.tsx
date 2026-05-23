import { notFound } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { ProductCard } from "@/components/product-card";
import { getCategory, listProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function CollectionPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const [category, products] = await Promise.all([getCategory(handle), listProducts({ categorySlug: handle })]);

  if (!category) notFound();

  return (
    <section className="container-page py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b2f22]">Collection</p>
      <h1 className="mt-2 text-4xl font-semibold">{category.title}</h1>
      {category.description ? <p className="mt-3 max-w-2xl text-[#6d5f52]">{category.description}</p> : null}
      {products.length ? (
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            title="No products in this collection yet"
            message="This collection is ready in the admin panel. Add products or assign existing products to publish it."
            action={{ href: "/collections/all", label: "Browse all products" }}
          />
        </div>
      )}
    </section>
  );
}
