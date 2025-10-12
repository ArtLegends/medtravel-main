// components/clinic/ClinicInquirySidebar.tsx
import Image from 'next/image';
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
    <div className="rounded-2xl border">
      {cover && (
        <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
          <Image src={cover} alt={clinic.name} fill sizes="380px" className="object-cover" />
        </div>
      )}

      <div className="space-y-4 p-5">
        <h2 className="text-lg font-semibold">{clinic.name}</h2>

        {address && (
          <div className="text-sm text-gray-700">
            <div className="mb-1 font-medium">Address</div>
            <div>{address}</div>
          </div>
        )}

        <div>
          <div className="mb-2 text-sm font-semibold">Operation Hours</div>
          <ul className="space-y-1 text-sm">
            {(clinic.hours ?? []).map((h, i) => {
              const label = fullDayName(h.day);
              const val = h.open && h.close ? `${h.open} - ${h.close}` : 'Closed';
              return (
                <li key={`${h.day}-${i}`} className="flex items-center justify-between">
                  <span className="text-gray-600">{label}</span>
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
