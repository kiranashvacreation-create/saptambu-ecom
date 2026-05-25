import { Mail, MessageSquareText, Phone, Send } from "lucide-react";
import { sendContactAction } from "@/app/pages/contact/actions";
import { site } from "@/lib/site";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <section className="container-page py-12 sm:py-16">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b2f22]">Contact</p>
        <h1 className="mt-2 text-4xl font-semibold">Contact</h1>
        <p className="mt-4 text-[#6d5f52]">
          Send us a note for product questions, bulk orders, rituals, or delivery help. We will reply as soon as we can.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <form action={sendContactAction} className="grid gap-5 rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <MessageSquareText className="text-[#1c6d62]" />
            <h2 className="text-xl font-semibold">Send a message</h2>
          </div>

          {params.sent === "1" ? (
            <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
              Thank you. Your message has been sent, and a confirmation email is on its way.
            </p>
          ) : null}
          {params.error === "1" ? (
            <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
              We could not send your message. Please check the fields or email us directly.
            </p>
          ) : null}

          <div className="hidden" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Name
              <input
                name="name"
                required
                minLength={2}
                maxLength={120}
                className="focus-ring h-11 rounded-md border border-[var(--border)] bg-white px-3"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Email
              <input
                name="email"
                required
                type="email"
                maxLength={180}
                className="focus-ring h-11 rounded-md border border-[var(--border)] bg-white px-3"
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-medium">
            Phone
            <input
              name="phone"
              required
              minLength={8}
              maxLength={40}
              className="focus-ring h-11 rounded-md border border-[var(--border)] bg-white px-3"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Message
            <textarea
              name="message"
              required
              minLength={10}
              maxLength={3000}
              rows={7}
              className="focus-ring rounded-md border border-[var(--border)] bg-white px-3 py-2"
            />
          </label>

          <button className="focus-ring inline-flex h-11 w-fit items-center justify-center gap-2 rounded-md bg-[#9b2f22] px-5 font-semibold text-white">
            <Send size={17} />
            Send message
          </button>
        </form>

        <aside className="grid h-fit gap-4">
          <a className="focus-ring rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm" href={`mailto:${site.email}`}>
            <Mail className="text-[#1c6d62]" />
            <p className="mt-4 font-semibold">Email</p>
            <p className="mt-1 break-all text-[#6d5f52]">{site.email}</p>
          </a>
          <a className="focus-ring rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm" href={`tel:${site.phone.replace(/\s/g, "")}`}>
            <Phone className="text-[#9b2f22]" />
            <p className="mt-4 font-semibold">Phone</p>
            <p className="mt-1 text-[#6d5f52]">{site.phone}</p>
          </a>
        </aside>
      </div>
    </section>
  );
}
