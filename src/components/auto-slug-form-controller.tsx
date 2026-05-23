"use client";

import { useEffect, useRef } from "react";
import { slugify } from "@/lib/slugs";

export function AutoSlugFormController({
  slugName = "slug",
  titleName = "title",
}: {
  slugName?: string;
  titleName?: string;
}) {
  const markerRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const form = markerRef.current?.closest("form");
    if (!form) return;

    const titleInput = form.querySelector<HTMLInputElement>(`input[name="${titleName}"]`);
    const slugInput = form.querySelector<HTMLInputElement>(`input[name="${slugName}"]`);
    if (!titleInput || !slugInput) return;

    let manuallyEdited = Boolean(slugInput.value.trim());

    const updatePlaceholder = () => {
      slugInput.placeholder = slugify(titleInput.value) || "auto-generated";
    };

    const syncSlug = () => {
      updatePlaceholder();
      if (manuallyEdited) return;
      slugInput.value = slugify(titleInput.value);
    };

    const onTitleInput = () => syncSlug();
    const onSlugInput = () => {
      manuallyEdited = Boolean(slugInput.value.trim());
      updatePlaceholder();
    };
    const onSlugBlur = () => {
      slugInput.value = slugify(slugInput.value);
      manuallyEdited = Boolean(slugInput.value.trim());
      syncSlug();
    };

    syncSlug();
    titleInput.addEventListener("input", onTitleInput);
    slugInput.addEventListener("input", onSlugInput);
    slugInput.addEventListener("blur", onSlugBlur);

    return () => {
      titleInput.removeEventListener("input", onTitleInput);
      slugInput.removeEventListener("input", onSlugInput);
      slugInput.removeEventListener("blur", onSlugBlur);
    };
  }, [slugName, titleName]);

  return <span ref={markerRef} hidden />;
}
