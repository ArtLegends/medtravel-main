// app/(creator)/layout.tsx
import { Suspense } from "react";

import { requireRole } from "@/lib/supabase/server";
import { PageTransition } from "@/components/shared/PageTransition";

// Загрузочный компонент для креаторских страниц
function CreatorLayoutSkeleton() {
  return (
    <div className="flex-1 p-6">
      <div className="container mx-auto space-y-6">
        <div className="h-8 w-64 bg-default-200 rounded animate-pulse" />
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-default-100 rounded animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // SSR Guard: требуется роль CREATOR или выше
  await requireRole("CREATOR");

  return (
    <Suspense fallback={<CreatorLayoutSkeleton />}>
      <PageTransition>{children}</PageTransition>
    </Suspense>
  );
}
