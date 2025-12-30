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