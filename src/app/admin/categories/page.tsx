import { saveCategoryAction } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin-shell";
import { Field, inputClass, textareaClass } from "@/components/admin-field";
import { AutoSlugFormController } from "@/components/auto-slug-form-controller";
import { requireAdmin } from "@/lib/auth";
import { requireDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  await requireAdmin();
  const categories = await requireDb().category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });

  return (
    <AdminShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="rounded-lg border border-[var(--border)] bg-white">
          {categories.map((category) => (
            <div key={category.id} className="border-b border-[var(--border)] p-4 last:border-0">
              <p className="font-semibold">{category.title}</p>
              <p className="text-sm text-[#6d5f52]">
                /collections/{category.slug} · {category._count.products} products
              </p>
            </div>
          ))}
        </div>
        <form action={saveCategoryAction} className="grid h-fit gap-4 rounded-lg border border-[var(--border)] bg-white p-5">
          <AutoSlugFormController />
          <h2 className="text-xl font-semibold">New category</h2>
          <Field label="Title">
            <input name="title" required className={inputClass} />
          </Field>
          <Field label="Slug">
            <input name="slug" className={inputClass} />
          </Field>
          <Field label="Sort order">
            <input name="sortOrder" type="number" defaultValue={0} className={inputClass} />
          </Field>
          <Field label="Description">
            <textarea name="description" rows={4} className={textareaClass} />
          </Field>
          <button className="focus-ring h-10 rounded-md bg-[#1c6d62] px-4 text-sm font-semibold text-white">Save category</button>
        </form>
      </div>
    </AdminShell>
  );
}
