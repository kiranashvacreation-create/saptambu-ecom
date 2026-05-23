import { ProductCard } from "@/components/product-card";
import { listProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const products = q ? await listProducts({ query: q }) : [];

  return (
    <section className="container-page py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b2f22]">Search</p>
      <h1 className="mt-2 text-4xl font-semibold">Search products</h1>
      <form className="mt-6 flex max-w-2xl gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search puja essentials, sacred waters..."
          className="focus-ring h-12 flex-1 rounded-md border border-[var(--border)] bg-white px-4"
        />
        <button className="focus-ring h-12 rounded-md bg-[#1c6d62] px-5 font-semibold text-white">Search</button>
      </form>
      {q ? (
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
