"use client";

import Script from "next/script";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-provider";
import { EmptyState } from "@/components/empty-state";
import { formatMoney } from "@/lib/money";

type Quote = {
  subtotal: number;
  discountTotal: number;
  total: number;
  lines: { productId: string; title: string; quantity: number; lineTotal: number }[];
};

type RazorpayPayment = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: "INR";
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: FormDataEntryValue | null;
    email: FormDataEntryValue | null;
    contact: FormDataEntryValue | null;
  };
  handler: (payment: RazorpayPayment) => Promise<void>;
  modal: { ondismiss: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

export function CheckoutClient() {
  const router = useRouter();
  const { items, clear } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const payloadItems = useMemo(
    () => items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    [items],
  );

  useEffect(() => {
    if (!items.length) return;

    const run = async () => {
      setError("");
      const response = await fetch("/api/cart/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payloadItems, couponCode }),
      });
      const data = await response.json();
      if (!response.ok) setError(data.error || "Unable to quote cart.");
      else setQuote(data.quote);
    };

    const id = window.setTimeout(run, 250);
    return () => window.clearTimeout(id);
  }, [couponCode, items.length, payloadItems]);

  if (!items.length) {
    return (
      <section className="container-page py-12">
        <EmptyState title="Your cart is empty" message="Add products before checkout." action={{ href: "/collections/all", label: "Shop products" }} />
      </section>
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const body = {
      items: payloadItems,
      couponCode,
      customer: Object.fromEntries(formData.entries()),
    };

    const response = await fetch("/api/checkout/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Unable to start checkout.");
      setLoading(false);
      return;
    }

    if (!window.Razorpay) {
      setError("Razorpay script did not load. Please refresh and try again.");
      setLoading(false);
      return;
    }

    const razorpay = new window.Razorpay({
      key: data.keyId,
      amount: data.amount,
      currency: "INR",
      name: "Saptambu",
      description: `Order ${data.orderNumber}`,
      order_id: data.razorpayOrderId,
      prefill: {
        name: formData.get("customerName"),
        email: formData.get("customerEmail"),
        contact: formData.get("customerPhone"),
      },
      handler: async (payment: RazorpayPayment) => {
        const verify = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payment, orderNumber: data.orderNumber }),
        });
        const verified = await verify.json();
        if (!verify.ok) {
          setError(verified.error || "Payment verification failed.");
          setLoading(false);
          return;
        }
        clear();
        router.push(`/order-confirmation/${data.orderNumber}`);
      },
      modal: {
        ondismiss: () => setLoading(false),
      },
    });

    razorpay.open();
  }

  return (
    <section className="container-page py-10">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <h1 className="text-4xl font-semibold">Checkout</h1>
      <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4 rounded-lg border border-[var(--border)] bg-white p-5">
          <h2 className="text-xl font-semibold">Delivery details</h2>
          {[
            ["customerName", "Full name"],
            ["customerEmail", "Email"],
            ["customerPhone", "Phone"],
            ["addressLine1", "Address line 1"],
            ["addressLine2", "Address line 2"],
            ["city", "City"],
            ["state", "State"],
            ["pincode", "Pincode"],
          ].map(([name, label]) => (
            <label key={name} className="grid gap-2 text-sm font-medium">
              {label}
              <input
                name={name}
                required={!["addressLine2"].includes(name)}
                type={name === "customerEmail" ? "email" : "text"}
                className="focus-ring h-11 rounded-md border border-[var(--border)] px-3"
              />
            </label>
          ))}
          <label className="grid gap-2 text-sm font-medium">
            Notes
            <textarea name="notes" rows={4} className="focus-ring rounded-md border border-[var(--border)] px-3 py-2" />
          </label>
        </div>
        <aside className="h-fit rounded-lg border border-[var(--border)] bg-white p-5">
          <h2 className="text-xl font-semibold">Order summary</h2>
          <div className="mt-4 grid gap-3 text-sm">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between gap-4">
                <span>
                  {item.quantity} x {item.title}
                </span>
                <span>{formatMoney(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <label className="mt-5 grid gap-2 text-sm font-medium">
            Coupon code
            <input
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
              className="focus-ring h-11 rounded-md border border-[var(--border)] px-3"
            />
          </label>
          {quote ? (
            <div className="mt-5 grid gap-2 border-t border-[var(--border)] pt-4 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatMoney(quote.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span>-{formatMoney(quote.discountTotal)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatMoney(quote.total)}</span>
              </div>
            </div>
          ) : null}
          {error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          <button
            className="focus-ring mt-5 h-12 w-full rounded-md bg-[#9b2f22] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Opening Razorpay..." : "Pay with Razorpay"}
          </button>
        </aside>
      </form>
    </section>
  );
}
