import type { ImageLoaderProps } from "next/image";

type CloudinaryImageOptions = {
  width?: number;
  quality?: number | "auto";
  crop?: "fill" | "fit" | "limit";
  gravity?: "auto";
  height?: number;
};

export function isCloudinaryImage(src: unknown): src is string {
  if (typeof src !== "string") return false;

  try {
    const url = new URL(src);
    return url.hostname === "res.cloudinary.com" && url.pathname.includes("/image/upload/");
  } catch {
    return false;
  }
}

export function getCloudinaryImageUrl(src: string, options: CloudinaryImageOptions = {}) {
  if (!isCloudinaryImage(src)) return src;

  const url = new URL(src);
  const marker = "/image/upload/";
  const [prefix, imagePath] = url.pathname.split(marker);

  if (!prefix || !imagePath) return src;

  const transforms = [
    "f_auto",
    options.quality && options.quality !== "auto" ? `q_${options.quality}` : "q_auto",
    `c_${options.crop || "limit"}`,
    options.gravity ? `g_${options.gravity}` : null,
    options.width ? `w_${Math.round(options.width)}` : null,
    options.height ? `h_${Math.round(options.height)}` : null,
  ].filter(Boolean);

  url.pathname = `${prefix}${marker}${transforms.join(",")}/${imagePath}`;
  return url.toString();
}

export function cloudinaryImageLoader({ src, width, quality }: ImageLoaderProps) {
  return getCloudinaryImageUrl(src, {
    crop: "limit",
    quality: quality || "auto",
    width,
  });
}
