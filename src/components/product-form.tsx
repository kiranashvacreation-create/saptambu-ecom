import type { Category, Product, ProductCategory, ProductImage, StockAdjustment } from "@/generated/prisma/client";
import { adjustStockAction, deleteProductAction, saveProductAction } from "@/app/admin/actions";
import { Field, inputClass, textareaClass } from "@/components/admin-field";
import { AutoSlugFormController } from "@/components/auto-slug-form-controller";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { ImageUploadField } from "@/components/image-upload-field";
import { toNumber } from "@/lib/money";

type ProductForForm = Product & {
  images: ProductImage[];
  categories: ProductCategory[];
  stockAdjustments?: StockAdjustment[];
};

export function ProductForm({
  product,
  categories,
}: {
  product?: ProductForForm;
  categories: Category[];
}) {
  const selected = new Set((product?.categories || []).map((entry) => entry.categoryId));
  const imageUrls = (product?.images || []).map((image) => image.url).join("\n");

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <form action={saveProductAction} className="grid gap-5 rounded-lg border border-[var(--border)] bg-white p-5">
        <AutoSlugFormController />
        <input type="hidden" name="id" value={product?.id || ""} />
        <Field label="Title">
          <input name="title" required defaultValue={product?.title || ""} className={inputClass} />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Slug">
            <input name="slug" defaultValue={product?.slug || ""} className={inputClass} />
          </Field>
          <Field label="SKU">
            <input name="sku" defaultValue={product?.sku || ""} className={inputClass} />
          </Field>
        </div>
        <Field label="Description">
          <textarea name="description" rows={7} defaultValue={product?.description || ""} className={textareaClass} />
        </Field>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Price">
            <input name="price" required type="number" step="0.01" defaultValue={toNumber(product?.price) || ""} className={inputClass} />
          </Field>
          <Field label="Sale price">
            <input name="salePrice" type="number" step="0.01" defaultValue={product?.salePrice ? toNumber(product.salePrice) : ""} className={inputClass} />
          </Field>
          <Field label="Compare at price">
            <input name="compareAtPrice" type="number" step="0.01" defaultValue={product?.compareAtPrice ? toNumber(product.compareAtPrice) : ""} className={inputClass} />
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Stock">
            <input name="stock" type="number" defaultValue={product?.stock ?? 10} className={inputClass} />
          </Field>
          <Field label="Low stock threshold">
            <input name="lowStockThreshold" type="number" defaultValue={product?.lowStockThreshold ?? 5} className={inputClass} />
          </Field>
          <Field label="Status">
            <select name="status" defaultValue={product?.status || "ACTIVE"} className={inputClass}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="DRAFT">DRAFT</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="showWhenSoldOut" defaultChecked={product?.showWhenSoldOut ?? true} />
          Show product when sold out
        </label>
        <Field label="Tags, comma separated">
          <input name="tags" defaultValue={(product?.tags || []).join(", ")} className={inputClass} />
        </Field>
        <Field label="Categories">
          <div className="grid gap-2 rounded-md border border-[var(--border)] p-3">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="categoryIds" value={category.id} defaultChecked={selected.has(category.id)} />
                {category.title}
              </label>
            ))}
          </div>
        </Field>
        <Field label="Images">
          <ImageUploadField defaultValue={imageUrls} />
        </Field>
        <button className="focus-ring h-11 rounded-md bg-[#1c6d62] px-5 font-semibold text-white">Save product</button>
      </form>
      {product ? (
        <aside className="grid h-fit gap-5">
          <div className="rounded-lg border border-[var(--border)] bg-white p-5">
            <h2 className="text-xl font-semibold">Stock adjustment</h2>
            <form action={adjustStockAction} className="mt-4 grid gap-3">
              <input type="hidden" name="productId" value={product.id} />
              <Field label="Change">
                <input name="change" type="number" required placeholder="-2 or 10" className={inputClass} />
              </Field>
              <Field label="Note">
                <input name="note" className={inputClass} />
              </Field>
              <button className="focus-ring h-10 rounded-md bg-[#9b2f22] px-4 text-sm font-semibold text-white">Adjust stock</button>
            </form>
          </div>
          <form action={deleteProductAction} className="grid gap-3 rounded-lg border border-red-200 bg-red-50 p-5">
            <input type="hidden" name="id" value={product.id} />
            <h2 className="text-xl font-semibold text-red-900">Delete product</h2>
            <p className="text-sm text-red-800">This removes the product, images, category links, and stock history.</p>
            <ConfirmSubmitButton
              className="focus-ring h-10 rounded-md bg-red-700 px-4 text-sm font-semibold text-white"
              confirmMessage={`Permanently delete "${product.title}"?`}
            >
              Delete product
            </ConfirmSubmitButton>
          </form>
        </aside>
      ) : null}
    </div>
  );
}
