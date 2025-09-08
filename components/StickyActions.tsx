"use client";
import Link from "next/link";

export default function StickyActions() {
  return (
    <div className="sticky top-24 space-y-3">
      <Link href="#" className="w-full inline-flex justify-center rounded-md bg-blue-600 text-white px-4 py-3 font-medium hover:bg-blue-700">
        Start Your Personalized Treatment Plan Today
      </Link>
      <Link href="#" className="w-full inline-flex justify-center rounded-md border px-4 py-3 font-medium hover:bg-gray-50">
        Claim Your Free Quote
      </Link>
    </div>
  );
}
