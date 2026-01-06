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

---

## 🤝 Contribution

Мы приветствуем вклад в развитие проекта! Пожалуйста, создавайте Pull Requests и описывайте изменения.

1. Форкните проект.
2. Создайте ветку для фичи (`git checkout -b feature/amazing-feature`).
3. Закоммитьте изменения (`git commit -m 'Add amazing feature'`).
4. Запушьте ветку (`git push origin feature/amazing-feature`).
5. Откройте Pull Request.





я протестировал все и в других категориях с фильтром по услугам и по локации.
в общем нам нужно полностью переработать систему фильтрации и юрлов, сейчас все распишу тебе.

все верно, фильтрация должно навигацией переходить на другой URL.
перерабатывать будем только систему фильтрации на странице категории, все остальное оставляем как есть.
для начала заменим содержимое фильтров, сейчас там находятся самые популярные услуги и локации из базы данных, нужно это заменить готовыми списками.
у меня есть списки подкатегорий для наших 6 главных категорий и списка локаций, видимо придется создать новые таблицы.
логика фильтрация будет заключатся во вложенности. вот путь(для описания пути я буду использовать реальные услуги, локации и категории, исключительно для примера и объяснения):
при переходе на страницу любой категории скажем Dentistry мы попадаем на страницу категории с юрл /dentistry, изначально в списке клиник находятся все клиники этой категории.
в фильтрах имеются списки подкатегорий и локаций, но технически только первая часть фильтров и список фильтров меняется в зависимости от вложенности и выбора фильтров пользователем.
изначально при переходе на страницу какой-либо категории она имеет свой список локаций и список подкатегорий это все должно быть связано в базе с категориями и локациями.
при выборе первого параметра в фильтре по подкатегориям скажем этого параметра All on 4 юрл должен быть следующего вида /dentistry/all-on-4, список подкатегорий уже должен измениться из-за вложенности, потому что этот параметр /subcategory/ подразумевает в себе еще список параметров, в котором мы еще выбираем параметр скажем Dental Crowns и далее редиректит все на ту же страницу категории на которой мы и были изначально, но с юрл /dentistry/all-on-4/dental-crowns, отфильтрованным списком клиник по выбранным параметрам и обновленным списком фильтров по подкатегориям, поскольку параметр /subcategory-2/ также подразумевает собой еще вложенные параметры, ну и последний параметр в этой вложенности это скажем Gold Crowns, получаем юрл /dentistry/all-on-4/dental-crowns/gold-crowns, отфильтрованный список клиник по выбранным параметрам и последний параметр во вложенности фильтра по подкатегориям /subcategory-3/, а список в фильтре должен быть не пустым на последнем параметре, а включать в себе первые параметры /subcategory/, чтобы можно было вернуться к началу.

точно такой же принцип с точно такой же вложенностью должен иметь фильтр по локации.
вот какими должны быть точные юрл в отдельности для каждого фильтра:
url фильтрации по локации - /category/country/province/city/district.
url фильтрации по подкатегориям - /category/subcategory/subcategory-2/subcategory-3.

но если для фильтрации использовать оба фильтра одновременно, то точный и полный юрл включая оба фильтра должен выглядеть так:
url фильтрации по локации и подкатегориям - /category/country/province/city/district/subcategory/subcategory-2/subcategory-3.

причем юрл может быть таким /category/country/city/district/subcategory/subcategory-2 или таким /category/country/city/subcategory, все зависит от выбранных параметров в фильтрах.

весь ui фильтров нужно сохранить, инпуты для поисков тоже оставить рабочими, Reset filters оставить, убрать лимит на количество параметров, вернее оставить видимый лимит по умолчанию но добавить ниже спан который разворачивает список показывая все существующие параметры в зависимости от вложенности.

фильтрация по подкатегориям в зависимости от выбранных параметров должна искать по точным услугам(services) клиник, похожим услугам и искать ближайщие совпадения, чтобы не было строгой фильтрации по точному выбору, нужно максимально приближенно по фильтрам находить результаты услуг клиник, локации клиник не зависимо от вложенности фильтров, от регистра той же услуги или локации клиники в каталоге.

