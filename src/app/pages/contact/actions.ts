"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { EmailStatus } from "@/generated/prisma/client";
import { sendContactEmails } from "@/lib/email";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().min(8).max(40),
  message: z.string().trim().min(10).max(3000),
  website: z.string().trim().max(0),
});

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function sendContactAction(formData: FormData) {
  const parsed = contactSchema.safeParse({
    name: text(formData, "name"),
    email: text(formData, "email"),
    phone: text(formData, "phone"),
    message: text(formData, "message"),
    website: text(formData, "website"),
  });

  if (!parsed.success) {
    if (text(formData, "website")) {
      redirect("/pages/contact?sent=1");
    }

    redirect("/pages/contact?error=1");
  }

  const outcomes = await sendContactEmails(parsed.data);
  if (outcomes.some((outcome) => outcome.status !== EmailStatus.SENT)) {
    redirect("/pages/contact?error=1");
  }

  redirect("/pages/contact?sent=1");
}
