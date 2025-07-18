// components/ClinicList.tsx
"use client";

import React from "react";
import ClinicCard from "./ClinicCard";
import type { Clinic } from "@/lib/supabase/requests";

interface Props {
  clinics: Clinic[];
}

// import React from "react";
// import ClinicCard from "./ClinicCard";
// import type { Clinic } from "@/lib/supabase/requests";

// interface Props {
//   clinics: Clinic[];
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

export default function ClinicList({ clinics }: Props) {
  if (clinics.length === 0) {
     return <p className="text-center text-gray-600">No clinics found</p>;
   }

   return (
     <div className="space-y-8">
      {clinics.map((c) => (
        <ClinicCard key={c.id} clinic={c} />
      ))}
    </div>
  );
}