придется поработать и в базе данных и в директории проекта.
услуги у нас находятся в таблицах services и clinic_services(эти таблицы связаны), категории в таблицах categories и clinic_categories(эти таблицы тоже связаны между собой).
локации клиник находятся в таблице clinics с колонками country, province, city, district. схемы этих таблиц прислал ниже. также загрузил на всякий случай lib/supabase/types.ts. текущие версии файлов app/[category]/[[...filters]]/page.tsx, components/category/CategoryGrid.tsx и components/category/CategoryGridClient.tsx ты знаешь, сам же мне их писал. смотри скриншоты, если еще что-нибудь для реализации потребуется смело говори я предоставлю. пример фильтров работающих по такому принципу, с такой же логикой есть на сервисе whatclinic.com. давай все реализуем качественно, безупречно, исходя из лучших практик.

реальные списки для примера:
Dentistry(category):
- Hollywood Smile(subcategory)
- All on 4(subcategory)
- All on 6(subcategory)
- Dental implants(subcategory)
- Crowns(subcategory)
- Zirconia crowns(subcategory)
- Veneers(subcategory)
- Tooth Whitening(subcategory)

пример для наглядность полной фильтрации по подкатегориям:
Plastic Surgery(category):
- Body plastics(subcategory):
- Liposuction(subcategory-2):
- Tumescent Liposuction(subcategory-3)

Turkey(country):
- Istanbul Province(province):
- Istanbul(city):
- Sisli(district)
- Fatih(district)
- Kadikoy(district)
- Esenyurt(district)
- Beyoglu(district)

public.categories: """
[
  {
    "ordinal_position": 1,
    "column_name": "id",
    "data_type": "integer",
    "udt_or_enum": "int4",
    "character_maximum_length": null,
    "numeric_precision": 32,
    "numeric_scale": 0,
    "is_nullable": "NO",
    "column_default": "nextval('categories_id_seq'::regclass)"
  },
  {
    "ordinal_position": 2,
    "column_name": "name",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "ordinal_position": 3,
    "column_name": "slug",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "NO",
    "column_default": null
  }
]
"""
public.clinic_categories: """
[
  {
    "ordinal_position": 1,
    "column_name": "clinic_id",
    "data_type": "uuid",
    "udt_or_enum": "uuid",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "ordinal_position": 2,
    "column_name": "category_id",
    "data_type": "integer",
    "udt_or_enum": "int4",
    "character_maximum_length": null,
    "numeric_precision": 32,
    "numeric_scale": 0,
    "is_nullable": "NO",
    "column_default": null
  }
]
"""
public.services: """
[
  {
    "ordinal_position": 1,
    "column_name": "id",
    "data_type": "integer",
    "udt_or_enum": "int4",
    "character_maximum_length": null,
    "numeric_precision": 32,
    "numeric_scale": 0,
    "is_nullable": "NO",
    "column_default": "nextval('services_id_seq'::regclass)"
  },
  {
    "ordinal_position": 2,
    "column_name": "name",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "ordinal_position": 3,
    "column_name": "slug",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "ordinal_position": 4,
    "column_name": "description",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  }
]
"""
public.clinic_services: """
[
  {
    "ordinal_position": 1,
    "column_name": "clinic_id",
    "data_type": "uuid",
    "udt_or_enum": "uuid",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "ordinal_position": 2,
    "column_name": "service_id",
    "data_type": "integer",
    "udt_or_enum": "int4",
    "character_maximum_length": null,
    "numeric_precision": 32,
    "numeric_scale": 0,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "ordinal_position": 3,
    "column_name": "price",
    "data_type": "numeric",
    "udt_or_enum": "numeric",
    "character_maximum_length": null,
    "numeric_precision": 10,
    "numeric_scale": 2,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 4,
    "column_name": "currency",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": "'USD'::text"
  }
]
"""
public.clinics: """
[
  {
    "ordinal_position": 1,
    "column_name": "id",
    "data_type": "uuid",
    "udt_or_enum": "uuid",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "ordinal_position": 2,
    "column_name": "owner_id",
    "data_type": "uuid",
    "udt_or_enum": "uuid",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": "auth.uid()"
  },
  {
    "ordinal_position": 3,
    "column_name": "name",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "ordinal_position": 4,
    "column_name": "slug",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "ordinal_position": 5,
    "column_name": "about",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 6,
    "column_name": "address",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 7,
    "column_name": "country",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 8,
    "column_name": "city",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 9,
    "column_name": "latitude",
    "data_type": "numeric",
    "udt_or_enum": "numeric",
    "character_maximum_length": null,
    "numeric_precision": 9,
    "numeric_scale": 6,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 10,
    "column_name": "longitude",
    "data_type": "numeric",
    "udt_or_enum": "numeric",
    "character_maximum_length": null,
    "numeric_precision": 9,
    "numeric_scale": 6,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 11,
    "column_name": "moderation_status",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "NO",
    "column_default": "'draft'::text"
  },
  {
    "ordinal_position": 12,
    "column_name": "is_published",
    "data_type": "boolean",
    "udt_or_enum": "bool",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "NO",
    "column_default": "true"
  },
  {
    "ordinal_position": 13,
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "udt_or_enum": "timestamptz",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "ordinal_position": 14,
    "column_name": "document",
    "data_type": "tsvector",
    "udt_or_enum": "tsvector",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 15,
    "column_name": "province",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 16,
    "column_name": "district",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 17,
    "column_name": "verified_by_medtravel",
    "data_type": "boolean",
    "udt_or_enum": "bool",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "NO",
    "column_default": "false"
  },
  {
    "ordinal_position": 18,
    "column_name": "is_official_partner",
    "data_type": "boolean",
    "udt_or_enum": "bool",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "NO",
    "column_default": "false"
  },
  {
    "ordinal_position": 19,
    "column_name": "map_embed_url",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 20,
    "column_name": "lat",
    "data_type": "double precision",
    "udt_or_enum": "float8",
    "character_maximum_length": null,
    "numeric_precision": 53,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 21,
    "column_name": "lng",
    "data_type": "double precision",
    "udt_or_enum": "float8",
    "character_maximum_length": null,
    "numeric_precision": 53,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 22,
    "column_name": "search",
    "data_type": "tsvector",
    "udt_or_enum": "tsvector",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 23,
    "column_name": "amenities",
    "data_type": "jsonb",
    "udt_or_enum": "jsonb",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": "'{}'::jsonb"
  },
  {
    "ordinal_position": 24,
    "column_name": "status",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": "'published'::text"
  },
  {
    "ordinal_position": 25,
    "column_name": "moderation_comment",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 26,
    "column_name": "main_email",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 27,
    "column_name": "extra_email",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 28,
    "column_name": "time_zone",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 29,
    "column_name": "payments",
    "data_type": "jsonb",
    "udt_or_enum": "jsonb",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": "'[]'::jsonb"
  }
]
"""














