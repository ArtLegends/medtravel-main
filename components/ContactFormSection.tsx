'use client'

import React from 'react'

export default function ContactFormSection() {
  return (
    <section className="bg-teal-600 text-white py-20">
      <div className="container mx-auto px-6">
        {/* Заголовок секции */}
        <h2 className="text-3xl font-bold text-center mb-8">
          Take the first step toward your perfect health — contact our experts now for personalized travel health care!
        </h2>

        {/* Форма в белой карточке */}
        <div className="max-w-2xl mx-auto bg-white text-gray-900 rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-semibold mb-6 text-center">
            Request a Free Consultation
          </h3>

          <form className="space-y-4">
            {/* Имя */}
            <div>
              <label className="block mb-1 font-medium" htmlFor="name">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            {/* Телефон */}
            <div>
              <label className="block mb-1 font-medium" htmlFor="phone">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            {/* Предпочтительный способ связи */}
            <div>
              <label className="block mb-1 font-medium" htmlFor="contactMethod">
                Preferred Contact Method
              </label>
              <select
                id="contactMethod"
                className="w-full border border-gray-300 rounded px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option>Select the best way to contact you</option>
                <option>Email</option>
                <option>Phone</option>
                <option>WhatsApp</option>
              </select>
            </div>

            {/* Интересующая услуга */}
            <div>
              <label className="block mb-1 font-medium" htmlFor="service">
                Service Interested In
              </label>
              <select
                id="service"
                className="w-full border border-gray-300 rounded px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option>The service that interested you</option>
                <option>Dental Implants</option>
                <option>Hair Transplant</option>
                <option>Plastic Surgery</option>
                {/* добавьте другие опции по необходимости */}
              </select>
            </div>

            {/* Кнопка отправки */}
            <div className="text-center mt-6">
              <button
                type="submit"
                className="bg-teal-500 hover:bg-teal-600 text-white font-medium rounded px-6 py-3 transition"
              >
                Schedule Your Appointment
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
