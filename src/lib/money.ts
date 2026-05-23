export function formatMoney(value: number | string) {
  const amount = typeof value === "string" ? Number(value) : value;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function paise(value: number) {
  return Math.round(value * 100);
}

export function rupeesFromPaise(value: number) {
  return Number((value / 100).toFixed(2));
}

export function toNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (value && typeof value === "object" && "toString" in value) {
    return Number(value.toString());
  }
  return 0;
}
