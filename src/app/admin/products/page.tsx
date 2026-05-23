import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { requireDb } from "@/lib/db";
import { formatMoney, toNumber } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdmin();
  const db = requireDb();
  const products = await db.product.findMany({
    include: { images: true, categories: { include: { category: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <AdminShell>
      <div className="flex justify-end">
        <Link href="/admin/products/new" className="focus-ring rounded-md bg-[#1c6d62] px-4 py-2 text-sm font-semibold text-white">
          New product
        </Link>
      </div>
      <div className="mt-4 overflow-hidden rounded-lg border border-[var(--border)] bg-white">
        <div className="grid grid-cols-[1.5fr_110px_100px_100px] gap-4 border-b border-[var(--border)] p-4 text-sm font-semibold">
          <span>Product</span>
          <span>Price</span>
          <span>Stock</span>
          <span>Status</span>
        </div>
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/admin/products/${product.id}`}
            className="grid grid-cols-[1.5fr_110px_100px_100px] gap-4 border-b border-[var(--border)] p-4 text-sm last:border-0"
          >
            <span className="font-semibold">{product.title}</span>
            <span>{formatMoney(toNumber(product.salePrice || product.price))}</span>
            <span className={product.stock <= product.lowStockThreshold ? "font-semibold text-[#9b2f22]" : ""}>{product.stock}</span>
            <span>{product.status}</span>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
