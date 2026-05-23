import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { requireDb } from "@/lib/db";
import { formatMoney, toNumber } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const db = requireDb();
  const [products, lowStock, orders, revenue] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { stock: { lte: 5 }, status: "ACTIVE" } }),
    db.order.count(),
    db.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { total: true } }),
  ]);
  const recentOrders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
    include: { items: true },
  });

  return (
    <AdminShell>
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Products", products],
          ["Low stock", lowStock],
          ["Orders", orders],
          ["Revenue", formatMoney(toNumber(revenue._sum.total))],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-[var(--border)] bg-white p-5">
            <p className="text-sm text-[#6d5f52]">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-lg border border-[var(--border)] bg-white">
        <div className="flex items-center justify-between border-b border-[var(--border)] p-5">
          <h2 className="text-xl font-semibold">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm font-semibold text-[#1c6d62]">
            View all
          </Link>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {recentOrders.map((order) => (
            <Link key={order.id} href={`/admin/orders/${order.id}`} className="grid gap-2 p-5 md:grid-cols-4">
              <span className="font-semibold">{order.orderNumber}</span>
              <span>{order.customerName}</span>
              <span>{order.paymentStatus}</span>
              <span className="md:text-right">{formatMoney(toNumber(order.total))}</span>
            </Link>
          ))}
          {!recentOrders.length ? <p className="p-5 text-sm text-[#6d5f52]">No orders yet.</p> : null}
        </div>
      </div>
    </AdminShell>
  );
}
