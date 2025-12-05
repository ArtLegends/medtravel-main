// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-50">
      <main className="mx-auto max-w-md px-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
          404 error
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900 md:text-4xl">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-gray-600 md:text-base">
          We couldn&apos;t find the page you were looking for. <br />
          Please check the URL or go back to the main catalog of clinics.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Go to Home page
          </Link>
          <Link
            href="/"
            className="rounded-full border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Browse categories
          </Link>
        </div>
      </main>
    </div>
  );
}
