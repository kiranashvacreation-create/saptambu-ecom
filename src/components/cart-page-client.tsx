"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useMemo } from "react";
import { CloudinaryImage } from "@/components/cloudinary-image";
import { useCart } from "@/components/cart-provider";
import { EmptyState } from "@/components/empty-state";
import { formatMoney } from "@/lib/money";

export function CartPageClient() {
  const { items, updateQuantity, removeItem } = useCart();
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  if (!items.length) {
    return (
      <section className="container-page py-12">
        <EmptyState
          title="Your cart is empty"
          message="Add sacred waters, puja essentials, and spiritual products to begin checkout."
          action={{ href: "/collections/all", label: "Browse products" }}
        />
      </section>
    );
  }

  return (
    <section className="container-page py-10">
      <h1 className="text-4xl font-semibold">Cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4">
          {items.map((item) => (
            <div key={item.productId} className="grid grid-cols-[96px_1fr] gap-4 rounded-lg border border-[var(--border)] bg-white p-4">
              <div className="relative aspect-square overflow-hidden rounded-md bg-[#f1ece2]">
                {item.image ? <CloudinaryImage src={item.image} alt={item.title} fill sizes="96px" className="object-cover" /> : null}
              </div>
              <div className="grid gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link href={`/products/${item.slug}`} className="font-semibold">
                      {item.title}
                    </Link>
                    <p className="mt-1 text-sm text-[#7a6a5a]">{formatMoney(item.price)}</p>
                  </div>
                  <button
                    aria-label={`Remove ${item.title}`}
                    className="focus-ring grid h-9 w-9 place-items-center rounded-full border border-[var(--border)]"
                    onClick={() => removeItem(item.productId)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={item.quantity}
                  onChange={(event) => updateQuantity(item.productId, Number(event.target.value))}
                  className="focus-ring h-10 w-24 rounded-md border border-[var(--border)] px-3"
                />
              </div>
            </div>
          ))}
        </div>
        <aside className="h-fit rounded-lg border border-[var(--border)] bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-[#6d5f52]">Subtotal</span>
            <strong>{formatMoney(subtotal)}</strong>
          </div>
          <p className="mt-3 text-sm leading-6 text-[#7a6a5a]">Coupons, stock checks, and final totals are verified at checkout.</p>
          <Link
            href="/checkout"
            className="focus-ring mt-5 inline-flex h-12 w-full items-center justify-center rounded-md bg-[#9b2f22] font-semibold text-white"
          >
            Checkout
          </Link>
        </aside>
      </div>
    </section>
  );
}
