import "server-only";

import dns from "node:dns";
import net from "node:net";
import tls from "node:tls";
import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import {
  EmailEvent,
  EmailRecipientRole,
  EmailStatus,
  type DeliveryUpdate,
  type Order,
  type OrderItem,
} from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import { formatMoney, toNumber } from "@/lib/money";

let transporter: nodemailer.Transporter | null = null;
const DEFAULT_OWNER_EMAIL = "kiranashvacreations@gmail.com";
const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

type OrderWithItems = Order & { items: OrderItem[] };

type EmailPayload = {
  to: string;
  replyTo?: string;
  recipientRole: EmailRecipientRole;
  event: EmailEvent;
  subject: string;
  text: string;
  html: string;
  orderId?: string;
  deliveryUpdateId?: string;
};

type EmailSendOutcome = {
  status: EmailStatus;
  recipient: string;
  event: EmailEvent;
};

type EmailMessagePayload = {
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
};

type EmailMessageOutcome = {
  status: EmailStatus;
  recipient: string;
  error?: string;
};

type OrderEmailOptions = {
  includeCustomer?: boolean;
  includeOwner?: boolean;
};

function cleanEnvValue(value: string | undefined) {
  const trimmed = (value || "").trim().replace(/^['"]+|['"]+$/g, "").trim();
  return trimmed === "\"\"" || trimmed === "''" ? "" : trimmed;
}

function cleanHeaderValue(value: string | undefined) {
  return cleanEnvValue(value).replace(/[\r\n]/g, "");
}

function normalizeEmailAddress(value: string | null | undefined) {
  const normalized = cleanEnvValue(value || "")
    .replace(/:+$/g, "")
    .trim()
    .toLowerCase();

  return EMAIL_PATTERN.test(normalized) ? normalized : "";
}

function shouldForceSmtpIpv4() {
  return cleanEnvValue(process.env.SMTP_FORCE_IPV4) !== "false";
}

function createIpv4SocketFactory(
  host: string,
  port: number,
  secure: boolean,
  connectionTimeout: number,
): SMTPTransport.Options["getSocket"] {
  return (_options, callback) => {
    let settled = false;
    const done = (error: Error | null, socketOptions?: { connection: net.Socket | tls.TLSSocket; secured?: boolean }) => {
      if (settled) return;
      settled = true;
      callback(error, socketOptions);
    };

    dns.resolve4(host, (dnsError, addresses) => {
      if (dnsError) {
        done(dnsError);
        return;
      }

      const address = addresses[0];
      if (!address) {
        done(new Error(`No IPv4 address found for SMTP host ${host}.`));
        return;
      }

      const connectOptions = { host: address, port, family: 4, timeout: connectionTimeout, servername: host };
      const socket = secure ? tls.connect(connectOptions) : net.connect(connectOptions);

      socket.once("connect", () => {
        socket.setTimeout(0);
        done(null, { connection: socket, secured: secure });
      });

      socket.once("error", done);
      socket.once("timeout", () => {
        socket.destroy();
        done(new Error(`SMTP IPv4 connection to ${host}:${port} timed out.`));
      });
    });
  };
}

function getTransporter() {
  const host = cleanEnvValue(process.env.SMTP_HOST);
  const user = cleanEnvValue(process.env.SMTP_USER);
  const pass = cleanEnvValue(process.env.SMTP_PASS);

  if (!host || !user || !pass) {
    return null;
  }

  if (!transporter) {
    const port = Number(cleanEnvValue(process.env.SMTP_PORT) || 587);
    const secure = cleanEnvValue(process.env.SMTP_SECURE) === "true";
    const connectionTimeout = 8000;

    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      connectionTimeout,
      greetingTimeout: 8000,
      socketTimeout: 12000,
      getSocket: shouldForceSmtpIpv4() ? createIpv4SocketFactory(host, port, secure, connectionTimeout) : undefined,
      auth: {
        user,
        pass,
      },
    });
  }

  return transporter;
}

function missingSmtpFields() {
  return [
    ["SMTP_HOST", cleanEnvValue(process.env.SMTP_HOST)],
    ["SMTP_USER", cleanEnvValue(process.env.SMTP_USER)],
    ["SMTP_PASS", cleanEnvValue(process.env.SMTP_PASS)],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);
}

function ownerEmail() {
  return normalizeEmailAddress(process.env.OWNER_EMAIL) || normalizeEmailAddress(process.env.SMTP_USER) || DEFAULT_OWNER_EMAIL;
}

function fromEmail() {
  const from = cleanHeaderValue(process.env.EMAIL_FROM);
  if (from) return from;

  const owner = ownerEmail();
  return owner ? `Kiranashva Creations <${owner}>` : cleanHeaderValue(process.env.SMTP_USER);
}

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
}