-----------------------------------------------------------------------------------------

отлично. раздел готов, все корректно отображает. теперь вернемся к функционалу ручной записи пациентов в панели пациента. этот функционал нужно немного доработать. как он работает сейчас:
выбор категории -> выбор услуги клиник по соответствующей категории -> выбор страны -> выбор города -> выбор клиники, далее уже запись.

мне уже на выборе услуги не нравится как это работает, поскольку у нас берутся абсолютно все услуги всех клиник соответствующей выбранной категории и тут нет никакой фильтрации, услуги дублируются и образуют огромный длинный монотонный список услуг. при выборе города примерно то же самое, есть дубликаты и такой же длинный список, и у выбора клиник в конце то же может быть длинный список, нужно предотвратить этот бесконечный скролинг, для пользователя это будет вообще не удобно.

я предлагаю воспользоваться таблицами category_location_nodes и category_subcategory_nodes, которые мы используем для фильтров. я имею в виду, вместо того чтобы на прямую брать услуги клиник и получать бардак, взять на моменте выбора услуги сделать выбор подкатегории из таблицы category_subcategory_nodes, причем только подкатегории с parent_id = null, category_id в таблице есть. выбор страны и города также заменить на выбор из таблицы category_location_nodes, category_id там тоже есть и kind есть. это значительно улучшит и ускорит запись. то что я сейчас расписал это фильтрация по выбору, она должна быть очень гибкой. путь по сути остается таким же, выбор категории -> выбор подкатегории -> выбор страны -> выбор города -> выбор отфильтрованных клиник -> а после выбора уже конкретной клиники ниже добавить уже все услуги этой выбранной клиники, и далее следует запись.

то есть мы ничего не убираем из этого функционала, а расширяем его, делаем фильтрацию по примеру как на странице категории реализовали, а запись на конкретную услугу переносим в самый конец, когда клиника уже будет выбрана.

все это нужно доработать исходя из лучших практик, можешь улучшить ux/ui, чтобы пользователю было комфортно и интуитивно понятно все.

