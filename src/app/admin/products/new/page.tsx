import { ProductForm } from "@/components/product-form";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { requireDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await requireDb().category.findMany({ orderBy: { title: "asc" } });

  return (
    <AdminShell>
      <ProductForm categories={categories} />
    </AdminShell>
  );
}
