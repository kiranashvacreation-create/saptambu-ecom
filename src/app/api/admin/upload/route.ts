import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getCloudinary } from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const cloudinary = getCloudinary();
    if (!cloudinary) {
      return NextResponse.json({ error: "Cloudinary is not configured." }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No image file uploaded." }, { status: 400 });
    }
    const folder = formData.get("folder") === "media" ? "saptambu/media" : "saptambu/products";

    const bytes = Buffer.from(await file.arrayBuffer());
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: "image" },
        (error, uploadResult) => {
          if (error || !uploadResult) reject(error || new Error("Upload failed."));
          else resolve(uploadResult as { secure_url: string });
        },
      );
      stream.end(bytes);
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to upload image." },
      { status: 400 },
    );
  }
}
