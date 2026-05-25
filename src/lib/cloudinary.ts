import "server-only";

import { v2 as cloudinary } from "cloudinary";

let configured = false;

function envValue(value: string | undefined) {
  const trimmed = (value || "").trim().replace(/^['"]+|['"]+$/g, "").trim();
  if (!trimmed || trimmed.startsWith("your-")) return "";
  return trimmed;
}

export function getCloudinary() {
  const cloudName = envValue(process.env.CLOUDINARY_CLOUD_NAME);
  const apiKey = envValue(process.env.CLOUDINARY_API_KEY);
  const apiSecret = envValue(process.env.CLOUDINARY_API_SECRET);

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  if (!configured) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    configured = true;
  }

  return cloudinary;
}
