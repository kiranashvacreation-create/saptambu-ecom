import { deleteDiscountAction, saveDiscountAction } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin-shell";
import { Field, inputClass } from "@/components/admin-field";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { requireAdmin } from "@/lib/auth";
import { requireDb } from "@/lib/db";
import { formatMoney, toNumber } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function DiscountsPage() {
  await requireAdmin();
  const discounts = await requireDb().discountCode.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <AdminShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="rounded-lg border border-[var(--border)] bg-white">
          {discounts.map((discount) => (
            <div key={discount.id} className="grid gap-2 border-b border-[var(--border)] p-4 last:border-0 md:grid-cols-[1fr_100px_100px_90px_auto] md:items-center">
              <span className="font-semibold">{discount.code}</span>
              <span>{discount.type === "PERCENT" ? `${toNumber(discount.value)}%` : formatMoney(toNumber(discount.value))}</span>
              <span>{discount.isActive ? "Active" : "Inactive"}</span>
              <span>{discount.usedCount} uses</span>
              <form action={deleteDiscountAction}>
                <input type="hidden" name="id" value={discount.id} />
                <ConfirmSubmitButton
                  className="focus-ring h-9 rounded-md border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-800"
                  confirmMessage={`Permanently delete coupon "${discount.code}"? Existing orders will keep their discount snapshot.`}
                >
                  Delete
                </ConfirmSubmitButton>
              </form>
            </div>
          ))}
          {!discounts.length ? <p className="p-4 text-sm text-[#6d5f52]">No coupons yet.</p> : null}
        </div>
        <form action={saveDiscountAction} className="grid h-fit gap-4 rounded-lg border border-[var(--border)] bg-white p-5">
          <h2 className="text-xl font-semibold">New coupon</h2>
          <Field label="Code">
            <input name="code" required className={inputClass} />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Type">
              <select name="type" className={inputClass}>
                <option value="PERCENT">Percent</option>
                <option value="FIXED">Fixed amount</option>
              </select>
            </Field>
            <Field label="Value">
              <input name="value" type="number" step="0.01" required className={inputClass} />
            </Field>
          </div>
          <Field label="Minimum subtotal">
            <input name="minimumSubtotal" type="number" step="0.01" className={inputClass} />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Max total uses">
              <input name="maxUses" type="number" className={inputClass} />
            </Field>
            <Field label="Per-email limit">
              <input name="perEmailLimit" type="number" className={inputClass} />
            </Field>
          </div>
          <Field label="Expires at">
            <input name="expiresAt" type="date" className={inputClass} />
          </Field>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" name="isActive" defaultChecked />
            Active
          </label>
          <button className="focus-ring h-10 rounded-md bg-[#1c6d62] px-4 text-sm font-semibold text-white">Save coupon</button>
        </form>
      </div>
    </AdminShell>
  );
}
