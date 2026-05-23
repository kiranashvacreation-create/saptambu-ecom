import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { currentPrice, getProduct } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  const price = currentPrice(product);

  return (
    <section className="container-page grid gap-10 py-10 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="grid gap-4">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-[#f1ece2]">
          {product.image ? (
            <Image src={product.image} alt={product.title} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-[#7a6a5a]">No image</div>
          )}
        </div>
      </div>
      <div>
        <div className="flex flex-wrap gap-2">
          {product.categories.map((category) => (
            <Link
              key={category.slug}
              href={`/collections/${category.slug}`}
              className="rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-semibold text-[#6d5f52]"
            >
              {category.title}
            </Link>
          ))}
        </div>
        <h1 className="mt-4 text-4xl font-semibold leading-tight">{product.title}</h1>
        <div className="mt-4 flex flex-wrap items-baseline gap-3">
          <span className="text-3xl font-semibold text-[#1c6d62]">{formatMoney(price)}</span>
          {product.salePrice ? <span className="text-lg text-[#8a7a68] line-through">{formatMoney(product.price)}</span> : null}
        </div>
        <p className="mt-2 text-sm text-[#7a6a5a]">
          {product.stock > 0 ? `${product.stock} unit(s) available` : "Currently sold out"}
        </p>
        <div className="prose-lite mt-6 max-w-2xl text-[#4e443c]">
          {product.description ? <p>{product.description}</p> : <p>Authentic product from Saptambu by Kiranashva Creation.</p>}
        </div>
        <div className="mt-8 max-w-sm">
          <AddToCart
            product={{
              id: product.id,
              title: product.title,
              slug: product.slug,
              price,
              image: product.image,
              stock: product.stock,
            }}
          />
        </div>
      </div>
    </section>
  );
}
