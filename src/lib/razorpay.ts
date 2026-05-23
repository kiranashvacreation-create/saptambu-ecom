import "server-only";

import Razorpay from "razorpay";
import { createHmac } from "node:crypto";

let razorpay: Razorpay | null = null;

export function getRazorpay() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) return null;

  if (!razorpay) {
    razorpay = new Razorpay({ key_id, key_secret });
  }

  return razorpay;
}

export function verifyRazorpaySignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  const expected = createHmac("sha256", secret)
    .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
    .digest("hex");

  return expected === params.razorpaySignature;
}
