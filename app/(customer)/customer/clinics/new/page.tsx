import { createServerClient } from "@/lib/supabase/serverClient";
import { revalidatePath } from "next/cache";

export default async function NewClinicPage() {
  async function createClinic(formData: FormData) {
    "use server";
    const sb = await createServerClient();
    const { data: { user } } = await sb.auth.getUser();

    const payload = {
      name: String(formData.get("name") || "").trim(),
      slug: String(formData.get("slug") || "").trim(),
      country: String(formData.get("country") || "").trim(),
      city: String(formData.get("city") || "").trim(),
      address: String(formData.get("address") || "").trim(),
      owner_id: user!.id,
      moderation_status: "pending",
    };

    const { error } = await sb.from("clinics").insert(payload);
    if (error) throw error;
    revalidatePath("/customer/clinics");
  }

  return (
    <form action={createClinic} className="max-w-xl space-y-4">
      <input name="name" placeholder="Clinic name" className="input" required />
      <input name="slug" placeholder="slug" className="input" required />
      <input name="country" placeholder="Country" className="input" required />
      <input name="city" placeholder="City" className="input" required />
      <input name="address" placeholder="Address" className="input" />
      <button className="btn-primary">Submit for moderation</button>
      <p className="text-sm text-gray-500 mt-2">Status will be <b>pending</b> until admin approves.</p>
    </form>
  );
}
