import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/discounts", label: "Discounts" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="container-page py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b2f22]">Back office</p>
          <h1 className="text-3xl font-semibold">Saptambu Admin</h1>
        </div>
        <form action={logoutAction}>
          <button className="focus-ring h-10 rounded-md border border-[var(--border)] bg-white px-4 text-sm font-semibold">
            Logout
          </button>
        </form>
      </div>
      <nav className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="focus-ring whitespace-nowrap rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      {children}
    </section>
  );
}
