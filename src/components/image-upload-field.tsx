"use client";

import { useState } from "react";

export function ImageUploadField({
  defaultValue = "",
  folder = "products",
  multiple = true,
  name = "imageUrls",
}: {
  defaultValue?: string;
  folder?: "media" | "products";
  multiple?: boolean;
  name?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.set("file", file);
    formData.set("folder", folder);
    const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "Upload failed.");
      return;
    }
    setValue((current) => (multiple ? [current, data.url].filter(Boolean).join("\n") : data.url));
  }

  return (
    <div className="grid gap-3">
      {multiple ? (
        <textarea
          name={name}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          rows={5}
          className="focus-ring rounded-md border border-[var(--border)] bg-white px-3 py-2 font-mono text-sm"
          placeholder="One image URL per line"
        />
      ) : (
        <>
          <input
            name={name}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="focus-ring h-11 rounded-md border border-[var(--border)] bg-white px-3 font-mono text-sm"
            placeholder="Image URL"
          />
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" src={value} className="aspect-[16/9] w-full rounded-md border border-[var(--border)] object-cover" />
          ) : null}
        </>
      )}
      <input type="file" accept="image/*" onChange={upload} className="text-sm" />
      {loading ? <p className="text-sm text-[#6d5f52]">Uploading to Cloudinary...</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
