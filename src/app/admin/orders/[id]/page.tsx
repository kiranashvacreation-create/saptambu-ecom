import { notFound } from "next/navigation";
import { updateOrderDeliveryAction } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin-shell";
import { Field, inputClass, textareaClass } from "@/components/admin-field";
import { requireAdmin } from "@/lib/auth";
import { requireDb } from "@/lib/db";
import { formatMoney, toNumber } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const order = await requireDb().order.findUnique({
    where: { id },
    include: { items: true, deliveryUpdates: { orderBy: { createdAt: "desc" } } },
  });

  if (!order) notFound();

  return (
    <AdminShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-6">
          <div className="rounded-lg border border-[var(--border)] bg-white p-5">
            <p className="text-sm text-[#6d5f52]">Order</p>
            <h2 className="text-2xl font-semibold">{order.orderNumber}</h2>
            <p className="mt-2 text-sm text-[#6d5f52]">
              {order.customerName} · {order.customerEmail} · {order.customerPhone}
            </p>
            <p className="mt-3 text-sm">
              {order.addressLine1}
              {order.addressLine2 ? `, ${order.addressLine2}` : ""}, {order.city}, {order.state} - {order.pincode}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-white p-5">
            <h2 className="text-xl font-semibold">Items</h2>
            <div className="mt-4 grid gap-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 border-b border-[var(--border)] pb-3">
                  <span>
                    {item.quantity} x {item.productTitle}
                  </span>
                  <span>{formatMoney(toNumber(item.lineTotal))}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatMoney(toNumber(order.subtotal))}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span>-{formatMoney(toNumber(order.discountTotal))}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatMoney(toNumber(order.total))}</span>
              </div>
            </div>
          </div>
        </div>
        <aside className="grid h-fit gap-5">
          <form action={updateOrderDeliveryAction} className="grid gap-4 rounded-lg border border-[var(--border)] bg-white p-5">
            <input type="hidden" name="orderId" value={order.id} />
            <h2 className="text-xl font-semibold">Delivery update</h2>
            <Field label="Status">
              <select name="deliveryStatus" defaultValue={order.deliveryStatus} className={inputClass}>
                <option value="ORDER_PLACED">ORDER_PLACED</option>
                <option value="PACKING">PACKING</option>
                <option value="PARCELLED">PARCELLED</option>
                <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </Field>
            <Field label="AWB">
              <input name="awb" defaultValue={order.awb || ""} className={inputClass} />
            </Field>
            <Field label="Tracking URL">
              <input name="trackingUrl" defaultValue={order.trackingUrl || ""} className={inputClass} />
            </Field>
            <Field label="Customer message">
              <textarea name="message" rows={4} defaultValue={order.deliveryMessage || ""} className={textareaClass} />
            </Field>
            <button className="focus-ring h-10 rounded-md bg-[#9b2f22] px-4 text-sm font-semibold text-white">
              Save & email customer
            </button>
          </form>
          <div className="rounded-lg border border-[var(--border)] bg-white p-5">
            <h2 className="text-xl font-semibold">History</h2>
            <div className="mt-4 grid gap-3 text-sm">
              {order.deliveryUpdates.map((update) => (
                <div key={update.id} className="border-b border-[var(--border)] pb-3 last:border-0">
                  <p className="font-semibold">{update.status}</p>
                  <p className="text-[#6d5f52]">{update.message}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </AdminShell>
  );
}
