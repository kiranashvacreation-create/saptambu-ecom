import "server-only";

import nodemailer from "nodemailer";
import type { Order, OrderItem } from "@/generated/prisma/client";
import { formatMoney, toNumber } from "@/lib/money";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporter;
}

type OrderWithItems = Order & { items: OrderItem[] };

function orderLines(order: OrderWithItems) {
  return order.items
    .map((item) => `${item.quantity} x ${item.productTitle} - ${formatMoney(toNumber(item.lineTotal))}`)
    .join("\n");
}

async function sendMail(to: string, subject: string, text: string) {
  const mailer = getTransporter();
  if (!mailer) {
    console.info("Email skipped; SMTP is not configured.", { to, subject });
    return;
  }

  await mailer.sendMail({
    to,
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    subject,
    text,
  });
}

export async function sendOrderEmails(order: OrderWithItems) {
  const ownerEmail = process.env.OWNER_EMAIL || process.env.SMTP_USER;
  const customerText = `Namaste ${order.customerName},

Thank you for your order ${order.orderNumber}.

Items:
${orderLines(order)}

Total paid: ${formatMoney(toNumber(order.total))}

We will prepare your parcel and share delivery updates by email.`;

  await sendMail(order.customerEmail, `Order confirmed: ${order.orderNumber}`, customerText);

  if (ownerEmail) {
    const ownerText = `New paid order ${order.orderNumber}

Customer: ${order.customerName}
Email: ${order.customerEmail}
Phone: ${order.customerPhone}
Address: ${order.addressLine1}${order.addressLine2 ? `, ${order.addressLine2}` : ""}, ${order.city}, ${order.state} - ${order.pincode}

Items:
${orderLines(order)}

Subtotal: ${formatMoney(toNumber(order.subtotal))}
Discount: ${formatMoney(toNumber(order.discountTotal))}
Total: ${formatMoney(toNumber(order.total))}
Payment: ${order.razorpayPaymentId || "Razorpay verified"}`;

    await sendMail(ownerEmail, `New paid order: ${order.orderNumber}`, ownerText);
  }
}

export async function sendDeliveryEmail(order: OrderWithItems, message: string) {
  await sendMail(
    order.customerEmail,
    `Delivery update: ${order.orderNumber}`,
    `Namaste ${order.customerName},

Delivery status for ${order.orderNumber}: ${order.deliveryStatus}

${message}

Thank you,
Saptambu`,
  );
}
