// components/ClinicCard.tsx
"use client";

import React from "react";
import type { Clinic } from "@/lib/supabase/requests";

interface Props {
  clinic: Clinic;
}

// interface Props {
//   clinic: Clinic;
//   id: string
//   name: string
//   slug: string
//   country: string
//   province: string
//   city: string
//   district: string
//   cover_url?: string | null
//   services: string[]
// }

export default function ClinicCard({ clinic }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col lg:flex-row">
      {clinic.cover_url && (
        <img
          src={clinic.cover_url}
          alt={clinic.name}
          className="w-full lg:w-1/3 h-48 lg:h-auto object-cover"
        />
      )}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-2xl font-semibold mb-2">{clinic.name}</h3>
          <p className="text-gray-500 mb-4">
            {clinic.city}, {clinic.province}, {clinic.country}
          </p>
          <p className="text-gray-700 mb-4 line-clamp-3">
            {clinic.description ?? "No description available."}
          </p>
          <a href={`/clinic/${clinic.slug}`} className="text-blue-600 hover:underline">
            Read more
          </a>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <ul className="space-y-1">
            {clinic.services.map((s) => (
              <li key={s} className="text-gray-800">
                • {s}
              </li>
            ))}
          </ul>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition">
            Claim your free quote
          </button>
        </div>
      </div>
    </div>
  );
}



// export interface Clinic {
//   id: string
//   name: string
//   slug: string
//   country: string
//   province: string
//   city: string
//   district: string
//   cover_url?: string | null
//   services: string[]
// }