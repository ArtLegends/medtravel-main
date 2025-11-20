"use server";

import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/adminClient";

const BUCKET = "admin-clinic-images";

export async function uploadClinicImages(files: File[]) {
  const supabase = createAdminClient();
  const urls: string[] = [];

  for (const file of files) {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `admin/${randomUUID()}.${ext}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      console.error("upload error", error);
      throw new Error("Failed to upload image");
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
    urls.push(pub.publicUrl);
  }

  return urls;
}
