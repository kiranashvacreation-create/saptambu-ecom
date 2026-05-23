import { NextResponse } from "next/server";
import { z } from "zod";
import { quoteCart } from "@/lib/checkout";
import { requireDb } from "@/lib/db";
import { paise } from "@/lib/money";
import { getRazorpay } from "@/lib/razorpay";
import { orderNumber } from "@/lib/slugs";

const schema = z.object({
  items: z.array(z.object({ productId: z.string(), quantity: z.number() })).min(1),
  couponCode: z.string().optional(),
  customer: z.object({
    customerName: z.string().min(2),
    customerEmail: z.string().email(),
    customerPhone: z.string().min(8),
    addressLine1: z.string().min(4),
    addressLine2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(4),
    notes: z.string().optional(),
  }),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const razorpay = getRazorpay();
    if (!razorpay || !process.env.RAZORPAY_KEY_ID) {
      return NextResponse.json({ error: "Razorpay is not configured." }, { status: 500 });
    }

    const db = requireDb();
    const quote = await quoteCart({
      items: input.items,
      couponCode: input.couponCode,
      customerEmail: input.customer.customerEmail,
    });

    const number = orderNumber();
    const order = await db.order.create({
      data: {
        orderNumber: number,
        customerName: input.customer.customerName,
        customerEmail: input.customer.customerEmail.toLowerCase(),
        customerPhone: input.customer.customerPhone,
        addressLine1: input.customer.addressLine1,
        addressLine2: input.customer.addressLine2 || null,
        city: input.customer.city,
        state: input.customer.state,
        pincode: input.customer.pincode,
        notes: input.customer.notes || null,
        subtotal: quote.subtotal,
        discountTotal: quote.discountTotal,
        total: quote.total,
        discountCodeId: quote.discount?.id || null,
        discountCodeSnapshot: quote.discount?.code || null,
        items: {
          create: quote.lines.map((line) => ({
            productId: line.productId,
            productTitle: line.title,
            productSlug: line.slug,
            sku: line.sku,
            unitPrice: line.unitPrice,
            quantity: line.quantity,
            lineTotal: line.lineTotal,
            imageUrl: line.imageUrl,
          })),
        },
      },
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: paise(quote.total),
      currency: "INR",
      receipt: number,
      notes: { orderId: order.id, orderNumber: number },
    });

    await db.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: razorpayOrder.id },
    });

    return NextResponse.json({
      keyId: process.env.RAZORPAY_KEY_ID,
      orderNumber: number,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create checkout." },
      { status: 400 },
    );
  }
}
