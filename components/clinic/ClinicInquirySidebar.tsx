// components/clinic/ClinicInquirySidebar.tsx
import Image from 'next/image';
import { Icon } from '@iconify/react';
import type { Clinic } from '@/lib/db/clinics';

function fullDayName(abbr: string) {
  switch (abbr) {
    case 'Mon': return 'Monday';
    case 'Tue': return 'Tuesday';
    case 'Wed': return 'Wednesday';
    case 'Thu': return 'Thursday';
    case 'Fri': return 'Friday';
    case 'Sat': return 'Saturday';
    case 'Sun': return 'Sunday';
    default: return abbr;
  }
}

export default function ClinicInquirySidebar({ clinic }: { clinic: Clinic }) {
  const cover = (clinic.images ?? []).find(Boolean);
  const address =
    clinic.location?.address ||
    [clinic.country, clinic.city, clinic.district].filter(Boolean).join(', ');

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      {cover && (
        <div className="relative h-44 w-full md:h-52">
          <Image
            src={cover}
            alt={clinic.name}
            fill
            sizes="380px"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-8 text-sm text-white">
            <div className="font-semibold">{clinic.name}</div>
            {address && (
              <div className="mt-1 flex items-center gap-1 text-xs text-white/80">
                <Icon icon="solar:map-point-linear" className="h-3.5 w-3.5" />
                <span className="line-clamp-1">{address}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4 p-5">
        {!cover && (
          <div>
            <h2 className="text-base font-semibold">{clinic.name}</h2>
            {address && (
              <div className="mt-1 flex items-start gap-2 text-sm text-gray-700">
                <Icon icon="solar:map-point-linear" className="mt-0.5 h-4 w-4 text-emerald-600" />
                <span>{address}</span>
              </div>
            )}
          </div>
        )}

        <div className="rounded-xl bg-gray-50 p-4 text-xs text-gray-600">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Icon icon="solar:info-circle-linear" className="h-4 w-4 text-emerald-600" />
            <span>What happens after you send an enquiry?</span>
          </div>
          <ol className="space-y-1 pl-4">
            <li className="list-decimal">
              We review your message and forward it to the clinic.
            </li>
            <li className="list-decimal">
              The clinic or our coordinator contacts you to clarify details.
            </li>
            <li className="list-decimal">
              Together you choose dates and the most suitable treatment plan.
            </li>
          </ol>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Icon icon="solar:clock-circle-linear" className="h-4 w-4 text-emerald-600" />
            <span>Operation Hours</span>
          </div>
          <ul className="space-y-1 rounded-xl bg-gray-50 p-3 text-sm">
            {(clinic.hours ?? []).map((h, i) => {
              const label = fullDayName(h.day);
              const val = h.open && h.close ? `${h.open} - ${h.close}` : 'Closed';
              return (
                <li
                  key={`${h.day}-${i}`}
                  className="flex items-center justify-between text-gray-700"
                >
                  <span>{label}</span>
                  <span className="font-medium">{val}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
