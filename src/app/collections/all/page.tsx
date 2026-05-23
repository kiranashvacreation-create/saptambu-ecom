import { EmptyState } from "@/components/empty-state";
import { ProductCard } from "@/components/product-card";
import { listCategories, listProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function AllProductsPage() {
  const [products, categories] = await Promise.all([listProducts(), listCategories()]);

  return (
    <section className="container-page py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b2f22]">Catalog</p>
      <h1 className="mt-2 text-4xl font-semibold">Products</h1>
      <div className="mt-5 flex flex-wrap gap-2">
        {categories.map((category) => (
          <a
            key={category.slug}
            href={`/collections/${category.slug}`}
            className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium"
          >
            {category.title}
          </a>
        ))}
      </div>
      {products.length ? (
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            title="No products yet"
            message="Run the seed command after configuring Railway PostgreSQL, then manage every product from admin."
          />
        </div>
      )}
    </section>
  );
}
