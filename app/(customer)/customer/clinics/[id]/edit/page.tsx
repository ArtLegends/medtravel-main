// app/(customer)/customer/clinics/[id]/edit/page.tsx
import { createAdminClient } from "@/lib/supabase/adminClient";
import type { InputHTMLAttributes } from "react";

type Params = { id: string };

export default async function EditClinicPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;

  const sbAdmin = createAdminClient();

  const { data: clinic, error } = await sbAdmin
    .from("clinics")
    .select(`
      id, name, slug, about, email, phone, website,
      address, country, province, city, district,
      moderation_status
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) return <pre className="text-red-600">{error.message}</pre>;
  if (!clinic) return <div>Clinic not found.</div>;

  return (
    <>
      <h1 className="text-2xl font-semibold">Edit clinic</h1>

      <form className="mt-4 grid gap-6 md:grid-cols-2">
        <Field label="Name" name="name" defaultValue={clinic.name ?? ""} />
        <Field label="Slug" name="slug" defaultValue={clinic.slug ?? ""} disabled />

        <Field label="Email" name="email" defaultValue={clinic.email ?? ""} />
        <Field label="Phone" name="phone" defaultValue={clinic.phone ?? ""} />
        <Field label="Website" name="website" defaultValue={clinic.website ?? ""} className="md:col-span-2" />

        <Field label="Address" name="address" defaultValue={clinic.address ?? ""} className="md:col-span-2" />
        <Field label="Country" name="country" defaultValue={clinic.country ?? ""} />
        <Field label="Province" name="province" defaultValue={clinic.province ?? ""} />
        <Field label="City" name="city" defaultValue={clinic.city ?? ""} />
        <Field label="District" name="district" defaultValue={clinic.district ?? ""} />

        <div className="md:col-span-2">
          <span className="mr-3 text-sm text-gray-600">
            Moderation status: <b>{clinic.moderation_status ?? "pending"}</b>
          </span>
          <button type="button" className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50">
            Save (stub)
          </button>
        </div>
      </form>
    </>
  );
}

function Field({
  label,
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <div className="mb-1 text-sm text-gray-600">{label}</div>
      <input
        {...rest}
        className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring disabled:bg-gray-50"
      />
    </label>
  );
}
