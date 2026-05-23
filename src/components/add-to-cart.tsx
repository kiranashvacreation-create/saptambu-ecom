"use client";

import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";

type Props = {
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    image: string | null;
    stock: number;
  };
};

export function AddToCart({ product }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const soldOut = product.stock <= 0;

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-3">
        <label htmlFor="quantity" className="text-sm font-medium">
          Qty
        </label>
        <input
          id="quantity"
          type="number"
          min={1}
          max={Math.max(1, product.stock)}
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
          className="focus-ring h-11 w-24 rounded-md border border-[var(--border)] bg-white px-3"
          disabled={soldOut}
        />
      </div>
      <button
        className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#9b2f22] px-5 font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#b8afa4]"
        disabled={soldOut}
        onClick={() => {
          addItem(
            {
              productId: product.id,
              title: product.title,
              slug: product.slug,
              price: product.price,
              image: product.image,
            },
            Math.min(quantity, product.stock),
          );
          setAdded(true);
          window.setTimeout(() => setAdded(false), 1800);
        }}
      >
        <ShoppingBag size={18} />
        {soldOut ? "Sold out" : added ? "Added" : "Add to cart"}
      </button>
    </div>
  );
}
