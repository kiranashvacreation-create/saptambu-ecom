"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sanitizeHtml from "sanitize-html";
import { EmailEvent, EmailStatus } from "@/generated/prisma/client";
import { clearAdminSession, requireAdmin, setAdminSession, verifyAdmin } from "@/lib/auth";
import { requireDb } from "@/lib/db";
import { sendDeliveryUpdateEmails, sendOrderConfirmationEmails } from "@/lib/email";
import { slugify } from "@/lib/slugs";

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function numberValue(formData: FormData, key: string, fallback = 0) {
  const value = Number(text(formData, key));
  return Number.isFinite(value) ? value : fallback;
}

function optionalDate(value: string) {
  return value ? new Date(value) : null;
}

function richHtml(formData: FormData, key: string) {
  return sanitizeHtml(text(formData, key), {
    allowedAttributes: {
      a: ["href", "name", "rel", "target"],
      img: ["alt", "src", "title"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedTags: [
      "a",
      "blockquote",
      "br",
      "em",
      "h2",
      "h3",
      "h4",
      "hr",
      "img",
      "li",
      "ol",
      "p",
      "strong",
      "ul",
    ],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
    },
  });
}

export async function loginAction(formData: FormData) {
  const email = text(formData, "email").toLowerCase();
  const password = text(formData, "password");
  const admin = await verifyAdmin(email, password);

  if (!admin) {
    redirect("/admin/login?error=1");
  }

  await setAdminSession(admin.id);
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function saveProductAction(formData: FormData) {
  await requireAdmin();
  const db = requireDb();
  const id = text(formData, "id");
  const title = text(formData, "title");
  const slug = text(formData, "slug") || slugify(title);
  const imageUrls = text(formData, "imageUrls")
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean);
  const categoryIds = formData.getAll("categoryIds").map(String);
  const tags = text(formData, "tags")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const salePrice = text(formData, "salePrice");
  const compareAtPrice = text(formData, "compareAtPrice");

  const data = {
    title,
    slug,
    description: text(formData, "description"),
    sku: text(formData, "sku") || null,
    price: numberValue(formData, "price"),
    salePrice: salePrice ? Number(salePrice) : null,
    compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
    stock: numberValue(formData, "stock"),
    lowStockThreshold: numberValue(formData, "lowStockThreshold", 5),
    showWhenSoldOut: formData.get("showWhenSoldOut") === "on",
    status: text(formData, "status") as "DRAFT" | "ACTIVE" | "ARCHIVED",
    tags,
  };

  const product = id
    ? await db.product.update({ where: { id }, data })
    : await db.product.create({ data });

  await db.productImage.deleteMany({ where: { productId: product.id } });
  if (imageUrls.length) {
    await db.productImage.createMany({
      data: imageUrls.map((url, index) => ({ productId: product.id, url, sortOrder: index, alt: title })),
    });
  }

  await db.productCategory.deleteMany({ where: { productId: product.id } });
  if (categoryIds.length) {
    await db.productCategory.createMany({
      data: categoryIds.map((categoryId) => ({ productId: product.id, categoryId })),
      skipDuplicates: true,
    });
  }

  revalidatePath("/");
  revalidatePath("/collections/all");
  revalidatePath(`/products/${product.slug}`);
  redirect("/admin/products");
}

export async function adjustStockAction(formData: FormData) {
  await requireAdmin();
  const db = requireDb();
  const productId = text(formData, "productId");
  const change = numberValue(formData, "change");
  const note = text(formData, "note");

  await db.$transaction([
    db.product.update({ where: { id: productId }, data: { stock: { increment: change } } }),
    db.stockAdjustment.create({
      data: {
        productId,
        change,
        reason: "Manual admin adjustment",
        note,
      },
    }),
  ]);

  revalidatePath("/admin/products");
  redirect(`/admin/products/${productId}`);
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const db = requireDb();
  const id = text(formData, "id");
  const product = await db.product.findUnique({
    where: { id },
    select: { slug: true, categories: { select: { category: { select: { slug: true } } } } },
  });

  if (product) {
    await db.product.delete({ where: { id } });
    revalidatePath(`/products/${product.slug}`);
    product.categories.forEach(({ category }) => revalidatePath(`/collections/${category.slug}`));
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/collections/all");
  redirect("/admin/products");
}

export async function saveCategoryAction(formData: FormData) {
  await requireAdmin();
  const db = requireDb();
  const id = text(formData, "id");
  const title = text(formData, "title");
  const data = {
    title,
    slug: text(formData, "slug") || slugify(title),
    description: text(formData, "description"),
    sortOrder: numberValue(formData, "sortOrder"),
  };

  if (id) await db.category.update({ where: { id }, data });
  else await db.category.create({ data });

  revalidatePath("/");
  revalidatePath("/collections/all");
  redirect("/admin/categories");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();
  const db = requireDb();
  const id = text(formData, "id");
  const category = await db.category.findUnique({ where: { id }, select: { slug: true } });

  if (category) {
    await db.category.delete({ where: { id } });
    revalidatePath(`/collections/${category.slug}`);
  }

  revalidatePath("/");
  revalidatePath("/admin/categories");
  revalidatePath("/collections/all");
  redirect("/admin/categories");
}

export async function saveDiscountAction(formData: FormData) {
  await requireAdmin();
  const db = requireDb();
  const id = text(formData, "id");
  const code = text(formData, "code").toUpperCase();
  const minimumSubtotal = text(formData, "minimumSubtotal");
  const maxUses = text(formData, "maxUses");
  const perEmailLimit = text(formData, "perEmailLimit");
  const expiresAt = text(formData, "expiresAt");
  const data = {
    code,
    type: text(formData, "type") as "PERCENT" | "FIXED",
    value: numberValue(formData, "value"),
    isActive: formData.get("isActive") === "on",
    minimumSubtotal: minimumSubtotal ? Number(minimumSubtotal) : null,
    maxUses: maxUses ? Number(maxUses) : null,
    perEmailLimit: perEmailLimit ? Number(perEmailLimit) : null,
    expiresAt: optionalDate(expiresAt),
  };

  if (id) await db.discountCode.update({ where: { id }, data });
  else await db.discountCode.create({ data });

  redirect("/admin/discounts");
}

export async function deleteDiscountAction(formData: FormData) {
  await requireAdmin();
  const db = requireDb();
  const id = text(formData, "id");

  await db.$transaction([
    db.order.updateMany({ where: { discountCodeId: id }, data: { discountCodeId: null } }),
    db.discountCode.deleteMany({ where: { id } }),
  ]);

  revalidatePath("/admin/discounts");
  redirect("/admin/discounts");
}

export async function resendOrderEmailsAction(formData: FormData) {
  await requireAdmin();
  const db = requireDb();
  const orderId = text(formData, "orderId");
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (order) {
    await sendOrderConfirmationEmails(order);
    revalidatePath(`/admin/orders/${orderId}`);
  }

  redirect(order ? `/admin/orders/${orderId}` : "/admin/orders");
}

export async function updateOrderDeliveryAction(formData: FormData) {
  await requireAdmin();
  const db = requireDb();
  const orderId = text(formData, "orderId");
  const deliveryStatus = text(formData, "deliveryStatus") as
    | "ORDER_PLACED"
    | "PACKING"
    | "PARCELLED"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED";
  const message = text(formData, "message") || `Delivery status updated to ${deliveryStatus}.`;
  const trackingUrl = text(formData, "trackingUrl");
  const awb = text(formData, "awb");

  const { order, deliveryUpdate } = await db.$transaction(async (tx) => {
    const order = await tx.order.update({
      where: { id: orderId },
      data: {
        deliveryStatus,
        deliveryMessage: message,
        trackingUrl: trackingUrl || null,
        awb: awb || null,
        status:
          deliveryStatus === "DELIVERED"
            ? "DELIVERED"
            : deliveryStatus === "PARCELLED"
              ? "PARCELLED"
              : deliveryStatus === "CANCELLED"
                ? "CANCELLED"
                : "PROCESSING",
      },
      include: { items: true },
    });

    const deliveryUpdate = await tx.deliveryUpdate.create({
      data: {
        orderId,
        status: deliveryStatus,
        message,
      },
    });

    return { order, deliveryUpdate };
  });

  const outcomes = await sendDeliveryUpdateEmails(order, deliveryUpdate);
  const customerOutcome = outcomes.find((outcome) => outcome.event === EmailEvent.DELIVERY_UPDATE);

  await db.deliveryUpdate.update({
    where: { id: deliveryUpdate.id },
    data: { emailed: customerOutcome?.status === EmailStatus.SENT },
  });

  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}`);
}

export async function deleteOrderAction(formData: FormData) {
  await requireAdmin();
  const db = requireDb();
  const id = text(formData, "id");
  const order = await db.order.findUnique({ where: { id }, select: { orderNumber: true } });

  if (order) {
    await db.order.delete({ where: { id } });
    revalidatePath(`/order-confirmation/${order.orderNumber}`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  redirect("/admin/orders");
}

export async function saveSettingAction(formData: FormData) {
  await requireAdmin();
  const db = requireDb();
  const entries = ["heroTitle", "heroCopy", "mediaCopy", "contactEmail", "contactPhone"];

  await Promise.all(
    entries.map((key) =>
      db.siteSetting.upsert({
        where: { key },
        create: { key, value: text(formData, key) },
        update: { value: text(formData, key) },
      }),
    ),
  );

  revalidatePath("/");
  redirect("/admin/settings");
}

export async function saveMediaArticleAction(formData: FormData) {
  await requireAdmin();
  const db = requireDb();
  const id = text(formData, "id");
  const title = text(formData, "title");
  const slug = text(formData, "slug") || slugify(title);
  const publishedAt = text(formData, "publishedAt");
  const status = text(formData, "status") as "DRAFT" | "PUBLISHED" | "ARCHIVED";

  const data = {
    title,
    slug,
    excerpt: text(formData, "excerpt"),
    bodyHtml: richHtml(formData, "bodyHtml"),
    coverImageUrl: text(formData, "coverImageUrl") || null,
    coverImageAlt: text(formData, "coverImageAlt") || title,
    sourceName: text(formData, "sourceName") || null,
    sourceUrl: text(formData, "sourceUrl") || null,
    publishedAt: publishedAt ? new Date(publishedAt) : status === "PUBLISHED" ? new Date() : null,
    sortOrder: numberValue(formData, "sortOrder"),
    status,
  };

  if (id) await db.mediaArticle.update({ where: { id }, data });
  else await db.mediaArticle.create({ data });

  revalidatePath("/admin/media");
  revalidatePath("/pages/media-coverage-1");
  revalidatePath(`/media/${slug}`);
  redirect("/admin/media");
}

export async function archiveMediaArticleAction(formData: FormData) {
  await requireAdmin();
  const db = requireDb();
  const id = text(formData, "id");

  await db.mediaArticle.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });

  revalidatePath("/admin/media");
  revalidatePath("/pages/media-coverage-1");
  redirect("/admin/media");
}

export async function deleteMediaArticleAction(formData: FormData) {
  await requireAdmin();
  const db = requireDb();
  const id = text(formData, "id");
  const article = await db.mediaArticle.findUnique({ where: { id }, select: { slug: true } });

  if (article) {
    await db.mediaArticle.delete({ where: { id } });
    revalidatePath(`/media/${article.slug}`);
  }

  revalidatePath("/admin/media");
  revalidatePath("/pages/media-coverage-1");
  redirect("/admin/media");
}
