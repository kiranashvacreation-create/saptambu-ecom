import { deleteCategoryAction, saveCategoryAction } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin-shell";
import { Field, inputClass, textareaClass } from "@/components/admin-field";
import { AutoSlugFormController } from "@/components/auto-slug-form-controller";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
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
            <div key={category.id} className="grid gap-3 border-b border-[var(--border)] p-4 last:border-0 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="font-semibold">{category.title}</p>
                <p className="text-sm text-[#6d5f52]">
                  /collections/{category.slug} · {category._count.products} products
                </p>
              </div>
              <form action={deleteCategoryAction}>
                <input type="hidden" name="id" value={category.id} />
                <ConfirmSubmitButton
                  className="focus-ring h-9 rounded-md border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-800"
                  confirmMessage={`Permanently delete category "${category.title}"? Products will stay, but this category link will be removed.`}
                >
                  Delete
                </ConfirmSubmitButton>
              </form>
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
