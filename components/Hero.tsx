// components/Hero.tsx
'use client'

import SearchBar from './SearchBar'
import { useState } from 'react'

const IMAGE_URL = 'https://images.unsplash.com/photo-1551076805-e1869033e561?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80' // ваш URL

export default function Hero() {
  const [query, setQuery] = useState('')

  return (
    <section
      className="relative h-[500px] bg-cover bg-center"
      style={{ backgroundImage: `url('${IMAGE_URL}')` }}
    >
      {/* Полупрозрачный оверлей */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Контент */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white max-w-2xl">
          MedTravel: Your Path to Aesthetic Transformation – Start Your Journey Today!
        </h1>

        <div className="w-full max-w-xl mt-8">
          <SearchBar
            value={query}
            onChangeAction={setQuery}
            placeholder="Search for treatments, specialists, or clinics"
          />
        </div>
      </div>
    </section>
  )
}