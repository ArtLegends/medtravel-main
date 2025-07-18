// components/WhyChooseUsCategory.tsx
"use client"
import React from "react"

const items = [
  { num: 1, text: "We are medical tourism professionals" },
  { num: 2, text: "We will help you find the clinic and doctor that best suits your needs" },
  { num: 3, text: "We will provide quick and easy access to all the information you need" },
]

export default function WhyChooseUsCategory() {
  return (
    <section className="container mx-auto py-16 space-y-8 text-center">
      <h2 className="text-3xl font-bold">Why Choose Us?</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.num} className="p-6 bg-white rounded shadow">
            <div className="inline-flex items-center justify-center mb-4 w-10 h-10 rounded-full bg-blue-500 text-blue-600 text-lg font-bold">
              {item.num}
            </div>
            <p className="font-medium">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
