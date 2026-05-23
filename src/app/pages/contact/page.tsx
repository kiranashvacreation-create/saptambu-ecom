import { Mail, Phone } from "lucide-react";
import { site } from "@/lib/site";

export default function ContactPage() {
  return (
    <section className="container-page py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b2f22]">Contact</p>
      <h1 className="mt-2 text-4xl font-semibold">Contact</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <a className="focus-ring rounded-lg border border-[var(--border)] bg-white p-6" href={`mailto:${site.email}`}>
          <Mail className="text-[#1c6d62]" />
          <p className="mt-4 font-semibold">Email</p>
          <p className="mt-1 text-[#6d5f52]">{site.email}</p>
        </a>
        <a className="focus-ring rounded-lg border border-[var(--border)] bg-white p-6" href={`tel:${site.phone.replace(/\s/g, "")}`}>
          <Phone className="text-[#9b2f22]" />
          <p className="mt-4 font-semibold">Phone</p>
          <p className="mt-1 text-[#6d5f52]">{site.phone}</p>
        </a>
      </div>
    </section>
  );
}
