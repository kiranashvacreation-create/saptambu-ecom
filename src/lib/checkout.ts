import "server-only";

import { DiscountCode } from "@/generated/prisma/client";
import { requireDb } from "@/lib/db";
import { currentPrice } from "@/lib/catalog";
import { toNumber } from "@/lib/money";

export type CartLineInput = {
  productId: string;
  quantity: number;
};

export type QuoteInput = {
  items: CartLineInput[];
  couponCode?: string;
  customerEmail?: string;
};

export type QuoteLine = {
  productId: string;
  slug: string;
  title: string;
  sku: string | null;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  stock: number;
};

export type Quote = {
  lines: QuoteLine[];
  subtotal: number;
  discountTotal: number;
  total: number;
  discount: DiscountCode | null;
};

function discountValue(discount: DiscountCode, subtotal: number) {
  const value = toNumber(discount.value);
  if (discount.type === "PERCENT") return Math.min(subtotal, Number(((subtotal * value) / 100).toFixed(2)));
  return Math.min(subtotal, value);
}

export async function quoteCart(input: QuoteInput): Promise<Quote> {
  const db = requireDb();
  const normalized = input.items
    .map((item) => ({
      productId: item.productId,
      quantity: Math.max(1, Math.min(99, Math.floor(Number(item.quantity) || 1))),
    }))
    .filter((item) => item.productId);

  if (!normalized.length) {
    throw new Error("Your cart is empty.");
  }

  const quantities = new Map<string, number>();
  for (const item of normalized) {
    quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
  }

  const products = await db.product.findMany({
    where: {
      id: { in: [...quantities.keys()] },
      status: "ACTIVE",
    },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      categories: { include: { category: true } },
    },
  });

  if (products.length !== quantities.size) {
    throw new Error("Some products in your cart are no longer available.");
  }

  const lines = products.map((product) => {
    const quantity = quantities.get(product.id) || 0;
    if (quantity > product.stock) {
      throw new Error(`${product.title} has only ${product.stock} unit(s) in stock.`);
    }

    const price = currentPrice({
      id: product.id,
      title: product.title,
      slug: product.slug,
      description: product.description,
      sku: product.sku,
      price: toNumber(product.price),
      salePrice: product.salePrice == null ? null : toNumber(product.salePrice),
      compareAtPrice: product.compareAtPrice == null ? null : toNumber(product.compareAtPrice),
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
      status: product.status,
      showWhenSoldOut: product.showWhenSoldOut,
      tags: product.tags,
      image: product.images[0]?.url || null,
      categories: product.categories.map((entry) => entry.category),
    });

    return {
      productId: product.id,
      slug: product.slug,
      title: product.title,
      sku: product.sku,
      imageUrl: product.images[0]?.url || null,
      quantity,
      unitPrice: price,
      lineTotal: Number((price * quantity).toFixed(2)),
      stock: product.stock,
    };
  });

  const subtotal = Number(lines.reduce((sum, line) => sum + line.lineTotal, 0).toFixed(2));
  let discount: DiscountCode | null = null;
  let discountTotal = 0;

  if (input.couponCode?.trim()) {
    const code = input.couponCode.trim().toUpperCase();
    discount = await db.discountCode.findUnique({ where: { code } });

    if (!discount || !discount.isActive) throw new Error("This coupon code is not active.");
    if (discount.expiresAt && discount.expiresAt < new Date()) throw new Error("This coupon code has expired.");
    if (discount.minimumSubtotal && subtotal < toNumber(discount.minimumSubtotal)) {
      throw new Error(`This coupon requires a minimum order of ${toNumber(discount.minimumSubtotal)}.`);
    }
    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      throw new Error("This coupon has reached its usage limit.");
    }
    if (discount.perEmailLimit && input.customerEmail) {
      const usedByEmail = await db.order.count({
        where: {
          customerEmail: input.customerEmail.toLowerCase(),
          discountCodeId: discount.id,
          paymentStatus: "PAID",
        },
      });
      if (usedByEmail >= discount.perEmailLimit) {
        throw new Error("This coupon has already been used by this email.");
      }
    }

    discountTotal = discountValue(discount, subtotal);
  }

  return {
    lines,
    subtotal,
    discountTotal,
    total: Number(Math.max(0, subtotal - discountTotal).toFixed(2)),
    discount,
  };
}
