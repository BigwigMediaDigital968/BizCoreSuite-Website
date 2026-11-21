import { NextResponse } from "next/server";
import { cloudinaryConfig, uploadImage } from "@/src/lib/cloudinary";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

/** POST /api/upload — admin only (enforced in proxy.ts). multipart field: "file" */
export async function POST(req: Request) {
  if (!cloudinaryConfig()) {
    return NextResponse.json(
      { error: "Image uploads are not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET." },
      { status: 503 }
    );
  }

  let file: FormDataEntryValue | null;
  try {
    file = (await req.formData()).get("file");
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data with a 'file' field" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported type. Use JPG, PNG, WebP, GIF or AVIF." }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image is too large (max 10 MB)." }, { status: 413 });
  }

  try {
    const result = await uploadImage(file);
    return NextResponse.json({ ...result, url: result.optimizedUrl, originalUrl: result.url });
  } catch (error) {
    console.error("POST /api/upload failed:", error);
    return NextResponse.json({ error: "Upload to Cloudinary failed." }, { status: 502 });
  }
}
