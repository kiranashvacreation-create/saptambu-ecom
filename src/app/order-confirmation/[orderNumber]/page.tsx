import { notFound } from "next/navigation";
import { requireDb } from "@/lib/db";
import { formatMoney, toNumber } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const db = requireDb();
  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  if (!order) notFound();

  return (
    <section className="container-page py-12">
      <div className="rounded-lg border border-[var(--border)] bg-white p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1c6d62]">Order confirmed</p>
        <h1 className="mt-2 text-4xl font-semibold">{order.orderNumber}</h1>
        <p className="mt-3 text-[#6d5f52]">
          Thank you, {order.customerName}. We have received your payment and will prepare your parcel.
        </p>
        <div className="mt-8 grid gap-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between gap-4 border-b border-[var(--border)] pb-3">
              <span>
                {item.quantity} x {item.productTitle}
              </span>
              <span>{formatMoney(toNumber(item.lineTotal))}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-between text-lg font-semibold">
          <span>Total paid</span>
          <span>{formatMoney(toNumber(order.total))}</span>
        </div>
      </div>
    </section>
  );
}
