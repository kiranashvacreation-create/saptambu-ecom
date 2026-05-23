import Link from "next/link";
import { deleteOrderAction } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin-shell";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
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
        <div className="grid grid-cols-[130px_1fr_120px_130px_110px_90px] gap-4 border-b border-[var(--border)] p-4 text-sm font-semibold">
          <span>Order</span>
          <span>Customer</span>
          <span>Payment</span>
          <span>Delivery</span>
          <span>Total</span>
          <span>Action</span>
        </div>
        {orders.map((order) => (
          <div
            key={order.id}
            className="grid grid-cols-[130px_1fr_120px_130px_110px_90px] gap-4 border-b border-[var(--border)] p-4 text-sm last:border-0"
          >
            <Link href={`/admin/orders/${order.id}`} className="font-semibold transition hover:text-[#9b2f22]">
              {order.orderNumber}
            </Link>
            <span>{order.customerName}</span>
            <span>{order.paymentStatus}</span>
            <span>{order.deliveryStatus}</span>
            <span>{formatMoney(toNumber(order.total))}</span>
            <form action={deleteOrderAction}>
              <input type="hidden" name="id" value={order.id} />
              <ConfirmSubmitButton
                className="focus-ring h-8 rounded-md border border-red-200 bg-red-50 px-2 text-xs font-semibold text-red-800"
                confirmMessage={`Permanently delete order ${order.orderNumber}?`}
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
