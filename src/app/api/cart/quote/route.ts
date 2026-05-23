import { NextResponse } from "next/server";
import { z } from "zod";
import { quoteCart } from "@/lib/checkout";

const schema = z.object({
  items: z.array(z.object({ productId: z.string(), quantity: z.number() })).min(1),
  couponCode: z.string().optional(),
  customerEmail: z.string().email().optional(),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const quote = await quoteCart(input);
    return NextResponse.json({ quote });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to quote cart." },
      { status: 400 },
    );
  }
}
