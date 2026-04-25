# MedTravel — Digital Platform for Medical Tourism

[![Next.js](https://img.shields.io/badge/Next.js-15.3.1-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue)](https://www.typescriptlang.org/)
[![HeroUI](https://img.shields.io/badge/HeroUI-2.7.10-purple)](https://heroui.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.16-cyan)](https://tailwindcss.com/)

MedTravel — это современная цифровая платформа для медицинского туризма, объединяющая пациентов и клиники по всему миру. Проект построен на передовом стеке технологий (Next.js 15, Supabase) и предоставляет удобные инструменты для поиска клиник, бронирования услуг и управления процессами лечения.

## 🌟 Особенности

- **🚀 Современный стек**: Next.js 15 (App Router), React 18, TypeScript.
- **🎨 Премиум UI**: Интерфейс на базе HeroUI с кастомной темой и адаптивностью.
- **🔐 Безопасность**: Supabase Auth с ролевой моделью (Admin, Customer/Clinic, Patient) и RLS (Row Level Security).
- **🌍 Экосистема**:
  - **Публичный каталог**: Поиск клиник, услуг, отзывы.
  - **Customer Panel (Кабинет клиники)**: Управление заявками, профилем клиники, отзывами и отчетами.
  - **Admin Panel**: Модерация клиник, глобальное управление контентом.
- **⚡ Производительность**: SSR, оптимизация изображений, кэширование.

---

## 📋 Содержание

1. [Технологический Стек](#-технологический-стек)
2. [Архитектура](#-архитектура)
3. [Структура Проекта](#-структура-проекта)
4. [База Данных](#-база-данных)
5. [Функциональные Модули](#-функциональные-модули)
6. [Установка и Запуск](#-установка-и-запуск)
7. [Разработка](#-разработка)

---

## 🛠 Технологический Стек

### Frontend
- **Framework**: Next.js 15.3.1 (App Router)
- **Language**: TypeScript 5.6
- **UI Library**: HeroUI (NextUI) v2.7
- **Styling**: Tailwind CSS 3.4 + Tailwind Variants
- **Icons**: Iconify, Lucide React
- **Forms**: React Hook Form + Zod Validation
- **I18n**: i18next + react-i18next (EN, ES, RU)

### Backend & Data
- **Database**: PostgreSQL (via Supabase)
- **Auth**: Supabase Auth
- **API**: Server Actions, Supabase Client (SSR & Browser)
- **Real-time**: Supabase Realtime (WebSockets)

---

## 🏗 Архитектура

Проект использует гибридную архитектуру с Server Components для производительности и Client Components для интерактивности.

### Ролевая Модель
Система поддерживает несколько ролей пользователей:
- **Patient (Пациент)**: Ищет клиники, оставляет заявки и отзывы.
- **Customer (Клиника)**: Управляет профилем клиники, обрабатывает заявки (`/customer`).
- **Partner (Партнер)**: Партнерский кабинет (`/partner`).
- **Admin (Администратор)**: Модерирует клиники и контент (`/admin`).

### Безопасность (RLS)
Доступ к данным регулируется на уровне базы данных (PostgreSQL RLS):
- Клиники видят только свои заявки и данные.
- Публичные данные доступны всем (или только опубликованные).
- Админы имеют полный доступ.

---

## 📁 Структура Проекта

```
frontend/
├── 📁 app/                     # Next.js App Router
│   ├── 📁 (admin)/            # Админ-панель (Role: ADMIN)
│   │   └── 📁 admin/
│   │       ├── 📁 clinics/        # Управление клиниками
│   │       ├── 📁 moderation/     # Модерация
│   │       └── 📁 users/          # Пользователи
│   ├── 📁 (auth)/             # Страницы входа/регистрации
│   ├── 📁 (customer)/         # Кабинет клиники (Role: CUSTOMER)
│   │   └── 📁 customer/
│   │       ├── 📁 bookings/       # Управление заявками
│   │       ├── 📁 clinic-profile/ # Редактирование профиля клиники
│   │       ├── 📁 patients/       # База пациентов
│   │       ├── 📁 reports/        # Жалобы и отчеты
│   │       ├── 📁 reviews/        # Модерация отзывов
│   │       └── 📁 transactions/   # Финансы
│   ├── 📁 (partner)/          # Кабинет партнера (Role: PARTNER)
│   │   └── 📁 partner/
│   ├── 📁 (site)/             # Публичные страницы (Каталог, Лендинг)
│   └── 📄 layout.tsx          # Root Layout
├── 📁 components/             # React компоненты
│   ├── 📁 clinic/             # Компоненты для клиник
│   ├── 📁 ui/                 # Базовые UI элементы
│   └── 📁 shared/             # Общие компоненты
├── 📁 lib/                    # Утилиты
│   ├── 📁 supabase/           # Клиенты Supabase (Server/Client)
│   └── 📄 utils.ts            # Хелперы
├── 📁 types/                  # TypeScript типы
└── 📄 middleware.ts           # Защита роутов и редиректы
```

---

## 🗄 База Данных

Основные сущности в Supabase:

- **`clinics`**: Профили клиник (название, адрес, описание, статус модерации).
- **`bookings`**: Заявки на лечение (связь пациент-клиника).
- **`reviews`**: Отзывы пациентов (с премодерацией клиники).
- **`clinic_reports`**: Жалобы/репорты на клиники.
- **`services`**: Услуги, предоставляемые клиниками.

Используются SQL Views (например, `v_customer_bookings`) для удобного отображения данных в админках и кабинетах.

---

## 🧩 Функциональные Модули

### Customer Panel (Кабинет Клиники)
Расположен по адресу `/customer`. Ключевые возможности:
- **Dashboard**: Статистика по заявкам и отзывам.
- **Bookings**: Таблица заявок с фильтрацией, сменой статуса и экспортом.
- **Reviews**: Управление отзывами (публикация/отклонение).
- **Clinic Profile**: Многошаговая форма заполнения данных о клинике (Врачи, Услуги, Галерея).

### Admin Panel
Расположен по адресу `/admin`.
- Модерация новых клиник (`pending` -> `approved`).
- Глобальный просмотр всех метрик платформы.

---

## 🚀 Установка и Запуск

### Предварительные требования
- Node.js 18+
- Yarn или NPM
- Аккаунт Supabase (для переменных окружения)

### 1. Клонирование репозитория
```bash
git clone https://github.com/your-repo/medtravel.git
cd medtravel
```

### 2. Установка зависимостей
```bash
yarn install
# или
npm install
```

### 3. Настройка окружения
Создайте файл `.env.local` в корне проекта и добавьте ключи Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Запуск в режиме разработки
```bash
yarn dev
```
Приложение будет доступно по адресу `http://localhost:3000`.

---

## 💻 Разработка

### Основные команды

- `yarn dev` — Запуск dev-сервера.
- `yarn build` — Сборка проекта для продакшена.
- `yarn start` — Запуск собранного приложения.
- `yarn lint` — Проверка кода линтером.

### Кодовые соглашения
- Используйте **Server Actions** для мутаций данных.
- Компоненты по умолчанию серверные, добавляйте `'use client'` только при необходимости (хуки, интерактивность).
- Стилизация через Tailwind Utility Classes.

<!-- npx supabase gen types typescript --project-id oymahnxwcajvaggbydim --schema public > lib/supabase/types.ts -->

<!-- "$(brew --prefix)/bin/supabase" gen types typescript \
  --project-id oymahnxwcajvaggbydim \
  --schema public > lib/supabase/types.ts -->

<!-- npx.cmd supabase gen types typescript --project-id oymahnxwcajvaggbydim --schema public > lib/supabase/types.ts -->