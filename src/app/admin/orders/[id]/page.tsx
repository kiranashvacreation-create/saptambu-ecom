import { notFound } from "next/navigation";
import { deleteOrderAction, resendOrderEmailsAction, updateOrderDeliveryAction } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin-shell";
import { Field, inputClass, textareaClass } from "@/components/admin-field";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { requireAdmin } from "@/lib/auth";
import { requireDb } from "@/lib/db";
import { formatMoney, toNumber } from "@/lib/money";

export const dynamic = "force-dynamic";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(value);
}

function statusClass(status: string) {
  if (status === "SENT") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "FAILED") return "bg-red-50 text-red-700 ring-red-200";
  if (status === "SKIPPED") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-stone-100 text-stone-700 ring-stone-200";
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const order = await requireDb().order.findUnique({
    where: { id },
    include: {
      items: true,
      deliveryUpdates: { orderBy: { createdAt: "desc" } },
      emailLogs: { orderBy: { createdAt: "desc" }, take: 12 },
    },
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
              Save & email customer + owner
            </button>
          </form>
          <div className="rounded-lg border border-[var(--border)] bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Email logs</h2>
                <p className="mt-1 text-xs text-[#6d5f52]">Customer and owner notifications for this order.</p>
              </div>
              <form action={resendOrderEmailsAction}>
                <input type="hidden" name="orderId" value={order.id} />
                <button className="focus-ring h-9 rounded-md border border-[var(--border)] px-3 text-xs font-semibold text-[#281b13]">
                  Resend order emails
                </button>
              </form>
            </div>
            <div className="mt-4 grid gap-3 text-sm">
              {order.emailLogs.length ? (
                order.emailLogs.map((log) => (
                  <div key={log.id} className="border-b border-[var(--border)] pb-3 last:border-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{log.event.replaceAll("_", " ")}</p>
                        <p className="mt-1 break-all text-xs text-[#6d5f52]">
                          {log.recipientRole} · {log.recipient}
                        </p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ring-1 ${statusClass(log.status)}`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-[#8a7663]">
                      {log.sentAt ? `Sent ${formatDate(log.sentAt)}` : `Logged ${formatDate(log.createdAt)}`}
                    </p>
                    {log.error ? <p className="mt-2 rounded-md bg-red-50 p-2 text-xs text-red-700">{log.error}</p> : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#6d5f52]">No email attempts logged yet.</p>
              )}
            </div>
          </div>
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
          <form action={deleteOrderAction} className="grid gap-3 rounded-lg border border-red-200 bg-red-50 p-5">
            <input type="hidden" name="id" value={order.id} />
            <h2 className="text-xl font-semibold text-red-900">Delete order</h2>
            <p className="text-sm text-red-800">This permanently removes the order, items, and delivery history.</p>
            <ConfirmSubmitButton
              className="focus-ring h-10 rounded-md bg-red-700 px-4 text-sm font-semibold text-white"
              confirmMessage={`Permanently delete order ${order.orderNumber}? This cannot be undone.`}
            >
              Delete order
            </ConfirmSubmitButton>
          </form>
        </aside>
      </div>
    </AdminShell>
  );
}
