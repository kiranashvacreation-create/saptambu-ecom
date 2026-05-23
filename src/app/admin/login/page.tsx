import { loginAction } from "@/app/admin/actions";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <section className="container-page grid min-h-[70vh] place-items-center py-12">
      <div className="w-full max-w-md rounded-lg border border-[var(--border)] bg-white p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b2f22]">Back office</p>
        <h1 className="mt-2 text-3xl font-semibold">Admin login</h1>
        {!getDb() ? (
          <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
            DATABASE_URL is not configured yet. Add Railway PostgreSQL, run migrations, and seed the admin user.
          </p>
        ) : null}
        <form action={loginAction} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-medium">
            Email
            <input name="email" type="email" required className="focus-ring h-11 rounded-md border border-[var(--border)] px-3" />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Password
            <input name="password" type="password" required className="focus-ring h-11 rounded-md border border-[var(--border)] px-3" />
          </label>
          <ErrorMessage searchParams={searchParams} />
          <button className="focus-ring h-11 rounded-md bg-[#9b2f22] font-semibold text-white">Login</button>
        </form>
      </div>
    </section>
  );
}

async function ErrorMessage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return params.error ? <p className="text-sm text-red-700">Invalid admin credentials.</p> : null;
}
