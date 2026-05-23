import { saveSettingAction } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin-shell";
import { Field, inputClass, textareaClass } from "@/components/admin-field";
import { requireAdmin } from "@/lib/auth";
import { requireDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await requireDb().siteSetting.findMany();
  const map = new Map(settings.map((setting) => [setting.key, setting.value]));

  return (
    <AdminShell>
      <form action={saveSettingAction} className="grid max-w-3xl gap-5 rounded-lg border border-[var(--border)] bg-white p-5">
        <h2 className="text-xl font-semibold">Store content</h2>
        <Field label="Hero title">
          <input name="heroTitle" defaultValue={map.get("heroTitle") || "Saptambu"} className={inputClass} />
        </Field>
        <Field label="Hero copy">
          <textarea name="heroCopy" rows={4} defaultValue={map.get("heroCopy") || ""} className={textareaClass} />
        </Field>
        <Field label="Media coverage copy">
          <textarea name="mediaCopy" rows={4} defaultValue={map.get("mediaCopy") || ""} className={textareaClass} />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Contact email">
            <input name="contactEmail" defaultValue={map.get("contactEmail") || ""} className={inputClass} />
          </Field>
          <Field label="Contact phone">
            <input name="contactPhone" defaultValue={map.get("contactPhone") || ""} className={inputClass} />
          </Field>
        </div>
        <button className="focus-ring h-10 rounded-md bg-[#1c6d62] px-4 text-sm font-semibold text-white">Save settings</button>
      </form>
    </AdminShell>
  );
}
