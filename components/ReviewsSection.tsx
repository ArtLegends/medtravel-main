'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Icon } from '@iconify/react'

// Тип для отзыва
interface Review {
  id: number
  avatar: string    // URL к картинке пользователя
  name: string
  location: string  // например "US" или "Dental Implants, Turkey"
  rating: number    // от 1 до 5
  title: string     // заголовок отзыва
  text: string      // короткий текст
}

// Табами переключения
const tabs = ['Recent', 'Popular', 'Featured'] as const

// Пример статичных отзывов
const reviews: Review[] = [
  {
    id: 1,
    avatar: '/avatars/claire.jpg',
    name: 'Claire Davis, US',
    location: 'Hair Transplant, Istanbul',
    rating: 5,
    title: 'Exceptional care throughout my journey',
    text: "I'm so grateful to the Medtravel.me team for their support throughout my hair transplant journey in Istanbul. From the moment I arrived, they ensured..."
  },
  {
    id: 2,
    avatar: '/avatars/sarah.jpg',
    name: 'Sarah Thompson, UK',
    location: 'Dental Implants, Turkey',
    rating: 5,
    title: 'Highly recommended!',
    text: "I had a great experience with Medtravel.me for my dental implants in Turkey. They organized everything, and the clinic was top-notch. Dr. Mehmet made me..."
  },
  {
    id: 3,
    avatar: '/avatars/liam.jpg',
    name: 'Liam Brown, CA',
    location: 'Rhinoplasty, Turkey',
    rating: 5,
    title: "Couldn't be happier with the results",
    text: "I underwent a rhinoplasty procedure in Turkey through Medtravel.me, and I couldn't be happier with the results. The whole process was so well..."
  },
  {
    id: 4,
    avatar: '/avatars/emily.jpg',
    name: 'Emily Harris, US',
    location: 'Facelift, Istanbul',
    rating: 5,
    title: 'My transformation journey was incredible',
    text: "Medtravel.me made my cosmetic surgery experience incredibly smooth. I traveled to Istanbul for a facelift, and I felt completely at ease throughout the whole..."
  },
  {
    id: 5,
    avatar: '/avatars/nathan.jpg',
    name: 'Nathan White, AU',
    location: 'Tummy Tuck, Istanbul',
    rating: 5,
    title: 'Amazing experience from start to finish',
    text: "I had an amazing experience with Medtravel.me when I went to Istanbul for a tummy tuck and liposuction. The clinic was pristine, and Dr. Ömer was..."
  },
  {
    id: 6,
    avatar: '/avatars/emma.jpg',
    name: 'Emma Johnson, US',
    location: 'Breast Augmentation, Turkey',
    rating: 5,
    title: 'So pleased with my results!',
    text: "Good evening to anyone who's still unsure or nervous! 😄 I want to share my experience: 7 days ago, I had breast augmentation surgery and a full..."
  }
  // ... ещё отзывы по аналогичной структуре
]

export default function ReviewsSection() {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('Recent')

  return (
    <section className="container mx-auto py-20 space-y-8">
      {/* Заголовок */}
      <h2 className="text-3xl font-bold text-center">Reviews</h2>

      {/* Вкладки */}
      <div className="flex justify-center">
        <div className="inline-flex bg-gray-200 rounded-full overflow-hidden">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={
                `px-6 py-2 text-sm font-medium transition ` +
                (activeTab === tab
                  ? 'bg-white text-gray-900'
                  : 'text-gray-600 hover:text-gray-900')
              }
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Сетка отзывов */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map(review => (
          <div
            key={review.id}
            className="bg-white p-6 rounded-lg shadow-sm flex flex-col"
          >
            {/* Шапка карточки */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Image
                  src={review.avatar}
                  alt={review.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div className="ml-3 text-sm">
                  <p className="font-semibold">{review.name}</p>
                  <p className="text-gray-500">{review.location}</p>
                </div>
              </div>
              {/* Логотип Google */}
              <Image
                src="/icons/google-logo.png"
                alt="Google"
                width={32}
                height={32}
              />
            </div>

            {/* Рейтинг */}
            <div className="flex items-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Icon
                  key={i}
                  icon="ant-design:star-filled"
                  className="w-5 h-5 text-yellow-400"
                />
              ))}
              <span className="ml-2 text-sm text-gray-600">({review.rating})</span>
            </div>

            {/* Заголовок и текст */}
            <h3 className="font-semibold mb-1">{review.title}</h3>
            <p className="text-gray-600 flex-1">
              {review.text}
            </p>

            {/* Ссылка «Read More» */}
            <a href="#" className="mt-4 text-blue-600 text-sm">
              Read More
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}