app\(patient)\patient\appointment\page.tsx: """
export const dynamic = "force-dynamic";

import Link from "next/link";
import AppointmentWizard from "@/components/patient/AppointmentWizard";

export default function PatientAppointmentPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Make an Appointment</h1>
          <p className="mt-1 text-sm text-gray-500">Book your medical appointment in 4 easy steps</p>
        </div>

        <Link
          href="/patient"
          className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <AppointmentWizard />
    </div>
  );
}
"""
components\patient\AppointmentWizard.tsx: """
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string; slug?: string | null };
type ServiceRow = { service_id: string; service_name: string; clinics_count: number };
type CountryRow = { country: string; clinics_count: number };
type CityRow = { city: string; clinics_count: number };
type ClinicRow = { clinic_id: string; clinic_name: string; country: string; city: string };

type BookingMethod = "manual" | "automatic";

function Stepper({ step }: { step: 1 | 2 | 3 | 4 }) {
  const items = [1, 2, 3, 4] as const;

  return (
    <div className="flex items-center justify-center gap-3">
      {items.map((n, idx) => {
        const done = n < step;
        const active = n === step;
        return (
          <div key={n} className="flex items-center gap-3">
            <div
              className={[
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                done ? "bg-emerald-600 text-white" : "",
                active ? "border-2 border-emerald-600 text-emerald-700 bg-white" : "",
                !done && !active ? "bg-gray-100 text-gray-500" : "",
              ].join(" ")}
            >
              {done ? "✓" : n}
            </div>
            {idx !== items.length - 1 && (
              <div className={["h-[2px] w-12", done ? "bg-emerald-600" : "bg-gray-200"].join(" ")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function AppointmentWizard() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [method, setMethod] = useState<BookingMethod | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [countries, setCountries] = useState<CountryRow[]>([]);
  const [cities, setCities] = useState<CityRow[]>([]);
  const [clinics, setClinics] = useState<ClinicRow[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceRow | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryRow | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityRow | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<ClinicRow | null>(null);

  // Step 4 form
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load categories
  useEffect(() => {
    apiGet<{ categories: Category[] }>("/api/patient/appointment/categories")
      .then((r) => setCategories(r.categories ?? []))
      .catch((e) => setErrorMsg(String(e?.message ?? e)));
  }, []);

  function resetStep3Down() {
    setServices([]);
    setCountries([]);
    setCities([]);
    setClinics([]);
    setSelectedService(null);
    setSelectedCountry(null);
    setSelectedCity(null);
    setSelectedClinic(null);
  }

  async function pickCategory(cat: Category) {
    setErrorMsg(null);
    setSelectedCategory(cat);
    resetStep3Down();
    setBusy(true);
    try {
      const r = await apiGet<{ services: ServiceRow[] }>(
        `/api/patient/appointment/services?categoryId=${encodeURIComponent(cat.id)}`,
      );
      setServices(r.services ?? []);
      setStep(3);
    } catch (e: any) {
      setErrorMsg(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  async function pickService(svc: ServiceRow) {
    setErrorMsg(null);
    setSelectedService(svc);
    setSelectedCountry(null);
    setSelectedCity(null);
    setSelectedClinic(null);
    setCountries([]);
    setCities([]);
    setClinics([]);
    setBusy(true);
    try {
      const r = await apiGet<{ countries: CountryRow[] }>(
        `/api/patient/appointment/countries?serviceId=${encodeURIComponent(svc.service_id)}`,
      );
      setCountries(r.countries ?? []);
    } catch (e: any) {
      setErrorMsg(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  async function pickCountry(c: CountryRow) {
    if (!selectedService) return;
    setErrorMsg(null);
    setSelectedCountry(c);
    setSelectedCity(null);
    setSelectedClinic(null);
    setCities([]);
    setClinics([]);
    setBusy(true);
    try {
      const r = await apiGet<{ cities: CityRow[] }>(
        `/api/patient/appointment/cities?serviceId=${encodeURIComponent(
          selectedService.service_id,
        )}&country=${encodeURIComponent(c.country)}`,
      );
      setCities(r.cities ?? []);
    } catch (e: any) {
      setErrorMsg(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  async function pickCity(c: CityRow) {
    if (!selectedService || !selectedCountry) return;
    setErrorMsg(null);
    setSelectedCity(c);
    setSelectedClinic(null);
    setClinics([]);
    setBusy(true);
    try {
      const r = await apiGet<{ clinics: ClinicRow[] }>(
        `/api/patient/appointment/clinics?serviceId=${encodeURIComponent(
          selectedService.service_id,
        )}&country=${encodeURIComponent(selectedCountry.country)}&city=${encodeURIComponent(c.city)}`,
      );
      setClinics(r.clinics ?? []);
    } catch (e: any) {
      setErrorMsg(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  const canGoStep4 = useMemo(
    () => method === "manual" && selectedCategory && selectedService && selectedCountry && selectedCity && selectedClinic,
    [method, selectedCategory, selectedService, selectedCountry, selectedCity, selectedClinic],
  );

  async function submitBooking() {
    if (!selectedClinic || !selectedService || !selectedCategory) return;

    setErrorMsg(null);
    setBusy(true);
    try {
      const res = await fetch("/api/patient/appointment/book", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          clinicId: selectedClinic.clinic_id,
          categoryId: selectedCategory.id,
          serviceId: selectedService.service_id,
          bookingMethod: method ?? "manual",
          preferredDate,
          preferredTime,
          fullName,
          phone,
          notes,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      router.push("/patient/bookings?created=1");
      router.refresh();
    } catch (e: any) {
      setErrorMsg(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Step chain */}
      <Stepper step={step} />

      {/* Errors */}
      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Choose appointment method</h2>
          <p className="mt-1 text-sm text-gray-500">How would you like to schedule your appointment?</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {/* Manual */}
            <div className="rounded-2xl border p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-2xl">📅</div>
              <div className="mt-3 text-lg font-semibold">Manual booking</div>
              <p className="mt-1 text-sm text-gray-500">
                Browse clinics and contact them directly to schedule your appointment.
              </p>
              <button
                className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                disabled={busy}
                onClick={() => {
                  setMethod("manual");
                  setStep(2);
                }}
              >
                Choose manual booking
              </button>
            </div>

            {/* Automatic (disabled) */}
            <div className="rounded-2xl border p-5 opacity-70">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-2xl">⏱️</div>
              <div className="mt-3 flex items-center gap-2 text-lg font-semibold">
                Automatic booking
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                  Coming soon
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                We’ll help you find and schedule appointments automatically.
              </p>
              <button
                className="mt-4 w-full cursor-not-allowed rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-500"
                disabled
              >
                Choose automatic booking
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Select medical category</h2>
              <p className="mt-1 text-sm text-gray-500">Choose the type of medical service you need</p>
            </div>
            <button
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
              onClick={() => setStep(1)}
            >
              ← Back
            </button>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                disabled={busy}
                onClick={() => pickCategory(cat)}
                className="rounded-xl border px-4 py-4 text-left hover:bg-gray-50 disabled:opacity-60"
              >
                <div className="text-sm font-semibold text-gray-900">{cat.name}</div>
                <div className="mt-1 text-xs text-gray-500">Tap to select</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <section className="rounded-2xl border bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Select service & location</h2>
              <p className="mt-1 text-sm text-gray-500">
                Choose service, country, city, and clinic
              </p>
            </div>
            <button
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
              onClick={() => setStep(2)}
            >
              ← Back
            </button>
          </div>

          {/* Services */}
          <div>
            <div className="text-sm font-semibold text-gray-900">Popular services</div>
            <div className="mt-3 grid gap-2 md:grid-cols-4">
              {services.map((s) => {
                const active = selectedService?.service_id === s.service_id;
                return (
                  <button
                    key={s.service_id}
                    disabled={busy}
                    onClick={() => pickService(s)}
                    className={[
                      "rounded-lg border px-3 py-2 text-sm font-medium",
                      active ? "bg-emerald-600 text-white border-emerald-600" : "hover:bg-gray-50",
                    ].join(" ")}
                  >
                    {s.service_name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Countries */}
          {selectedService && (
            <div>
              <div className="text-sm font-semibold text-gray-900">Available countries</div>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {countries.map((c) => {
                  const active = selectedCountry?.country === c.country;
                  return (
                    <button
                      key={c.country}
                      disabled={busy}
                      onClick={() => pickCountry(c)}
                      className={[
                        "rounded-xl border px-4 py-4 text-left",
                        active ? "bg-emerald-600 text-white border-emerald-600" : "hover:bg-gray-50",
                      ].join(" ")}
                    >
                      <div className="text-sm font-semibold">{c.country}</div>
                      <div className={["mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                        active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"].join(" ")}>
                        {c.clinics_count} clinics
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cities */}
          {selectedCountry && (
            <div>
              <div className="text-sm font-semibold text-gray-900">Available cities</div>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {cities.map((c) => {
                  const active = selectedCity?.city === c.city;
                  return (
                    <button
                      key={c.city}
                      disabled={busy}
                      onClick={() => pickCity(c)}
                      className={[
                        "rounded-xl border px-4 py-4 text-left",
                        active ? "bg-emerald-600 text-white border-emerald-600" : "hover:bg-gray-50",
                      ].join(" ")}
                    >
                      <div className="text-sm font-semibold">{c.city}</div>
                      <div className={["mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                        active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"].join(" ")}>
                        {c.clinics_count} clinics
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Clinics */}
          {selectedCity && (
            <div>
              <div className="text-sm font-semibold text-gray-900">Available clinics</div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {clinics.map((c) => {
                  const active = selectedClinic?.clinic_id === c.clinic_id;
                  return (
                    <button
                      key={c.clinic_id}
                      disabled={busy}
                      onClick={() => setSelectedClinic(c)}
                      className={[
                        "rounded-xl border p-4 text-left",
                        active ? "border-emerald-600 ring-2 ring-emerald-100" : "hover:bg-gray-50",
                      ].join(" ")}
                    >
                      <div className="text-sm font-semibold text-gray-900">{c.clinic_name}</div>
                      <div className="mt-1 text-xs text-gray-500">
                        {c.city}, {c.country}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between gap-4">
                <button
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
                  onClick={() => {
                    // “Previous” как на шаблоне
                    setSelectedCity(null);
                    setClinics([]);
                  }}
                >
                  Previous
                </button>

                <button
                  disabled={!canGoStep4 || busy}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  onClick={() => setStep(4)}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Step 4 */}
      {step === 4 && selectedClinic && selectedService && (
        <section className="rounded-2xl border bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Complete your appointment</h2>
              <p className="mt-1 text-sm text-gray-500">Fill in the details to finalize your request</p>
            </div>
            <button
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
              onClick={() => setStep(3)}
            >
              ← Back
            </button>
          </div>

          {/* Summary */}
          <div className="rounded-2xl border p-5">
            <div className="text-lg font-semibold">Appointment summary</div>
            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <div>🏥 <span className="font-semibold">{selectedClinic.clinic_name}</span></div>
              <div>📍 {selectedClinic.city}, {selectedClinic.country}</div>
              <div>🩺 {selectedService.service_name}</div>
              <div>🗓️ Manual booking</div>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-2xl border p-5">
            <div className="text-lg font-semibold">Appointment details</div>
            <p className="mt-1 text-sm text-gray-500">Provide your preferences and contact information</p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-gray-700">Preferred date</label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Preferred time</label>
                <input
                  type="time"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Full name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Phone number</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Additional notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional information or special requests..."
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  rows={4}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
              <button
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
                onClick={() => setStep(3)}
              >
                Previous
              </button>

              <button
                disabled={busy || !preferredDate || !fullName || !phone}
                className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                onClick={submitBooking}
              >
                {busy ? "Submitting..." : "Submit request"}
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
"""
app\api\patient\appointment\services\route.ts: """
import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const categoryId = url.searchParams.get("categoryId");
  if (!categoryId) return NextResponse.json({ error: "categoryId is required" }, { status: 400 });

  const supabase = await createRouteClient();

  const { data, error } = await supabase.rpc("patient_services_by_category", {
    p_category_id: categoryId,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const list = (data ?? []).map((s: any) => ({
    service_id: String(s.id ?? s.service_id),
    service_name: s.name ?? s.service_name ?? "",
    clinics_count: Number(s.clinicsCount ?? s.clinics_count ?? 0),
    slug: s.slug ?? null,
  }));

  return NextResponse.json(
    { services: list, data: list, items: list },
    { headers: { "Cache-Control": "no-store" } }
  );
}
"""
app\api\patient\appointment\clinics\route.ts: """
import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const serviceIdRaw = url.searchParams.get("serviceId");
  const serviceId = Number(serviceIdRaw);
  const country = url.searchParams.get("country");
  const city = url.searchParams.get("city");

  if (!Number.isInteger(serviceId) || !country || !city) {
    return NextResponse.json({ error: "serviceId, country, city are required" }, { status: 400 });
  }

  const supabase = await createRouteClient();
  const { data, error } = await supabase.rpc("patient_clinics_by_service", {
    p_service_id: serviceId,
    p_country: country,
    p_city: city,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const list = (data ?? []).map((c: any) => ({
    clinic_id: String(c.id ?? c.clinic_id),
    clinic_name: c.name ?? c.clinic_name ?? "",
    slug: c.slug ?? null,
    country: c.country ?? "",
    city: c.city ?? "",
  }));

  return NextResponse.json(
    { clinics: list, data: list, items: list },
    { headers: { "Cache-Control": "no-store" } }
  );
}
"""
app\api\patient\appointment\countries\route.ts: """
import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const serviceIdRaw = url.searchParams.get("serviceId");
  const serviceId = Number(serviceIdRaw);

  if (!Number.isInteger(serviceId)) {
    return NextResponse.json({ error: "serviceId must be an integer" }, { status: 400 });
  }

  const supabase = await createRouteClient();
  const { data, error } = await supabase.rpc("patient_countries_by_service", {
    p_service_id: serviceId,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const list = (data ?? []).map((c: any) => ({
    country: c.country ?? "",
    clinics_count: Number(c.clinicsCount ?? c.clinics_count ?? 0),
  }));

  return NextResponse.json(
    { countries: list, data: list, items: list },
    { headers: { "Cache-Control": "no-store" } }
  );
}
"""
app\api\patient\appointment\cities\route.ts: """
import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const serviceIdRaw = url.searchParams.get("serviceId");
  const serviceId = Number(serviceIdRaw);
  const country = url.searchParams.get("country");

  if (!Number.isInteger(serviceId) || !country) {
    return NextResponse.json({ error: "serviceId and country are required" }, { status: 400 });
  }

  const supabase = await createRouteClient();
  const { data, error } = await supabase.rpc("patient_cities_by_service", {
    p_service_id: serviceId,
    p_country: country,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const list = (data ?? []).map((c: any) => ({
    city: c.city ?? "",
    clinics_count: Number(c.clinicsCount ?? c.clinics_count ?? 0),
  }));

  return NextResponse.json(
    { cities: list, data: list, items: list },
    { headers: { "Cache-Control": "no-store" } }
  );
}
"""
app\api\patient\appointment\book\route.ts: """
import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const supabase = await createRouteClient();

  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const {
    clinicId,
    categoryId,
    serviceId,
    bookingMethod,
    preferredDate,
    preferredTime,
    fullName,
    phone,
    notes,
  } = body ?? {};

  if (!clinicId || !serviceId || !preferredDate || !fullName || !phone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("patient_bookings")
    .insert({
      patient_id: user.id,
      clinic_id: clinicId,
      category_id: categoryId ?? null,
      service_id: serviceId,
      booking_method: bookingMethod === "automatic" ? "automatic" : "manual",
      preferred_date: preferredDate,
      preferred_time: preferredTime ?? null,
      full_name: fullName,
      phone,
      notes: notes ?? null,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ id: data.id });
}
"""
таблица и вью, public.patient_bookings: """
[
  {
    "ordinal_position": 1,
    "column_name": "id",
    "data_type": "uuid",
    "udt_or_enum": "uuid",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "ordinal_position": 2,
    "column_name": "patient_id",
    "data_type": "uuid",
    "udt_or_enum": "uuid",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "ordinal_position": 3,
    "column_name": "clinic_id",
    "data_type": "uuid",
    "udt_or_enum": "uuid",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "ordinal_position": 4,
    "column_name": "category_id",
    "data_type": "integer",
    "udt_or_enum": "int4",
    "character_maximum_length": null,
    "numeric_precision": 32,
    "numeric_scale": 0,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 5,
    "column_name": "service_id",
    "data_type": "integer",
    "udt_or_enum": "int4",
    "character_maximum_length": null,
    "numeric_precision": 32,
    "numeric_scale": 0,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "ordinal_position": 6,
    "column_name": "booking_method",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "NO",
    "column_default": "'manual'::text"
  },
  {
    "ordinal_position": 7,
    "column_name": "status",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "NO",
    "column_default": "'pending'::text"
  },
  {
    "ordinal_position": 8,
    "column_name": "preferred_date",
    "data_type": "date",
    "udt_or_enum": "date",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "ordinal_position": 9,
    "column_name": "preferred_time",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 10,
    "column_name": "full_name",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "ordinal_position": 11,
    "column_name": "phone",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "ordinal_position": 12,
    "column_name": "notes",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 13,
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "udt_or_enum": "timestamptz",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "ordinal_position": 14,
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "udt_or_enum": "timestamptz",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "ordinal_position": 15,
    "column_name": "actual_cost",
    "data_type": "numeric",
    "udt_or_enum": "numeric",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 16,
    "column_name": "currency",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  }
]
"""
public.v_customer_patients: """
[
  {
    "ordinal_position": 1,
    "column_name": "booking_id",
    "data_type": "uuid",
    "udt_or_enum": "uuid",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 2,
    "column_name": "patient_id",
    "data_type": "uuid",
    "udt_or_enum": "uuid",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 3,
    "column_name": "clinic_id",
    "data_type": "uuid",
    "udt_or_enum": "uuid",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 4,
    "column_name": "patient_public_id",
    "data_type": "integer",
    "udt_or_enum": "int4",
    "character_maximum_length": null,
    "numeric_precision": 32,
    "numeric_scale": 0,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 5,
    "column_name": "patient_name",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 6,
    "column_name": "phone",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 7,
    "column_name": "service_id",
    "data_type": "integer",
    "udt_or_enum": "int4",
    "character_maximum_length": null,
    "numeric_precision": 32,
    "numeric_scale": 0,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 8,
    "column_name": "service_name",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 9,
    "column_name": "status",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 10,
    "column_name": "booking_method",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 11,
    "column_name": "preferred_date",
    "data_type": "date",
    "udt_or_enum": "date",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 12,
    "column_name": "preferred_time",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 13,
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "udt_or_enum": "timestamptz",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 14,
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "udt_or_enum": "timestamptz",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 15,
    "column_name": "pre_cost",
    "data_type": "numeric",
    "udt_or_enum": "numeric",
    "character_maximum_length": null,
    "numeric_precision": 10,
    "numeric_scale": 2,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 16,
    "column_name": "currency",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 17,
    "column_name": "actual_cost",
    "data_type": "numeric",
    "udt_or_enum": "numeric",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 18,
    "column_name": "clinic_name",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  }
]
"""
функции, patient_cities_by_service: """

  select
    c.city as city,
    count(distinct c.id)::int as "clinicsCount"
  from public.clinic_services cs
  join public.clinics c on c.id = cs.clinic_id
  where cs.service_id = p_service_id
    and c.country = p_country
    and c.city is not null and c.city <> ''
    and c.status = 'published'
    and c.moderation_status = 'approved'
    and c.is_published = true
  group by c.city
  order by "clinicsCount" desc, c.city asc;
"""
patient_cities_by_service_country: """

  select
    c.city as city,
    count(distinct c.id)::int as "clinicsCount"
  from public.clinic_services cs
  join public.clinics c on c.id = cs.clinic_id
  where cs.service_id::text = p_service_id
    and c.country = p_country
    and c.city is not null and c.city <> ''
  group by c.city
  order by "clinicsCount" desc, c.city asc;
"""
patient_cities_by_service_country: """

  select * from public.patient_cities_by_service(p_service_id, p_country);
"""
patient_clinics_by_service: """

  select
    c.id::text as id,
    c.name as name,
    c.slug as slug,
    c.country as country,
    c.city as city
  from public.clinic_services cs
  join public.clinics c on c.id = cs.clinic_id
  where cs.service_id = p_service_id
    and c.country = p_country
    and c.city = p_city
    and c.status = 'published'
    and c.moderation_status = 'approved'
    and c.is_published = true
  order by c.name asc;
"""
patient_clinics_by_service_location: """

  select * from public.patient_clinics_by_service(p_service_id, p_country, p_city);
"""
patient_clinics_by_service_location: """

  select
    c.id::text as id,
    c.name as name,
    c.slug as slug,
    c.country as country,
    c.city as city
  from public.clinic_services cs
  join public.clinics c on c.id = cs.clinic_id
  where cs.service_id::text = p_service_id
    and c.country = p_country
    and c.city = p_city
  order by c.name asc;
"""
patient_countries_by_service: """

  select
    c.country as country,
    count(distinct c.id)::int as "clinicsCount"
  from public.clinic_services cs
  join public.clinics c on c.id = cs.clinic_id
  where cs.service_id = p_service_id
    and c.country is not null and c.country <> ''
    and c.status = 'published'
    and c.moderation_status = 'approved'
    and c.is_published = true
  group by c.country
  order by "clinicsCount" desc, c.country asc;
"""
patient_services_by_category: """

  select
    s.id as id,
    s.name as name,
    s.slug as slug,
    count(distinct cs.clinic_id)::int as "clinicsCount"
  from public.clinic_categories cc
  join public.clinic_services cs on cs.clinic_id = cc.clinic_id
  join public.services s on s.id = cs.service_id
  join public.clinics c on c.id = cc.clinic_id
  where cc.category_id = p_category_id
    and c.status = 'published'
    and c.moderation_status = 'approved'
    and c.is_published = true
  group by s.id, s.name, s.slug
  order by "clinicsCount" desc, s.name asc;
"""