export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}

export const inputClass = "focus-ring h-11 rounded-md border border-[var(--border)] bg-white px-3";
export const textareaClass = "focus-ring rounded-md border border-[var(--border)] bg-white px-3 py-2";
