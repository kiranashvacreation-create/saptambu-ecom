"use client";

import { type ChangeEvent, type ClipboardEvent, type DragEvent, useRef, useState } from "react";

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
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  function appendUrl(url: string) {
    setValue((current) => (multiple ? [current, url].filter(Boolean).join("\n") : url));
  }

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Only image files can be uploaded.");
      return;
    }

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
    appendUrl(data.url);
  }

  async function uploadFiles(files: FileList | File[]) {
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (!imageFiles.length) {
      setError("Drop or paste an image file.");
      return;
    }

    for (const file of multiple ? imageFiles : imageFiles.slice(0, 1)) {
      await uploadFile(file);
    }
  }

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length) return;
    await uploadFiles(files);
    event.target.value = "";
  }

  function onDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(true);
  }

  function onDragLeave(event: DragEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setDragActive(false);
    }
  }

  async function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    await uploadFiles(event.dataTransfer.files);
  }

  async function onPaste(event: ClipboardEvent<HTMLDivElement>) {
    const files = Array.from(event.clipboardData.files).filter((file) => file.type.startsWith("image/"));
    if (!files.length) return;
    event.preventDefault();
    await uploadFiles(files);
  }

  return (
    <div
      className={`grid gap-3 rounded-md border border-dashed p-3 transition ${
        dragActive ? "border-[#1c6d62] bg-[#f1faf6]" : "border-[var(--border)] bg-[#fbfaf8]"
      }`}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onPaste={onPaste}
    >
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
      <div className="grid gap-2 rounded-md bg-white/72 p-3 text-sm text-[#6d5f52]">
        <p>Drag an image here, paste a copied image, or choose a file.</p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            className="focus-ring h-9 rounded-md border border-[var(--border)] bg-white px-3 font-semibold text-[#1c6d62]"
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            Choose image
          </button>
          <span>{multiple ? "Multiple images supported." : "One cover image."}</span>
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple={multiple} onChange={upload} className="sr-only" />
      {loading ? <p className="text-sm text-[#6d5f52]">Uploading to Cloudinary...</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
