// app/(admin)/loading.tsx
export default function Loading() {
  return (
    <div className="flex-1 flex">
      {/* Sidebar skeleton */}
      <div className="w-64 bg-default-50 animate-pulse border-r border-divider" />

      {/* Content area skeleton */}
      <main className="flex-1 p-6">
        <div className="space-y-6">
          <div className="h-6 w-48 bg-default-200 rounded animate-pulse" />
          <div className="h-8 w-64 bg-default-200 rounded animate-pulse" />
          <div className="grid gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-default-100 rounded animate-pulse"
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
