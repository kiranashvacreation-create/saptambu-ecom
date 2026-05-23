import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { requireDb } from "@/lib/db";
import { formatMoney, toNumber } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  await requireAdmin();
  const orders = await requireDb().order.findMany({ orderBy: { createdAt: "desc" }, include: { items: true } });

  return (
    <AdminShell>
      <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-white">
        <div className="grid grid-cols-[130px_1fr_120px_130px_110px] gap-4 border-b border-[var(--border)] p-4 text-sm font-semibold">
          <span>Order</span>
          <span>Customer</span>
          <span>Payment</span>
          <span>Delivery</span>
          <span>Total</span>
        </div>
        {orders.map((order) => (
          <Link
            href={`/admin/orders/${order.id}`}
            key={order.id}
            className="grid grid-cols-[130px_1fr_120px_130px_110px] gap-4 border-b border-[var(--border)] p-4 text-sm last:border-0"
          >
            <span className="font-semibold">{order.orderNumber}</span>
            <span>{order.customerName}</span>
            <span>{order.paymentStatus}</span>
            <span>{order.deliveryStatus}</span>
            <span>{formatMoney(toNumber(order.total))}</span>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
