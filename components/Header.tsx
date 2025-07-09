// components/Header.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const path = usePathname()

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Логотип */}
        <Link href="/" className="text-2xl font-bold">
          Med<span className="text-teal-500">Travel</span>
        </Link>

        {/* Навигационные кнопки */}
        <nav className="flex items-center gap-4">
          <Link
            href="/add-clinic"
            className={`px-4 py-2 border rounded ${path === '/add-clinic' ? 'bg-teal-50 border-teal-500 text-teal-600' : 'border-gray-300 text-gray-700'}`}
          >
            Add a clinic
          </Link>
          <Link
            href="/book"
            className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition"
          >
            Book a call
          </Link>

          {/* Селектор языка (пока статично) */}
          <button className="px-2 py-1 text-gray-600 hover:text-gray-800 transition">
            🌐 English
          </button>
        </nav>
      </div>
    </header>
  )
}
