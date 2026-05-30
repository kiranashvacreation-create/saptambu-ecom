"use client";

import Link from "next/link";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";

const links = [
  { href: "/collections/all", label: "All Products" },
  { href: "/collections/daily-puja-essentials", label: "Daily Puja Essentials" },
  { href: "/collections/sacred-waters", label: "Sacred Waters" },
  { href: "/collections/spiritual-wellness-japmala", label: "Wellness & Japmala" },
  { href: "/pages/media-coverage-1", label: "Media" },
  { href: "/pages/contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const pathname = usePathname();
  const isHome = pathname === "/";

  function closeMenuSoon() {
    window.setTimeout(() => setOpen(false), 0);
  }

  return (
    <header
      className={
        isHome
          ? "absolute inset-x-0 top-0 z-40 border-b border-[#e3d6c2] bg-[#fffaf0]/92 text-[#2d251c] backdrop-blur-md"
          : "sticky top-0 z-40 border-b border-[var(--border)] bg-[#fbfaf6]/95 backdrop-blur"
      }
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="focus-ring flex items-center gap-3">
          <span
            className={
              isHome
                ? "grid h-10 w-10 place-items-center rounded-full bg-[#c99324] font-semibold text-[#211408]"
                : "grid h-10 w-10 place-items-center rounded-full bg-[#9b2f22] font-semibold text-white"
            }
          >
            S
          </span>
          <span>
            <span className="block text-lg font-semibold leading-5">Saptambu</span>
            <span className={isHome ? "block text-xs text-[#7a6a5a]" : "block text-xs text-[#7a6a5a]"}>
              Kiranashva Creation
            </span>
          </span>
        </Link>

        <nav
          className={
            isHome
              ? "hidden items-center gap-5 text-sm font-medium text-[#54483f] lg:flex"
              : "hidden items-center gap-5 text-sm font-medium text-[#54483f] lg:flex"
          }
        >
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={isHome ? "hover:text-[#b88424]" : "hover:text-[var(--accent)]"}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className={
              isHome
                ? "focus-ring grid h-10 w-10 place-items-center rounded-full border border-[#d8c8ae] bg-[#fffaf0]"
                : "focus-ring grid h-10 w-10 place-items-center rounded-full border border-[var(--border)] bg-white"
            }
            aria-label="Search"
          >
            <Search size={18} />
          </Link>
          <Link
            href="/cart"
            className={
              isHome
                ? "focus-ring relative grid h-10 w-10 place-items-center rounded-full border border-[#d8c8ae] bg-[#fffaf0]"
                : "focus-ring relative grid h-10 w-10 place-items-center rounded-full border border-[var(--border)] bg-white"
            }
            aria-label="Cart"
          >
            <ShoppingBag size={18} />
            {count > 0 ? (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#1c6d62] px-1 text-xs font-semibold text-white">
                {count}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            className={
              isHome
                ? "focus-ring grid h-10 w-10 place-items-center rounded-full border border-[#d8c8ae] bg-[#fffaf0] lg:hidden"
                : "focus-ring grid h-10 w-10 place-items-center rounded-full border border-[var(--border)] bg-white lg:hidden"
            }
            onClick={() => setOpen((value) => !value)}
            aria-controls="mobile-nav"
            aria-expanded={open}
            aria-label="Menu"
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>
      {open ? (
        <nav
          id="mobile-nav"
          className={
            isHome
              ? "border-t border-[#e3d6c2] bg-[#fffaf0] px-4 py-4 text-[#2d251c] lg:hidden"
              : "border-t border-[var(--border)] bg-white px-4 py-4 lg:hidden"
          }
        >
          <div className="container-page grid gap-3 text-sm font-medium">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={closeMenuSoon}>
                {link.label}
              </Link>
            ))}
            <Link href="/admin" onClick={closeMenuSoon}>
              Admin
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
