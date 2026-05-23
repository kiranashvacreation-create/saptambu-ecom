import Link from "next/link";
import { deleteProductAction } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin-shell";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
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
        <div className="grid grid-cols-[1.5fr_110px_100px_100px_90px] gap-4 border-b border-[var(--border)] p-4 text-sm font-semibold">
          <span>Product</span>
          <span>Price</span>
          <span>Stock</span>
          <span>Status</span>
          <span>Action</span>
        </div>
        {products.map((product) => (
          <div
            key={product.id}
            className="grid grid-cols-[1.5fr_110px_100px_100px_90px] gap-4 border-b border-[var(--border)] p-4 text-sm last:border-0"
          >
            <Link href={`/admin/products/${product.id}`} className="font-semibold transition hover:text-[#9b2f22]">
              {product.title}
            </Link>
            <span>{formatMoney(toNumber(product.salePrice || product.price))}</span>
            <span className={product.stock <= product.lowStockThreshold ? "font-semibold text-[#9b2f22]" : ""}>{product.stock}</span>
            <span>{product.status}</span>
            <form action={deleteProductAction}>
              <input type="hidden" name="id" value={product.id} />
              <ConfirmSubmitButton
                className="focus-ring h-8 rounded-md border border-red-200 bg-red-50 px-2 text-xs font-semibold text-red-800"
                confirmMessage={`Permanently delete "${product.title}"?`}
              >
                Delete
              </ConfirmSubmitButton>
            </form>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
