// components/Process.tsx
'use client'

import { Icon } from '@iconify/react'
import React from 'react'

const steps = [
  {
    icon: 'akar-icons:search',
    title: 'You Submit a Request',
    text: 'We gather your preferences and needs to find the best match for your treatment.'
  },
  {
    icon: 'akar-icons:check',
    title: 'We Reach Out to Clinics',
    text: 'Once we have your request, we contact clinics and provide you with the top options based on pricing, specialist qualifications, and your specific needs.'
  },
  {
    icon: 'bi:calendar',
    title: 'We Plan Your Arrival Together',
    text: 'After selecting a clinic, we assist in coordinating all organizational details for your trip.'
  },
  {
    icon: 'akar-icons:chat',
    title: 'We Stay in Touch',
    text: 'Once you arrive, we’re available 24/7 to provide any support you need, ensuring you stay focused on your treatment without any distractions.'
  },
]

export default function Process() {
  return (
    <section className="container mx-auto py-20 space-y-8">
      {/* Заголовок */}
      <h2 className="text-3xl font-bold text-center">Our Process</h2>

      {/* Список шагов */}
      <div className="flex items-start justify-center flex-wrap gap-4">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            {/* Карточка шага */}
            <div className="bg-white p-8 rounded-lg shadow-md max-w-xs text-center">
              <Icon icon={step.icon} className="mx-auto text-primary w-10 h-10" />
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{step.text}</p>
            </div>

            {/* Стрелка между карточками (кроме последней) */}
            {idx < steps.length - 1 && (
              <Icon
                icon="akar-icons:chevron-right"
                className="text-primary w-6 h-6 mt-20"
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  )
}
