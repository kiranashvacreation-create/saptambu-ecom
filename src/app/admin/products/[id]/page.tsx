import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { ProductForm } from "@/components/product-form";
import { requireAdmin } from "@/lib/auth";
import { requireDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const db = requireDb();
  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } }, categories: true, stockAdjustments: { orderBy: { createdAt: "desc" }, take: 10 } },
    }),
    db.category.findMany({ orderBy: { title: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <AdminShell>
      <ProductForm product={product} categories={categories} />
    </AdminShell>
  );
}
