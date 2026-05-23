import Link from "next/link";

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--border)] bg-white p-8 text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#6d5f52]">{message}</p>
      {action ? (
        <Link
          href={action.href}
          className="focus-ring mt-5 inline-flex h-11 items-center justify-center rounded-md bg-[#1c6d62] px-5 text-sm font-semibold text-white"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