function escapeHtml(value: string | null | undefined) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function nl2br(value: string) {
  return escapeHtml(value).replace(/\n/g, "<br />");
}

function prettyStatus(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function contactDetailRows({
  name,
  email,
  phone,
  message,
}: {
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  return `
    <div style="border:1px solid #eadcc2;border-radius:16px;padding:18px;background:#fffdf8;color:#5b4633;font-size:15px;line-height:1.8;">
      <strong style="color:#281b13;">${escapeHtml(name)}</strong><br />
      ${escapeHtml(email)} · ${escapeHtml(phone)}
    </div>
    <div style="margin-top:20px;border-left:3px solid #c9a96e;padding-left:18px;">
      <p style="margin:0;color:#5b4633;font-size:16px;line-height:1.8;">${nl2br(message)}</p>
    </div>`;
}

function addressLine(order: OrderWithItems) {
  return `${order.addressLine1}${order.addressLine2 ? `, ${order.addressLine2}` : ""}, ${order.city}, ${order.state} - ${order.pincode}`;
}

function orderLinesText(order: OrderWithItems) {
  return order.items
    .map((item) => `${item.quantity} x ${item.productTitle} - ${formatMoney(toNumber(item.lineTotal))}`)
    .join("\n");
}

function orderRowsHtml(order: OrderWithItems) {
  return order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #eee4d5;color:#281b13;">
            <strong>${escapeHtml(item.quantity.toString())} x ${escapeHtml(item.productTitle)}</strong>
            ${item.sku ? `<div style="margin-top:4px;color:#8a7663;font-size:12px;">SKU ${escapeHtml(item.sku)}</div>` : ""}
          </td>
          <td align="right" style="padding:14px 0;border-bottom:1px solid #eee4d5;color:#281b13;">
            ${escapeHtml(formatMoney(toNumber(item.lineTotal)))}
          </td>
        </tr>`,
    )
    .join("");
}

function trackingText(order: OrderWithItems) {
  const lines = [];
  if (order.awb) lines.push(`AWB: ${order.awb}`);
  if (order.trackingUrl) lines.push(`Track parcel: ${order.trackingUrl}`);
  return lines.length ? `\n${lines.join("\n")}` : "";
}

function trackingHtml(order: OrderWithItems) {
  if (!order.awb && !order.trackingUrl) return "";

  return `
    <div style="margin-top:20px;padding:16px 18px;border:1px solid #e1cfad;background:#fff8ec;border-radius:14px;">
      ${order.awb ? `<p style="margin:0 0 8px;color:#5b4633;"><strong>AWB:</strong> ${escapeHtml(order.awb)}</p>` : ""}
      ${
        order.trackingUrl
          ? `<a href="${escapeHtml(order.trackingUrl)}" style="display:inline-block;color:#8c5b1f;text-decoration:none;font-weight:700;">Track parcel</a>`
          : ""
      }
    </div>`;
}

function shellHtml({
  eyebrow,
  title,
  intro,
  body,
  cta,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  body: string;
  cta?: { href: string; label: string };
}) {
  return `<!doctype html>
<html>
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;background:#0b0806;padding:28px 12px;font-family:Georgia,'Times New Roman',serif;color:#281b13;">
    <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style="max-width:680px;background:#fffaf1;border:1px solid #d9bf83;border-radius:22px;overflow:hidden;">
            <tr>
              <td style="padding:30px 32px;background:linear-gradient(135deg,#1a1008,#4b2b0e 52%,#c9a96e);color:#fff8e8;">
                <div style="font-size:12px;letter-spacing:0.34em;text-transform:uppercase;color:#e9d29a;">Saptambu</div>
                <h1 style="margin:22px 0 8px;font-size:34px;line-height:1.05;font-weight:400;">${escapeHtml(title)}</h1>
                <p style="margin:0;color:#f0ddba;font-size:16px;line-height:1.6;">${escapeHtml(intro)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px 34px;">
                <div style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#a37a37;margin-bottom:16px;">${escapeHtml(eyebrow)}</div>
                ${body}
                ${
                  cta
                    ? `<div style="margin-top:28px;"><a href="${escapeHtml(cta.href)}" style="display:inline-block;background:#9b2f22;color:#fff7e8;text-decoration:none;padding:13px 20px;border-radius:999px;font-size:13px;font-weight:700;letter-spacing:0.08em;">${escapeHtml(cta.label)}</a></div>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="padding:22px 32px;background:#f2e6cf;color:#6c5845;font-size:13px;line-height:1.7;">
                This is an automated Saptambu update. For help, reply to this email or contact ${escapeHtml(
                  process.env.OWNER_EMAIL || process.env.SMTP_USER || "the Saptambu team",
                )}.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function totalsHtml(order: OrderWithItems) {
  return `
    <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style="margin-top:10px;">
      <tr>
        <td style="padding:7px 0;color:#6d5f52;">Subtotal</td>
        <td align="right" style="padding:7px 0;color:#281b13;">${escapeHtml(formatMoney(toNumber(order.subtotal)))}</td>
      </tr>
      <tr>
        <td style="padding:7px 0;color:#6d5f52;">Discount</td>
        <td align="right" style="padding:7px 0;color:#281b13;">-${escapeHtml(formatMoney(toNumber(order.discountTotal)))}</td>
      </tr>
      <tr>
        <td style="padding:12px 0 0;border-top:1px solid #e6d6b8;font-size:18px;font-weight:700;color:#281b13;">Total</td>
        <td align="right" style="padding:12px 0 0;border-top:1px solid #e6d6b8;font-size:18px;font-weight:700;color:#281b13;">${escapeHtml(
          formatMoney(toNumber(order.total)),
        )}</td>
      </tr>
    </table>`;
}

function orderSummaryHtml(order: OrderWithItems) {
  return `
    <div style="border:1px solid #eadcc2;border-radius:16px;padding:0 18px;margin-top:18px;background:#fffdf8;">
      <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
        ${orderRowsHtml(order)}
      </table>
      ${totalsHtml(order)}
    </div>`;
}

async function createEmailLog(payload: EmailPayload) {
  const db = getDb();
  if (!db) return null;

  try {
    const log = await db.emailLog.create({
      data: {
        recipient: payload.to,
        recipientRole: payload.recipientRole,
        event: payload.event,
        subject: payload.subject,
        status: EmailStatus.PENDING,
        orderId: payload.orderId || null,
        deliveryUpdateId: payload.deliveryUpdateId || null,
      },
      select: { id: true },
    });
    return log.id;
  } catch (error) {
    console.warn("Unable to create email log.", error);
    return null;
  }
}

async function updateEmailLog(id: string | null, status: EmailStatus, error?: unknown) {
  if (!id) return;
  const db = getDb();
  if (!db) return;

  try {
    await db.emailLog.update({
      where: { id },
      data: {
        status,
        sentAt: status === EmailStatus.SENT ? new Date() : null,
        error: error instanceof Error ? error.message : error ? String(error) : null,
      },
    });
  } catch (logError) {
    console.warn("Unable to update email log.", logError);
  }
}

async function sendEmailMessage(payload: EmailMessagePayload): Promise<EmailMessageOutcome> {
  const to = normalizeEmailAddress(payload.to);

  if (!to) {
    const error = `Invalid email recipient: ${payload.to || "(missing recipient)"}`;
    console.warn("Email failed.", { to: payload.to, subject: payload.subject, error });
    return { status: EmailStatus.FAILED, recipient: payload.to, error };
  }

  const mailer = getTransporter();

  if (!mailer) {
    const missing = missingSmtpFields();
    const message = `SMTP is not configured${missing.length ? `; missing ${missing.join(", ")}.` : "."}`;
    console.info("Email skipped; SMTP is not configured.", { to, subject: payload.subject, missing });
    return { status: EmailStatus.SKIPPED, recipient: to, error: message };
  }

  try {
    await mailer.sendMail({
      to,
      from: fromEmail(),
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
      replyTo: payload.replyTo ? normalizeEmailAddress(payload.replyTo) || undefined : undefined,
    });
    return { status: EmailStatus.SENT, recipient: to };
  } catch (error) {
    console.warn("Email failed.", { to, subject: payload.subject, error });
    return {
      status: EmailStatus.FAILED,
      recipient: to,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function sendTransactionalEmail(payload: EmailPayload): Promise<EmailSendOutcome> {
  const to = normalizeEmailAddress(payload.to);
  const safePayload = { ...payload, to: to || payload.to || "(missing recipient)" };
  const logId = await createEmailLog(safePayload);
  const outcome = await sendEmailMessage(payload);

  await updateEmailLog(logId, outcome.status, outcome.error);
  return { status: outcome.status, recipient: outcome.recipient, event: payload.event };
}

function orderConfirmationEmail(order: OrderWithItems): EmailPayload {
  const confirmationUrl = siteUrl() ? `${siteUrl()}/order-confirmation/${order.orderNumber}` : "";
  const subject = `Saptambu order confirmed: ${order.orderNumber}`;
  const text = `Namaste ${order.customerName},

Thank you for your order ${order.orderNumber}.

Items:
${orderLinesText(order)}

Total paid: ${formatMoney(toNumber(order.total))}

We will prepare your parcel and share delivery updates by email.`;

  const html = shellHtml({
    eyebrow: `Order ${order.orderNumber}`,
    title: "Your Saptambu order is confirmed",
    intro: "Thank you. We have received your payment and will prepare your parcel with care.",
    body: `
      <p style="margin:0;color:#5b4633;font-size:16px;line-height:1.8;">Namaste ${escapeHtml(order.customerName)},</p>
      ${orderSummaryHtml(order)}
      <p style="margin:22px 0 0;color:#5b4633;font-size:15px;line-height:1.8;">We will email you again when the parcel moves to the next delivery stage.</p>`,
    cta: confirmationUrl ? { href: confirmationUrl, label: "View order" } : undefined,
  });

  return {
    to: order.customerEmail,
    recipientRole: EmailRecipientRole.CUSTOMER,
    event: EmailEvent.ORDER_CONFIRMATION,
    subject,
    text,
    html,
    orderId: order.id,
  };
}

function ownerOrderEmail(order: OrderWithItems, to: string): EmailPayload {
  const adminUrl = siteUrl() ? `${siteUrl()}/admin/orders/${order.id}` : "";
  const subject = `New Saptambu paid order: ${order.orderNumber}`;
  const text = `New paid order ${order.orderNumber}

Customer: ${order.customerName}
Email: ${order.customerEmail}
Phone: ${order.customerPhone}
Address: ${addressLine(order)}

Items:
${orderLinesText(order)}

Subtotal: ${formatMoney(toNumber(order.subtotal))}
Discount: ${formatMoney(toNumber(order.discountTotal))}
Total: ${formatMoney(toNumber(order.total))}
Payment: ${order.razorpayPaymentId || "Razorpay verified"}`;

  const html = shellHtml({
    eyebrow: `Paid order ${order.orderNumber}`,
    title: "New paid order received",
    intro: "A customer has completed payment. Prepare the parcel and update delivery from admin.",
    body: `
      <div style="border:1px solid #eadcc2;border-radius:16px;padding:18px;background:#fffdf8;color:#5b4633;font-size:15px;line-height:1.8;">
        <strong style="color:#281b13;">${escapeHtml(order.customerName)}</strong><br />
        ${escapeHtml(order.customerEmail)} · ${escapeHtml(order.customerPhone)}<br />
        ${escapeHtml(addressLine(order))}
      </div>
      ${orderSummaryHtml(order)}
      <p style="margin:20px 0 0;color:#5b4633;font-size:15px;">Payment: ${escapeHtml(
        order.razorpayPaymentId || "Razorpay verified",
      )}</p>`,
    cta: adminUrl ? { href: adminUrl, label: "Open order" } : undefined,
  });

  return {
    to,
    recipientRole: EmailRecipientRole.OWNER,
    event: EmailEvent.OWNER_ORDER_NOTIFICATION,
    subject,
    text,
    html,
    orderId: order.id,
  };
}

function deliveryEmail(order: OrderWithItems, deliveryUpdate: DeliveryUpdate): EmailPayload {
  const subject = `Saptambu delivery update: ${order.orderNumber}`;
  const status = prettyStatus(deliveryUpdate.status);
  const text = `Namaste ${order.customerName},

Delivery status for ${order.orderNumber}: ${status}

${deliveryUpdate.message}${trackingText(order)}

Thank you,
Saptambu`;

  const html = shellHtml({
    eyebrow: `Order ${order.orderNumber}`,
    title: "Delivery update",
    intro: `Your order is now marked as ${status}.`,
    body: `
      <div style="border-left:3px solid #c9a96e;padding-left:18px;">
        <div style="font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#a37a37;">${escapeHtml(status)}</div>
        <p style="margin:10px 0 0;color:#5b4633;font-size:16px;line-height:1.8;">${nl2br(deliveryUpdate.message)}</p>
      </div>
      ${trackingHtml(order)}`,
  });

  return {
    to: order.customerEmail,
    recipientRole: EmailRecipientRole.CUSTOMER,
    event: EmailEvent.DELIVERY_UPDATE,
    subject,
    text,
    html,
    orderId: order.id,
    deliveryUpdateId: deliveryUpdate.id,
  };
}

function ownerDeliveryEmail(order: OrderWithItems, deliveryUpdate: DeliveryUpdate, to: string): EmailPayload {
  const adminUrl = siteUrl() ? `${siteUrl()}/admin/orders/${order.id}` : "";
  const status = prettyStatus(deliveryUpdate.status);
  const subject = `Order delivery updated: ${order.orderNumber}`;
  const text = `Delivery update saved for ${order.orderNumber}

Status: ${status}
Customer: ${order.customerName}
Email: ${order.customerEmail}
Phone: ${order.customerPhone}

Message:
${deliveryUpdate.message}${trackingText(order)}`;

  const html = shellHtml({
    eyebrow: `Order ${order.orderNumber}`,
    title: "Delivery update saved",
    intro: `${order.customerName}'s order is now marked as ${status}.`,
    body: `
      <div style="border:1px solid #eadcc2;border-radius:16px;padding:18px;background:#fffdf8;color:#5b4633;font-size:15px;line-height:1.8;">
        <strong style="color:#281b13;">${escapeHtml(order.customerName)}</strong><br />
        ${escapeHtml(order.customerEmail)} · ${escapeHtml(order.customerPhone)}<br />
        Status: <strong>${escapeHtml(status)}</strong>
      </div>
      <p style="margin:20px 0 0;color:#5b4633;font-size:16px;line-height:1.8;">${nl2br(deliveryUpdate.message)}</p>
      ${trackingHtml(order)}`,
    cta: adminUrl ? { href: adminUrl, label: "Open order" } : undefined,
  });

  return {
    to,
    recipientRole: EmailRecipientRole.OWNER,
    event: EmailEvent.OWNER_DELIVERY_UPDATE,
    subject,
    text,
    html,
    orderId: order.id,
    deliveryUpdateId: deliveryUpdate.id,
  };
}

export async function sendOrderConfirmationEmails(order: OrderWithItems, options: OrderEmailOptions = {}) {
  const emails: EmailPayload[] = [];
  const owner = ownerEmail();
  const includeCustomer = options.includeCustomer !== false;
  const includeOwner = options.includeOwner !== false;

  if (includeCustomer) {
    emails.push(orderConfirmationEmail(order));
  }

  if (includeOwner && owner) {
    emails.push(ownerOrderEmail(order, owner));
  } else if (includeOwner) {
    console.info("Owner order email skipped; OWNER_EMAIL and SMTP_USER are not configured.");
  }

  return Promise.all(emails.map(sendTransactionalEmail));
}

export async function sendDeliveryUpdateEmails(order: OrderWithItems, deliveryUpdate: DeliveryUpdate) {
  const emails = [deliveryEmail(order, deliveryUpdate)];
  const owner = ownerEmail();

  if (owner) {
    emails.push(ownerDeliveryEmail(order, deliveryUpdate, owner));
  } else {
    console.info("Owner delivery email skipped; OWNER_EMAIL and SMTP_USER are not configured.");
  }

  return Promise.all(emails.map(sendTransactionalEmail));
}

export async function sendContactEmails({
  name,
  email,
  phone,
  message,
}: {
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  const owner = ownerEmail();
  const ownerSubject = `New contact enquiry from ${name}`;
  const ownerText = `New contact enquiry

Name: ${name}
Email: ${email}
Phone: ${phone}

Message:
${message}`;
  const ownerHtml = shellHtml({
    eyebrow: "Contact enquiry",
    title: "New contact enquiry",
    intro: "A visitor sent a message from the Saptambu contact page.",
    body: contactDetailRows({ name, email, phone, message }),
  });

  const customerSubject = "We received your message - Saptambu";
  const customerText = `Namaste ${name},

Thank you for contacting Saptambu. We have received your message and will get back to you soon.

Your message:
${message}

Thank you,
Saptambu`;
  const customerHtml = shellHtml({
    eyebrow: "Message received",
    title: "We received your message",
    intro: "Thank you for contacting Saptambu. We will get back to you soon.",
    body: `
      <p style="margin:0;color:#5b4633;font-size:16px;line-height:1.8;">Namaste ${escapeHtml(name)},</p>
      <p style="margin:16px 0 0;color:#5b4633;font-size:15px;line-height:1.8;">Your message has reached our team.</p>
      <div style="margin-top:20px;border-left:3px solid #c9a96e;padding-left:18px;">
        <p style="margin:0;color:#5b4633;font-size:15px;line-height:1.8;">${nl2br(message)}</p>
      </div>`,
  });

  return Promise.all([
    sendEmailMessage({
      to: owner,
      replyTo: email,
      subject: ownerSubject,
      text: ownerText,
      html: ownerHtml,
    }),
    sendEmailMessage({
      to: email,
      subject: customerSubject,
      text: customerText,
      html: customerHtml,
    }),
  ]);
}

export const sendOrderEmails = sendOrderConfirmationEmails;
