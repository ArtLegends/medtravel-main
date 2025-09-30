// app/clinic/[slug]/inquiry/page.tsx
import Image from "next/image";
import { notFound } from "next/navigation";
import { getClinicBySlug } from "@/lib/mock/clinic";

import ClinicInquiryForm from "./ClinicInquiryForm";

export const metadata = {
  title: "Clinic Inquiry • MedTravel",
};

export default async function ClinicInquiryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const clinic = getClinicBySlug(slug);
  if (!clinic) return notFound();

  const cover = clinic.images?.[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="sr-only">Clinic Inquiry</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* LEFT: form */}
        <div className="rounded-xl border bg-white p-4 sm:p-6">
          <ClinicInquiryForm
            clinicSlug={clinic.slug}
            clinicName={clinic.name}
            services={(clinic.services ?? []).map((s) => s.name)}
          />
        </div>

        {/* RIGHT: clinic card */}
        <aside className="rounded-xl border bg-white">
          {cover ? (
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-xl">
              <Image
                src={cover}
                alt={`${clinic.name} photo`}
                fill
                className="object-cover"
                sizes="(min-width:1024px) 380px, 100vw"
              />
            </div>
          ) : null}

          <div className="p-4 sm:p-5">
            <div className="text-lg font-semibold">{clinic.name}</div>

            {clinic.location?.address && (
              <div className="mt-3 text-sm text-gray-700">
                <div className="mb-1 font-medium">Address</div>
                <div>{clinic.location.address}</div>
              </div>
            )}

            {clinic.hours?.length ? (
              <div className="mt-5">
                <div className="mb-2 text-sm font-semibold">Operation Hours</div>
                <ul className="grid grid-cols-1 gap-1 text-sm">
                  {clinic.hours.map((h) => (
                    <li
                      key={h.day}
                      className="flex justify-between rounded-md bg-gray-50 px-3 py-1.5"
                    >
                      <span className="font-medium">{h.day}</span>
                      <span>{h.open && h.close ? `${h.open} - ${h.close}` : "—"}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
