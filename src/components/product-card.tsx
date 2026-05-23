import Image from "next/image";
import Link from "next/link";
import { ProductSummary, currentPrice } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";

export function ProductCard({ product }: { product: ProductSummary }) {
  const price = currentPrice(product);
  const soldOut = product.stock <= 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="focus-ring group grid overflow-hidden rounded-lg border border-[#e1d4bf] bg-white shadow-sm hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(25,18,14,0.12)]"
    >
      <div className="relative aspect-square overflow-hidden bg-[#f1ece2]">
        <div className="absolute inset-3 z-10 border border-white/55 opacity-0 transition-opacity group-hover:opacity-100" />
        {product.image ? (
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="grid h-full place-items-center bg-[linear-gradient(145deg,#fff9ec,#dfc99e)] text-sm text-[#7a6a5a]">
            No image
          </div>
        )}
        {soldOut ? (
          <span className="absolute left-3 top-3 z-20 rounded-full bg-[#211b17] px-3 py-1 text-xs font-semibold text-white">
            Sold out
          </span>
        ) : product.salePrice ? (
          <span className="absolute left-3 top-3 z-20 rounded-full bg-[#9b2f22] px-3 py-1 text-xs font-semibold text-white">
            Sale
          </span>
        ) : null}
      </div>
      <div className="grid min-h-36 gap-3 p-4">
        <div>
          <p className="line-clamp-2 min-h-11 font-semibold leading-snug">{product.title}</p>
          <p className="mt-1 text-xs text-[#7a6a5a]">{product.categories[0]?.title || "Saptambu"}</p>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-[#1c6d62]">{formatMoney(price)}</span>
            {product.compareAtPrice || product.salePrice ? (
              <span className="ml-2 text-sm text-[#8a7a68] line-through">
                {formatMoney(product.compareAtPrice || product.price)}
              </span>
            ) : null}
          </div>
          <span className="text-xs text-[#7a6a5a]">{product.stock} left</span>
        </div>
      </div>
    </Link>
  );
}
