// components/Footer.tsx
'use client'

import NextLink from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t pt-12 pb-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Левый блок: логотип + описание */}
        <div className="pt-6">
          <h2 className="text-2xl font-bold">
            Med<span className="text-teal-500">Travel</span>
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Your trusted platform for finding the best medical treatments abroad. We connect patients with top-quality clinics worldwide for aesthetic and medical procedures.
          </p>
        </div>

        {/* Средний блок: Company */}
        <div className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Company</h3>
          <ul className="space-y-2">
            <li>
              <NextLink href="/about" className="text-gray-700 hover:text-teal-500 transition">
                About us
              </NextLink>
            </li>
            <li>
              <NextLink href="/add-clinic" className="text-gray-700 hover:text-teal-500 transition">
                Add a clinic
              </NextLink>
            </li>
            <li>
              <NextLink href="/disclaimer" className="text-gray-700 hover:text-teal-500 transition">
                Disclaimer
              </NextLink>
            </li>
            <li>
              <NextLink href="/contact" className="text-gray-700 hover:text-teal-500 transition">
                Contact us
              </NextLink>
            </li>
          </ul>
        </div>

        {/* Правый блок: Legal */}
        <div className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Legal</h3>
          <ul className="space-y-2">
            <li>
              <NextLink href="/blog" className="text-gray-700 hover:text-teal-500 transition">
                Blog
              </NextLink>
            </li>
            <li>
              <NextLink href="/terms" className="text-gray-700 hover:text-teal-500 transition">
                Terms of use
              </NextLink>
            </li>
            <li>
              <NextLink href="/review-policy" className="text-gray-700 hover:text-teal-500 transition">
                Review policy
              </NextLink>
            </li>
            <li>
              <NextLink href="/privacy" className="text-gray-700 hover:text-teal-500 transition">
                Privacy policy
              </NextLink>
            </li>
          </ul>
        </div>
      </div>

      {/* Нижняя строка */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} MedTravel. All rights reserved.
      </div>
    </footer>
  )
}
