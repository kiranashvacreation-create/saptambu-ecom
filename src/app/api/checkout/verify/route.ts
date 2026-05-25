import { after, NextResponse } from "next/server";
import { z } from "zod";
import { EmailEvent, EmailStatus } from "@/generated/prisma/client";
import { requireDb } from "@/lib/db";
import { sendOrderConfirmationEmails } from "@/lib/email";
import { verifyRazorpaySignature } from "@/lib/razorpay";

const schema = z.object({
  orderNumber: z.string(),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

async function sendMissingOrderConfirmationEmails(
  db: ReturnType<typeof requireDb>,
  order: Parameters<typeof sendOrderConfirmationEmails>[0],
) {
  try {
    const sentLogs = await db.emailLog.findMany({
      where: {
        orderId: order.id,
        status: EmailStatus.SENT,
        event: { in: [EmailEvent.ORDER_CONFIRMATION, EmailEvent.OWNER_ORDER_NOTIFICATION] },
      },
      select: { event: true },
    });
    const sentEvents = new Set(sentLogs.map((log) => log.event));

    if (sentEvents.has(EmailEvent.ORDER_CONFIRMATION) && sentEvents.has(EmailEvent.OWNER_ORDER_NOTIFICATION)) {
      return [];
    }

    return sendOrderConfirmationEmails(order, {
      includeCustomer: !sentEvents.has(EmailEvent.ORDER_CONFIRMATION),
      includeOwner: !sentEvents.has(EmailEvent.OWNER_ORDER_NOTIFICATION),
    });
  } catch (error) {
    console.warn("Unable to inspect order email logs before sending.", error);
    return sendOrderConfirmationEmails(order);
  }
}

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const ok = verifyRazorpaySignature({
      razorpayOrderId: input.razorpay_order_id,
      razorpayPaymentId: input.razorpay_payment_id,
      razorpaySignature: input.razorpay_signature,
    });

    if (!ok) {
      return NextResponse.json({ error: "Invalid Razorpay signature." }, { status: 400 });
    }

    const db = requireDb();
    const order = await db.order.findUnique({
      where: { orderNumber: input.orderNumber },
      include: { items: true },
    });

    if (!order || order.razorpayOrderId !== input.razorpay_order_id) {
      return NextResponse.json({ error: "Order was not found." }, { status: 404 });
    }

    if (order.paymentStatus === "PAID") {
      after(async () => {
        try {
          await sendMissingOrderConfirmationEmails(db, order);
        } catch (error) {
          console.warn("Unable to send already-paid order emails.", error);
        }
      });
      return NextResponse.json({ ok: true });
    }

    await db.$transaction(async (tx) => {
      for (const item of order.items) {
        if (!item.productId) continue;
        const updated = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count !== 1) {
          throw new Error(`${item.productTitle} is no longer available in the requested quantity.`);
        }
        await tx.stockAdjustment.create({
          data: {
            productId: item.productId,
            change: -item.quantity,
            reason: `Paid order ${order.orderNumber}`,
          },
        });
      }

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paymentStatus: "PAID",
          deliveryStatus: "ORDER_PLACED",
          razorpayPaymentId: input.razorpay_payment_id,
          razorpaySignature: input.razorpay_signature,
        },
      });

      if (order.discountCodeId) {
        await tx.discountCode.update({
          where: { id: order.discountCodeId },
          data: { usedCount: { increment: 1 } },
        });
      }

      await tx.deliveryUpdate.create({
        data: {
          orderId: order.id,
          status: "ORDER_PLACED",
          message: "Order paid successfully. The shop owner will prepare the parcel.",
        },
      });
    });

    const paidOrder = await db.order.findUniqueOrThrow({
      where: { id: order.id },
      include: { items: true },
    });
    after(async () => {
      try {
        await sendMissingOrderConfirmationEmails(db, paidOrder);
      } catch (error) {
        console.warn("Unable to send paid order emails.", error);
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to verify payment." },
      { status: 400 },
    );
  }
}
