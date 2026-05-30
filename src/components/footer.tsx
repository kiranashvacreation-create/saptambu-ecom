"use client";

import Link from "next/link";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-[var(--border)] bg-[#211b17] text-[#f8f2e8]">
      <div className="container-page grid gap-8 py-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-xl font-semibold">{site.name}</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#d8cab8]">{site.description}</p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#dfb45f]">Shop</p>
          <div className="mt-3 grid gap-2 text-sm text-[#d8cab8]">
            <Link href="/collections/all">All products</Link>
            <Link href="/collections/sacred-waters">Sacred waters</Link>
            <Link href="/collections/daily-puja-essentials">Daily puja essentials</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#dfb45f]">Contact</p>
          <div className="mt-3 grid gap-2 text-sm text-[#d8cab8]">
            <a href={`mailto:${site.email}`}>{site.email}</a>
            <a href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a>
            <Link href="/pages/contact">Contact page</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
