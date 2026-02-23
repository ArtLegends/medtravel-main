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

















-----------------------------------------------------------------------------

теперь все отлично, запрос успешно выполнился. сейчас перейдем к связыванию партнерской панели и панели пациента.



app\(partner)\partner\page.tsx: """
// app/(partner)/partner/page.tsx

type ProgramRow = {
    id: string;
    name: string;
    impressions: number;
    clicks: number;
    pending: number;
    cancelled: number;
    paid: number;
    payout: number;
    potentialPayouts: number;
  };
  
  // 👇 временные статичные данные; позже сюда подставим данные из Supabase
  const PROGRAMS: ProgramRow[] = [
    // {
    //   id: "dentistry",
    //   name: "Dentistry",
    //   impressions: 0,
    //   clicks: 0,
    //   pending: 0,
    //   cancelled: 0,
    //   paid: 0,
    //   payout: 0,
    //   potentialPayouts: 0,
    // },
    // {
    //   id: "hair-transplant",
    //   name: "Hair Transplant",
    //   impressions: 0,
    //   clicks: 0,
    //   pending: 0,
    //   cancelled: 0,
    //   paid: 0,
    //   payout: 0,
    //   potentialPayouts: 0,
    // },
    // {
    //   id: "plastic-surgery",
    //   name: "Plastic Surgery",
    //   impressions: 0,
    //   clicks: 0,
    //   pending: 0,
    //   cancelled: 0,
    //   paid: 0,
    //   payout: 0,
    //   potentialPayouts: 0,
    // },
  ];
  
  // Подготовка функции для будущей агрегации (уже готова к реальным данным)
  function getTotals(rows: ProgramRow[]): ProgramRow {
    return rows.reduce<ProgramRow>(
      (acc, row) => ({
        ...acc,
        impressions: acc.impressions + row.impressions,
        clicks: acc.clicks + row.clicks,
        pending: acc.pending + row.pending,
        cancelled: acc.cancelled + row.cancelled,
        paid: acc.paid + row.paid,
        payout: acc.payout + row.payout,
        potentialPayouts: acc.potentialPayouts + row.potentialPayouts,
      }),
      {
        id: "total",
        name: "Total",
        impressions: 0,
        clicks: 0,
        pending: 0,
        cancelled: 0,
        paid: 0,
        payout: 0,
        potentialPayouts: 0,
      }
    );
  }
  
  function StatCard({ title, value }: { title: string; value: string }) {
    return (
      <div className="rounded-xl border bg-white px-4 py-4">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {title}
        </div>
        <div className="mt-2 text-2xl font-semibold text-gray-900">{value}</div>
      </div>
    );
  }
  
  function formatMonthYear(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(date);
  }
  
  export default function PartnerDashboardPage() {
    const today = new Date();
  
    const thisMonthLabel = formatMonthYear(today);
    const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthLabel = formatMonthYear(lastMonthDate);
  
    const totals = getTotals(PROGRAMS);
  
    return (
      <div className="space-y-6">
        {/* Заголовок */}
        <div>
          <h1 className="text-2xl font-bold">Welcome to Partner Panel!</h1>
          <p className="text-gray-600">
            Track your referral performance and payouts.
          </p>
        </div>
  
        {/* Статистика: Today / Yesterday / This month / Last month */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Today" value="$0" />
          <StatCard title="Yesterday" value="$0" />
          <StatCard title={thisMonthLabel} value="$0" />
          <StatCard title={lastMonthLabel} value="$0" />
        </div>
  
        {/* Programs Performance */}
        <div className="rounded-xl border bg-white p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Programs Performance</h2>
          </div>
  
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                  <th className="px-3 py-2">Landing page</th>
                  <th className="px-3 py-2">Impressions</th>
                  <th className="px-3 py-2">Clicks</th>
                  <th className="px-3 py-2">Pending</th>
                  <th className="px-3 py-2">Cancelled</th>
                  <th className="px-3 py-2">Paid</th>
                  <th className="px-3 py-2">Payout</th>
                  <th className="px-3 py-2">Potential payouts</th>
                </tr>
              </thead>
              <tbody>
                {/* Итоговая строка Total — всегда первая */}
                <tr className="border-b bg-gray-50 font-semibold">
                  <td className="px-3 py-2">Total</td>
                  <td className="px-3 py-2">{totals.impressions}</td>
                  <td className="px-3 py-2">{totals.clicks}</td>
                  <td className="px-3 py-2">{totals.pending}</td>
                  <td className="px-3 py-2">{totals.cancelled}</td>
                  <td className="px-3 py-2">{totals.paid}</td>
                  <td className="px-3 py-2">${totals.payout}</td>
                  <td className="px-3 py-2">${totals.potentialPayouts}</td>
                </tr>
  
                {/* Отдельные программы (пока всё по нулям) */}
                {PROGRAMS.map((program) => (
                  <tr key={program.id} className="border-b last:border-0">
                    <td className="px-3 py-2">{program.name}</td>
                    <td className="px-3 py-2">{program.impressions}</td>
                    <td className="px-3 py-2">{program.clicks}</td>
                    <td className="px-3 py-2">{program.pending}</td>
                    <td className="px-3 py-2">{program.cancelled}</td>
                    <td className="px-3 py-2">{program.paid}</td>
                    <td className="px-3 py-2">${program.payout}</td>
                    <td className="px-3 py-2">${program.potentialPayouts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
"""
components\partner\ProgramDetail.tsx: """
// components/partner/ProgramDetail.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { useSupabase } from "@/lib/supabase/supabase-provider";
import type { SupabaseContextType } from "@/lib/supabase/supabase-provider";

export type ProgramDetailConfig = {
  key: string;                 // <--- добавили
  name: string;
  rewardRate: string;
  cookieLifetime: string;
  platforms: string;
  programDetails: string;
  payoutProcess: string;
  languages: string;
  targetCountries: string;
  allowedChannels: string;
  programTerms: string;
};

type RequestStatus = "none" | "pending" | "approved" | "rejected";

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-white p-4 md:p-5">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-gray-700">
        {children}
      </div>
    </section>
  );
}

export default function ProgramDetail({
  config,
}: {
  config: ProgramDetailConfig;
}) {
  const { supabase, session } =
    useSupabase() as SupabaseContextType;

  const [status, setStatus] = useState<RequestStatus>("none");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // подгружаем текущее состояние заявки для этой программы
  useEffect(() => {
    if (!supabase || !session) return;

    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("partner_program_requests")
        .select("id,status")
        .eq("user_id", session.user.id)
        .eq("program_key", config.key)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        // тихо игнорируем, просто остаётся status = "none"
        console.error("load partner_program_request error", error);
        return;
      }

      if (data?.status === "pending") setStatus("pending");
      else if (data?.status === "approved") setStatus("approved");
      else if (data?.status === "rejected") setStatus("rejected");
      else setStatus("none");
    })();

    return () => {
      cancelled = true;
    };
  }, [supabase, session, config.key]);

  const handleConnect = useCallback(async () => {
    setErrorMsg(null);

    // если по каким-то причинам юзер не авторизован — ведём на логин
    if (!session) {
      if (typeof window !== "undefined") {
        const next =
          window.location.pathname + window.location.search;
        window.location.href =
          `/auth/login?as=PARTNER&next=${encodeURIComponent(next)}`;
      }
      return;
    }

    if (!supabase) return;

    setBusy(true);
    try {
      const { error } = await supabase
        .from("partner_program_requests")
        .insert({
          user_id: session.user.id,
          program_key: config.key,
          status: "pending",
        });

      if (error) {
        console.error("insert partner_program_request error", error);
        setErrorMsg(
          error.message || "Failed to send request. Please try again.",
        );
      } else {
        setStatus("pending");
      }
    } finally {
      setBusy(false);
    }
  }, [supabase, session, config.key]);

  let buttonLabel = "Connect to program";
  if (status === "pending") buttonLabel = "Request sent (pending)";
  if (status === "approved") buttonLabel = "Connected";
  if (status === "rejected") buttonLabel = "Request rejected";

  const buttonDisabled =
    busy || status === "pending" || status === "approved";

  return (
    <div className="space-y-6">
      {/* Верх: back + заголовок + кнопка */}
      <div className="space-y-3">
        <Link
          href="/partner/programs"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Link>

        <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <h1 className="text-2xl font-bold">{config.name}</h1>

          <button
            type="button"
            onClick={handleConnect}
            disabled={buttonDisabled}
            className={[
              "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white",
              buttonDisabled
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-900 hover:bg-black",
            ].join(" ")}
          >
            {busy ? "Processing…" : buttonLabel}
          </button>
        </div>

        {errorMsg && (
          <p className="text-sm text-red-600">{errorMsg}</p>
        )}
      </div>

      {/* Overview */}
      <section className="rounded-xl border bg-white p-4 md:p-5">
        <h2 className="text-base font-semibold text-gray-900">
          Overview
        </h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 text-sm text-gray-700 md:grid-cols-3">
          <div>
            <dt className="text-gray-500">Reward rate</dt>
            <dd className="mt-1 text-base font-semibold text-gray-900">
              {config.rewardRate}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Cookie lifetime</dt>
            <dd className="mt-1 text-base font-semibold text-gray-900">
              {config.cookieLifetime}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Rewarded platforms</dt>
            <dd className="mt-1 text-base font-semibold text-gray-900">
              {config.platforms}
            </dd>
          </div>
        </dl>
      </section>

      {/* Остальные секции без изменений */}
      <SectionCard title="Program details">
        <p>{config.programDetails}</p>
      </SectionCard>

      <SectionCard title="Payout process">
        <p>{config.payoutProcess}</p>
      </SectionCard>

      <SectionCard title="Reward rate">
        <p className="text-base font-semibold text-gray-900">
          {config.rewardRate}
        </p>
      </SectionCard>

      <SectionCard title="Languages">
        <p>{config.languages}</p>
      </SectionCard>

      <SectionCard title="Target countries">
        <p>{config.targetCountries}</p>
      </SectionCard>

      <SectionCard title="Allowed brand promotion methods & channels">
        <p>{config.allowedChannels}</p>
      </SectionCard>

      <SectionCard title="Program terms">
        <p>{config.programTerms}</p>
      </SectionCard>
    </div>
  );
}
"""
app\(partner)\partner\programs\page.tsx: """
// app/(partner)/partner/programs/page.tsx
import Link from "next/link";

type PartnerProgram = {
  id: string;
  slug: string;
  name: string;
  rewardRatePercent: number;
  cookieLifetimeDays: number;
  platforms: string;
};

const PROGRAMS: PartnerProgram[] = [
  {
    id: "dentistry",
    slug: "dentistry",
    name: "Dentistry",
    rewardRatePercent: 5,
    cookieLifetimeDays: 90,
    platforms: "Desktop, Mobile web",
  },
  {
    id: "hair-transplant",
    slug: "hair-transplant",
    name: "Hair Transplant",
    rewardRatePercent: 5,
    cookieLifetimeDays: 90,
    platforms: "Desktop, Mobile web",
  },
  {
    id: "plastic-surgery",
    slug: "plastic-surgery",
    name: "Plastic surgery",
    rewardRatePercent: 5,
    cookieLifetimeDays: 90,
    platforms: "Desktop, Mobile web",
  },
];

export default function PartnerProgramsPage() {
  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-bold">Programs</h1>
        <p className="text-gray-600">
          Manage your affiliate programs and track performance across different
          medical categories.
        </p>
      </div>

      {/* Карточки программ */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {PROGRAMS.map((program) => (
          <article
            key={program.id}
            className="flex h-full flex-col overflow-hidden rounded-xl border bg-white"
          >
            {/* Placeholder под картинку */}
            <div className="h-40 w-full bg-gray-200" />

            {/* Контент карточки */}
            <div className="flex flex-1 flex-col p-4 space-y-4">
              <h2 className="text-lg font-semibold">{program.name}</h2>

              <div className="rounded-lg bg-gray-50 p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Reward Rate</span>
                  <span className="font-semibold">
                    {program.rewardRatePercent}%
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-gray-600">Cookie lifetime</span>
                  <span className="font-semibold">
                    {program.cookieLifetimeDays} days
                  </span>
                </div>

                <div className="mt-3">
                  <div className="text-gray-600">Rewarded platforms:</div>
                  <div className="mt-1 font-medium text-gray-800">
                    {program.platforms}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={`/partner/programs/${program.slug}`}
                  className="inline-flex w-full items-center justify-center rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
                >
                  Details
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
"""
app\(partner)\partner\programs\dentistry\page.tsx: """
import ProgramDetail, {
    ProgramDetailConfig,
  } from "@/components/partner/ProgramDetail";
  
  const CONFIG: ProgramDetailConfig = {
    key: "dentistry",
    name: "Dentistry",
    rewardRate: "5%",
    cookieLifetime: "90 days",
    platforms: "Desktop Mobile web",
    programDetails:
      "Medtravel.me connects patients from Europe, the CIS, and North America with leading dental clinics in Turkey. From veneers and implants to full-mouth restorations, we deliver high-quality leads for certified clinics offering world-class care at competitive prices. Our platform empowers clinic partners with real-time lead tracking, dedicated account support, and optimized campaign tools to maximize conversion. All partner clinics meet strict international standards for quality, safety, and patient satisfaction. Join medtravel.me and attract patients actively seeking dental treatments in one of the world's top medical tourism destinations.",
    payoutProcess:
      'Patients often take time to research and make informed decisions about dental care abroad. This means the time between first inquiry and actual treatment can vary — sometimes taking several weeks or even months. All leads and conversions will initially appear as "Pending." Once the clinic confirms that the treatment has been completed and payment received, the status will update to "Confirmed." Payouts are processed monthly, and confirmed treatments are included in the following payout cycle.',
    languages:
      "English German Polish Russian Danish Dutch; Flemish Finnish Norwegian Swedish",
    targetCountries:
      "United Kingdom Ireland United States Canada Germany Austria Switzerland Liechtenstein Luxembourg Belgium Poland Russia Belarus Kazakhstan Ukraine Estonia Latvia Lithuania Moldova Denmark Netherlands Belgium Finland Norway Sweden",
    allowedChannels:
      "Website, Social media, Video platform, Newsletter, Messaging platform",
    programTerms:
      "Please note that failure to comply with these terms and conditions could result in your relationship within this Affiliate Program being terminated and any Partner's fee earned being reversed. By joining the present Affiliate Program of the Advertiser, you agree to comply with the terms specified below and confirm that you understand that: The advertiser is Medtravel.me, which offers online booking services for clinics for medical tourism purposes and operates its affiliate program through the Medtravel.me affiliate network. 1.1. You are not allowed to engage (willingly or accidentally) in Prohibited Activities (\"Forbidden traffic types\") while Traffic Acquisition, including, but not limited to, those mentioned on the description page of the Advertiser's Affiliate Program; 1.2. Ad hijacking of the Advertiser's ads or direct linking to the Advertiser is strictly prohibited. You will be immediately blacklisted for this Advertiser, and all of your fees for Traffic Acquisition will be reversed for failure to comply with the specified condition. You must provide content that is of value and beneficial to the end-user and should not use PPC as a redirect. You should refrain from creating PPC ads that either contain the Advertiser's URL or contain Advertiser's trademarks or any other Advertiser's intellectual property or redirect to the Advertiser's website and should not click through to the Advertiser's ad; 1.3. You are not allowed to add URLs that link to the Advertiser's website and post other promo materials on third-party websites without the explicit consent of their owners; 1.4. You are not allowed to use any other advertising materials, except for those that are presented on the Affiliate Network website: Partner's fee: 2.1. Your Partner's fee for Traffic Acquisition is paid for Desired Actions, which mean actual purchases or other actions in relation to Travel services on the Advertiser's website that are made by referrals from your website; 2.2. Your Partner's fee is based on all referrals, who used the URLs that contain your affiliate ID, provided that all the transactions made by a user within the cookie lifetime period starting from their first visit to the Advertiser's website are taken into account; 2.3. Your Partner's fee is calculated as mentioned on the description page of the Advertiser on the Medtravel.me website; 2.4. You will be provided with information about statistics on completed Desired Actions and your income on the dashboard at Medtravel.me. The Partner's fee calculated for the previous month is paid as it's described on Travelpayouts.com by transferring funds to your account according to the payment details specified in your Personal Dashboard.",
  };
  
  export default function DentistryProgramPage() {
    return <ProgramDetail config={CONFIG} />;
  }
"""
components\layout\Navbar.tsx: """
// components/layout/Navbar.tsx
"use client";

import React, { useMemo, useCallback, useEffect, useState } from "react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";

import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Link,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Badge,
  Button,
} from "@heroui/react";

import type { SupabaseContextType } from "@/lib/supabase/supabase-provider";
import { useSupabase } from "@/lib/supabase/supabase-provider";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { ThemeSwitch } from "@/components/shared/ThemeSwitch";
import {
  getAccessibleNavItems,
  getAccessibleProfileMenuItems,
} from "@/config/nav";
import CustomerAuthModal from "@/components/auth/CustomerAuthModal";
import PartnerAuthModal from "@/components/auth/PartnerAuthModal";
import PatientAuthModal from "@/components/auth/PatientAuthModal";
import NotificationsBell from "@/components/notifications/NotificationsBell";

// безопасный текст без жёсткой завязки на i18n
const tSafe = (t: any, key: string, fallback: string) => {
  try {
    const v = t(key);
    if (!v || typeof v !== "string" || v.startsWith("navbar.")) return fallback;
    return v;
  } catch {
    return fallback;
  }
};

/** Desktop item */
const NavItemLink = React.memo(
  ({ item, active, t }: { item: any; active: boolean; t: any }) => (
    <NavbarItem isActive={active}>
      <NextLink
        prefetch
        className={`font-medium transition-colors ${
          active ? "text-primary" : "text-foreground hover:text-primary"
        }`}
        href={item.href}
      >
        {tSafe(t, item.label, String(item.key ?? item.label))}
      </NextLink>
    </NavbarItem>
  ),
);
NavItemLink.displayName = "NavItemLink";

/** Mobile item */
const MobileNavItem = React.memo(
  ({
    item,
    active,
    t,
    onClose,
  }: {
    item: any;
    active: boolean;
    t: any;
    onClose: () => void;
  }) => (
    <NavbarMenuItem isActive={active}>
      <Link
        prefetch
        as={NextLink}
        className="w-full flex items-center gap-4 font-medium text-lg py-2 px-2 justify-center"
        color={active ? "primary" : "foreground"}
        href={item.href}
        onPress={onClose}
      >
        {tSafe(t, item.label, String(item.key ?? item.label))}
      </Link>
    </NavbarMenuItem>
  ),
);
MobileNavItem.displayName = "MobileNavItem";

/** Дропдаун гостя — выбор: клиника / партнёр / пациент */
function ProfileDropdownGuest({
  onOpenCustomerAuth,
  onOpenPartnerAuth,
  onOpenPatientAuth,
}: {
  onOpenCustomerAuth: () => void;
  onOpenPartnerAuth: () => void;
  onOpenPatientAuth: () => void;
}) {
  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button className="h-8 w-8 min-w-0 p-0" size="sm" variant="ghost">
          <Icon
            className="text-default-500"
            icon="solar:user-linear"
            width={24}
          />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Guest Actions" variant="flat">
        <DropdownItem key="signin-clinic" onPress={onOpenCustomerAuth}>
          Sign in / Sign up as clinic
        </DropdownItem>
        <DropdownItem key="signin-partner" onPress={onOpenPartnerAuth}>
          Sign in / Sign up as partner
        </DropdownItem>
        <DropdownItem key="signin-patient" onPress={onOpenPatientAuth}>
          Sign in / Sign up as patient
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

/** Дропдаун авторизованного */
function ProfileDropdownAuth({
  session,
  role,
  supabase,
  t,
}: {
  session: any;
  role: any;
  supabase: any;
  t: any;
}) {
  const router = useRouter();
  const [roles, setRoles] = useState<string[] | null>(null);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }, [supabase, router]);

  // грузим все роли пользователя из user_roles + primary role из profile
  useEffect(() => {
    let cancelled = false;

    async function loadRoles() {
      if (!session) {
        if (!cancelled) setRoles(null);
        return;
      }

      let collected: string[] = [];

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);

        if (!error && Array.isArray(data)) {
          collected = data
            .map((r: any) => String(r.role || "").toUpperCase())
            .filter(Boolean);
        }
      } catch {
        // в крайнем случае просто используем profile.role
      }

      const primary = String(role || "").toUpperCase();
      if (primary && !collected.includes(primary)) {
        collected.push(primary);
      }

      if (!collected.length) {
        collected.push("GUEST");
      }

      if (!cancelled) setRoles(collected);
    }

    loadRoles();

    return () => {
      cancelled = true;
    };
  }, [session, supabase, role]);

  const effectiveRoles =
    roles && roles.length
      ? roles
      : [String(role || "").toUpperCase() || "GUEST"];

  const hasAdmin =
    effectiveRoles.includes("ADMIN") || effectiveRoles.includes("SUPER_ADMIN");

  const canAccessCustomer = hasAdmin || effectiveRoles.includes("CUSTOMER");
  const canAccessPartner = hasAdmin || effectiveRoles.includes("PARTNER");
  const canAccessPatient = hasAdmin || effectiveRoles.includes("PATIENT");

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button className="h-8 w-8 min-w-0 p-0" size="sm" variant="ghost">
          <Badge
            color="success"
            content=""
            placement="bottom-right"
            shape="circle"
            size="sm"
          >
            <Icon
              className="text-default-500"
              icon="solar:user-linear"
              width={24}
            />
          </Badge>
        </Button>
      </DropdownTrigger>

      <DropdownMenu aria-label="Profile Actions" variant="flat">
        <DropdownItem key="profile" className="h-14 gap-2 cursor-default">
          <p className="font-semibold text-small">
            {tSafe(t, "navbar.signedInAs", "Signed in as")}
          </p>
          <p className="font-medium text-tiny text-default-500">
            {session?.user?.email ?? ""}
          </p>
        </DropdownItem>

        {/* единые настройки для любой роли */}
        <DropdownItem
          key="settings"
          onPress={() => router.push("/settings")}
          startContent={<Icon icon="solar:settings-linear" width={16} />}
        >
          {tSafe(t, "navbar.mySettings", "My settings")}
        </DropdownItem>

        {/* Клиентская панель */}
        {canAccessCustomer ? (
          <DropdownItem
            key="my-clinic"
            onPress={() => router.push("/customer")}
            startContent={<Icon icon="solar:hospital-linear" width={16} />}
          >
            My clinic
          </DropdownItem>
        ) : null}

        {/* Партнёрская панель */}
        {canAccessPartner ? (
          <DropdownItem
            key="partner-dashboard"
            onPress={() => router.push("/partner")}
            startContent={
              <Icon
                icon="solar:users-group-two-rounded-linear"
                width={16}
              />
            }
          >
            My partner dashboard
          </DropdownItem>
        ) : null}

        {/* Пациентская панель */}
        {canAccessPatient ? (
          <DropdownItem
            key="patient-dashboard"
            onPress={() => router.push("/patient")}
            startContent={<Icon icon="solar:heart-pulse-2-linear" width={16} />}
          >
            My patient portal
          </DropdownItem>
        ) : null}

        {/* Admin panel */}
        {hasAdmin ? (
          <DropdownItem
            key="admin"
            onPress={() => router.push("/admin")}
            startContent={<Icon icon="solar:shield-user-bold" width={16} />}
          >
            {tSafe(t, "navbar.adminPanel", "Admin panel")}
          </DropdownItem>
        ) : null}

        <DropdownItem
          key="logout"
          color="danger"
          startContent={<Icon icon="solar:logout-linear" width={16} />}
          onPress={handleLogout}
        >
          {tSafe(t, "navbar.logOut", "Log out")}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

export const Navbar = React.memo(() => {
  const { t } = useTranslation();
  const { supabase, session, role } =
    useSupabase() as SupabaseContextType;

  const pathname = usePathname() ?? "";
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [customerAuthOpen, setCustomerAuthOpen] = React.useState(false);
  const [partnerAuthOpen, setPartnerAuthOpen] = React.useState(false);
  const [patientAuthOpen, setPatientAuthOpen] = React.useState(false);

  const navItems = useMemo(() => getAccessibleNavItems(role), [role]);
  useMemo(() => getAccessibleProfileMenuItems(role), [role]);

  const isAuth = useMemo(
    () => pathname.startsWith("/login") || pathname.startsWith("/auth"),
    [pathname],
  );

  // На /auth/* показываем урезанный navbar
  if (isAuth) {
    return (
      <HeroUINavbar
        className="border-b border-divider"
        height="64px"
        maxWidth="xl"
      >
        <NavbarContent justify="end">
          <NavbarItem>
            <LanguageSwitcher />
          </NavbarItem>
          <NavbarItem>
            <ThemeSwitch />
          </NavbarItem>
        </NavbarContent>
      </HeroUINavbar>
    );
  }

  return (
    <>
      <HeroUINavbar
        className="border-b border-divider bg-background/80 backdrop-blur-md"
        height="64px"
        maxWidth="xl"
        shouldHideOnScroll
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
      >
        <NavbarBrand className="gap-2">
          <NavbarMenuToggle className="mr-1 h-6 sm:hidden" />
          <NextLink
            prefetch
            className="font-bold text-xl text-inherit hover:text-primary transition-colors"
            href="/"
          >
            MedTravel
          </NextLink>
        </NavbarBrand>

        <NavbarContent
          className="absolute left-1/2 transform -translate-x-1/2 hidden sm:flex gap-6"
          justify="center"
        >
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <NavItemLink
                key={item.key}
                active={active}
                item={item}
                t={t}
              />
            );
          })}
        </NavbarContent>

        <NavbarContent
          className="ml-auto flex h-12 max-w-fit items-center gap-1 rounded-full p-0"
          justify="end"
        >
          <NavbarItem>
            <LanguageSwitcher />
          </NavbarItem>
          <NavbarItem>
            <ThemeSwitch />
          </NavbarItem>

          {session && (
            <NavbarItem>
              <NotificationsBell />
            </NavbarItem>
          )}

          <NavbarItem className="px-2">
            {session ? (
              <ProfileDropdownAuth
                session={session}
                role={role}
                supabase={supabase}
                t={t}
              />
            ) : (
              <ProfileDropdownGuest
                onOpenCustomerAuth={() => setCustomerAuthOpen(true)}
                onOpenPartnerAuth={() => setPartnerAuthOpen(true)}
                onOpenPatientAuth={() => setPatientAuthOpen(true)}
              />
            )}
          </NavbarItem>
        </NavbarContent>

        <NavbarMenu className="flex justify-center pt-6">
          <div className="w-full max-w-screen-md mx-auto space-y-2">
            {navItems.map((item) => (
              <MobileNavItem
                key={item.key}
                active={
                  pathname === item.href ||
                  (item.href !== "/" &&
                    pathname.startsWith(item.href))
                }
                item={item}
                t={t}
                onClose={() => setIsMenuOpen(false)}
              />
            ))}
          </div>
        </NavbarMenu>
      </HeroUINavbar>

      {/* Модалки авторизации */}
      <CustomerAuthModal
        open={customerAuthOpen}
        onClose={() => setCustomerAuthOpen(false)}
      />
      <PartnerAuthModal
        open={partnerAuthOpen}
        onClose={() => setPartnerAuthOpen(false)}
      />
      <PatientAuthModal
        open={patientAuthOpen}
        onClose={() => setPatientAuthOpen(false)}
      />
    </>
  );
});
Navbar.displayName = "Navbar";
"""
components\notifications\NotificationsBell.tsx: """
// components/notifications/NotificationsBell.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Icon } from "@iconify/react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Badge,
  Button,
} from "@heroui/react";

import { useSupabase } from "@/lib/supabase/supabase-provider";
import type { SupabaseContextType } from "@/lib/supabase/supabase-provider";
import { clinicHref } from "@/lib/clinic-url";

type NotificationRow = {
  id: string;
  type: string;
  data: any;
  is_read: boolean;
  created_at: string;
};

export default function NotificationsBell() {
  const { supabase, session } =
    useSupabase() as SupabaseContextType;

  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(false);

  // гость — вообще не показываем иконку
  if (!session) return null;

  const loadNotifications = useCallback(async () => {
    if (!supabase || !session) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) setItems(data as NotificationRow[]);
    setLoading(false);
  }, [supabase, session]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = items.filter((n) => !n.is_read).length;

  const markAllRead = useCallback(async () => {
    if (!supabase || !session || unreadCount === 0) return;

    setItems((prev) =>
      prev.map((n) => ({ ...n, is_read: true })),
    );

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", session.user.id)
      .eq("is_read", false);
  }, [supabase, session, unreadCount]);

  function renderText(n: NotificationRow) {
    if (n.type === "partner_program_approved") {
      const program = n.data?.program_key ?? "program";
      const code = n.data?.ref_code as string | undefined;
      const url = n.data?.referral_url as string | undefined;

      return (
        <div className="space-y-1 text-left">
          <div className="text-sm font-medium">
            Your request for{" "}
            <span className="font-semibold">{program}</span> program
            has been approved.
          </div>
          {code && (
            <div className="text-xs text-default-500">
              Referral code:{" "}
              <span className="font-mono">{code}</span>
            </div>
          )}
          {url && (
            <div className="text-xs text-default-500 break-all">
              Referral link: {url}
            </div>
          )}
        </div>
      );
    }

    if (n.type === "clinic_approved") {
      const data = n.data ?? {};
      const clinicName = data?.name ?? "your clinic";

      let clinicUrl: string | null = null;
      try {
        if (data?.slug) {
          clinicUrl = clinicHref({
            slug: data.slug,
            country: data.country ?? undefined,
            province: data.province ?? undefined,
            city: data.city ?? undefined,
            district: data.district ?? undefined,
          });
        }
      } catch {
        clinicUrl = null;
      }

      return (
        <div className="space-y-1 text-left">
          <div className="text-sm font-medium">
            Your clinic{" "}
            <span className="font-semibold">{clinicName}</span> has
            been published.
          </div>
          {clinicUrl && (
            <div className="text-xs text-default-500">
              <a
                href={clinicUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline"
              >
                Open clinic page
              </a>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="text-sm">
        {n.data?.message ?? "Notification"}
      </div>
    );
  }

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button
          className="h-8 w-8 min-w-0 p-0"
          size="sm"
          variant="ghost"
          onClick={markAllRead}
        >
          <Badge
            color={unreadCount > 0 ? "danger" : "default"}
            content={
              unreadCount > 0 ? String(Math.min(unreadCount, 9)) : ""
            }
            isInvisible={unreadCount === 0}
            placement="top-right"
            shape="circle"
            size="sm"
          >
            <Icon
              className="text-default-500"
              icon="solar:bell-linear"
              width={22}
            />
          </Badge>
        </Button>
      </DropdownTrigger>

      <DropdownMenu
        aria-label="Notifications"
        className="max-w-xs"
        disabledKeys={["title"]}
      >
        <DropdownItem key="title" className="cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-default-500">
              Notifications
            </span>
            {loading ? (
              <span className="text-[10px] text-default-400">
                Loading…
              </span>
            ) : (
              <span className="text-[10px] text-default-400">
                {items.length === 0 ? "0" : `${items.length}`}
              </span>
            )}
          </div>
        </DropdownItem>

        {/* Пустое состояние — всегда возвращаем элемент, без `false` */}
        {items.length === 0 && !loading ? (
          <DropdownItem key="empty" className="cursor-default">
            <span className="text-xs text-default-500">
              No notifications yet.
            </span>
          </DropdownItem>
        ) : (
          <></>
        )}

        {/* Список уведомлений — заворачиваем в Fragment, чтобы не было `Element[]` */}
        {items.length > 0 ? (
          <>
            {items.map((n) => (
              <DropdownItem key={n.id} className="py-2">
                {renderText(n)}
              </DropdownItem>
            ))}
          </>
        ) : (
          <></>
        )}
      </DropdownMenu>
    </Dropdown>
  );
}
"""


----------------------------------------------------------

отлично, больше не редиректит на 404, а редиректит на логин, я авторизовался с новой почты через google auth, но почему-то не зарегистрировался как пациент, дальше редиректило только на главную с url - https://medtravel.me/?error=invalid_request&error_code=bad_oauth_state&error_description=OAuth+callback+with+invalid+state

у партнера в My referrals, по ссылке которого я перешел, отобразился только клик, а регистрация нет(смотри скриншоты). у нас вообще регистрация и авторизация очень хромает, давай наверное сначала доведем до идеала авторизацию для всех ролей, а затем уже будем дорабатывать реферальную систему.

----------------------------------------------------------

resend: re_MDmbfUU2_7tBbx7Dki8CLDM7ZUqk8zCni
welcome@medtravel.me
----------------------------------------------------------

отлично. в файле навбара все заменил по твоей инструкции, там только одна ошибка сейчас:
[{
	"resource": "/c:/Users/Artem/Desktop/АРТЕМ ПАПКА/medtravel-main/components/layout/Navbar.tsx",
	"owner": "typescript",
	"code": "2322",
	"severity": 8,
	"message": "Type '{ role: string; label: string; icon: string; show: boolean; }[]' is not assignable to type '{ role: UserRole; label: string; icon: string; show: boolean; }[]'.\n  Type '{ role: string; label: string; icon: string; show: boolean; }' is not assignable to type '{ role: UserRole; label: string; icon: string; show: boolean; }'.\n    Types of property 'role' are incompatible.\n      Type 'string' is not assignable to type 'UserRole'.",
	"source": "ts",
	"startLineNumber": 179,
	"startColumn": 9,
	"endLineNumber": 179,
	"endColumn": 20,
	"modelVersionId": 36,
	"origin": "extHost1"
}]

далее, в таблице public.profiles успешно добавил твоим запросом колонку email_verified.

в vercel environments добавил RESEND_API_KEY, RESEND_FROM=no-reply@medtravel.me, а NEXT_PUBLIC_SITE_URL=https://medtravel.me и NEXTAUTH_URL=https://medtravel.me и так были. в resend подтвержден домен. письма называть Medtravel.

теперь давай поправим немного навбар, затем ты мне дашь готовые роуты, а далее UnifiedAuthModal и так далее по порядку.

текущий полный файл навбара components\layout\Navbar.tsx: """
// components/layout/Navbar.tsx
"use client";

import React, { useMemo, useCallback, useEffect, useState } from "react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";

import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Link,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Badge,
  Button,
} from "@heroui/react";

import type { UserRole } from "@/lib/supabase/supabase-provider";
import { useSupabase } from "@/lib/supabase/supabase-provider";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { ThemeSwitch } from "@/components/shared/ThemeSwitch";
import {
  getAccessibleNavItems,
  getAccessibleProfileMenuItems,
} from "@/config/nav";
import CustomerAuthModal from "@/components/auth/CustomerAuthModal";
import PartnerAuthModal from "@/components/auth/PartnerAuthModal";
import PatientAuthModal from "@/components/auth/PatientAuthModal";
import NotificationsBell from "@/components/notifications/NotificationsBell";

// безопасный текст без жёсткой завязки на i18n
const tSafe = (t: any, key: string, fallback: string) => {
  try {
    const v = t(key);
    if (!v || typeof v !== "string" || v.startsWith("navbar.")) return fallback;
    return v;
  } catch {
    return fallback;
  }
};

/** Desktop item */
const NavItemLink = React.memo(
  ({ item, active, t }: { item: any; active: boolean; t: any }) => (
    <NavbarItem isActive={active}>
      <NextLink
        prefetch
        className={`font-medium transition-colors ${
          active ? "text-primary" : "text-foreground hover:text-primary"
        }`}
        href={item.href}
      >
        {tSafe(t, item.label, String(item.key ?? item.label))}
      </NextLink>
    </NavbarItem>
  ),
);
NavItemLink.displayName = "NavItemLink";

/** Mobile item */
const MobileNavItem = React.memo(
  ({
    item,
    active,
    t,
    onClose,
  }: {
    item: any;
    active: boolean;
    t: any;
    onClose: () => void;
  }) => (
    <NavbarMenuItem isActive={active}>
      <Link
        prefetch
        as={NextLink}
        className="w-full flex items-center gap-4 font-medium text-lg py-2 px-2 justify-center"
        color={active ? "primary" : "foreground"}
        href={item.href}
        onPress={onClose}
      >
        {tSafe(t, item.label, String(item.key ?? item.label))}
      </Link>
    </NavbarMenuItem>
  ),
);
MobileNavItem.displayName = "MobileNavItem";

/** Дропдаун гостя — выбор: клиника / партнёр / пациент */
function ProfileDropdownGuest({
  onOpenCustomerAuth,
  onOpenPartnerAuth,
  onOpenPatientAuth,
}: {
  onOpenCustomerAuth: () => void;
  onOpenPartnerAuth: () => void;
  onOpenPatientAuth: () => void;
}) {
  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button className="h-8 w-8 min-w-0 p-0" size="sm" variant="ghost">
          <Icon
            className="text-default-500"
            icon="solar:user-linear"
            width={24}
          />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Guest Actions" variant="flat">
        <DropdownItem key="signin-clinic" onPress={onOpenCustomerAuth}>
          Sign in / Sign up as clinic
        </DropdownItem>
        <DropdownItem key="signin-partner" onPress={onOpenPartnerAuth}>
          Sign in / Sign up as partner
        </DropdownItem>
        <DropdownItem key="signin-patient" onPress={onOpenPatientAuth}>
          Sign in / Sign up as patient
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

/** Дропдаун авторизованного */
function ProfileDropdownAuth({
  session,
  roles,
  activeRole,
  setActiveRole,
  supabase,
  t,
}: {
  session: any;
  roles: UserRole[];
  activeRole: UserRole;
  setActiveRole: (r: UserRole) => void;
  supabase: any;
  t: any;
}) {
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }, [supabase, router]);

  const hasAdmin = roles.includes("ADMIN");
  const canAccessCustomer = hasAdmin || roles.includes("CUSTOMER");
  const canAccessPartner = hasAdmin || roles.includes("PARTNER");
  const canAccessPatient = hasAdmin || roles.includes("PATIENT");

  const goPortal = (role: UserRole) => {
    setActiveRole(role);

    // маршруты порталов
    const map: Record<UserRole, string> = {
      GUEST: "/",
      PATIENT: "/patient",
      PARTNER: "/partner",
      CUSTOMER: "/customer",
      ADMIN: "/admin",
    };

    router.push(map[role] ?? "/");
  };

  // какие пункты показать в “Switch portal”
  const switchItems: Array<{ role: UserRole; label: string; icon: string; show: boolean }> = [
    {
      role: "PATIENT",
      label: "Patient portal",
      icon: "solar:heart-pulse-2-linear",
      show: canAccessPatient,
    },
    {
      role: "PARTNER",
      label: "Partner dashboard",
      icon: "solar:users-group-two-rounded-linear",
      show: canAccessPartner,
    },
    {
      role: "CUSTOMER",
      label: "Clinic panel",
      icon: "solar:hospital-linear",
      show: canAccessCustomer,
    },
    {
      role: "ADMIN",
      label: "Admin panel",
      icon: "solar:shield-user-bold",
      show: hasAdmin,
    },
  ].filter((x) => x.show);

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button className="h-8 w-8 min-w-0 p-0" size="sm" variant="ghost">
          <Badge color="success" content="" placement="bottom-right" shape="circle" size="sm">
            <Icon className="text-default-500" icon="solar:user-linear" width={24} />
          </Badge>
        </Button>
      </DropdownTrigger>

      <DropdownMenu aria-label="Profile Actions" variant="flat">
        <DropdownItem key="profile" className="h-14 gap-2 cursor-default">
          <p className="font-semibold text-small">
            {tSafe(t, "navbar.signedInAs", "Signed in as")}
          </p>
          <p className="font-medium text-tiny text-default-500">
            {session?.user?.email ?? ""}
          </p>
        </DropdownItem>

        {/* единые настройки */}
        <DropdownItem
          key="settings"
          onPress={() => router.push("/settings")}
          startContent={<Icon icon="solar:settings-linear" width={16} />}
        >
          {tSafe(t, "navbar.mySettings", "My settings")}
        </DropdownItem>

        {/* Switch portal */}
        {switchItems.length ? (
          <>
            <DropdownItem key="switch-title" className="cursor-default text-default-500">
              {tSafe(t, "navbar.switchPortal", "Switch portal")}
            </DropdownItem>

            {switchItems.map((it) => (
              <DropdownItem
                key={`switch-${it.role}`}
                onPress={() => goPortal(it.role)}
                startContent={<Icon icon={it.icon} width={16} />}
                endContent={
                  activeRole === it.role ? (
                    <Icon icon="solar:check-circle-bold" width={16} />
                  ) : null
                }
              >
                {it.label}
              </DropdownItem>
            ))}
          </>
        ) : null}

        <DropdownItem
          key="logout"
          color="danger"
          startContent={<Icon icon="solar:logout-linear" width={16} />}
          onPress={handleLogout}
        >
          {tSafe(t, "navbar.logOut", "Log out")}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}


export const Navbar = React.memo(() => {
  const { t } = useTranslation();
  const { supabase, session, roles, activeRole, setActiveRole } = useSupabase();

  const pathname = usePathname() ?? "";
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [customerAuthOpen, setCustomerAuthOpen] = React.useState(false);
  const [partnerAuthOpen, setPartnerAuthOpen] = React.useState(false);
  const [patientAuthOpen, setPatientAuthOpen] = React.useState(false);

  const navItems = useMemo(() => getAccessibleNavItems(activeRole), [activeRole]);

  const isAuth = useMemo(
    () => pathname.startsWith("/login") || pathname.startsWith("/auth"),
    [pathname],
  );

  // На /auth/* показываем урезанный navbar
  if (isAuth) {
    return (
      <HeroUINavbar
        className="border-b border-divider"
        height="64px"
        maxWidth="xl"
      >
        <NavbarContent justify="end">
          <NavbarItem>
            <LanguageSwitcher />
          </NavbarItem>
          <NavbarItem>
            <ThemeSwitch />
          </NavbarItem>
        </NavbarContent>
      </HeroUINavbar>
    );
  }

  return (
    <>
      <HeroUINavbar
        className="border-b border-divider bg-background/80 backdrop-blur-md"
        height="64px"
        maxWidth="xl"
        shouldHideOnScroll
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
      >
        <NavbarBrand className="gap-2">
          <NavbarMenuToggle className="mr-1 h-6 sm:hidden" />
          <NextLink
            prefetch
            className="font-bold text-xl text-inherit hover:text-primary transition-colors"
            href="/"
          >
            MedTravel
          </NextLink>
        </NavbarBrand>

        <NavbarContent
          className="absolute left-1/2 transform -translate-x-1/2 hidden sm:flex gap-6"
          justify="center"
        >
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <NavItemLink
                key={item.key}
                active={active}
                item={item}
                t={t}
              />
            );
          })}
        </NavbarContent>

        <NavbarContent
          className="ml-auto flex h-12 max-w-fit items-center gap-1 rounded-full p-0"
          justify="end"
        >
          <NavbarItem>
            <LanguageSwitcher />
          </NavbarItem>
          <NavbarItem>
            <ThemeSwitch />
          </NavbarItem>

          {session && (
            <NavbarItem>
              <NotificationsBell />
            </NavbarItem>
          )}

          <NavbarItem className="px-2">
            {session ? (
              <ProfileDropdownAuth
                session={session}
                roles={roles}
                activeRole={activeRole}
                setActiveRole={setActiveRole}
                supabase={supabase}
                t={t}
              />
            ) : (
              <ProfileDropdownGuest
                onOpenCustomerAuth={() => setCustomerAuthOpen(true)}
                onOpenPartnerAuth={() => setPartnerAuthOpen(true)}
                onOpenPatientAuth={() => setPatientAuthOpen(true)}
              />
            )}
          </NavbarItem>
        </NavbarContent>

        <NavbarMenu className="flex justify-center pt-6">
          <div className="w-full max-w-screen-md mx-auto space-y-2">
            {navItems.map((item) => (
              <MobileNavItem
                key={item.key}
                active={
                  pathname === item.href ||
                  (item.href !== "/" &&
                    pathname.startsWith(item.href))
                }
                item={item}
                t={t}
                onClose={() => setIsMenuOpen(false)}
              />
            ))}
          </div>
        </NavbarMenu>
      </HeroUINavbar>

      {/* Модалки авторизации */}
      <CustomerAuthModal
        open={customerAuthOpen}
        onClose={() => setCustomerAuthOpen(false)}
      />
      <PartnerAuthModal
        open={partnerAuthOpen}
        onClose={() => setPartnerAuthOpen(false)}
      />
      <PatientAuthModal
        open={patientAuthOpen}
        onClose={() => setPatientAuthOpen(false)}
      />
    </>
  );
});
Navbar.displayName = "Navbar";
"""

-------------------------------------------------

отлично. в навбаре исправили switchItems, больше ошибки нет. файлы app\api\auth\email\send-otp\route.ts и app\api\auth\email\verify-otp\route.ts создал. в supabase smtp от resend включил и полностью настроил.

в файлах components\auth\EmailForm.tsx и components\auth\OtpForm.tsx сейчас ничего не трогал, ниже дал их полные текущие версии, если надо то давай подключим в них send/verify otp. а далее UnifiedAuthModal и так далее.
ответ на твой вопрос, в otp сейчас 6 цифр.

components\auth\EmailForm.tsx: """
// components/auth/EmailForm.tsx
"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { createClient } from "@/lib/supabase/browserClient";

const supabase = createClient();

type Props = {
  as: string; // "CUSTOMER" / "ADMIN" / ...
  next: string;
  onSuccess?: (email: string) => void;
};

const schema = z.object({ email: z.string().email("Enter a valid email") });
type FormValues = z.infer<typeof schema>;

export default function EmailForm({ as, next, onSuccess }: Props) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setErrorMsg(null);

    const origin = window.location.origin;
    const redirectTo = `${origin}/auth/callback?as=${encodeURIComponent(
      as,
    )}&next=${encodeURIComponent(next)}`;

    const { error } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: {
        emailRedirectTo: redirectTo,
        data: { requested_role: as },
      },
    });

    if (error) setErrorMsg(error.message);
    else onSuccess?.(data.email);
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
      <Input
        isRequired
        placeholder="you@clinic.com"
        className="h-full"
        type="email"
        variant="bordered"
        errorMessage={errors.email?.message}
        {...register("email")}
      />
      {errorMsg && <p className="text-danger text-small">{errorMsg}</p>}
      <Button
        color="primary"
        isLoading={isSubmitting}
        startContent={<Icon className="text-2xl" icon="solar:letter-bold" />}
        type="submit"
      >
        Continue with email
      </Button>
    </form>
  );
}
"""
components\auth\OtpForm.tsx: """
// components/auth/OtpForm.tsx
"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputOtp, Button, Link } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browserClient";

const supabase = createClient();

type Props = {
  email: string;
  as?: string;    // CUSTOMER / PARTNER / PATIENT / ADMIN
  next?: string;  // куда редиректить после успешного ввода
  onBack?: () => void;
};

const schema = z.object({
  token: z
    .string()
    .length(6, "6 digits")
    .regex(/^[0-9]{6}$/),
});

type FormValues = z.infer<typeof schema>;

export default function OtpForm({ email, as = "CUSTOMER", next = "/", onBack }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const resend = async () => {
    if (seconds === 0) {
      const origin = window.location.origin;
      const redirectTo = `${origin}/auth/callback?as=${encodeURIComponent(
        as
      )}&next=${encodeURIComponent(next)}`;

      await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
          data: { requested_role: as },
        },
      });
      setSeconds(60);
      reset();
    }
  };

  const onSubmit = async (data: FormValues) => {
    setErrorMsg(null);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: data.token,
      type: "email",
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      router.replace(next || "/");
      router.refresh();
    }
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
      <InputOtp
        isRequired
        aria-label="OTP input"
        length={6}
        placeholder="0"
        {...register("token")}
      />
      {errors.token && (
        <p className="text-danger text-small">{errors.token.message}</p>
      )}
      {errorMsg && <p className="text-danger text-small">{errorMsg}</p>}
      <p className="text-tiny text-default-500">
        Didn&apos;t receive code?{" "}
        <Link as="button" disabled={seconds !== 0} size="sm" onClick={resend}>
          Resend{seconds ? ` (${seconds}s)` : ""}
        </Link>
      </p>
      <Button color="primary" isLoading={isSubmitting} type="submit">
        Verify
      </Button>
      <Button
        type="button"
        variant="light"
        onClick={onBack || (() => window.history.back())}
      >
        Back
      </Button>
    </form>
  );
}
"""

------------------------------------------------

отлично. я пока еще ничего не деплоил и не тестировал, давай сначала закончим с UnifiedAuthModal, навбаром и доведем ux/ui и в целом auth до идеала, а уже после я все задеплою разом и буду тестировать.

------------------------------------------------

хорошо. так, изменения я выполнил, все обновил. давай пока что чуть остановимся. я могу уже деплоить и тестировать? или нам нужно еще дойти до логической точки, чтобы не запутаться? просто уже много чего сделали и все еще продолжаем.
в файле components\auth\AuthLoginClient.tsx есть одна ошибка: """
[{
	"resource": "/c:/Users/Artem/Desktop/АРТЕМ ПАПКА/medtravel-main/components/auth/AuthLoginClient.tsx",
	"owner": "typescript",
	"code": "2345",
	"severity": 8,
	"message": "Argument of type '\"GUEST\" | \"PATIENT\" | \"CUSTOMER\" | \"PARTNER\" | null' is not assignable to parameter of type 'SetStateAction<\"PATIENT\" | \"CUSTOMER\" | \"PARTNER\" | null>'.\n  Type '\"GUEST\"' is not assignable to type 'SetStateAction<\"PATIENT\" | \"CUSTOMER\" | \"PARTNER\" | null>'.",
	"source": "ts",
	"startLineNumber": 73,
	"startColumn": 13,
	"endLineNumber": 73,
	"endColumn": 14,
	"modelVersionId": 2,
	"origin": "extHost1"
}]
"""

ниже предоставил нектороые файлы, остальное вроде бы не трогалось. проверь все тщательно пожалуйста и дай правки если что-то не так.
а в целом давай поправим что надо, все перепроверим, дойдем до логической точки, затем я задеплою и просмотрю, протестирую как работает все, а уже потом будем думать и расписывать что дальше и тд.

components\layout\Navbar.tsx: """
// components/layout/Navbar.tsx
"use client";

import React, { useMemo, useCallback, useEffect, useState } from "react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";

import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Link,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Badge,
  Button,
} from "@heroui/react";

import type { UserRole } from "@/lib/supabase/supabase-provider";
import { useSupabase } from "@/lib/supabase/supabase-provider";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { ThemeSwitch } from "@/components/shared/ThemeSwitch";
import {
  getAccessibleNavItems,
  getAccessibleProfileMenuItems,
} from "@/config/nav";
import UnifiedAuthModal from "@/components/auth/UnifiedAuthModal";
import NotificationsBell from "@/components/notifications/NotificationsBell";

// безопасный текст без жёсткой завязки на i18n
const tSafe = (t: any, key: string, fallback: string) => {
  try {
    const v = t(key);
    if (!v || typeof v !== "string" || v.startsWith("navbar.")) return fallback;
    return v;
  } catch {
    return fallback;
  }
};

/** Desktop item */
const NavItemLink = React.memo(
  ({ item, active, t }: { item: any; active: boolean; t: any }) => (
    <NavbarItem isActive={active}>
      <NextLink
        prefetch
        className={`font-medium transition-colors ${
          active ? "text-primary" : "text-foreground hover:text-primary"
        }`}
        href={item.href}
      >
        {tSafe(t, item.label, String(item.key ?? item.label))}
      </NextLink>
    </NavbarItem>
  ),
);
NavItemLink.displayName = "NavItemLink";

/** Mobile item */
const MobileNavItem = React.memo(
  ({
    item,
    active,
    t,
    onClose,
  }: {
    item: any;
    active: boolean;
    t: any;
    onClose: () => void;
  }) => (
    <NavbarMenuItem isActive={active}>
      <Link
        prefetch
        as={NextLink}
        className="w-full flex items-center gap-4 font-medium text-lg py-2 px-2 justify-center"
        color={active ? "primary" : "foreground"}
        href={item.href}
        onPress={onClose}
      >
        {tSafe(t, item.label, String(item.key ?? item.label))}
      </Link>
    </NavbarMenuItem>
  ),
);
MobileNavItem.displayName = "MobileNavItem";

/** Дропдаун гостя — выбор: клиника / партнёр / пациент */
function ProfileDropdownGuest({
  onOpenCustomerAuth,
  onOpenPartnerAuth,
  onOpenPatientAuth,
}: {
  onOpenCustomerAuth: () => void;
  onOpenPartnerAuth: () => void;
  onOpenPatientAuth: () => void;
}) {
  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button className="h-8 w-8 min-w-0 p-0" size="sm" variant="ghost">
          <Icon
            className="text-default-500"
            icon="solar:user-linear"
            width={24}
          />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Guest Actions" variant="flat">
        <DropdownItem key="signin-clinic" onPress={onOpenCustomerAuth}>
          Sign in / Sign up as clinic
        </DropdownItem>
        <DropdownItem key="signin-partner" onPress={onOpenPartnerAuth}>
          Sign in / Sign up as partner
        </DropdownItem>
        <DropdownItem key="signin-patient" onPress={onOpenPatientAuth}>
          Sign in / Sign up as patient
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

/** Дропдаун авторизованного */
function ProfileDropdownAuth({
  session,
  roles,
  activeRole,
  setActiveRole,
  supabase,
  t,
}: {
  session: any;
  roles: UserRole[];
  activeRole: UserRole;
  setActiveRole: (r: UserRole) => void;
  supabase: any;
  t: any;
}) {
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }, [supabase, router]);

  const hasAdmin = roles.includes("ADMIN");
  const canAccessCustomer = hasAdmin || roles.includes("CUSTOMER");
  const canAccessPartner = hasAdmin || roles.includes("PARTNER");
  const canAccessPatient = hasAdmin || roles.includes("PATIENT");

  const goPortal = (role: UserRole) => {
    setActiveRole(role);

    // маршруты порталов
    const map: Record<UserRole, string> = {
      GUEST: "/",
      PATIENT: "/patient",
      PARTNER: "/partner",
      CUSTOMER: "/customer",
      ADMIN: "/admin",
    };

    router.push(map[role] ?? "/");
  };

  // какие пункты показать в “Switch portal”
  const switchItems = ([
    {
      role: "PATIENT" as UserRole,
      label: "Patient portal",
      icon: "solar:heart-pulse-2-linear",
      show: canAccessPatient,
    },
    {
      role: "PARTNER" as UserRole,
      label: "Partner dashboard",
      icon: "solar:users-group-two-rounded-linear",
      show: canAccessPartner,
    },
    {
      role: "CUSTOMER" as UserRole,
      label: "Clinic panel",
      icon: "solar:hospital-linear",
      show: canAccessCustomer,
    },
    {
      role: "ADMIN" as UserRole,
      label: "Admin panel",
      icon: "solar:shield-user-bold",
      show: hasAdmin,
    },
  ] as const satisfies ReadonlyArray<{
    role: UserRole;
    label: string;
    icon: string;
    show: boolean;
  }>).filter((x) => x.show);

  const switchableCount = switchItems.length;

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button className="h-8 w-8 min-w-0 p-0" size="sm" variant="ghost">
          <Badge color="success" content="" placement="bottom-right" shape="circle" size="sm">
            <Icon className="text-default-500" icon="solar:user-linear" width={24} />
          </Badge>
        </Button>
      </DropdownTrigger>

      <DropdownMenu aria-label="Profile Actions" variant="flat">
        <DropdownItem key="profile" className="h-14 gap-2 cursor-default">
          <p className="font-semibold text-small">
            {tSafe(t, "navbar.signedInAs", "Signed in as")}
          </p>
          <p className="font-medium text-tiny text-default-500">
            {session?.user?.email ?? ""}
          </p>
        </DropdownItem>

        <DropdownItem key="active-portal" className="cursor-default">
          <div className="flex items-center justify-between w-full">
            <span className="text-tiny text-default-500">Active portal</span>
            <span className="text-tiny font-semibold">{activeRole}</span>
          </div>
        </DropdownItem>

        {/* единые настройки */}
        <DropdownItem
          key="settings"
          onPress={() => router.push("/settings")}
          startContent={<Icon icon="solar:settings-linear" width={16} />}
        >
          {tSafe(t, "navbar.mySettings", "My settings")}
        </DropdownItem>

        {/* Switch portal */}
        {switchableCount > 1 ? (
          <>
            <DropdownItem key="switch-title" className="cursor-default text-default-500">
              {tSafe(t, "navbar.switchPortal", "Switch portal")}
            </DropdownItem>

            {switchItems.map((it) => (
              <DropdownItem
                key={`switch-${it.role}`}
                onPress={() => goPortal(it.role)}
                startContent={<Icon icon={it.icon} width={16} />}
                endContent={
                  activeRole === it.role ? (
                    <Icon icon="solar:check-circle-bold" width={16} />
                  ) : null
                }
              >
                {it.label}
              </DropdownItem>
            ))}
          </>
        ) : null}

        <DropdownItem
          key="logout"
          color="danger"
          startContent={<Icon icon="solar:logout-linear" width={16} />}
          onPress={handleLogout}
        >
          {tSafe(t, "navbar.logOut", "Log out")}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}


export const Navbar = React.memo(() => {
  const { t } = useTranslation();
  const { supabase, session, roles, activeRole, setActiveRole } = useSupabase();

  const pathname = usePathname() ?? "";
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [authOpen, setAuthOpen] = React.useState(false);
  const [authRole, setAuthRole] = React.useState<"CUSTOMER" | "PARTNER" | "PATIENT" | null>(null);

  const navItems = useMemo(() => getAccessibleNavItems(activeRole), [activeRole]);

  const isAuth = useMemo(
    () => pathname.startsWith("/login") || pathname.startsWith("/auth"),
    [pathname],
  );

  // На /auth/* показываем урезанный navbar
  if (isAuth) {
    return (
      <HeroUINavbar
        className="border-b border-divider"
        height="64px"
        maxWidth="xl"
      >
        <NavbarContent justify="end">
          <NavbarItem>
            <LanguageSwitcher />
          </NavbarItem>
          <NavbarItem>
            <ThemeSwitch />
          </NavbarItem>
        </NavbarContent>
      </HeroUINavbar>
    );
  }

  return (
    <>
      <HeroUINavbar
        className="border-b border-divider bg-background/80 backdrop-blur-md"
        height="64px"
        maxWidth="xl"
        shouldHideOnScroll
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
      >
        <NavbarBrand className="gap-2">
          <NavbarMenuToggle className="mr-1 h-6 sm:hidden" />
          <NextLink
            prefetch
            className="font-bold text-xl text-inherit hover:text-primary transition-colors"
            href="/"
          >
            MedTravel
          </NextLink>
        </NavbarBrand>

        <NavbarContent
          className="absolute left-1/2 transform -translate-x-1/2 hidden sm:flex gap-6"
          justify="center"
        >
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <NavItemLink
                key={item.key}
                active={active}
                item={item}
                t={t}
              />
            );
          })}
        </NavbarContent>

        <NavbarContent
          className="ml-auto flex h-12 max-w-fit items-center gap-1 rounded-full p-0"
          justify="end"
        >
          <NavbarItem>
            <LanguageSwitcher />
          </NavbarItem>
          <NavbarItem>
            <ThemeSwitch />
          </NavbarItem>

          {session && (
            <NavbarItem>
              <NotificationsBell />
            </NavbarItem>
          )}

          <NavbarItem className="px-2">
            {session ? (
              <ProfileDropdownAuth
                session={session}
                roles={roles}
                activeRole={activeRole}
                setActiveRole={setActiveRole}
                supabase={supabase}
                t={t}
              />
            ) : (
              <Button
                color="primary"
                variant="flat"
                startContent={<Icon icon="solar:user-linear" width={18} />}
                onPress={() => {
                  setAuthRole(null);     // важно: null => в модалке покажется выбор роли
                  setAuthOpen(true);
                }}
                className="hidden sm:flex"
              >
                Sign in
              </Button>
            )}

            {!session ? (
              <Button
                className="h-8 w-8 min-w-0 p-0 sm:hidden"
                size="sm"
                variant="ghost"
                onPress={() => {
                  setAuthRole(null);
                  setAuthOpen(true);
                }}
              >
                <Icon className="text-default-500" icon="solar:user-linear" width={24} />
              </Button>
            ) : null}
          </NavbarItem>
        </NavbarContent>

        <NavbarMenu className="flex justify-center pt-6">
          <div className="w-full max-w-screen-md mx-auto space-y-2">
            {navItems.map((item) => (
              <MobileNavItem
                key={item.key}
                active={
                  pathname === item.href ||
                  (item.href !== "/" &&
                    pathname.startsWith(item.href))
                }
                item={item}
                t={t}
                onClose={() => setIsMenuOpen(false)}
              />
            ))}
          </div>
        </NavbarMenu>
      </HeroUINavbar>

      <UnifiedAuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        initialRole={authRole}
        next={pathname || "/"}
      />
    </>
  );
});
Navbar.displayName = "Navbar";
"""
app\auth\login\page.tsx: """
// app/auth/login/page.tsx
import AuthLoginClient from "@/components/auth/AuthLoginClient";

export const dynamic = "force-dynamic";

type SP = { [key: string]: string | string[] | undefined };

function pick(sp: SP, key: string): string | undefined {
  const v = sp[key];
  return Array.isArray(v) ? v[0] : v;
}

export default function Page({ searchParams }: { searchParams: SP }) {
  const as = pick(searchParams, "as");     // PATIENT / PARTNER / CUSTOMER
  const next = pick(searchParams, "next"); // куда после логина

  return <AuthLoginClient as={as} next={next} />;
}
"""
components\auth\AuthLoginClient.tsx: """
// components/auth/AuthLoginClient.tsx
"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button, Card, CardBody, Divider } from "@heroui/react";

import type { UserRole } from "@/lib/supabase/supabase-provider";
import { useSupabase } from "@/lib/supabase/supabase-provider";

import EmailForm from "@/components/auth/EmailForm";
import OtpForm from "@/components/auth/OtpForm";

type Step = "role" | "method" | "email" | "otp";

type Props = {
  as?: string;   // из query
  next?: string; // из query
};

const ROLE_META: Record<
  Exclude<UserRole, "GUEST">,
  { title: string; subtitle: string; icon: string }
> = {
  PATIENT: {
    title: "Patient",
    subtitle: "Book appointments, manage visits",
    icon: "solar:heart-pulse-2-linear",
  },
  PARTNER: {
    title: "Partner",
    subtitle: "Referral links, programs, reports",
    icon: "solar:users-group-two-rounded-linear",
  },
  CUSTOMER: {
    title: "Clinic",
    subtitle: "Manage clinic profile and bookings",
    icon: "solar:hospital-linear",
  },
  ADMIN: {
    title: "Admin",
    subtitle: "Administration panel",
    icon: "solar:shield-user-bold",
  },
};

function normalizeRole(v?: string): Exclude<UserRole,'s GUEST' | "ADMIN"> | null {
  const r = String(v || "").trim().toUpperCase();
  if (r === "PATIENT" || r === "PARTNER" || r === "CUSTOMER") return r;
  return null;
}

export default function AuthLoginClient({ as, next }: Props) {
  const router = useRouter();
  const { supabase } = useSupabase();

  const safeNext = useMemo(() => {
    const n = String(next || "/");
    // защита от внешних редиректов
    return n.startsWith("/") ? n : "/";
  }, [next]);

  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<Exclude<UserRole, "GUEST" | "ADMIN"> | null>(
    null,
  );
  const [email, setEmail] = useState("");

  useEffect(() => {
    const r = normalizeRole(as);
    setRole(r);
    setEmail("");
    setStep(r ? "method" : "role");
  }, [as]);

  const roleLabel = role ? ROLE_META[role]?.title ?? role : "";

  const signInWithGoogle = useCallback(async () => {
    if (!role) return;

    const origin = window.location.origin;
    const redirectTo = `${origin}/auth/callback?as=${encodeURIComponent(
      role,
    )}&next=${encodeURIComponent(safeNext)}`;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  }, [supabase, role, safeNext]);

  const onEmailSuccess = (e: string) => {
    setEmail(e);
    setStep("otp");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[520px]">
        <div className="mb-6 flex items-center justify-between">
          <NextLink
            href="/"
            className="text-sm text-default-500 hover:text-primary transition-colors inline-flex items-center gap-2"
          >
            <Icon icon="solar:alt-arrow-left-linear" width={18} />
            Back to home
          </NextLink>

          <div className="text-sm text-default-500">
            {role ? (
              <span className="inline-flex items-center gap-2">
                <Icon icon={ROLE_META[role].icon} width={16} />
                {roleLabel}
              </span>
            ) : (
              "Choose role"
            )}
          </div>
        </div>

        <Card className="border border-divider">
          <CardBody className="p-6 flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <Icon icon="solar:login-3-linear" width={20} />
              <div className="font-semibold text-lg">
                {step === "role" ? "Sign in / Sign up" : `Continue as ${roleLabel}`}
              </div>
            </div>

            <Divider />

            {/* STEP: role */}
            {step === "role" ? (
              <div className="grid grid-cols-1 gap-3">
                {(["PATIENT", "PARTNER", "CUSTOMER"] as const).map((r) => (
                  <button
                    key={r}
                    className="w-full text-left rounded-xl border border-divider hover:border-primary transition-colors p-4 flex items-center gap-4"
                    onClick={() => {
                      setRole(r);
                      setStep("method");
                      // обновляем URL параметр as (удобно шарить ссылку)
                      router.replace(`/auth/login?as=${r}&next=${encodeURIComponent(safeNext)}`);
                    }}
                  >
                    <div className="h-10 w-10 rounded-full bg-default-100 flex items-center justify-center">
                      <Icon icon={ROLE_META[r].icon} width={22} />
                    </div>
                    <div className="flex flex-col">
                      <div className="font-semibold">{ROLE_META[r].title}</div>
                      <div className="text-tiny text-default-500">{ROLE_META[r].subtitle}</div>
                    </div>
                    <div className="ml-auto text-default-400">
                      <Icon icon="solar:alt-arrow-right-linear" width={18} />
                    </div>
                  </button>
                ))}
              </div>
            ) : null}

            {/* STEP: method */}
            {step === "method" ? (
              <div className="flex flex-col gap-3">
                <Button
                  color="primary"
                  startContent={<Icon icon="solar:letter-bold" width={18} />}
                  onPress={() => setStep("email")}
                  className="justify-center"
                >
                  Continue with email
                </Button>

                <Button
                  variant="bordered"
                  startContent={<Icon icon="logos:google-icon" width={18} />}
                  onPress={signInWithGoogle}
                  className="justify-center"
                >
                  Continue with Google
                </Button>

                <div className="flex items-center justify-between mt-2">
                  <Button
                    variant="light"
                    onPress={() => {
                      setRole(null);
                      setStep("role");
                      router.replace(`/auth/login?next=${encodeURIComponent(safeNext)}`);
                    }}
                    startContent={<Icon icon="solar:refresh-linear" width={16} />}
                  >
                    Change role
                  </Button>

                  <span className="text-tiny text-default-500">
                    Next: <b>{safeNext}</b>
                  </span>
                </div>
              </div>
            ) : null}

            {/* STEP: email */}
            {step === "email" && role ? (
              <div className="flex flex-col gap-4">
                <EmailForm as={role} next={safeNext} onSuccess={onEmailSuccess} />
                <Button variant="light" onPress={() => setStep("method")}>
                  Back
                </Button>
              </div>
            ) : null}

            {/* STEP: otp */}
            {step === "otp" && role ? (
              <div className="flex flex-col gap-4">
                <OtpForm
                  email={email}
                  as={role}
                  next={safeNext}
                  onBack={() => setStep("email")}
                />
              </div>
            ) : null}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
"""
components\auth\EmailForm.tsx: """
// components/auth/EmailForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Button } from "@heroui/react";
import { Icon } from "@iconify/react";

type Props = {
  as: string; // "CUSTOMER" / "PARTNER" / "PATIENT" / "ADMIN"
  next: string;
  onSuccess?: (email: string) => void;
};

const schema = z.object({ email: z.string().email("Enter a valid email") });
type FormValues = z.infer<typeof schema>;

export default function EmailForm({ as, next, onSuccess }: Props) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/email/send-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: data.email, as, next }),
        cache: "no-store",
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMsg(json?.error || "Failed to send code");
        return;
      }

      onSuccess?.(data.email);
    } catch (e: any) {
      setErrorMsg(e?.message || "Network error");
    }
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
      <Input
        isRequired
        placeholder="you@clinic.com"
        className="h-full"
        type="email"
        variant="bordered"
        errorMessage={errors.email?.message}
        {...register("email")}
      />

      {errorMsg && <p className="text-danger text-small">{errorMsg}</p>}

      <Button
        color="primary"
        isLoading={isSubmitting}
        startContent={<Icon className="text-2xl" icon="solar:letter-bold" />}
        type="submit"
      >
        Continue with email
      </Button>
    </form>
  );
}
"""
components\auth\OtpForm.tsx: """
// components/auth/OtpForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputOtp, Button, Link } from "@heroui/react";
import { useRouter } from "next/navigation";

type Props = {
  email: string;
  as?: string; // CUSTOMER / PARTNER / PATIENT / ADMIN
  next?: string; // куда редиректить после успешного ввода
  onBack?: () => void;
};

const schema = z.object({
  token: z.string().length(6, "6 digits").regex(/^[0-9]{6}$/),
});

type FormValues = z.infer<typeof schema>;

export default function OtpForm({
  email,
  as = "CUSTOMER",
  next = "/",
  onBack,
}: Props) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(60);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const resend = async () => {
    if (seconds !== 0 || resending) return;

    setErrorMsg(null);
    setResending(true);

    try {
      const res = await fetch("/api/auth/email/send-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, as, next }),
        cache: "no-store",
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMsg(json?.error || "Failed to resend code");
        return;
      }

      setSeconds(60);
      reset();
    } catch (e: any) {
      setErrorMsg(e?.message || "Network error");
    } finally {
      setResending(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/email/verify-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          token: data.token,
          as,
          next,
        }),
        cache: "no-store",
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMsg(json?.error || "Invalid code");
        return;
      }

      router.replace(next || "/");
      router.refresh();
    } catch (e: any) {
      setErrorMsg(e?.message || "Network error");
    }
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
      <InputOtp
        isRequired
        aria-label="OTP input"
        length={6}
        placeholder="0"
        {...register("token")}
      />

      {errors.token && (
        <p className="text-danger text-small">{errors.token.message}</p>
      )}
      {errorMsg && <p className="text-danger text-small">{errorMsg}</p>}

      <p className="text-tiny text-default-500">
        Didn&apos;t receive code?{" "}
        <Link
          as="button"
          disabled={seconds !== 0 || resending}
          size="sm"
          onClick={resend}
        >
          Resend{seconds ? ` (${seconds}s)` : ""}
        </Link>
      </p>

      <Button color="primary" isLoading={isSubmitting} type="submit">
        Verify
      </Button>

      <Button
        type="button"
        variant="light"
        onClick={onBack || (() => window.history.back())}
      >
        Back
      </Button>
    </form>
  );
}
"""

---------------------------------------------

выполнил правки, ошибок больше нет. начал деплоить и по завершению ошибки при деплое: """
03:32:30.016 Running build in Washington, D.C., USA (East) – iad1
03:32:30.020 Build machine configuration: 2 cores, 8 GB
03:32:30.342 Cloning github.com/ArtLegends/medtravel-main (Branch: main, Commit: 4cf68d3)
03:32:31.858 Cloning completed: 1.516s
03:32:32.802 Restored build cache from previous deployment (2XP7pCteRjnwMJgskKsvE1PhD9Vm)
03:32:34.079 Running "vercel build"
03:32:34.501 Vercel CLI 50.1.6
03:32:35.243 yarn config v1.22.19
03:32:35.273 success Set "enableGlobalCache" to "false".
03:32:35.274 Done in 0.03s.
03:32:35.284 Installing dependencies...
03:32:35.456 yarn install v1.22.19
03:32:35.553 [1/4] Resolving packages...
03:32:44.565 warning next@15.3.6: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/security-update-2025-12-11 for more details.
03:32:50.340 warning supabase > node-fetch > fetch-blob > node-domexception@1.0.0: Use your platform's native DOMException instead
03:32:50.960 [2/4] Fetching packages...
03:33:20.103 warning tailwind-variants@0.3.0: The engine "pnpm" appears to be invalid.
03:33:20.105 warning tailwind-variants@3.2.2: The engine "pnpm" appears to be invalid.
03:33:20.118 [3/4] Linking dependencies...
03:33:20.129 warning "@heroui/react > @heroui/theme@2.4.25" has incorrect peer dependency "tailwindcss@>=4.0.0".
03:33:37.506 [4/4] Building fresh packages...
03:33:41.260 success Saved lockfile.
03:33:41.272 Done in 65.82s.
03:33:41.336 Detected Next.js version: 15.3.6
03:33:41.339 Running "yarn run build"
03:33:41.519 yarn run v1.22.19
03:33:41.551 $ next build
03:33:42.239    ▲ Next.js 15.3.6
03:33:42.239    - Environments: .env
03:33:42.240 
03:33:42.320    Creating an optimized production build ...
03:34:03.537 
03:34:03.538 [1m[33mwarn[39m[22m - The utility `data-[has-label=true]:mt-[calc(theme(fontSize.small)_+_10px)]` contains an invalid theme value and was not generated.
03:34:11.747  ✓ Compiled successfully in 28.0s
03:34:11.753    Skipping linting
03:34:11.754    Checking validity of types ...
03:34:32.271 Failed to compile.
03:34:32.272 
03:34:32.273 app/auth/login/page.tsx
03:34:32.273 Type error: Type '{ searchParams: SP; }' does not satisfy the constraint 'PageProps'.
03:34:32.273   Types of property 'searchParams' are incompatible.
03:34:32.273     Type 'SP' is missing the following properties from type 'Promise<any>': then, catch, finally, [Symbol.toStringTag]
03:34:32.273 
03:34:32.324 Next.js build worker exited with code: 1 and signal: null
03:34:32.390 error Command failed with exit code 1.
03:34:32.390 info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
03:34:32.412 Error: Command "yarn run build" exited with 1
"""

вот текущий файл app\auth\login\page.tsx: """
// app/auth/login/page.tsx
import AuthLoginClient from "@/components/auth/AuthLoginClient";

export const dynamic = "force-dynamic";

type SP = { [key: string]: string | string[] | undefined };

function pick(sp: SP, key: string): string | undefined {
  const v = sp[key];
  return Array.isArray(v) ? v[0] : v;
}

export default function Page({ searchParams }: { searchParams: SP }) {
  const as = pick(searchParams, "as");     // PATIENT / PARTNER / CUSTOMER
  const next = pick(searchParams, "next"); // куда после логина

  return <AuthLoginClient as={as} next={next} />;
}
"""
а вот файл который был до нового app\auth\login\_old-page.tsx на всякий случай пришлю его: """
// app/(auth)/login/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import { Card, CardBody } from "@/components/shared/HeroUIComponents";
import LoginManager from "@/components/auth/LoginManager";

export const metadata: Metadata = {
  title: "Sign In - MedTravel",
  description: "Sign in to your MedTravel account",
  robots: {
    index: false,
    follow: false,
  },
};

function LoginSkeleton() {
  return (
    <Card className="w-full max-w-md animate-pulse">
      <CardBody className="space-y-4 p-6">
        <div className="h-6 w-32 bg-default-200 rounded" />
        <div className="h-4 w-48 bg-default-100 rounded" />
        <div className="h-10 bg-default-100 rounded" />
        <div className="h-10 bg-primary/20 rounded" />
      </CardBody>
    </Card>
  );
}

// searchParams теперь Promise
type Props = {
  searchParams: Promise<{ as?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;

  const as = (params.as || "CUSTOMER").toUpperCase();
  const isAdmin = as === "ADMIN";
  const isPartner = as === "PARTNER";
  const isPatient = as === "PATIENT";

  const portalLabel = isAdmin
    ? "Admin portal"
    : isPartner
    ? "Partner portal"
    : isPatient
    ? "Patient portal"
    : "Clinic portal";

  const title = isAdmin
    ? "Sign in to admin panel"
    : isPartner
    ? "Sign in as partner"
    : isPatient
    ? "Sign in as patient"
    : "Sign in";

  const description = isAdmin
    ? "Access the MedTravel admin dashboard."
    : isPartner
    ? "Access your MedTravel partner dashboard using Google or email."
    : isPatient
    ? "Access your MedTravel patient portal using Google or email."
    : "Access your MedTravel clinic dashboard using Google or email.";

  return (
    <main className="min-h-screen w-full bg-gradient-to-b flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
            {portalLabel}
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-sm text-default-500">{description}</p>
        </div>

        <Card className="shadow-lg">
          <CardBody className="pt-6 pb-6">
            <Suspense fallback={<LoginSkeleton />}>
              <LoginManager />
            </Suspense>
          </CardBody>
        </Card>

        <div className="text-center">
          <a
            href="/"
            className="text-xs text-default-500 hover:text-default-700 underline underline-offset-2"
          >
            ← Back to MedTravel home
          </a>
        </div>
      </div>
    </main>
  );
}
"""

------------------------------------------------------

так, вот результаты после деплоя и ниже актуальные, текущие версии файлов.
в меню дропдауна вернулись панели, но по ним нельзя перейти, а в консоли ошибки: """
layout-0d632149ae37c573.js:1 Uncaught Error: Function not implemented.
    at setActiveRole (layout-0d632149ae37c573.js:1:21141)
    at T (layout-0d632149ae37c573.js:1:17543)
    at onPress (layout-0d632149ae37c573.js:1:19093)
    at heroui-31f4f7c9b523916c.js:1:746065
    at vendors-2d3e66f9ed74f2cb.js:25:177500
    at onClick (vendors-2d3e66f9ed74f2cb.js:25:180764)
    at vendors-2d3e66f9ed74f2cb.js:31:659826
    at uY (vendors-2d3e66f9ed74f2cb.js:31:463717)
    at vendors-2d3e66f9ed74f2cb.js:31:469795
    at tE (vendors-2d3e66f9ed74f2cb.js:31:350135)
    at u2 (vendors-2d3e66f9ed74f2cb.js:31:464950)
    at s7 (vendors-2d3e66f9ed74f2cb.js:31:491000)
    at s6 (vendors-2d3e66f9ed74f2cb.js:31:490822)
"""

при попытке через email + password зарегистрироваться прилетает уведомление Password must be at least 8 characters, причем в любом случае, я вводил пароль более 8 символов, и ошибки в консоли: """
Failed to load resource: the server responded with a status of 400 ()
"""

таблица public.email_otps создана. в env на vercel все есть.

смотри скриншоты. 

components\layout\Navbar.tsx: """
// components/layout/Navbar.tsx
"use client";

import React, { useMemo, useCallback, useEffect, useState } from "react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";

import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Link,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Badge,
  Button,
} from "@heroui/react";

import type { UserRole } from "@/lib/supabase/supabase-provider";
import { useSupabase } from "@/lib/supabase/supabase-provider";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { ThemeSwitch } from "@/components/shared/ThemeSwitch";
import {
  getAccessibleNavItems,
} from "@/config/nav";
import UnifiedAuthModal from "@/components/auth/UnifiedAuthModal";
import NotificationsBell from "@/components/notifications/NotificationsBell";

// безопасный текст без жёсткой завязки на i18n
const tSafe = (t: any, key: string, fallback: string) => {
  try {
    const v = t(key);
    if (!v || typeof v !== "string" || v.startsWith("navbar.")) return fallback;
    return v;
  } catch {
    return fallback;
  }
};

/** Desktop item */
const NavItemLink = React.memo(
  ({ item, active, t }: { item: any; active: boolean; t: any }) => (
    <NavbarItem isActive={active}>
      <NextLink
        prefetch
        className={`font-medium transition-colors ${
          active ? "text-primary" : "text-foreground hover:text-primary"
        }`}
        href={item.href}
      >
        {tSafe(t, item.label, String(item.key ?? item.label))}
      </NextLink>
    </NavbarItem>
  ),
);
NavItemLink.displayName = "NavItemLink";

/** Mobile item */
const MobileNavItem = React.memo(
  ({
    item,
    active,
    t,
    onClose,
  }: {
    item: any;
    active: boolean;
    t: any;
    onClose: () => void;
  }) => (
    <NavbarMenuItem isActive={active}>
      <Link
        prefetch
        as={NextLink}
        className="w-full flex items-center gap-4 font-medium text-lg py-2 px-2 justify-center"
        color={active ? "primary" : "foreground"}
        href={item.href}
        onPress={onClose}
      >
        {tSafe(t, item.label, String(item.key ?? item.label))}
      </Link>
    </NavbarMenuItem>
  ),
);
MobileNavItem.displayName = "MobileNavItem";

/** Дропдаун авторизованного */
function ProfileDropdownAuth({
  session,
  roles,
  activeRole,
  setActiveRole,
  supabase,
  t,
}: {
  session: any;
  roles: UserRole[];
  activeRole: UserRole;
  setActiveRole: (r: UserRole) => void;
  supabase: any;
  t: any;
}) {
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }, [supabase, router]);

  const hasAdmin = roles.includes("ADMIN");
  const canAccessCustomer = hasAdmin || roles.includes("CUSTOMER");
  const canAccessPartner = hasAdmin || roles.includes("PARTNER");
  const canAccessPatient = hasAdmin || roles.includes("PATIENT");

  const goPortal = (role: UserRole) => {
    setActiveRole(role);

    const map: Record<UserRole, string> = {
      GUEST: "/",
      PATIENT: "/patient",
      PARTNER: "/partner",
      CUSTOMER: "/customer",
      ADMIN: "/admin",
    };

    router.push(map[role] ?? "/");
  };

  const portalItems = ([
    {
      role: "PATIENT" as const,
      label: "Patient portal",
      icon: "solar:heart-pulse-2-linear",
      show: canAccessPatient,
    },
    {
      role: "PARTNER" as const,
      label: "Partner dashboard",
      icon: "solar:users-group-two-rounded-linear",
      show: canAccessPartner,
    },
    {
      role: "CUSTOMER" as const,
      label: "Clinic panel",
      icon: "solar:hospital-linear",
      show: canAccessCustomer,
    },
    {
      role: "ADMIN" as const,
      label: "Admin panel",
      icon: "solar:shield-user-bold",
      show: hasAdmin,
    },
  ] satisfies ReadonlyArray<{
    role: UserRole;
    label: string;
    icon: string;
    show: boolean;
  }>).filter((x) => x.show);

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button className="h-8 w-8 min-w-0 p-0" size="sm" variant="ghost">
          <Badge
            color="success"
            content=""
            placement="bottom-right"
            shape="circle"
            size="sm"
          >
            <Icon className="text-default-500" icon="solar:user-linear" width={24} />
          </Badge>
        </Button>
      </DropdownTrigger>

      <DropdownMenu aria-label="Profile Actions" variant="flat">
        <DropdownItem key="profile" className="h-14 gap-2 cursor-default">
          <p className="font-semibold text-small">
            {tSafe(t, "navbar.signedInAs", "Signed in as")}
          </p>
          <p className="font-medium text-tiny text-default-500">
            {session?.user?.email ?? ""}
          </p>
        </DropdownItem>

        <DropdownItem
          key="settings"
          onPress={() => router.push("/settings")}
          startContent={<Icon icon="solar:settings-linear" width={16} />}
        >
          {tSafe(t, "navbar.mySettings", "My settings")}
        </DropdownItem>

        {/* ПАНЕЛИ (вернули) */}
        {portalItems.length ? (
          <>
            <DropdownItem key="portals-title" className="cursor-default text-default-500">
              Portals
            </DropdownItem>

            {portalItems.map((it) => (
              <DropdownItem
                key={`portal-${it.role}`}
                onPress={() => goPortal(it.role)}
                startContent={<Icon icon={it.icon} width={16} />}
              >
                {it.label}
              </DropdownItem>
            ))}
          </>
        ) : null}

        <DropdownItem
          key="logout"
          color="danger"
          startContent={<Icon icon="solar:logout-linear" width={16} />}
          onPress={handleLogout}
        >
          {tSafe(t, "navbar.logOut", "Log out")}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

export const Navbar = React.memo(() => {
  const { t } = useTranslation();
  const { supabase, session, roles, activeRole, setActiveRole } = useSupabase();

  const pathname = usePathname() ?? "";
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [authOpen, setAuthOpen] = React.useState(false);
  const [authRole, setAuthRole] = React.useState<"CUSTOMER" | "PARTNER" | "PATIENT" | null>(null);

  const navItems = useMemo(() => getAccessibleNavItems(activeRole), [activeRole]);

  const isAuth = useMemo(
    () => pathname.startsWith("/login") || pathname.startsWith("/auth"),
    [pathname],
  );

  // На /auth/* показываем урезанный navbar
  if (isAuth) {
    return (
      <HeroUINavbar
        className="border-b border-divider"
        height="64px"
        maxWidth="xl"
      >
        <NavbarContent justify="end">
          <NavbarItem>
            <LanguageSwitcher />
          </NavbarItem>
          <NavbarItem>
            <ThemeSwitch />
          </NavbarItem>
        </NavbarContent>
      </HeroUINavbar>
    );
  }

  return (
    <>
      <HeroUINavbar
        className="border-b border-divider bg-background/80 backdrop-blur-md"
        height="64px"
        maxWidth="xl"
        shouldHideOnScroll
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
      >
        <NavbarBrand className="gap-2">
          <NavbarMenuToggle className="mr-1 h-6 sm:hidden" />
          <NextLink
            prefetch
            className="font-bold text-xl text-inherit hover:text-primary transition-colors"
            href="/"
          >
            MedTravel
          </NextLink>
        </NavbarBrand>

        <NavbarContent
          className="absolute left-1/2 transform -translate-x-1/2 hidden sm:flex gap-6"
          justify="center"
        >
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <NavItemLink
                key={item.key}
                active={active}
                item={item}
                t={t}
              />
            );
          })}
        </NavbarContent>

        <NavbarContent
          className="ml-auto flex h-12 max-w-fit items-center gap-1 rounded-full p-0"
          justify="end"
        >
          <NavbarItem>
            <LanguageSwitcher />
          </NavbarItem>
          <NavbarItem>
            <ThemeSwitch />
          </NavbarItem>

          {session && (
            <NavbarItem>
              <NotificationsBell />
            </NavbarItem>
          )}

          <NavbarItem className="px-2">
            {session ? (
              <ProfileDropdownAuth
                session={session}
                roles={roles}
                supabase={supabase}
                t={t} activeRole={"GUEST"} setActiveRole={function (r: UserRole): void {
                  throw new Error("Function not implemented.");
                } }              />
            ) : (
                <Button
                  variant="light"
                  color="default"
                  startContent={<Icon icon="solar:user-linear" width={18} />}
                  onPress={() => { setAuthRole(null); setAuthOpen(true); }}
                  className="hidden sm:flex"
                >
                  Sign up / Sign in
                </Button>
            )}

            {!session ? (
              <Button
                className="h-8 w-8 min-w-0 p-0 sm:hidden"
                size="sm"
                variant="ghost"
                onPress={() => {
                  setAuthRole(null);
                  setAuthOpen(true);
                }}
              >
                <Icon className="text-default-500" icon="solar:user-linear" width={24} />
              </Button>
            ) : null}
          </NavbarItem>
        </NavbarContent>

        <NavbarMenu className="flex justify-center pt-6">
          <div className="w-full max-w-screen-md mx-auto space-y-2">
            {navItems.map((item) => (
              <MobileNavItem
                key={item.key}
                active={
                  pathname === item.href ||
                  (item.href !== "/" &&
                    pathname.startsWith(item.href))
                }
                item={item}
                t={t}
                onClose={() => setIsMenuOpen(false)}
              />
            ))}
          </div>
        </NavbarMenu>
      </HeroUINavbar>

      <UnifiedAuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        initialRole={authRole}
        next={pathname || "/"}
      />
    </>
  );
});
Navbar.displayName = "Navbar";
"""
app\api\auth\email\signup\route.ts: """
import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function makeCode6() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function isValidEmail(email: unknown) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    const as = String(body?.as || "").trim().toUpperCase();
    const next = String(body?.next || "/");

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }
    if (!["PATIENT", "PARTNER", "CUSTOMER"].includes(as)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(url, serviceKey);

    // 1) create user (НЕ отправляет письма)
    const { data: created, error: createErr } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: { requested_role: as },
      });

    // если пользователь уже существует — это не критично для UX:
    // мы просто отправим OTP ещё раз (но при login он пойдёт в Sign in)
    if (createErr && !String(createErr.message).toLowerCase().includes("already")) {
      return NextResponse.json({ error: createErr.message }, { status: 400 });
    }

    // 2) гарантируем profiles.email_verified=false
    // (если у тебя есть триггер on auth.users -> profiles, он уже вставит строку; здесь просто upsert)
    await supabase
      .from("profiles")
      .upsert({ id: created?.user?.id, email_verified: false }, { onConflict: "id" });

    // 3) генерим OTP + сохраняем hash
    const code = makeCode6();
    const otpSecret = process.env.OTP_SECRET || "dev-secret";
    const purpose = "verify_email";
    const codeHash = sha256(`${email}:${purpose}:${code}:${otpSecret}`);

    // защита от спама: удаляем старые и создаём новый
    await supabase.from("email_otps").delete().eq("email", email).eq("purpose", purpose);

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const { error: insErr } = await supabase.from("email_otps").insert({
      email,
      purpose,
      code_hash: codeHash,
      expires_at: expiresAt.toISOString(),
    });

    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    // 4) отправляем письмо через Resend (без SDK, просто fetch)
    const from = process.env.RESEND_FROM!;
    const apiKey = process.env.RESEND_API_KEY!;

    const subject = "Your MedTravel verification code";
    const html = `
      <div style="font-family: Inter, Arial, sans-serif; line-height: 1.5">
        <h2 style="margin:0 0 12px">Confirm your email</h2>
        <p style="margin:0 0 16px">Use this code to finish signup:</p>
        <div style="font-size:28px; font-weight:700; letter-spacing:6px; padding:12px 16px; background:#f2f4f7; display:inline-block; border-radius:10px">
          ${code}
        </div>
        <p style="margin:16px 0 0; color:#667085">Code expires in 10 minutes.</p>
      </div>
    `;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject,
        html,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text().catch(() => "");
      return NextResponse.json(
        { error: `Resend error: ${errText || resendRes.statusText}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, email, as, next });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
"""
components\auth\AuthLoginClient.tsx: """
// components/auth/AuthLoginClient.tsx
"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button, Card, CardBody, Divider } from "@heroui/react";

import type { UserRole } from "@/lib/supabase/supabase-provider";
import { useSupabase } from "@/lib/supabase/supabase-provider";

import CredentialsForm from "@/components/auth/CredentialsForm";
import OtpForm from "@/components/auth/OtpForm";

type Step = "role" | "auth" | "otp";
type Mode = "signin" | "signup";

type Props = {
  as?: string;
  next?: string;
};

const ROLE_META: Record<
  Exclude<UserRole, "GUEST">,
  { title: string; subtitle: string; icon: string }
> = {
  PATIENT: {
    title: "Patient",
    subtitle: "Book appointments, manage visits",
    icon: "solar:heart-pulse-2-linear",
  },
  PARTNER: {
    title: "Partner",
    subtitle: "Referral links, programs, reports",
    icon: "solar:users-group-two-rounded-linear",
  },
  CUSTOMER: {
    title: "Clinic",
    subtitle: "Manage clinic profile and bookings",
    icon: "solar:hospital-linear",
  },
  ADMIN: {
    title: "Admin",
    subtitle: "Administration panel",
    icon: "solar:shield-user-bold",
  },
};

type LoginRole = Exclude<UserRole, "GUEST" | "ADMIN">;

function normalizeRole(v?: string): LoginRole | null {
  const r = String(v || "").trim().toUpperCase();
  if (r === "PATIENT" || r === "PARTNER" || r === "CUSTOMER") return r as LoginRole;
  return null;
}

export default function AuthLoginClient({ as, next }: Props) {
  const router = useRouter();
  const { supabase } = useSupabase();

  const safeNext = useMemo(() => {
    const n = String(next || "/");
    return n.startsWith("/") ? n : "/";
  }, [next]);

  const [step, setStep] = useState<Step>("role");
  const [mode, setMode] = useState<Mode>("signin");
  const [role, setRole] = useState<LoginRole | null>(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const r = normalizeRole(as);
    setRole(r);
    setEmail("");
    setMode("signin");
    setStep(r ? "auth" : "role");
  }, [as]);

  const roleLabel = role ? ROLE_META[role]?.title ?? role : "";

  const signInWithGoogle = useCallback(async () => {
    if (!role) return;

    const origin = window.location.origin;
    const redirectTo = `${origin}/auth/callback?as=${encodeURIComponent(
      role,
    )}&next=${encodeURIComponent(safeNext)}`;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  }, [supabase, role, safeNext]);

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[560px]">
        <div className="mb-6 flex items-center justify-between">
          <NextLink
            href="/"
            className="text-sm text-default-500 hover:text-primary transition-colors inline-flex items-center gap-2"
          >
            <Icon icon="solar:alt-arrow-left-linear" width={18} />
            Back to home
          </NextLink>

          <div className="text-sm text-default-500">
            {role ? (
              <span className="inline-flex items-center gap-2">
                <Icon icon={ROLE_META[role].icon} width={16} />
                {roleLabel}
              </span>
            ) : (
              "Choose role"
            )}
          </div>
        </div>

        <Card className="border border-divider">
          <CardBody className="p-6 flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <Icon icon="solar:login-3-linear" width={20} />
              <div className="font-semibold text-lg">
                {step === "role"
                  ? "Sign in / Sign up"
                  : role
                  ? `${mode === "signin" ? "Sign in" : "Create account"} — ${roleLabel}`
                  : "Sign in"}
              </div>
            </div>

            <Divider />

            {/* STEP: role */}
            {step === "role" ? (
              <div className="grid grid-cols-1 gap-3">
                {(["PATIENT", "PARTNER", "CUSTOMER"] as const).map((r) => (
                  <button
                    key={r}
                    className="w-full text-left rounded-xl border border-divider hover:border-primary transition-colors p-4 flex items-center gap-4"
                    onClick={() => {
                      setRole(r);
                      setStep("auth");
                      router.replace(
                        `/auth/login?as=${r}&next=${encodeURIComponent(safeNext)}`,
                      );
                    }}
                  >
                    <div className="h-10 w-10 rounded-full bg-default-100 flex items-center justify-center">
                      <Icon icon={ROLE_META[r].icon} width={22} />
                    </div>
                    <div className="flex flex-col">
                      <div className="font-semibold">{ROLE_META[r].title}</div>
                      <div className="text-tiny text-default-500">{ROLE_META[r].subtitle}</div>
                    </div>
                    <div className="ml-auto text-default-400">
                      <Icon icon="solar:alt-arrow-right-linear" width={18} />
                    </div>
                  </button>
                ))}
              </div>
            ) : null}

            {/* STEP: auth */}
            {step === "auth" && role ? (
              <div className="flex flex-col gap-4">
                <div className="w-full rounded-xl border border-divider bg-default-50 p-1 flex gap-1">
                  <Button
                    className="flex-1"
                    color={mode === "signin" ? "primary" : "default"}
                    variant={mode === "signin" ? "solid" : "light"}
                    onPress={() => setMode("signin")}
                  >
                    Sign in
                  </Button>
                  <Button
                    className="flex-1"
                    color={mode === "signup" ? "primary" : "default"}
                    variant={mode === "signup" ? "solid" : "light"}
                    onPress={() => setMode("signup")}
                  >
                    Sign up
                  </Button>
                </div>

                <CredentialsForm
                  mode={mode}
                  role={role}
                  next={safeNext}
                  onSignedIn={() => {
                    router.replace(safeNext);
                    router.refresh();
                  }}
                  onOtpRequired={(e) => {
                    setEmail(e);
                    setStep("otp");
                  }}
                />

                <Divider />

                <Button
                  variant="bordered"
                  startContent={<Icon icon="logos:google-icon" width={18} />}
                  onPress={signInWithGoogle}
                  className="justify-center"
                >
                  Continue with Google
                </Button>

                <div className="flex items-center justify-between">
                  <Button
                    variant="light"
                    onPress={() => {
                      setRole(null);
                      setStep("role");
                      router.replace(`/auth/login?next=${encodeURIComponent(safeNext)}`);
                    }}
                    startContent={<Icon icon="solar:refresh-linear" width={16} />}
                  >
                    Change role
                  </Button>

                  <span className="text-tiny text-default-500">
                    Next: <b>{safeNext}</b>
                  </span>
                </div>
              </div>
            ) : null}

            {/* STEP: otp */}
            {step === "otp" && role ? (
              <div className="flex flex-col gap-4">
                <OtpForm
                  email={email}
                  as={role}
                  next={safeNext}
                  onBack={() => setStep("auth")}
                />
              </div>
            ) : null}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
"""
app\api\auth\email\send-otp\route.ts: """
// app/api/auth/email/send-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

type AllowedRole = "PATIENT" | "PARTNER" | "CUSTOMER" | "ADMIN";

function isAllowedRole(v: any): v is AllowedRole {
  return v === "PATIENT" || v === "PARTNER" || v === "CUSTOMER" || v === "ADMIN";
}

function safeNext(v: any): string {
  const s = String(v || "/");
  return s.startsWith("/") ? s : "/";
}

function normalizeEmail(v: any): string {
  return String(v || "").trim().toLowerCase();
}

function generateOtp6(): string {
  const n = crypto.randomInt(0, 1_000_000);
  return String(n).padStart(6, "0");
}

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

async function sendViaResend(params: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey) throw new Error("Missing RESEND_API_KEY");
  if (!from) throw new Error("Missing EMAIL_FROM (e.g. no-reply@medtravel.me)");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
    }),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json?.message || "Resend: failed to send email");
  }

  return json;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const email = normalizeEmail(body.email);
    const roleRaw = String(body.as ?? body.role ?? "").trim().toUpperCase();
    const role = isAllowedRole(roleRaw) ? roleRaw : null;

    // В signup-флоу пароль обязателен (по твоим требованиям)
    const password = String(body.password ?? "").trim();

    const next = safeNext(body.next);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // В модалке ты используешь только PATIENT/PARTNER/CUSTOMER,
    // но на всякий случай разрешаем ADMIN если надо.
    if (!role || role === "ADMIN") {
      // если ADMIN не нужен для email signup — просто запрети:
      // return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      // пока оставлю мягко:
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      return NextResponse.json(
        { error: "Server auth is not configured (missing Supabase envs)" },
        { status: 500 },
      );
    }

    const supabaseAdmin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 1) Проверим существует ли уже пользователь
    const { data: existingList, error: listErr } =
      await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });

    if (listErr) {
      return NextResponse.json({ error: listErr.message }, { status: 500 });
    }

    const exists = (existingList?.users || []).some(
      (u) => (u.email || "").toLowerCase() === email,
    );

    if (exists) {
      return NextResponse.json(
        { error: "Account already exists. Please sign in." },
        { status: 409 },
      );
    }

    // 2) Создаём пользователя без подтверждения email (подтвердим после verify-otp)
    const { data: created, error: createErr } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: {
          requested_role: role ?? "CUSTOMER",
        },
      });

    if (createErr || !created?.user) {
      return NextResponse.json(
        { error: createErr?.message || "Failed to create user" },
        { status: 500 },
      );
    }

    const userId = created.user.id;

    // 3) Генерим OTP, сохраняем HASH в public.email_otps
    const otp = generateOtp6();
    const expiresInMinutes = 10;
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();

    const otpSecret = process.env.OTP_SECRET || "dev-secret-change-me";
    const tokenHash = sha256(`${email}:${otp}:${otpSecret}`);

    // удаляем предыдущие незавершённые для email (на всякий)
    await supabaseAdmin.from("email_otps").delete().eq("email", email);

    const { error: insErr } = await supabaseAdmin.from("email_otps").insert({
      email,
      user_id: userId,
      role: role ?? "CUSTOMER",
      next,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });

    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    // 4) Отправка письма через Resend API
    const subject = "Your MedTravel verification code";
    const html = `
      <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; line-height:1.5">
        <h2 style="margin:0 0 12px">Your verification code</h2>
        <p style="margin:0 0 16px">Enter this 6-digit code to confirm your email:</p>
        <div style="font-size:28px; font-weight:700; letter-spacing:6px; padding:14px 16px; background:#f4f4f5; border-radius:12px; display:inline-block">
          ${otp}
        </div>
        <p style="margin:16px 0 0; color:#71717a">This code expires in ${expiresInMinutes} minutes.</p>
        <p style="margin:8px 0 0; color:#71717a">If you didn’t request this, you can ignore this email.</p>
      </div>
    `;

    await sendViaResend({ to: email, subject, html });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
"""
app\api\auth\email\verify-otp\route.ts: """
import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();
    const token = String(body?.token || "").trim();
    const purpose = String(body?.purpose || "verify_email");

    if (!email || !/^[0-9]{6}$/.test(token)) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(url, serviceKey);

    const { data: rows, error: selErr } = await supabase
      .from("email_otps")
      .select("*")
      .eq("email", email)
      .eq("purpose", purpose)
      .order("created_at", { ascending: false })
      .limit(1);

    if (selErr) return NextResponse.json({ error: selErr.message }, { status: 500 });

    const row = rows?.[0];
    if (!row) return NextResponse.json({ error: "Code not found" }, { status: 400 });

    const expired = new Date(row.expires_at).getTime() < Date.now();
    if (expired) {
      await supabase.from("email_otps").delete().eq("id", row.id);
      return NextResponse.json({ error: "Code expired" }, { status: 400 });
    }

    const otpSecret = process.env.OTP_SECRET || "dev-secret";
    const expected = sha256(`${email}:${purpose}:${token}:${otpSecret}`);

    if (expected !== row.code_hash) {
      // увеличим attempts
      const attempts = Number(row.attempts || 0) + 1;
      await supabase.from("email_otps").update({ attempts }).eq("id", row.id);

      if (attempts >= 5) {
        await supabase.from("email_otps").delete().eq("id", row.id);
        return NextResponse.json({ error: "Too many attempts. Request new code." }, { status: 400 });
      }

      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    // валидно → удаляем OTP
    await supabase.from("email_otps").delete().eq("id", row.id);

    // находим user id по email в auth.users
    const { data: au, error: auErr } = await supabase
      .schema("auth")
      .from("users")
      .select("id")
      .eq("email", email)
      .limit(1);

    if (auErr) return NextResponse.json({ error: auErr.message }, { status: 500 });

    const userId = au?.[0]?.id;
    if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // подтверждаем email в Supabase Auth
    const { error: updErr } = await supabase.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

    // ставим флаг в profiles
    await supabase.from("profiles").update({ email_verified: true }).eq("id", userId);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
"""
components\auth\CredentialsForm.tsx: """
// components/auth/CredentialsForm.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useSupabase } from "@/lib/supabase/supabase-provider";

type Mode = "signin" | "signup";

type Props = {
  mode: Mode;
  role: string; // PATIENT | PARTNER | CUSTOMER
  next: string;

  onOtpRequired: (email: string) => void;
  onSignedIn?: () => void; // для модалки: закрыть
};

export default function CredentialsForm({
  mode,
  role,
  next,
  onOtpRequired,
  onSignedIn,
}: Props) {
  const { supabase } = useSupabase();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  const schema = useMemo(() => {
    const base = {
      email: z.string().email("Enter a valid email"),
      password: z.string().min(8, "Password must be at least 8 characters"),
    };

    if (mode === "signin") {
      return z.object(base);
    }

    return z
      .object({
        ...base,
        password2: z.string().min(8, "Password must be at least 8 characters"),
      })
      .refine((v) => v.password === v.password2, {
        message: "Passwords do not match",
        path: ["password2"],
      });
  }, [mode]);

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setErrorMsg(null);

    const email = String(data.email).trim().toLowerCase();
    const password = String(data.password);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
          return;
        }

        // (необязательно, но полезно для контекста)
        await supabase.auth.updateUser({
          data: { requested_role: role },
        });

        onSignedIn?.();
        return;
      }

      // signup
      const res = await fetch("/api/auth/email/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password, as: role, next }),
        cache: "no-store",
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(json?.error || "Failed to sign up");
        return;
      }

      // отправляем OTP (теперь user уже существует, send-otp пропустит)
      const res2 = await fetch("/api/auth/email/send-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, as: role, next, purpose: "verify_email" }),
        cache: "no-store",
      });

      const json2 = await res2.json().catch(() => ({}));
      if (!res2.ok) {
        setErrorMsg(json2?.error || "Failed to send code");
        return;
      }

      onOtpRequired(email);
    } catch (e: any) {
      setErrorMsg(e?.message || "Network error");
    }
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
      <Input
        isRequired
        type="email"
        variant="bordered"
        placeholder="you@email.com"
        errorMessage={errors.email?.message as any}
        {...register("email")}
      />

      <Input
        isRequired
        type={showPass ? "text" : "password"}
        variant="bordered"
        placeholder="Password"
        errorMessage={errors.password?.message as any}
        endContent={
          <button
            type="button"
            className="text-default-500"
            onClick={() => setShowPass((s) => !s)}
            aria-label="toggle password"
          >
            <Icon icon={showPass ? "solar:eye-closed-linear" : "solar:eye-linear"} width={18} />
          </button>
        }
        {...register("password")}
      />

      {mode === "signup" ? (
        <Input
          isRequired
          type={showPass ? "text" : "password"}
          variant="bordered"
          placeholder="Confirm password"
          errorMessage={(errors as any).password2?.message}
          {...register("password2" as any)}
        />
      ) : null}

      {errorMsg && <p className="text-danger text-small">{errorMsg}</p>}

      <Button
        color="primary"
        isLoading={isSubmitting}
        type="submit"
        className="justify-center"
        startContent={<Icon icon={mode === "signin" ? "solar:login-3-linear" : "solar:user-plus-linear"} width={18} />}
      >
        {mode === "signin" ? "Sign in" : "Create account"}
      </Button>
    </form>
  );
}
"""
components\auth\UnifiedAuthModal.tsx: """
// components/auth/UnifiedAuthModal.tsx
"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Icon } from "@iconify/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Divider,
  Card,
  CardBody,
} from "@heroui/react";
import { useRouter } from "next/navigation";

import type { UserRole } from "@/lib/supabase/supabase-provider";
import { useSupabase } from "@/lib/supabase/supabase-provider";

import CredentialsForm from "@/components/auth/CredentialsForm";
import OtpForm from "@/components/auth/OtpForm";

type Step = "role" | "auth" | "otp";
type Mode = "signin" | "signup";

type Props = {
  open: boolean;
  onClose: () => void;
  initialRole?: Exclude<UserRole, "ADMIN" | "GUEST"> | null;
  next?: string;
};

const ROLE_META: Record<
  Exclude<UserRole, "GUEST">,
  { title: string; subtitle: string; icon: string }
> = {
  PATIENT: {
    title: "Patient",
    subtitle: "Book appointments, manage visits, chat with clinics",
    icon: "solar:heart-pulse-2-linear",
  },
  PARTNER: {
    title: "Partner",
    subtitle: "Referral links, programs, reports, payouts",
    icon: "solar:users-group-two-rounded-linear",
  },
  CUSTOMER: {
    title: "Clinic",
    subtitle: "Manage clinic profile, services, doctors and bookings",
    icon: "solar:hospital-linear",
  },
  ADMIN: {
    title: "Admin",
    subtitle: "Administration panel",
    icon: "solar:shield-user-bold",
  },
};

function isAllowedRole(r: any): r is Exclude<UserRole, "ADMIN" | "GUEST"> {
  return r === "PATIENT" || r === "PARTNER" || r === "CUSTOMER";
}

export default function UnifiedAuthModal({
  open,
  onClose,
  initialRole = null,
  next = "/",
}: Props) {
  const router = useRouter();
  const { supabase } = useSupabase();

  const safeNext = useMemo(() => {
    const n = String(next || "/");
    return n.startsWith("/") ? n : "/";
  }, [next]);

  const [step, setStep] = useState<Step>("role");
  const [mode, setMode] = useState<Mode>("signin");
  const [role, setRole] = useState<Exclude<UserRole, "ADMIN" | "GUEST"> | null>(
    null,
  );
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    if (!open) return;

    const r = isAllowedRole(initialRole) ? initialRole : null;
    setRole(r);
    setEmail("");
    setMode("signin");
    setStep(r ? "auth" : "role");
  }, [open, initialRole]);

  const roleLabel = useMemo(() => (role ? ROLE_META[role]?.title ?? role : ""), [role]);

  const title = useMemo(() => {
    if (step === "role") return "Sign in / Sign up";
    if (step === "auth") return role ? `${mode === "signin" ? "Sign in" : "Create account"} — ${roleLabel}` : "Sign in";
    return `Enter code (${roleLabel})`;
  }, [step, role, roleLabel, mode]);

  const signInWithGoogle = useCallback(async () => {
    if (!role) return;

    const origin = window.location.origin;
    const redirectTo = `${origin}/auth/callback?as=${encodeURIComponent(
      role,
    )}&next=${encodeURIComponent(safeNext)}`;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  }, [supabase, role, safeNext]);

  const goBack = useCallback(() => {
    if (step === "otp") return setStep("auth");
    if (step === "auth") return setStep(initialRole ? "auth" : "role");
    onClose();
  }, [step, onClose, initialRole]);

  const pickRole = (r: Exclude<UserRole, "ADMIN" | "GUEST">) => {
    setRole(r);
    setStep("auth");
  };

  return (
    <Modal
      isOpen={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
      placement="center"
      backdrop="blur"
      size="md"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(close) => (
          <>
            <ModalHeader className="flex items-center gap-2">
              <Icon icon="solar:login-3-linear" width={20} />
              <span>{title}</span>
            </ModalHeader>

            <Divider />

            <ModalBody className="py-5">
              {/* STEP: ROLE */}
              {step === "role" ? (
                <div className="grid grid-cols-1 gap-3">
                  {(["PATIENT", "PARTNER", "CUSTOMER"] as const).map((r) => (
                    <Card
                      key={r}
                      isPressable
                      onPress={() => pickRole(r)}
                      className="border border-divider hover:border-primary transition-colors"
                    >
                      <CardBody className="flex flex-row items-center gap-4 py-4">
                        <div className="h-10 w-10 rounded-full bg-default-100 flex items-center justify-center">
                          <Icon icon={ROLE_META[r].icon} width={22} />
                        </div>
                        <div className="flex flex-col">
                          <div className="font-semibold">{ROLE_META[r].title}</div>
                          <div className="text-tiny text-default-500">
                            {ROLE_META[r].subtitle}
                          </div>
                        </div>
                        <div className="ml-auto text-default-400">
                          <Icon icon="solar:alt-arrow-right-linear" width={18} />
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              ) : null}

              {/* STEP: AUTH */}
              {step === "auth" && role ? (
                <div className="flex flex-col gap-4">
                  {/* segmented sign in / sign up */}
                  <div className="w-full rounded-xl border border-divider bg-default-50 p-1 flex gap-1">
                    <Button
                      className="flex-1"
                      color={mode === "signin" ? "primary" : "default"}
                      variant={mode === "signin" ? "solid" : "light"}
                      onPress={() => setMode("signin")}
                    >
                      Sign in
                    </Button>
                    <Button
                      className="flex-1"
                      color={mode === "signup" ? "primary" : "default"}
                      variant={mode === "signup" ? "solid" : "light"}
                      onPress={() => setMode("signup")}
                    >
                      Sign up
                    </Button>
                  </div>

                  <CredentialsForm
                    mode={mode}
                    role={role}
                    next={safeNext}
                    onSignedIn={() => {
                      close();
                      onClose();
                      router.replace(safeNext);
                      router.refresh();
                    }}
                    onOtpRequired={(e) => {
                      setEmail(e);
                      setStep("otp");
                    }}
                  />

                  <Divider />

                  <Button
                    variant="bordered"
                    startContent={<Icon icon="logos:google-icon" width={18} />}
                    onPress={signInWithGoogle}
                    className="justify-center"
                  >
                    Continue with Google
                  </Button>

                  {mode === "signup" ? (
                    <p className="text-tiny text-default-500 text-center">
                      We’ll send a 6-digit code to confirm your email.
                    </p>
                  ) : (
                    <p className="text-tiny text-default-500 text-center">
                      Use your email and password to sign in.
                    </p>
                  )}
                </div>
              ) : null}

              {/* STEP: OTP */}
              {step === "otp" && role ? (
                <div className="flex flex-col gap-4">
                  <OtpForm
                    email={email}
                    as={role}
                    next={safeNext}
                    onBack={() => setStep("auth")}
                    onSuccess={() => {
                      // закроем модалку сразу, UX чище
                      onClose();
                    }}
                  />
                </div>
              ) : null}
            </ModalBody>

            <Divider />

            <ModalFooter className="flex items-center justify-between">
              <Button
                variant="light"
                onPress={() => {
                  if (step === "role") {
                    close();
                    onClose();
                    return;
                  }
                  goBack();
                }}
              >
                Back
              </Button>

              {step !== "role" && !initialRole ? (
                <Button
                  variant="light"
                  onPress={() => {
                    setRole(null);
                    setEmail("");
                    setMode("signin");
                    setStep("role");
                  }}
                  startContent={<Icon icon="solar:refresh-linear" width={16} />}
                >
                  Change role
                </Button>
              ) : (
                <span />
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
"""

--------------------------------------------------

это уже пиздец, мы не можем реализовать supabase auth/register по email + password + otp.
не работает, я захожу регистрироваться и выдает "The schema must be one of the following: public, graphql_public",
и ошибку в консоли: """
layout-379791e5db57da5c.js:1 
 POST https://medtravel.me/api/auth/email/send-otp 500 (Internal Server Error)
"""
хотя в базе в users уже создается пользователь. как так???
письма на почту не приходят, а я тут еще заметил что оно приходило, после какого-то деплоя, а я просто не заметил, это было 2 с половиной часа назад. оно приходило, но видимо тогда в модалке ничего для ввода otp не следовало. в таблице email_otps никаких теперь записей не появляется. после повторного нажатия create account следует "Account already exists. Please sign in." и ошибка: """
POST https://medtravel.me/api/auth/email/signup 409 (Conflict)
"""

проанализируй в чем проблема, где она находится и как ее решать.

----------------------------------------------------------

ты мне сейчас продублировал все что было в прошлом запросе. я если ты вдруг еще не понял, то выполняю правки по твоим инструкциям, если не выполняю то пишу об этом, даже если выполняю то не редко пишу что все выполнил. в прошлом запросе я дал тебе результат, который не изменился. вот ниже актуальные файлы. уже пора довести все до рабочего состояния, чтобы я мог зарегистрироваться как новый пользователь, чтобы мне пришло письмо с otp на почту и подтвердилось. просто нужна рабочая регистрация и авторизация по email и password.

app\api\auth\email\send-otp\route.ts: """
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const runtime = "nodejs";

function normalizeEmail(v: any): string {
  return String(v || "").trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function safePurpose(v: any): string {
  const p = String(v || "verify_email").trim();
  return p.replace(/[^a-zA-Z0-9_\-]/g, "").slice(0, 64) || "verify_email";
}

function generateOtp6(): string {
  const n = crypto.randomInt(0, 1_000_000);
  return String(n).padStart(6, "0");
}

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

async function sendViaResend(params: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? process.env.EMAIL_FROM;

  if (!apiKey) throw new Error("Missing RESEND_API_KEY");
  if (!from) throw new Error("Missing RESEND_FROM (or EMAIL_FROM)");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Resend: failed to send email");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const email = normalizeEmail(body.email);
    const purpose = safePurpose(body.purpose);

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      return NextResponse.json(
        { error: "Server auth is not configured (missing Supabase envs)" },
        { status: 500 },
      );
    }

    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Важно: код шлём только существующему пользователю
    // (иначе можно спамить на любые email)
    let userId: string | null = null;

    // 1) ищем user в auth.users по email (как у тебя в verify-otp)
    const { data: au, error: auErr } = await supabase
      .schema("auth")
      .from("users")
      .select("id")
      .eq("email", email)
      .limit(1);

    if (auErr) return NextResponse.json({ error: auErr.message }, { status: 500 });

    userId = au?.[0]?.id ?? null;
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2) генерим OTP + hash
    const code = generateOtp6();
    const otpSecret = process.env.OTP_SECRET || "dev-secret-change-me";
    const codeHash = sha256(`${email}:${purpose}:${code}:${otpSecret}`);

    const expiresInMinutes = 10;
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();

    // 3) удаляем старые для email+purpose, вставляем новый
    await supabase.from("email_otps").delete().eq("email", email).eq("purpose", purpose);

    const { error: insErr } = await supabase.from("email_otps").insert({
      email,
      purpose,
      code_hash: codeHash,
      expires_at: expiresAt,
      attempts: 0,
    });

    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    // 4) шлём письмо
    const subject = "Your MedTravel verification code";
    const html = `
      <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; line-height:1.5">
        <h2 style="margin:0 0 12px">Your verification code</h2>
        <p style="margin:0 0 16px">Enter this 6-digit code to confirm your email:</p>
        <div style="font-size:28px; font-weight:700; letter-spacing:6px; padding:14px 16px; background:#f4f4f5; border-radius:12px; display:inline-block">
          ${code}
        </div>
        <p style="margin:16px 0 0; color:#71717a">This code expires in ${expiresInMinutes} minutes.</p>
      </div>
    `;

    await sendViaResend({ to: email, subject, html });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
"""
app\api\auth\email\verify-otp\route.ts: """
import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();
    const token = String(body?.token || "").trim();
    const purpose = String(body?.purpose || "verify_email");

    if (!email || !/^[0-9]{6}$/.test(token)) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(url, serviceKey);

    const { data: rows, error: selErr } = await supabase
      .from("email_otps")
      .select("*")
      .eq("email", email)
      .eq("purpose", purpose)
      .order("created_at", { ascending: false })
      .limit(1);

    if (selErr) return NextResponse.json({ error: selErr.message }, { status: 500 });

    const row = rows?.[0];
    if (!row) return NextResponse.json({ error: "Code not found" }, { status: 400 });

    const expired = new Date(row.expires_at).getTime() < Date.now();
    if (expired) {
      await supabase.from("email_otps").delete().eq("id", row.id);
      return NextResponse.json({ error: "Code expired" }, { status: 400 });
    }

    const otpSecret = process.env.OTP_SECRET || "dev-secret";
    const expected = sha256(`${email}:${purpose}:${token}:${otpSecret}`);

    if (expected !== row.code_hash) {
      // увеличим attempts
      const attempts = Number(row.attempts || 0) + 1;
      await supabase.from("email_otps").update({ attempts }).eq("id", row.id);

      if (attempts >= 5) {
        await supabase.from("email_otps").delete().eq("id", row.id);
        return NextResponse.json({ error: "Too many attempts. Request new code." }, { status: 400 });
      }

      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    // валидно → удаляем OTP
    await supabase.from("email_otps").delete().eq("id", row.id);

    // находим user id по email в auth.users
    const { data: au, error: auErr } = await supabase
      .schema("auth")
      .from("users")
      .select("id")
      .eq("email", email)
      .limit(1);

    if (auErr) return NextResponse.json({ error: auErr.message }, { status: 500 });

    const userId = au?.[0]?.id;
    if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // подтверждаем email в Supabase Auth
    const { error: updErr } = await supabase.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

    // ставим флаг в profiles
    await supabase.from("profiles").update({ email_verified: true }).eq("id", userId);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
"""
components\auth\CredentialsForm.tsx: """
// components/auth/CredentialsForm.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useSupabase } from "@/lib/supabase/supabase-provider";

type Mode = "signin" | "signup";

type Props = {
  mode: Mode;
  role: string; // PATIENT | PARTNER | CUSTOMER
  next: string;

  onOtpRequired: (email: string) => void;
  onSignedIn?: () => void; // для модалки: закрыть
};

export default function CredentialsForm({
  mode,
  role,
  next,
  onOtpRequired,
  onSignedIn,
}: Props) {
  const { supabase } = useSupabase();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  const schema = useMemo(() => {
    const base = {
      email: z.string().email("Enter a valid email"),
      password: z.string().min(8, "Password must be at least 8 characters"),
    };

    if (mode === "signin") {
      return z.object(base);
    }

    return z
      .object({
        ...base,
        password2: z.string().min(8, "Password must be at least 8 characters"),
      })
      .refine((v) => v.password === v.password2, {
        message: "Passwords do not match",
        path: ["password2"],
      });
  }, [mode]);

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setErrorMsg(null);

    const email = String(data.email).trim().toLowerCase();
    const password = String(data.password);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
          return;
        }

        // (необязательно, но полезно для контекста)
        await supabase.auth.updateUser({
          data: { requested_role: role },
        });

        onSignedIn?.();
        return;
      }

      // signup
      const res = await fetch("/api/auth/email/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password, as: role, next }),
        cache: "no-store",
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(json?.error || "Failed to sign up");
        return;
      }

      // отправляем OTP (теперь user уже существует, send-otp пропустит)
      const res2 = await fetch("/api/auth/email/send-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, as: role, next, purpose: "verify_email" }),
        cache: "no-store",
      });

      const json2 = await res2.json().catch(() => ({}));
      if (!res2.ok) {
        setErrorMsg(json2?.error || "Failed to send code");
        return;
      }

      onOtpRequired(email);
    } catch (e: any) {
      setErrorMsg(e?.message || "Network error");
    }
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
      <Input
        isRequired
        type="email"
        variant="bordered"
        placeholder="you@email.com"
        errorMessage={errors.email?.message as any}
        {...register("email")}
      />

      <Input
        isRequired
        type={showPass ? "text" : "password"}
        variant="bordered"
        placeholder="Password"
        errorMessage={errors.password?.message as any}
        endContent={
          <button
            type="button"
            className="text-default-500"
            onClick={() => setShowPass((s) => !s)}
            aria-label="toggle password"
          >
            <Icon icon={showPass ? "solar:eye-closed-linear" : "solar:eye-linear"} width={18} />
          </button>
        }
        {...register("password")}
      />

      {mode === "signup" ? (
        <Input
          isRequired
          type={showPass ? "text" : "password"}
          variant="bordered"
          placeholder="Confirm password"
          errorMessage={(errors as any).password2?.message}
          {...register("password2" as any)}
        />
      ) : null}

      {errorMsg && <p className="text-danger text-small">{errorMsg}</p>}

      <Button
        color="primary"
        isLoading={isSubmitting}
        type="submit"
        className="justify-center"
        startContent={<Icon icon={mode === "signin" ? "solar:login-3-linear" : "solar:user-plus-linear"} width={18} />}
      >
        {mode === "signin" ? "Sign in" : "Create account"}
      </Button>
    </form>
  );
}
"""

---------------------------------------------------------------
конец

выполнил изменения и задеплоил, при заходе в Clinic Profile статус выставляется Not Published вроде по умолчанию, но оно почему-то автоматически отправляет запрос на модерацию(хотя ни одно поле, вообще ничего не заполнено в клинике) и почему-то подтверждается со статусом Published. смотри скриншоты.

я объясню как это должно работать и как работало ранее:
новый зарегистрированный пользователь с ролью customer в разделе Clinic Profile кастомер панели должен заполнить как минимум все обязательные поля и разделы для своей клиники, по кнопке Save as Draft все что пользователь заполнил должно сохранится в таблицу public.clinic_profile_drafts и получается что в базе сохраняется его клиника и у пользователя данные клиники не сбрасываются, по кнопке Publish в админ панель в раздел Moderation попадает заявка на публикацию этой клиники в публичный каталог и в таблицу public.clinics и остальные распределяется все данные клиники пользователя, но пока что со статусом pending, модератор может отклонить или подтвердить модерацию, если он подтверждает, то в базе меняется статус у клиники и она попадает в публичный каталог и далее пользователь может сколько угодно обновлять свою клинику без повторной модерации.

вот и в целом весь путь, который должен происходить. я не понимаю почему сейчас это все происходит. клиника публикуется сама по себе, пустая и с таким url - /clinic/draft-clinic-tv7shb.

давай разберемся и приведем все в порядок, я вообще давно не трогал функционал добавления новой клиники в кастомер панели, мы в прошлых чатах это реализовали и все работало, больше я ничего там не делал. только ничего не ломай, нам нужно все исправить.

app\(customer)\customer\clinic-profile\page.tsx: """
"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import clsx from "clsx";
import { Icon } from "@iconify/react";
import {
  getDraft,
  saveDraftSection,
  saveDraftWhole,
  submitForReview,
  getCategories,
  uploadGallery,
  uploadDoctorImage,
  uploadAccreditationLogo,
} from "./actions";
import { clinicHref } from "@/lib/clinic-url";

type SectionKey =
  | "basic"
  | "services"
  | "doctors"
  | "accreditations"
  | "additional"
  | "hours"
  | "gallery"
  | "location"
  | "payments";

  type SectionStatus = "Required" | "Optional" | "Complete";

  const REQUIRED: SectionKey[] = [
    "basic",
    "services",
    "doctors",
    "accreditations",
    "hours",
    "location",
  ];

type HourRow = {
  day: string;
  status: "Open" | "Closed";
  start?: string;
  end?: string;
};

const DEFAULT_HOURS: HourRow[] = [
  { day: "Monday", status: "Open" },
  { day: "Tuesday", status: "Open" },
  { day: "Wednesday", status: "Open" },
  { day: "Thursday", status: "Open" },
  { day: "Friday", status: "Open" },
  { day: "Saturday", status: "Closed" },
  { day: "Sunday", status: "Closed" },
];

type ServiceRow = {
  name: string;
  price?: string;
  currency: string;
  description?: string;
};

// диапазон и шаг для слайдера цены
const PRICE_MIN = 0;
const PRICE_MAX = 20000;
const PRICE_STEP = 10;

type DoctorRow = {
  fullName: string;
  title?: string;
  specialty?: string;
  description?: string;
  photo?: string;
};

type AmenityItem = { label: string; icon?: string | null };

type Accreditation = { name: string; logo_url?: string; description?: string };

type FacilitiesState = {
  premises: AmenityItem[];
  clinic_services: AmenityItem[];
  travel_services: AmenityItem[];
  languages_spoken: AmenityItem[];
  accreditations: Accreditation[];
};

type GalleryItem = { url: string; title?: string };

// ==== COMMON CONSTANTS / HELPERS ====

const COMMON_CURRENCIES = ["USD", "EUR", "GBP", "TRY", "AED", "SAR"];

const PRESET_PAYMENT_METHODS = [
  "Visa",
  "Mastercard",
  "American Express",
  "Payoneer",
  "Cash",
  "BTC",
  "ETH",
  "USDT",
];

const PAYMENT_ICON_MAP: Record<string, { icon: string }> = {
  default: { icon: "mdi:credit-card-outline" },
  visa: { icon: "mdi:credit-card-outline" },
  mastercard: { icon: "mdi:credit-card-outline" },
  americanexpress: { icon: "mdi:credit-card-outline" },
  amex: { icon: "mdi:credit-card-outline" },
  payoneer: { icon: "mdi:credit-card-outline" },
  cash: { icon: "mdi:cash-multiple" },
  btc: { icon: "mdi:bitcoin" },
  bitcoin: { icon: "mdi:bitcoin" },
  eth: { icon: "mdi:ethereum" },
  ethereum: { icon: "mdi:ethereum" },
  usdt: { icon: "mdi:currency-usd-circle" },
};

function normalizePaymentKey(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "").trim();
}

function normalizeAmenityLabel(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/* -------------------------------- Page -------------------------------- */

export default function ClinicProfilePage() {
  const [active, setActive] = useState<SectionKey>("basic");
  const [isPending, startTransition] = useTransition();

  const [basic, setBasic] = useState({
    name: "",
    slug: "",
    specialty: "",
    country: "",
    city: "",
    province: "",
    district: "",
    address: "",
    description: "",
  });

  const [services, setServices] = useState<ServiceRow[]>([]);
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [additional, setAdditional] = useState<FacilitiesState>({
    premises: [],
    clinic_services: [],
    travel_services: [],
    languages_spoken: [],
    accreditations: [],
  });
  const [hours, setHours] = useState<HourRow[]>(DEFAULT_HOURS);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [location, setLocation] = useState({ mapUrl: "", directions: "" });
  const [payments, setPayments] = useState<string[]>([]);

  const [cats, setCats] = useState<Array<{ id: number; name: string; slug: string }>>([]);

  const [clinicMeta, setClinicMeta] = useState<{
    is_published: boolean;
    moderation_status: string | null;
    status: string | null;
    slug: string | null;
    country: string | null;
    province: string | null;
    city: string | null;
    district: string | null;
  } | null>(null);

  // загрузка драфта
  useEffect(() => {
    startTransition(async () => {
      try {
        const [draftRes, catsRes] = await Promise.allSettled([
          getDraft(),
          getCategories(),
        ]);

        if (draftRes.status === "fulfilled") {
          const res = draftRes.value;
          const draft = res?.draft;
          const clinic = res?.clinic;
        
          if (clinic) {
            setClinicMeta({
              is_published: !!clinic.is_published,
              moderation_status: clinic.moderation_status ?? null,
              status: clinic.status ?? null,
              slug: clinic.slug ?? null,
              country: clinic.country ?? null,
              province: clinic.province ?? null,
              city: clinic.city ?? null,
              district: clinic.district ?? null,
            });
          }
        
          if (draft) {
            setBasic((p) =>
              draft.basic_info ? { ...p, ...draft.basic_info } : p
            );

            const srv: ServiceRow[] = Array.isArray(draft.services)
              ? draft.services.map((s: any) => ({
                  name: s?.name ?? "",
                  price: s?.price ?? "",
                  currency: s?.currency ?? "USD",
                  description: s?.description ?? s?.desc ?? "",
                }))
              : [];
            setServices(srv);

            const docs: DoctorRow[] = Array.isArray(draft.doctors)
              ? draft.doctors.map((d: any) => ({
                  fullName: d?.fullName ?? d?.name ?? "",
                  title: d?.title ?? "",
                  specialty: d?.specialty ?? d?.spec ?? "",
                  description: d?.description ?? d?.bio ?? d?.qual ?? "",
                  photo: d?.photo ?? "",
                }))
              : [];
            setDoctors(docs);

            const fac = draft.facilities ?? {};
            setAdditional({
              premises: normalizeAmenityList(fac.premises),
              clinic_services: normalizeAmenityList(fac.clinic_services),
              travel_services: normalizeAmenityList(fac.travel_services),
              languages_spoken: normalizeAmenityList(fac.languages_spoken),
              accreditations: Array.isArray(fac.accreditations)
                ? fac.accreditations
                    .map((a: any): Accreditation | null => {
                      const name = (a?.name ?? "").trim();
                      if (!name) return null;
                      return {
                        name,
                        logo_url: a?.logo_url ?? a?.logo ?? undefined,
                        description: a?.description ?? "",
                      };
                    })
                    .filter(Boolean) as Accreditation[]
                : [],
            });

            setHours(
              draft.hours && Array.isArray(draft.hours) && draft.hours.length
                ? draft.hours
                : DEFAULT_HOURS
            );
            setGallery(draft.gallery ?? []);
            setLocation(draft.location ?? { mapUrl: "", directions: "" });

            const paymentsFromDraft = Array.isArray(draft.pricing)
              ? draft.pricing
                  .map((x: any) =>
                    typeof x === "string" ? x : x?.method
                  )
                  .filter(
                    (v: any): v is string =>
                      typeof v === "string" && v.trim().length > 0
                  )
              : [];
            setPayments(paymentsFromDraft);
          }
        }

        if (catsRes.status === "fulfilled") {
          setCats(catsRes.value);
        }
      } catch {
        // no-op
      }
    });
  }, []);

  // section statuses
  const sectionStatuses: Record<SectionKey, SectionStatus> = useMemo(() => {
    const basicOk =
      basic.name.trim() &&
      basic.specialty.trim() &&
      basic.country.trim() &&
      basic.city.trim() &&
      basic.address.trim();
  
    const servicesOk =
      services.length > 0 && services.every((s) => s.name.trim());
  
    const doctorsOk =
      doctors.length > 0 && doctors.every((d) => d.fullName.trim());
  
    // Location: оба поля обязательны
    const locationOk =
      location.mapUrl.trim().length > 0 &&
      location.directions.trim().length > 0;
  
    const accreditationsOk =
      (additional.accreditations?.length ?? 0) > 0;
  
    const additionalFilled =
      (additional.premises?.length ?? 0) ||
      (additional.clinic_services?.length ?? 0) ||
      (additional.travel_services?.length ?? 0) ||
      (additional.languages_spoken?.length ?? 0);
  
    // Hours: для всех дней, где статус Open, должны быть start и end
    const hoursOk = hours.every((h) =>
      h.status === "Closed" ? true : Boolean(h.start && h.end)
    );
  
    const galleryOk = gallery.length > 0;
    const paymentsOk = payments.length > 0;
  
    return {
      basic: basicOk ? "Complete" : "Required",
      services: servicesOk ? "Complete" : "Required",
      doctors: doctorsOk ? "Complete" : "Required",
      accreditations: accreditationsOk ? "Complete" : "Required",
      location: locationOk ? "Complete" : "Required",
      hours: hoursOk ? "Complete" : "Required",
      additional: additionalFilled ? "Complete" : "Optional",
      gallery: galleryOk ? "Complete" : "Optional",
      payments: paymentsOk ? "Complete" : "Optional",
    };
  }, [basic, services, doctors, location, additional, hours, gallery, payments]);

  const completion = useMemo(() => {
    const done = REQUIRED.filter((k) => sectionStatuses[k] === "Complete")
      .length;
    return Math.round((done / REQUIRED.length) * 100);
  }, [sectionStatuses]);
  
  const publishDisabled = REQUIRED.some(
    (key) => sectionStatuses[key] !== "Complete"
  );

  const statusLabel = useMemo(() => {
    if (!clinicMeta) return "Not published";

    const moderation = (clinicMeta.moderation_status ?? "").toLowerCase();
    const status = (clinicMeta.status ?? "").toLowerCase();

    if (clinicMeta.is_published) return "Published";
    if (clinicMeta.moderation_status === "pending") return "Pending review";
    if ((clinicMeta.status ?? "").toLowerCase() === "draft") return "Draft";

    return "Not published";
  }, [clinicMeta]);

  const statusClass = useMemo(() => {
    switch (statusLabel) {
      case "Published":
        return "bg-emerald-50 text-emerald-700 border border-emerald-100";
      case "Pending review":
        return "bg-amber-50 text-amber-800 border border-amber-100";
      case "Draft":
        return "bg-gray-100 text-gray-700 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  }, [statusLabel]);
      
  const isPublished = !!clinicMeta?.is_published;

  const clinicPublicHref = useMemo(() => {
    if (!clinicMeta?.is_published || !clinicMeta.slug) return null;
    try {
      return clinicHref({
        slug: clinicMeta.slug,
        country: clinicMeta.country ?? undefined,
        province: clinicMeta.province ?? undefined,
        city: clinicMeta.city ?? undefined,
        district: clinicMeta.district ?? undefined,
      });
    } catch {
      return null;
    }
  }, [clinicMeta]);
  
  const sidebarPrimaryLabel = isPublished ? "Update Clinic" : "Publish Clinic";
  const submitButtonLabel = isPublished ? "Update Clinic" : "Submit for Review";

  const sections: { key: SectionKey; label: string }[] = [
    { key: "basic", label: "Basic Information" },
    { key: "services", label: "Services" },
    { key: "doctors", label: "Doctors" },
    { key: "accreditations", label: "Accreditations" },
    { key: "additional", label: "Additional Services" },
    { key: "hours", label: "Operating Hours" },
    { key: "gallery", label: "Gallery" },
    { key: "location", label: "Location" },
    { key: "payments", label: "Payment Methods" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-[22px] font-semibold">Clinic Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-6">
        {/* LEFT */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="text-sm text-gray-500 mb-2">Status</div>
            <span
              className={clsx(
                "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
                statusClass
              )}
            >
              {statusLabel}
            </span>
          </Card>

          <Card className="p-4">
            <div className="text-sm text-gray-500 mb-2">Profile Completion</div>
            <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className={clsx(
                  "h-2 rounded-full transition-all",
                  completion === 100 ? "bg-emerald-500" : "bg-blue-500"
                )}
                style={{ width: `${completion}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-gray-600">{completion}%</div>
          </Card>

          <Card className="p-4 space-y-3">
            <div className="flex flex-col gap-2">
              <button
                disabled={publishDisabled || isPending}
                onClick={() => {
                  startTransition(async () => {
                    await saveDraftSection("basic_info", basic);
                    await saveDraftSection("services", services);
                    await saveDraftSection("doctors", doctors);
                    await saveDraftSection("facilities", additional);
                    await saveDraftSection("hours", hours);
                    await saveDraftSection("gallery", gallery);
                    await saveDraftSection("location", location);
                    await saveDraftSection("pricing", payments);
                    await submitForReview();
                  });
                }}
                className={clsx(
                  "w-full rounded-md px-3 py-2 text-white font-medium transition",
                  publishDisabled
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {isPending
                  ? isPublished
                    ? "Updating..."
                    : "Publishing..."
                  : sidebarPrimaryLabel}
              </button>

              {/* Кнопка "My clinic" – только когда клиника уже опубликована */}
              {clinicPublicHref && (
                <a
                  href={clinicPublicHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1 rounded-md border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                >
                  <Icon
                    icon="solar:external-link-linear"
                    className="h-4 w-4"
                  />
                  <span>My clinic</span>
                </a>
              )}
            </div>

            <p className="text-xs text-gray-500">
              Complete all required sections to enable publishing or updating
            </p>
          </Card>

          <Card className="p-2">
            {sections.map((s) => {
              const state = sectionStatuses[s.key];
              const isActive = active === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setActive(s.key)}
                  className={clsx(
                    "w-full flex items-center justify-between px-3 py-2 rounded-md text-left transition",
                    "hover:bg-gray-50",
                    isActive && "ring-1 ring-blue-200 bg-blue-50/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={clsx(
                        "text-sm font-medium",
                        isActive ? "text-blue-800" : "text-gray-900"
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                  <span
                    className={clsx(
                      "text-xs px-2 py-1 rounded-full",
                      state === "Required" && "bg-rose-50 text-rose-600",
                      state === "Complete" && "bg-emerald-50 text-emerald-600",
                      state === "Optional" && "bg-gray-100 text-gray-700"
                    )}
                  >
                    {state}
                  </span>
                </button>
              );
            })}
          </Card>
        </div>

        {/* RIGHT */}
        <Card className="p-6 space-y-6">
          {active === "basic" && (
            <BasicInfo
              value={basic}
              onChange={setBasic}
              completion={completion}
              cats={cats}
            />
          )}

          {active === "services" && (
            <ServicesSection rows={services} onChange={setServices} />
          )}

          {active === "doctors" && (
            <DoctorsSection rows={doctors} onChange={setDoctors} />
          )}

          {active === "accreditations" && (
            <AccreditationsSection
              value={additional.accreditations}
              onChange={(next) =>
                setAdditional((prev) => ({ ...prev, accreditations: next }))
              }
            />
          )}

          {active === "additional" && (
            <AdditionalSection value={additional} onChange={setAdditional} />
          )}

          {active === "hours" && (
            <HoursSection
              rows={hours}
              onChange={setHours}
            />
          )}

          {active === "gallery" && (
            <GallerySection
              rows={gallery}
              onChange={setGallery}
            />
          )}

          {active === "location" && (
            <LocationSection value={location} onChange={setLocation} />
          )}

          {active === "payments" && (
            <PaymentsSection
              rows={payments}
              onAdd={(row) => setPayments((p) => [...p, row])}
              onRemove={(i) =>
                setPayments((p) => p.filter((_, idx) => idx !== i))
              }
            />
          )}

          {/* footer */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                const snapshot = {
                  basic_info: basic,
                  services,
                  doctors,
                  facilities: additional,
                  hours,
                  gallery,
                  location,
                  pricing: payments,
                };
                startTransition(async () => {
                  await saveDraftWhole(snapshot);
                });
              }}
              className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save as Draft"}
            </button>

            <button
              onClick={() => {
                startTransition(async () => {
                  await saveDraftWhole({
                    basic_info: basic,
                    services,
                    doctors,
                    facilities: additional,
                    hours,
                    gallery,
                    location,
                    pricing: payments,
                  });
                  await submitForReview();
                });
              }}
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
              disabled={publishDisabled || isPending}
            >
              {isPending
                ? isPublished
                  ? "Updating..."
                  : "Submitting..."
                : submitButtonLabel}
            </button>
          </div>
          <p className="text-xs text-gray-500">
              When filling out the clinic, first of all, save the data using the "Save as Draft" button to save the data and not lose it.
          </p>
        </Card>
      </div>
    </div>
  );
}

/* ----------------------------- Primitives ----------------------------- */

function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={clsx("rounded-xl border bg-white", className)}>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  helper,
  className,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  helper?: string;
  className?: string;
  type?: string;
}) {
  return (
    <div className={className}>
      <label className="text-[13px] text-gray-600">{label}</label>
      <input
        className="mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
      />
      {helper && <p className="mt-1 text-xs text-gray-500">{helper}</p>}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; disabled?: boolean }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-[13px] text-gray-600">{label}</label>
      <select
        className="mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option
            key={o.value + o.label}
            value={o.value}
            disabled={o.disabled}
          >
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-[13px] text-gray-600">{label}</label>
      <textarea
        className="mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
}

function TagInput({
  label,
  values,
  onAdd,
  onRemove,
  placeholder,
}: {
  label: string;
  values: string[];
  onAdd: (v: string) => void;
  onRemove: (i: number) => void;
  placeholder?: string;
}) {
  const [val, setVal] = useState("");
  return (
    <div>
      <label className="text-[13px] text-gray-600">{label}</label>
      <div className="mt-1 flex gap-2">
        <input
          className="flex-1 rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => {
            const v = val.trim();
            if (!v) return;
            onAdd(v);
            setVal("");
          }}
          className="rounded-md border px-3 py-2 text-sm bg-white hover:bg-gray-50"
        >
          + Add
        </button>
      </div>
      {!values.length ? (
        <p className="mt-2 text-sm text-gray-400">No items yet.</p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          {values.map((v, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm"
            >
              {v}
              <button
                onClick={() => onRemove(i)}
                className="text-gray-500 hover:text-rose-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----------------------------- Sections ------------------------------ */

function BasicInfo({
  value,
  onChange,
  completion,
  cats,
}: {
  value: {
    name: string;
    slug: string;
    specialty: string;
    country: string;
    city: string;
    province: string;
    district: string;
    address: string;
    description: string;
  };
  onChange: (v: any) => void;
  completion: number;
  cats: Array<{ id: number; name: string; slug: string }>;
}) {
  return (
    <>
      <div className="space-y-2">
        <div className="text-lg font-semibold">Basic Information</div>
        <p className="text-sm text-gray-500">
          Set up your clinic&apos;s basic information and contact details
        </p>
      </div>

      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <div className="font-medium mb-1">
          Complete all required fields to submit your clinic for review.
        </div>
        <div>You&apos;re {completion}% done!</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Clinic Name *"
          value={value.name}
          onChange={(v) => onChange({ ...value, name: v })}
          placeholder="Enter clinic name"
        />
        <Field
          label="URL Slug"
          value={value.slug}
          onChange={(v) => onChange({ ...value, slug: v })}
          placeholder="clinic-url-slug"
          helper="URL slug will be auto-generated from clinic name if left empty."
        />

        <Select
          label="Specialty *"
          value={value.specialty}
          onChange={(v) => onChange({ ...value, specialty: v })}
          options={[
            { value: "", label: "Select specialty", disabled: true },
            ...cats.map((c) => ({
              value: c.slug,
              label: c.name,
            })),
          ]}
        />

        <div />

        <Field
          label="Country *"
          value={value.country}
          onChange={(v) => onChange({ ...value, country: v })}
          placeholder="Enter country"
        />
        <Field
          label="City *"
          value={value.city}
          onChange={(v) => onChange({ ...value, city: v })}
          placeholder="Enter city"
        />
        <Field
          label="Province/State"
          value={value.province}
          onChange={(v) => onChange({ ...value, province: v })}
          placeholder="Enter province or state"
        />
        <Field
          label="District/Area"
          value={value.district}
          onChange={(v) => onChange({ ...value, district: v })}
          placeholder="Enter district or area"
        />

        <Textarea
          className="md:col-span-2"
          label="Full Address *"
          value={value.address}
          onChange={(v) => onChange({ ...value, address: v })}
          placeholder="Enter complete clinic address"
          rows={4}
        />

        <Textarea
          className="md:col-span-2"
          label="Description"
          value={value.description}
          onChange={(v) => onChange({ ...value, description: v })}
          placeholder="Describe your clinic, services, and what makes you special"
          rows={4}
        />
      </div>
    </>
  );
}

/* -------- Services: редактирование + currency input (uppercase) ------- */

function ServicesSection({
  rows,
  onChange,
}: {
  rows: ServiceRow[];
  onChange: (rows: ServiceRow[]) => void;
}) {
  const [draft, setDraft] = useState<ServiceRow>({
    name: "",
    price: "",
    currency: "USD",
    description: "",
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // парсим цену из строки, чтобы слайдер не падал даже при странном формате
  const sliderValue = React.useMemo(() => {
    const raw = draft.price ?? "";
    const parsed = parseInt(String(raw).replace(/[^\d]/g, ""), 10);
    if (!Number.isFinite(parsed)) return PRICE_MIN;
    return Math.min(PRICE_MAX, Math.max(PRICE_MIN, parsed));
  }, [draft.price]);

  function resetDraft() {
    setDraft({ name: "", price: "", currency: "USD", description: "" });
    setEditingIndex(null);
  }

  function handleSave() {
    if (!draft.name.trim()) return;

    const next: ServiceRow = {
      ...draft,
      // цена хранится как «чистое число» в строке
      price:
        draft.price && draft.price.toString().trim().length
          ? String(
              Math.min(
                PRICE_MAX,
                Math.max(
                  PRICE_MIN,
                  parseInt(
                    draft.price.toString().replace(/[^\d]/g, ""),
                    10,
                  ) || 0,
                ),
              ),
            )
          : "",
      currency: (draft.currency || "USD").toUpperCase(),
    };

    if (editingIndex === null) {
      onChange([...rows, next]);
    } else {
      onChange(rows.map((r, i) => (i === editingIndex ? next : r)));
    }
    resetDraft();
  }

  return (
    <>
      <div className="text-lg font-semibold">Services</div>
      <p className="mt-1 text-sm text-gray-500">
        Add treatments, prices and currencies. Use the slider or type the price
        manually. Currency codes are stored in uppercase (USD, EUR, etc.).
      </p>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Название услуги */}
        <Field
          label="Service Name *"
          value={draft.name}
          onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
          placeholder="Enter service name"
        />

        {/* ЦЕНА: слайдер + инпут "от" */}
        <div className="space-y-2">
          <label className="text-[13px] text-gray-600">Price from</label>

          {/* слайдер в синем цвете, как на сайте */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-[12px] text-gray-500">
              <span>
                Min: {PRICE_MIN.toLocaleString()} {draft.currency.toUpperCase()}
              </span>
              <span>
                Max: {PRICE_MAX.toLocaleString()} {draft.currency.toUpperCase()}
              </span>
            </div>

            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={PRICE_STEP}
              value={sliderValue}
              onChange={(e) => {
                const v = Number(e.target.value) || 0;
                setDraft((d) => ({ ...d, price: String(v) }));
              }}
              className="w-full accent-blue-600"
            />

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">From</span>
              <input
                type="number"
                className="w-32 rounded-md border px-3 py-1.5 text-sm outline-none focus:border-blue-500"
                value={draft.price ?? ""}
                min={PRICE_MIN}
                max={PRICE_MAX}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") {
                    setDraft((d) => ({ ...d, price: "" }));
                    return;
                  }
                  const parsed = parseInt(
                    raw.toString().replace(/[^\d]/g, ""),
                    10,
                  );
                  if (!Number.isFinite(parsed)) return;
                  const clamped = Math.min(
                    PRICE_MAX,
                    Math.max(PRICE_MIN, parsed),
                  );
                  setDraft((d) => ({ ...d, price: String(clamped) }));
                }}
              />
              <span className="text-sm text-gray-500">
                {draft.currency.toUpperCase()}
              </span>
            </div>

            <p className="text-[11px] text-gray-400">
              Drag the slider or enter the amount. We store only the numeric
              value of the price.
            </p>
          </div>
        </div>

        {/* Валюта с выбором популярных, как было */}
        <div className="space-y-1">
          <Field
            label="Currency"
            value={draft.currency}
            onChange={(v) =>
              setDraft((d) => ({ ...d, currency: v.toUpperCase() }))
            }
            placeholder="USD"
          />
          <details className="rounded-md border bg-gray-50 px-3 py-2 text-xs text-gray-600">
            <summary className="flex cursor-pointer items-center justify-between list-none">
              <span className="flex items-center gap-1">
                <Icon
                  icon="mdi:currency-usd-circle"
                  className="h-4 w-4 text-blue-600"
                />
                <span>Common currencies</span>
              </span>
              <span className="text-[10px] uppercase tracking-wide">
                Tap to expand
              </span>
            </summary>
            <div className="mt-2 flex flex-wrap gap-2">
              {COMMON_CURRENCIES.map((code) => {
                const active = draft.currency.toUpperCase() === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() =>
                      setDraft((d) => ({ ...d, currency: code }))
                    }
                    className={clsx(
                      "inline-flex items-center rounded-full border px-3 py-1 text-[11px]",
                      active
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                    )}
                  >
                    {code}
                  </button>
                );
              })}
            </div>
          </details>
        </div>

        {/* Описание услуги */}
        <Field
          label="Description"
          value={draft.description || ""}
          onChange={(v) => setDraft((d) => ({ ...d, description: v }))}
          placeholder="Enter description"
        />
      </div>

      {/* Кнопки сохранить/отмена */}
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={handleSave}
          className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
          disabled={!draft.name.trim()}
        >
          {editingIndex === null ? "+ Add Service" : "Save changes"}
        </button>
        {editingIndex !== null && (
          <button
            type="button"
            onClick={resetDraft}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        )}
      </div>

      {/* список услуг как был, редактирование / удаление не ломаем */}
      {!rows.length ? (
        <p className="mt-3 text-sm text-gray-400">No services added yet.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {rows.map((r, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded border px-3 py-2 text-sm"
            >
              <div>
                <div className="font-medium">{r.name}</div>
                <div className="text-gray-500">
                  {[
                    r.price &&
                      `${r.price} ${(r.currency || "USD").toUpperCase()}`,
                    r.description,
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setDraft({
                      name: r.name,
                      price: r.price ?? "",
                      currency: r.currency || "USD",
                      description: r.description || "",
                    });
                    setEditingIndex(i);
                  }}
                  className="text-gray-500 hover:text-blue-600 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() =>
                    onChange(rows.filter((_, idx) => idx !== i))
                  }
                  className="text-gray-500 hover:text-rose-600 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ---------------- Doctors: upload only + edit ---------------- */

function DoctorsSection({
  rows,
  onChange,
}: {
  rows: DoctorRow[];
  onChange: (rows: DoctorRow[]) => void;
}) {
  const [draft, setDraft] = useState<DoctorRow>({
    fullName: "",
    title: "",
    specialty: "",
    description: "",
    photo: "",
  });

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputId = "doctorPhotoUpload";
  const MAX_MB = 20;
  const MAX_BYTES = MAX_MB * 1024 * 1024;

  const startNew = () => {
    setDraft({
      fullName: "",
      title: "",
      specialty: "",
      description: "",
      photo: "",
    });
    setEditingIndex(null);
    setError(null);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files[0]) return;
    const file = files[0];

    if (file.size > MAX_BYTES) {
      setError(`Image is too large. Max size is ${MAX_MB} MB.`);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const url = await uploadDoctorImage(fd);
      setDraft((d) => ({ ...d, photo: url }));
    } catch (e: any) {
      console.error(e);
      setError("Failed to upload image. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleSave = () => {
    if (!draft.fullName.trim()) return;

    const normalized: DoctorRow = {
      fullName: draft.fullName.trim(),
      title: draft.title?.trim() || "",
      specialty: draft.specialty?.trim() || "",
      description: draft.description?.trim() || "",
      photo: draft.photo?.trim() || "",
    };

    if (editingIndex === null) {
      onChange([...rows, normalized]);
    } else {
      onChange(
        rows.map((r, i) => (i === editingIndex ? normalized : r))
      );
    }

    startNew();
  };

  const handleEdit = (index: number) => {
    const d = rows[index];
    setDraft({
      fullName: d.fullName,
      title: d.title || "",
      specialty: d.specialty || "",
      description: d.description || "",
      photo: d.photo || "",
    });
    setEditingIndex(index);
    setError(null);
  };

  const handleDelete = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
    if (editingIndex === index) {
      startNew();
    }
  };

  return (
    <>
      <div className="text-lg font-semibold">Doctors &amp; Medical Staff</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Full Name *"
          value={draft.fullName}
          onChange={(v) => setDraft((d) => ({ ...d, fullName: v }))}
          placeholder="Dr. John Smith"
        />
        <Field
          label="Title/Position"
          value={draft.title || ""}
          onChange={(v) => setDraft((d) => ({ ...d, title: v }))}
          placeholder="Chief Surgeon"
        />
        <Field
          label="Specialty"
          value={draft.specialty || ""}
          onChange={(v) => setDraft((d) => ({ ...d, specialty: v }))}
          placeholder="Orthopedics, etc."
        />

        <div className="md:col-span-1">
          <label className="text-[13px] text-gray-600">Photo</label>
          <div className="mt-1 flex items-center gap-3">
            <input
              id={fileInputId}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
            <label
              htmlFor={fileInputId}
              className={clsx(
                "rounded-md border bg-white px-3 py-2 text-sm cursor-pointer hover:bg-gray-50",
                busy && "opacity-60 cursor-default"
              )}
            >
              {busy ? "Uploading…" : "⬆ Upload photo from device"}
            </label>
            <span className="text-xs text-gray-500">
              One image per doctor. You can change it while editing.
            </span>
          </div>
          {draft.photo && (
            <div className="mt-2 h-10 w-10 rounded-full overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={draft.photo}
                alt={draft.fullName || "Doctor photo"}
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>

        <Textarea
          className="md:col-span-2"
          label="Description"
          value={draft.description || ""}
          onChange={(v) => setDraft((d) => ({ ...d, description: v }))}
          placeholder="Short bio/qualifications"
        />
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={!draft.fullName.trim() || busy}
          className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
        >
          {editingIndex === null ? "+ Add Doctor" : "Save changes"}
        </button>
        {editingIndex !== null && (
          <button
            type="button"
            onClick={startNew}
            className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}

      {!rows.length ? (
        <p className="mt-3 text-sm text-gray-400">No doctors added yet.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {rows.map((d, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded border px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                {d.photo && (
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={d.photo}
                      alt={d.fullName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="truncate">
                  <span className="font-medium">{d.fullName}</span>
                  {d.title && (
                    <span className="text-gray-500"> — {d.title}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleEdit(i)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(i)}
                  className="text-sm text-gray-500 hover:text-rose-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* -------- Additional (amenities + icons, accreditations edit+upload) --- */

function normalizeAmenityList(raw: any): AmenityItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string") return { label: item, icon: undefined };
      if (!item) return null;
      const label = String(item.label ?? "").trim();
      if (!label) return null;
      const icon =
        item.icon && String(item.icon).trim()
          ? String(item.icon).trim()
          : undefined;
      return { label, icon };
    })
    .filter(Boolean) as AmenityItem[];
}

const AMENITY_ICON_OPTIONS: {
  value: string;
  label: string;
  icon: string;
}[] = [
  { value: "check", label: "General", icon: "solar:check-circle-bold" },
  { value: "bed", label: "Bed / room", icon: "mdi:bed" },
  { value: "tooth", label: "Dental", icon: "mdi:tooth-outline" },
  { value: "airplane", label: "Airplane / travel", icon: "mdi:airplane" },
  { value: "car", label: "Car / transfer", icon: "mdi:car" },
  { value: "hotel", label: "Hotel / stay", icon: "mdi:hotel" },
  { value: "language", label: "Languages", icon: "mdi:translate-variant" },
  { value: "globe", label: "Global / international", icon: "mdi:earth" },
];

const PRESET_PREMISES = [
  "Private rooms",
  "Operating rooms",
  "Recovery rooms",
  "ICU / intensive care",
];

const PRESET_CLINIC_SERVICES = [
  "Consultation",
  "Diagnosis",
  "Treatment",
  "Follow-up care",
];

const PRESET_TRAVEL_SERVICES = [
  "Airport pick-up",
  "Hotel booking",
  "Clinic transfer",
  "Translation assistance",
];

const PRESET_LANGUAGES = [
  "English",
  "Turkish",
  "Russian",
  "Arabic",
  "Spanish",
];

function IconPicker({
  value,
  onChange,
}: {
  value?: string;
  onChange: (v: string | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const active =
    AMENITY_ICON_OPTIONS.find((o) => o.value === value) ||
    AMENITY_ICON_OPTIONS[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 rounded-md border bg-white px-2 py-1 text-xs hover:bg-gray-50"
      >
        <Icon icon={active.icon} className="h-4 w-4 text-sky-600" />
        <span className="text-[11px] text-gray-600">Icon</span>
      </button>

      {open && (
        <div
          className={clsx(
            "absolute z-20 mt-1 w-56 max-w-[80vw] rounded-md border bg-white shadow-lg",
            "right-0 p-2 grid grid-cols-3 gap-1"
          )}
        >
          <button
            type="button"
            onClick={() => {
              onChange(undefined);
              setOpen(false);
            }}
            className="flex flex-col items-center justify-center rounded p-1 hover:bg-gray-50 text-xs text-gray-600 col-span-3 mb-1"
          >
            <span>No icon</span>
          </button>

          {AMENITY_ICON_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={clsx(
                "flex flex-col items-center justify-center rounded p-1 hover:bg-sky-50 text-[10px] text-gray-600",
                value === opt.value && "ring-2 ring-sky-500"
              )}
            >
              <Icon icon={opt.icon} className="mb-1 h-5 w-5 text-sky-600" />
              <span className="text-center leading-tight">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AmenityGroupField({
  label,
  placeholder,
  items,
  onChange,
  suggestions,
}: {
  label: string;
  placeholder: string;
  items: AmenityItem[];
  onChange: (items: AmenityItem[]) => void;
  suggestions?: string[];
}) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<string | undefined>(undefined);

  const existingKeys = useMemo(
    () => new Set(items.map((it) => normalizeAmenityLabel(it.label))),
    [items]
  );

  function addAmenity(raw: string, iconOverride?: string) {
    const v = raw.trim();
    if (!v) return;
    const key = normalizeAmenityLabel(v);
    if (!key || existingKeys.has(key)) {
      // уже есть такой (с учётом регистра/пробелов) – не добавляем
      return;
    }
    onChange([
      ...items,
      { label: v, icon: iconOverride ?? icon ?? undefined },
    ]);
  }

  function handleAdd() {
    addAmenity(name);
    setName("");
    setIcon(undefined);
  }

  return (
    <div className="space-y-1">
      <div className="text-[13px] text-gray-600">{label}</div>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={placeholder}
        />
        <IconPicker value={icon} onChange={setIcon} />
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-md border bg-white px-3 py-2 text-xs hover:bg-gray-50"
        >
          Add
        </button>
      </div>

      {suggestions && suggestions.length > 0 && (
        <details className="mt-1 rounded-md border bg-gray-50 px-3 py-2 text-[11px] text-gray-600">
          <summary className="flex cursor-pointer items-center justify-between list-none">
            <span className="flex items-center gap-1">
              <Icon
                icon="solar:menu-dots-bold"
                className="h-4 w-4 text-sky-600"
              />
              <span>Choose from common options</span>
            </span>
            <span className="text-[9px] uppercase tracking-wide">
              Tap to expand
            </span>
          </summary>
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestions.map((s) => {
              const key = normalizeAmenityLabel(s);
              const exists = existingKeys.has(key);
              return (
                <button
                  key={s}
                  type="button"
                  disabled={exists}
                  onClick={() => addAmenity(s)}
                  className={clsx(
                    "inline-flex items-center rounded-full border px-2.5 py-1",
                    "text-[11px]",
                    exists
                      ? "border-gray-200 bg-gray-100 text-gray-400 cursor-default"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </details>
      )}

      {!items.length ? (
        <p className="mt-1 text-xs text-gray-400">No items yet.</p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          {items.map((it, i) => {
            const cfg = AMENITY_ICON_OPTIONS.find(
              (o) => o.value === it.icon
            );
            const iconName = cfg?.icon ?? AMENITY_ICON_OPTIONS[0].icon;

            return (
              <span
                key={i}
                className="inline-flex items-center gap-2 rounded-full bg-gray-50 border px-2 py-1 text-xs"
              >
                <Icon icon={iconName} className="h-4 w-4 text-sky-600" />
                <span>{it.label}</span>
                <button
                  type="button"
                  onClick={() =>
                    onChange(items.filter((_, idx) => idx !== i))
                  }
                  className="text-gray-400 hover:text-rose-600"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AccreditationsSection({
  value,
  onChange,
}: {
  value: Accreditation[];
  onChange: (v: Accreditation[]) => void;
}) {
  const [accDraft, setAccDraft] = useState<Accreditation>({
    name: "",
    logo_url: "",
    description: "",
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [accBusy, setAccBusy] = useState(false);
  const [accError, setAccError] = useState<string | null>(null);

  const logoInputId = "accreditationLogoUpload";
  const MAX_MB = 20;
  const MAX_BYTES = MAX_MB * 1024 * 1024;

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files[0]) return;
    const file = files[0];

    if (file.size > MAX_BYTES) {
      setAccError(`Image is too large. Max size is ${MAX_MB} MB.`);
      return;
    }

    setAccBusy(true);
    setAccError(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const url = await uploadAccreditationLogo(fd);
      setAccDraft((d) => ({ ...d, logo_url: url }));
    } catch (err) {
      console.error(err);
      setAccError("Failed to upload image. Please try again.");
    } finally {
      setAccBusy(false);
    }
  };

  const resetAcc = () => {
    setAccDraft({ name: "", logo_url: "", description: "" });
    setEditingIndex(null);
    setAccError(null);
  };

  const saveAccreditation = () => {
    if (!accDraft.name.trim()) return;

    const normalized: Accreditation = {
      name: accDraft.name.trim(),
      logo_url: accDraft.logo_url?.trim() || undefined,
      description: accDraft.description?.trim() || undefined,
    };

    if (editingIndex === null) {
      onChange([...(value || []), normalized]);
    } else {
      onChange(
        value.map((a, i) => (i === editingIndex ? normalized : a))
      );
    }

    resetAcc();
  };

  const editAccreditation = (index: number) => {
    const a = value[index];
    setAccDraft({
      name: a.name,
      logo_url: a.logo_url || "",
      description: a.description || "",
    });
    setEditingIndex(index);
    setAccError(null);
  };

  const deleteAccreditation = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
    if (editingIndex === index) {
      resetAcc();
    }
  };

  return (
    <>
      <div className="text-lg font-semibold">Accreditations</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Name *"
          value={accDraft.name}
          onChange={(v) => setAccDraft((a) => ({ ...a, name: v }))}
          placeholder="JCI, ISO..."
        />

        <div>
          <label className="text-[13px] text-gray-600">Logo</label>
          <div className="mt-1 flex items-center gap-3">
            <input
              id={logoInputId}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
            <label
              htmlFor={logoInputId}
              className={clsx(
                "rounded-md border bg-white px-3 py-2 text-sm cursor-pointer hover:bg-gray-50",
                accBusy && "opacity-60 cursor-default"
              )}
            >
              {accBusy ? "Uploading…" : "⬆ Upload logo"}
            </label>
            <span className="text-xs text-gray-500">
              One image per accreditation.
            </span>
          </div>
          {accDraft.logo_url && (
            <div className="mt-2 h-10 w-10 overflow-hidden rounded bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={accDraft.logo_url}
                alt={accDraft.name || "Accreditation logo"}
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>

        <Textarea
          className="md:col-span-2"
          label="Description"
          value={accDraft.description || ""}
          onChange={(v) =>
            setAccDraft((a) => ({ ...a, description: v }))
          }
          placeholder="Brief description of the accreditation"
        />
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={saveAccreditation}
          className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-gray-50"
          disabled={!accDraft.name.trim() || accBusy}
        >
          {editingIndex === null ? "+ Add Accreditation" : "Save changes"}
        </button>
        {editingIndex !== null && (
          <button
            type="button"
            onClick={resetAcc}
            className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>

      {accError && (
        <p className="mt-2 text-xs text-red-600">{accError}</p>
      )}

      {!value?.length ? (
        <p className="mt-3 text-sm text-gray-400">No accreditations yet.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {value.map((a, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded border px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                {a.logo_url && (
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.logo_url}
                      alt={a.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="truncate font-medium">{a.name}</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => editAccreditation(i)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => deleteAccreditation(i)}
                  className="text-sm text-gray-500 hover:text-rose-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function AdditionalSection({
  value,
  onChange,
}: {
  value: FacilitiesState;
  onChange: (v: FacilitiesState) => void;
}) {
  return (
    <>
      <div className="text-lg font-semibold">
        Additional Services & Facilities
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Choose common services from the lists or add your own custom items.
      </p>

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        {/* левая колонка */}
        <div className="space-y-6">
          <AmenityGroupField
            label="Premises"
            placeholder="Operating rooms, recovery rooms, etc."
            items={value.premises}
            onChange={(items) => onChange({ ...value, premises: items })}
            suggestions={PRESET_PREMISES}
          />

          <AmenityGroupField
            label="Clinic Services"
            placeholder="Consultation, diagnosis, treatment, etc."
            items={value.clinic_services}
            onChange={(items) =>
              onChange({ ...value, clinic_services: items })
            }
            suggestions={PRESET_CLINIC_SERVICES}
          />
        </div>

        {/* правая колонка */}
        <div className="space-y-6">
          <AmenityGroupField
            label="Travel Services"
            placeholder="Airport pickup, accommodation, etc."
            items={value.travel_services}
            onChange={(items) =>
              onChange({ ...value, travel_services: items })
            }
            suggestions={PRESET_TRAVEL_SERVICES}
          />

          <AmenityGroupField
            label="Languages Spoken"
            placeholder="English, Spanish, French, etc."
            items={value.languages_spoken}
            onChange={(items) =>
              onChange({ ...value, languages_spoken: items })
            }
            suggestions={PRESET_LANGUAGES}
          />
        </div>
      </div>
    </>
  );
}

/* --------------------- Hours: fixed days + apply to all ---------------- */

function HoursSection({
  rows,
  onChange,
}: {
  rows: HourRow[];
  onChange: (rows: HourRow[]) => void;
}) {
  const applyToAll = (index: number) => {
    const src = rows[index];
    const isClosed = src.status === "Closed";

    const next = rows.map((r) => ({
      ...r,
      status: src.status,
      start: isClosed ? undefined : src.start || "00:00",
      end: isClosed ? undefined : src.end || "00:00",
    }));

    onChange(next);
  };

  return (
    <>
      <div className="text-lg font-semibold">Operating Hours</div>
      <p className="mt-1 text-sm text-gray-500">
        Set opening hours for each day. Use “Apply to all days” to quickly copy status and time.
      </p>

      <div className="mt-3 space-y-3">
        {rows.map((r, i) => {
          const isClosed = r.status === "Closed";

          return (
            <div key={r.day} className="rounded border p-3">
              <div className="grid grid-cols-1 md:grid-cols-[1.1fr,1.1fr,1fr,1fr] gap-3 items-end">
                {/* Day (fixed, disabled) */}
                <div>
                  <label className="text-[13px] text-gray-600">Day</label>
                  <input
                    className="mt-1 w-full rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-500"
                    value={r.day}
                    disabled
                  />
                </div>

                {/* Status */}
                <Select
                  label="Status"
                  value={r.status}
                  onChange={(v) => {
                    const status = v as "Open" | "Closed";
                    const next = rows.map((x, idx) =>
                      idx === i
                        ? {
                            ...x,
                            status,
                            start:
                              status === "Closed"
                                ? undefined
                                : x.start || "00:00",
                            end:
                              status === "Closed"
                                ? undefined
                                : x.end || "00:00",
                          }
                        : x
                    );
                    onChange(next);
                  }}
                  options={[
                    { value: "Open", label: "Open" },
                    { value: "Closed", label: "Closed" },
                  ]}
                />

                {/* Start time */}
                <Field
                  label="Start Time"
                  type="time"
                  value={isClosed ? "" : r.start || ""}
                  onChange={(v) => {
                    const next = rows.map((x, idx) =>
                      idx === i ? { ...x, start: v } : x
                    );
                    onChange(next);
                  }}
                  className={isClosed ? "opacity-60" : ""}
                />

                {/* End time */}
                <Field
                  label="End Time"
                  type="time"
                  value={isClosed ? "" : r.end || ""}
                  onChange={(v) => {
                    const next = rows.map((x, idx) =>
                      idx === i ? { ...x, end: v } : x
                    );
                    onChange(next);
                  }}
                  className={isClosed ? "opacity-60" : ""}
                />
              </div>

              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => applyToAll(i)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Apply to all days
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* --------------------- Gallery: only upload + editable title ---------- */

function GallerySection({
  rows,
  onChange,
}: {
  rows: GalleryItem[];
  onChange: (rows: GalleryItem[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_IMAGES = 10;
  const MAX_MB = 20;
  const MAX_BYTES = MAX_MB * 1024 * 1024;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";

    if (!files.length) return;

    const remaining = MAX_IMAGES - rows.length;
    if (remaining <= 0) {
      setError(`You can upload up to ${MAX_IMAGES} images.`);
      return;
    }

    const allowed = files.slice(0, remaining);
    const tooBig = allowed.filter((f) => f.size > MAX_BYTES);

    if (tooBig.length) {
      setError(`Some files are too large. Max size is ${MAX_MB} MB per image.`);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const fd = new FormData();
      allowed.forEach((f) => fd.append("files", f));
      const urls = await uploadGallery(fd);
      const next = [
        ...rows,
        ...urls.map((url, idx) => ({
          url,
          title: `Image ${rows.length + idx + 1}`,
        })),
      ];
      onChange(next);
    } catch (e: any) {
      console.error(e);
      setError("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="text-lg font-semibold">Gallery</div>
      <p className="mt-1 text-sm text-gray-500">
        Upload up to {MAX_IMAGES} images. Max size {MAX_MB} MB per image.
      </p>

      <div className="mt-3">
        <input
          id="galleryUpload"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
        <label
          htmlFor="galleryUpload"
          className={clsx(
            "inline-flex items-center rounded-md border px-3 py-2 text-sm cursor-pointer",
            "bg-white hover:bg-gray-50",
            uploading && "opacity-60 cursor-default"
          )}
        >
          {uploading ? "Uploading…" : "⬆ Upload images"}
        </label>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {!rows.length ? (
        <p className="mt-3 text-sm text-gray-400">No images yet.</p>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((g, i) => (
            <div key={i} className="rounded-lg border overflow-hidden">
              <div className="aspect-[4/3] bg-gray-100">
                {g.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={g.url}
                    alt={g.title || `Image ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="flex items-center justify-between px-3 py-2">
                <div className="min-w-0">
                  <div className="truncate text-sm text-gray-700">
                    {g.title || `Image ${i + 1}`}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(i)}
                  className="text-sm text-gray-500 hover:text-rose-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* --------------------- Location & Payments (без изменений) ------------ */

function LocationSection({
  value,
  onChange,
}: {
  value: { mapUrl: string; directions: string };
  onChange: (v: { mapUrl: string; directions: string }) => void;
}) {
  return (
    <>
      <div className="text-lg font-semibold">Location & Directions</div>
      <Field
        label="Google Maps URL"
        value={value.mapUrl}
        onChange={(v) => onChange({ ...value, mapUrl: v })}
        placeholder="https://goo.gl/maps/..."
      />
      <Textarea
        label="Directions & Transportation"
        value={value.directions}
        onChange={(v) => onChange({ ...value, directions: v })}
        placeholder="Bus #5, Metro line A, etc."
      />
    </>
  );
}

function PaymentsSection({
  rows,
  onAdd,
  onRemove,
}: {
  rows: string[];
  onAdd: (r: string) => void;
  onRemove: (i: number) => void;
}) {
  const [draft, setDraft] = useState("");

  const existingKeys = useMemo(
    () => new Set(rows.map((r) => normalizePaymentKey(r))),
    [rows]
  );

  function handleAdd(raw: string) {
    const label = raw.trim();
    if (!label) return;
    const key = normalizePaymentKey(label);
    if (!key || existingKeys.has(key)) {
      // уже есть такой метод (visa / VISA / Visa  и т.п.) – не добавляем
      return;
    }
    onAdd(label);
  }

  return (
    <>
      <div className="text-lg font-semibold">Payment Methods</div>
      <p className="mt-1 text-sm text-gray-500">
        Select popular payment methods or add your own. We will try to avoid
        duplicates even if the spelling is slightly different.
      </p>

      {/* Аккордеон с типовыми методами */}
      <div className="mt-3">
        <details className="rounded-md border bg-gray-50 px-3 py-2 text-xs text-gray-600">
          <summary className="flex cursor-pointer items-center justify-between list-none">
            <span className="flex items-center gap-1">
              <Icon
                icon="mdi:credit-card-outline"
                className="h-4 w-4 text-sky-600"
              />
            <span>Common payment methods</span>
            </span>
            <span className="text-[10px] uppercase tracking-wide">
              Tap to expand
            </span>
          </summary>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESET_PAYMENT_METHODS.map((label) => {
              const key = normalizePaymentKey(label);
              const exists = existingKeys.has(key);
              const def =
                PAYMENT_ICON_MAP[key] ?? PAYMENT_ICON_MAP["default"];
              return (
                <button
                  key={label}
                  type="button"
                  disabled={exists}
                  onClick={() => handleAdd(label)}
                  className={clsx(
                    "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px]",
                    exists
                      ? "border-gray-200 bg-gray-100 text-gray-400 cursor-default"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <Icon
                    icon={def.icon}
                    className="h-4 w-4 text-sky-600"
                  />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </details>
      </div>

      {/* Кастомный инпут */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field
          label="Payment Method"
          value={draft}
          onChange={setDraft}
          placeholder="e.g., Bank transfer, Insurance"
        />
      </div>
      <button
        onClick={() => {
          handleAdd(draft);
          setDraft("");
        }}
        className="mt-2 rounded-md border bg-white px-3 py-2 text-sm hover:bg-gray-50"
      >
        + Add Payment Method
      </button>

      {!rows.length ? (
        <p className="mt-2 text-sm text-gray-400">No payment methods yet.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {rows.map((p, i) => {
            const key = normalizePaymentKey(p);
            const def = PAYMENT_ICON_MAP[key] ?? PAYMENT_ICON_MAP["default"];
            return (
              <div
                key={`${p}-${i}`}
                className="flex items-center justify-between rounded border px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <Icon
                    icon={def.icon}
                    className="h-4 w-4 text-sky-600"
                  />
                  <span className="font-medium">{p}</span>
                </div>
                <button
                  onClick={() => onRemove(i)}
                  className="text-gray-500 hover:text-rose-600"
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
"""
app\(customer)\customer\clinic-profile\actions.ts: """
"use server";

import { createServerClient } from "@/lib/supabase/serverClient";
import type { SupabaseClient } from "@supabase/supabase-js";

async function getSupa(): Promise<SupabaseClient> {
  return await createServerClient();
}

function makeSlug(base = "dev-draft-clinic") {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${base}-${rand}`;
}

/** Возвращает clinic_id «текущего пользователя». */
export async function ensureClinicForOwner(): Promise<string> {
  const sb = await createServerClient();
  const { data: userRes } = await sb.auth.getUser();

  if (!userRes?.user) {
    throw new Error("Not authenticated");
  }

  const user = userRes.user;

  // 1) ищем существующее членство
  const { data: membership } = await sb
    .from("clinic_members")
    .select("clinic_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membership?.clinic_id) return membership.clinic_id;

  // 2) создаём новую клинику-чёрновик
  const { data: clinic, error: cErr } = await sb
    .from("clinics")
    .insert({
      owner_id: user.id,
      is_published: false,

      // до ревью: draft (а pending — только после submit)
      moderation_status: "draft",

      // “пользовательский” статус
      status: "not_published",

      name: "Draft Clinic",
      slug: makeSlug("draft-clinic"),
    })
    .select("id")
    .single();
  if (cErr) throw cErr;

  const { error: iErr } = await sb.from("clinic_members").insert({
    clinic_id: clinic.id,
    user_id: user.id,
    role: "owner",
  });
  if (iErr) throw iErr;

  return clinic.id;
}

/** Получить черновик + мету клиники */
export async function getDraft() {
  const clinicId = await ensureClinicForOwner();
  const client = await getSupa();

  // тянем клинику, чтобы знать статус / опубликована ли
  const { data: clinic, error: clinicErr } = await client
    .from("clinics")
    .select(
      "id, is_published, moderation_status, status, slug, country, province, city, district"
    )
    .eq("id", clinicId)
    .maybeSingle();

  if (clinicErr) throw clinicErr;

  let { data: draft, error } = await client
    .from("clinic_profile_drafts")
    .select("*")
    .eq("clinic_id", clinicId)
    .maybeSingle();

  if (error) throw error;

  if (!draft) {
    const { data: created, error: insErr } = await client
      .from("clinic_profile_drafts")
      .insert({ clinic_id: clinicId, status: "editing" })
      .select("*")
      .single();
    if (insErr) throw insErr;
    draft = created;
  }

  return { clinicId, draft, clinic };
}

/** Сохранить секцию черновика */
export async function saveDraftSection(
  section:
    | "basic_info"
    | "services"
    | "doctors"
    | "facilities"
    | "hours"
    | "gallery"
    | "location"
    | "pricing",
  payload: unknown
) {
  const clinicId = await ensureClinicForOwner();
  const client = await getSupa();

  const fields: Record<string, unknown> = {
    [section]: payload,
    updated_at: new Date().toISOString(),
  };

  const { error } = await client
    .from("clinic_profile_drafts")
    .upsert({ clinic_id: clinicId, ...fields }, { onConflict: "clinic_id" });
  if (error) throw error;

  return { ok: true };
}

/** Отправить на ревью / обновить опубликованную клинику */
export async function submitForReview() {
  const clinicId = await ensureClinicForOwner();
  const admin = await getSupa();

  // 0) тянем саму клинику, чтобы понять опубликована она или нет
  const { data: clinic, error: cErr } = await admin
    .from("clinics")
    .select("id, is_published, moderation_status, status")
    .eq("id", clinicId)
    .maybeSingle();

  if (cErr) throw cErr;

  const alreadyPublished = !!clinic?.is_published;

  // 1) тянем черновик
  const { data: draft, error: dErr } = await admin
    .from("clinic_profile_drafts")
    .select("*")
    .eq("clinic_id", clinicId)
    .maybeSingle();
  if (dErr) throw dErr;

  const basic: any = draft?.basic_info ?? {};
  const facilities: any = draft?.facilities ?? {};
  const location: any = draft?.location ?? {};

  const about =
    typeof basic.description === "string" ? basic.description.trim() : null;

  // собрать amenities в формат jsonb
  const amenities = {
    premises: Array.isArray(facilities.premises) ? facilities.premises : [],
    clinic_services: Array.isArray(facilities.clinic_services)
      ? facilities.clinic_services
      : [],
    travel_services: Array.isArray(facilities.travel_services)
      ? facilities.travel_services
      : [],
    languages_spoken: Array.isArray(facilities.languages_spoken)
      ? facilities.languages_spoken
      : [],
  };

  // собрать payments: jsonb [{ method: "Cash" }, ...]
  const payments =
    Array.isArray(draft?.pricing)
      ? draft.pricing
          .map((x: any) => {
            if (typeof x === "string") return x;
            if (x && typeof x.method === "string") return x.method;
            return null;
          })
          .filter(
            (v: unknown): v is string =>
              typeof v === "string" && v.trim().length > 0
          )
          .map((method: string) => ({ method }))
      : null;

  const safe = (v: unknown) => (typeof v === "string" ? v.trim() : null);

  // mapUrl / directions из location
  const map_embed_url = safe(location.mapUrl);
  const directions = safe(location.directions);

  const location_json =
    map_embed_url || directions
      ? {
          mapUrl: map_embed_url,
          directions,
        }
      : null;

  // slug нормализация
  const slugify = (s: string) =>
    (s || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  let slug = slugify(basic.slug || basic.name || "");
  if (!slug) slug = `clinic-${Math.random().toString(36).slice(2, 8)}`;

  // 2) формируем апдейт для clinics
  const clinicUpdate: Record<string, unknown> = {
    name: safe(basic.name),
    slug,
    address: safe(basic.address),
    country: safe(basic.country),
    city: safe(basic.city),
    province: safe(basic.province),
    district: safe(basic.district),
    about,
    amenities,
    map_embed_url,
    payments,
  };

  if (location_json) {
    clinicUpdate.location = location_json;
  }

  // если клиника ещё НЕ опубликована – это первый сабмит на модерацию
  if (!alreadyPublished) {
    clinicUpdate.moderation_status = "pending";
    clinicUpdate.is_published = false;
    clinicUpdate.status = "draft";
    clinicUpdate.verified_by_medtravel = true;
    clinicUpdate.is_official_partner = true;
  }

  const { error: uErr } = await admin
    .from("clinics")
    .update(clinicUpdate)
    .eq("id", clinicId);
  if (uErr) throw uErr;

  // синхронизируем связанные таблицы (услуги, доктора, часы, галерея, аккредитации, категории)
  const { error: syncErr } = await admin.rpc(
    "sync_clinic_relations_from_draft",
    { p_clinic_id: clinicId }
  );
  if (syncErr) throw syncErr;

  // 3) статус черновика:
  //    - до первой публикации: pending (для модератора)
  //    - после публикации: editing (без повторной модерации)
  const draftStatus = alreadyPublished ? "editing" : "pending";

  const { error: e1 } = await admin
    .from("clinic_profile_drafts")
    .update({
      status: draftStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("clinic_id", clinicId);
  if (e1) throw e1;

  // БЕЗ rpc("publish_clinic_from_draft") — иначе 500 на повторном вызове

  return { ok: true, alreadyPublished };
}

export async function getCategories() {
  const client = await getSupa();
  const { data, error } = await client
    .from("categories")
    .select("id,name,slug")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function publishClinic(clinicId: string) {
  const supabase = await createServerClient();
  const { error } = await supabase.rpc("publish_clinic_from_draft", {
    p_clinic_id: clinicId,
  });
  if (error) throw error;
}

/* -------------------- Upload helpers -------------------- */

const MAX_IMAGE_SIZE_MB = 20;
const MAX_IMAGE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

/**
 * Внутренний helper: грузим файлы в bucket `clinic-images`
 * с префиксом (gallery/staff/accreditations) и лимитом по размеру.
 */
async function uploadImagesInternal(files: File[], folder: string) {
  const supa = await getSupa();
  await supa.auth.getUser();

  const urls: string[] = [];

  for (const f of files) {
    if (f.size > MAX_IMAGE_BYTES) {
      throw new Error(
        `File "${f.name}" is too large. Max size is ${MAX_IMAGE_SIZE_MB} MB.`
      );
    }

    const ext = (f.name.split(".").pop() || "jpg").toLowerCase();
    const key = `u/${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    // ВАЖНО: конвертим File -> ArrayBuffer, чтобы upload не падал на сервере
    const buffer = await f.arrayBuffer();

    const { error: upErr } = await supa.storage
      .from("clinic-images")
      .upload(key, buffer, {
        cacheControl: "31536000",
        upsert: false,
        contentType: f.type || "application/octet-stream",
      });

    if (upErr) {
      console.error("Supabase upload error:", upErr);
      throw new Error(upErr.message || "Supabase upload error");
    }

    const { data: pub } = supa.storage.from("clinic-images").getPublicUrl(key);
    urls.push(pub.publicUrl);
  }

  return urls;
}

/**
 * Галерея клиники – вызывается с FormData, в котором несколько файлов под ключом "files".
 */
export async function uploadGallery(formData: FormData) {
  const files = formData.getAll("files") as File[];
  if (!files.length) {
    throw new Error("No files provided");
  }
  return uploadImagesInternal(files, "gallery");
}

/** Фото доктора – одно изображение (FormData, ключ "file") */
export async function uploadDoctorImage(formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file) {
    throw new Error("No file provided");
  }
  const [url] = await uploadImagesInternal([file], "staff");
  return url;
}

/** Лого аккредитации – одно изображение (FormData, ключ "file") */
export async function uploadAccreditationLogo(formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file) {
    throw new Error("No file provided");
  }
  const [url] = await uploadImagesInternal([file], "accreditations");
  return url;
}

// copyImageFromUrl оставляем почти как было
export async function copyImageFromUrl(url: string) {
  const supa = await getSupa();
  await supa.auth.getUser();

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to download image from URL");
  }

  const contentType = res.headers.get("content-type") || "image/jpeg";

  const ext =
    contentType.includes("png")
      ? "png"
      : contentType.includes("webp")
      ? "webp"
      : contentType.includes("gif")
      ? "gif"
      : "jpg";

  const key = `u/staff/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  const blob = await res.blob();

  const { error: upErr } = await supa.storage
    .from("clinic-images")
    .upload(key, blob, {
      cacheControl: "31536000",
      upsert: false,
      contentType,
    });

  if (upErr) {
    console.error("Supabase upload from URL error:", upErr);
    throw upErr;
  }

  const { data: pub } = supa.storage.from("clinic-images").getPublicUrl(key);

  return pub.publicUrl;
}

/** Сохранить весь драфт одним апдейтом (без стирания других полей) */
export async function saveDraftWhole(payload: {
  basic_info: any;
  services: any[];
  doctors: any[];
  facilities: any;
  hours: any[];
  gallery: any[];
  location: any;
  pricing: string[];
}) {
  const clinicId = await ensureClinicForOwner();
  const client = await getSupa();

  const { data: existing, error: getErr } = await client
    .from("clinic_profile_drafts")
    .select("*")
    .eq("clinic_id", clinicId)
    .maybeSingle();
  if (getErr) throw getErr;

  const nextRow = {
    clinic_id: clinicId,
    status: existing?.status ?? "editing",
    updated_at: new Date().toISOString(),
    ...payload,
  };

  const { error: upErr } = await client
    .from("clinic_profile_drafts")
    .upsert(nextRow, { onConflict: "clinic_id" });
  if (upErr) throw upErr;

  // переводим клинику в Draft только если она не опубликована
  const { error: sErr } = await client
    .from("clinics")
    .update({ status: "draft" })
    .eq("id", clinicId)
    .eq("is_published", false);

  if (sErr) throw sErr;

  return { ok: true };
}

export async function syncClinicRelationsFromDraft(clinicId: string) {
  const supabase = await createServerClient();
  const { error } = await supabase.rpc("sync_clinic_relations_from_draft", {
    p_clinic_id: clinicId,
  });
  if (error) throw error;
}
"""
app\(admin)\admin\moderation\page.tsx: """
// app/(admin)/admin/moderation/page.tsx

import Link from "next/link";
import { createServerClient } from "@/lib/supabase/serverClient";
import { approveClinic, rejectClinic } from "./actions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;

type ModerationQueueRow = {
  clinic_id: string;
  name: string | null;
  slug: string | null;
  city: string | null;
  country: string | null;
  moderation_status: "pending" | "approved" | "rejected" | null;
  draft_status: "editing" | "pending" | "published" | "draft" | null;
  draft_updated_at: string | null;
};

// В Next 15 searchParams в пропсах страницы — это Promise
type ModerationPageProps = {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

export default async function ModerationPage({ searchParams }: ModerationPageProps) {
  const supabase = await createServerClient();
  const sp = await searchParams;

  const getParam = (key: string): string | undefined => {
    const v = sp?.[key];
    if (Array.isArray(v)) return v[0];
    return v;
  };

  // ---- фильтр по статусу ---------------------------------------------------
  const rawStatusParam = getParam("status");
  const rawStatus = (rawStatusParam ?? "all") as
    | "all"
    | "pending"
    | "approved"
    | "rejected";

  const statusFilter: "all" | "pending" | "approved" | "rejected" =
    ["pending", "approved", "rejected"].includes(rawStatus)
      ? rawStatus
      : "all";

  // ---- пагинация -----------------------------------------------------------
  const rawPageParam = getParam("page");
  const rawPage = Number(rawPageParam ?? "1");
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // ---- запрос к moderation_queue_v2 ----------------------------------------
  let query = supabase
    .from("moderation_queue_v2")
    .select("*", { count: "exact" })
    // прячем DEV-клиники
    .not("slug", "ilike", "dev-%")
    .not("name", "ilike", "dev%");

  if (statusFilter !== "all") {
    query = query.eq("moderation_status", statusFilter);
  }

  const { data, error, count } = await query
    .order("draft_updated_at", { ascending: false })
    .range(from, to);

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Load error: {error.message}
      </div>
    );
  }

  const rows = (data ?? []) as ModerationQueueRow[];
  const total = count ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 1;

  const makeStatusHref = (status: "all" | "pending" | "approved" | "rejected") => {
    const query: Record<string, string> = {};
    if (status !== "all") query.status = status;
    query.page = "1"; // при смене статуса всегда на первую страницу

    return {
      pathname: "/admin/moderation",
      query,
    };
  };

  const makePageHref = (targetPage: number) => {
    const query: Record<string, string> = { page: String(targetPage) };
    if (statusFilter !== "all") query.status = statusFilter;
    return {
      pathname: "/admin/moderation",
      query,
    };
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Moderation queue</h1>

        {/* Фильтры по статусу */}
        <div className="flex items-center gap-2 text-sm">
          {(["all", "pending", "approved", "rejected"] as const).map((status) => {
            const isActive = statusFilter === status;
            return (
              <Link
                key={status}
                href={makeStatusHref(status)}
                className={[
                  "rounded-full border px-3 py-1 capitalize",
                  isActive
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50",
                ].join(" ")}
              >
                {status === "all" ? "All" : status}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Clinic</th>
              <th className="px-3 py-2 text-left">Location</th>
              <th className="px-3 py-2 text-center">Status</th>
              <th className="px-3 py-2 text-center">Draft</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.clinic_id} className="border-t">
                <td className="px-3 py-2">
                  <div className="font-medium">
                    <Link
                      className="text-blue-600 hover:underline"
                      href={`/admin/moderation/detail?id=${r.clinic_id}`}
                    >
                      {r.name || "(no name)"}
                    </Link>
                  </div>
                  <div className="text-gray-500 text-xs">{r.slug}</div>
                </td>

                <td className="px-3 py-2">
                  {[r.city, r.country].filter(Boolean).join(", ")}
                </td>

                <td className="px-3 py-2 text-center">
                  <span className="rounded-full bg-gray-100 px-2 py-1">
                    {r.moderation_status ?? "pending"}
                  </span>
                </td>

                <td className="px-3 py-2 text-center">
                  <span className="rounded-full bg-gray-100 px-2 py-1">
                    {r.draft_status ?? "-"}
                  </span>
                </td>

                <td className="px-3 py-2">
                  <div className="flex items-center gap-2 justify-end">
                    {/* APPROVE */}
                    <form action={approveClinic}>
                      <input type="hidden" name="clinicId" value={r.clinic_id} />
                      <button
                        className="rounded-md bg-emerald-600 text-white px-3 py-1 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={r.draft_status !== "pending"}
                        title={
                          r.draft_status !== "pending"
                            ? "Approve доступен только для черновиков в статусе pending"
                            : ""
                        }
                      >
                        Approve
                      </button>
                    </form>

                    {/* REJECT */}
                    <form action={rejectClinic} className="flex items-center gap-2">
                      <input type="hidden" name="clinicId" value={r.clinic_id} />
                      <input
                        name="reason"
                        placeholder="Reason"
                        className="rounded-md border px-2 py-1 text-sm"
                      />
                      <button className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50">
                        Reject
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}

            {!rows.length && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-8 text-center text-gray-500"
                >
                  Queue is empty
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          {total > 0 ? (
            <>
              Showing{" "}
              <span className="font-medium">
                {Math.min(from + 1, total)}–{Math.min(to + 1, total)}
              </span>{" "}
              of <span className="font-medium">{total}</span>
            </>
          ) : (
            "No clinics to show"
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={makePageHref(Math.max(1, page - 1))}
            aria-disabled={page <= 1}
            className={[
              "rounded-md border px-3 py-1",
              page <= 1
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-gray-50",
            ].join(" ")}
          >
            Previous
          </Link>
          <span>
            Page <span className="font-medium">{page}</span> of{" "}
            <span className="font-medium">{totalPages}</span>
          </span>
          <Link
            href={makePageHref(Math.min(totalPages, page + 1))}
            aria-disabled={page >= totalPages}
            className={[
              "rounded-md border px-3 py-1",
              page >= totalPages || totalPages === 0
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-gray-50",
            ].join(" ")}
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
"""
app\(admin)\admin\moderation\actions.ts: """
// app/(admin)/admin/moderation/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/adminClient";

/**
 * APPROVE:
 * 1) вызываем RPC publish_clinic_from_draft(p_clinic_id uuid),
 *    чтобы синхронизировать все зависимые таблицы (services, staff, images, hours и т.д.)
 * 2) дополнительно дочитываем pricing из драфта и собираем payments для clinics
 * 3) помечаем драфт как published
 */
export async function approveClinic(formData: FormData) {
  const clinicId = String(formData.get("clinicId") ?? "");
  if (!clinicId) return;

  const supabase = createAdminClient();

  // 1) основная логика в БД (services, staff, images, hours, accreditations, category + статусы)
  const { error: rpcError } = await supabase.rpc("publish_clinic_from_draft", {
    p_clinic_id: clinicId,
  });

  if (rpcError) {
    console.error("publish_clinic_from_draft error:", rpcError);
    throw rpcError;
  }

  // 2) забираем из драфта pricing -> собираем payments JSON для clinics
  const { data: draft, error: draftError } = await supabase
    .from("clinic_profile_drafts")
    .select("pricing")
    .eq("clinic_id", clinicId)
    .maybeSingle();

  if (draftError) {
    console.error("Load draft pricing error:", draftError);
  }

  let payments: { method: string }[] | null = null;

  if (draft && Array.isArray(draft.pricing)) {
    const pricingArray: unknown[] = draft.pricing as unknown[];

    const methods = pricingArray
      .map((item: unknown): string | null => {
        if (typeof item === "string") return item;
        const obj = item as { method?: unknown; name?: unknown } | null;
        if (obj && typeof obj.method === "string") return obj.method;
        if (obj && typeof obj.name === "string") return obj.name;
        return null;
      })
      .filter(
        (v: unknown): v is string =>
          typeof v === "string" && v.trim().length > 0
      );

    const uniqMethods = Array.from(new Set(methods));
    payments =
      uniqMethods.length > 0
        ? uniqMethods.map((method) => ({ method }))
        : null;
  }

  // Обновляем строку в clinics: статусы + payments (если есть)
  const updatePayload: Record<string, unknown> = {
    is_published: true,
    moderation_status: "approved",
    status: "published",
  };

  // если payments вычислены — явно пишем их (можно и null)
  if (payments !== null) {
    updatePayload.payments = payments;
  }

  const { error: clinicsUpdateError } = await supabase
    .from("clinics")
    .update(updatePayload)
    .eq("id", clinicId);

  if (clinicsUpdateError) {
    console.error("clinics status/payments update error:", clinicsUpdateError);
    throw clinicsUpdateError;
  }

  // 3) уведомление владельцу клиники о публикации
  try {
    const { data: clinicRow, error: ownerErr } = await supabase
      .from("clinics")
      .select(
        "id, owner_id, name, slug, country, province, city, district"
      )
      .eq("id", clinicId)
      .maybeSingle();

    if (ownerErr) {
      console.error("load clinic for notification error:", ownerErr);
    }

    if (clinicRow?.owner_id) {
      await supabase.from("notifications").insert({
        user_id: clinicRow.owner_id,
        type: "clinic_approved",
        is_read: false,
        data: {
          clinic_id: clinicRow.id,
          name: clinicRow.name,
          slug: clinicRow.slug,
          country: clinicRow.country,
          province: clinicRow.province,
          city: clinicRow.city,
          district: clinicRow.district,
        },
      });
    }
  } catch (e) {
    console.warn("clinic_approved notification insert error:", e);
  }

  // 4) помечаем драфт как published (если таблица/колонка существуют)
  try {
    await supabase
      .from("clinic_profile_drafts")
      .update({ status: "published" })
      .eq("clinic_id", clinicId);
  } catch (e) {
    console.warn("clinic_profile_drafts publish update warning:", e);
  }

  // 5) перерисовать очередь модерации
  revalidatePath("/admin/moderation");
}

/**
 * REJECT:
 * - напрямую обновляем статус клиники и драфта через сервис-клиент
 */
export async function rejectClinic(formData: FormData) {
  const clinicId = String(formData.get("clinicId") ?? "");
  const reason = String(formData.get("reason") ?? "");
  if (!clinicId) return;

  const supabase = createAdminClient();

  // 1) обновляем клинику
  const { error: clinicsError } = await supabase
    .from("clinics")
    .update({
      is_published: false,
      moderation_status: "rejected",
      status: "draft",
      // reason сейчас нигде не сохраняем (нет колонки)
    })
    .eq("id", clinicId);

  if (clinicsError) {
    console.error("clinics reject update error:", clinicsError);
    throw clinicsError;
  }

  // 2) возвращаем драфт в статус draft
  try {
    await supabase
      .from("clinic_profile_drafts")
      .update({
        status: "draft",
        // сюда потом можно добавить колонку для причины
      })
      .eq("clinic_id", clinicId);
  } catch (e) {
    console.warn("clinic_profile_drafts reject update warning:", e);
  }

  revalidatePath("/admin/moderation");
}
"""
app\(admin)\admin\moderation\detail\page.tsx: """
// app/(admin)/admin/moderation/detail/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/adminClient";
import { approveClinic, rejectClinic } from "../actions";
import { clinicPath } from "@/lib/clinic-url";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SearchParams = {
  id?: string;
};

type ModerationDetailProps = {
  // в Next 15 searchParams приходит как Promise
  searchParams: Promise<SearchParams>;
};

export default async function ModerationDetail({
  searchParams,
}: ModerationDetailProps) {
  const sp = await searchParams;
  const clinicId = sp.id;
  if (!clinicId) return notFound();

  const sb = createAdminClient();

  const [{ data: clinic, error: cErr }, { data: draft, error: dErr }] =
    await Promise.all([
      sb.from("clinics").select("*").eq("id", clinicId).maybeSingle(),
      sb
        .from("clinic_profile_drafts")
        .select("*")
        .eq("clinic_id", clinicId)
        .maybeSingle(),
    ]);

  if (cErr) throw cErr;
  if (!clinic) return notFound();
  if (dErr) throw dErr;

  // безопасная распаковка черновика
  const basic = (draft?.basic_info ?? {}) as any;

  const services: any[] = Array.isArray(draft?.services)
    ? (draft!.services as any[])
    : [];

  const doctors: any[] = Array.isArray(draft?.doctors)
    ? (draft!.doctors as any[])
    : [];

  const facilities = (draft?.facilities ?? {
    premises: [],
    clinic_services: [],
    travel_services: [],
    languages_spoken: [],
  }) as any;

  const hours: any[] = Array.isArray(draft?.hours)
    ? (draft!.hours as any[])
    : [];

  const gallery: any[] = Array.isArray(draft?.gallery)
    ? (draft!.gallery as any[])
    : [];

  const location = (draft?.location ?? {}) as any;

  // pricing → массив строк (названия методов)
  const payments: string[] = Array.isArray(draft?.pricing)
    ? (draft!.pricing as any[])
        .map((x) => {
          if (typeof x === "string") return x;
          if (x && typeof x.method === "string") return x.method;
          return null;
        })
        .filter(
          (v: unknown): v is string =>
            typeof v === "string" && v.trim().length > 0,
        )
    : [];

  const formatDateTime = (v?: string | null) =>
    v ? new Date(v).toLocaleString() : "-";

    const publicPath =
    clinic.slug &&
    (clinicPath({
      slug: clinic.slug,
      country: clinic.country ?? undefined,
      province: (clinic as any).province ?? undefined,
      city: clinic.city ?? undefined,
      district: (clinic as any).district ?? undefined,
    }) || `/clinic/${clinic.slug}`);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {clinic.name || "(no name)"}
          </h1>
          <p className="text-sm text-gray-500">
            Moderation overview for clinic draft
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          {publicPath && (
            <Link
              href={publicPath}
              className="rounded-full border border-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-50"
              target="_blank"
            >
              Open public page →
            </Link>
          )}
          <Link
            href="/admin/moderation"
            className="rounded-full border border-gray-200 px-3 py-1 text-blue-600 hover:bg-gray-50"
          >
            ← Back to list
          </Link>
        </div>
      </div>

      {/* SUMMARY CARD */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Clinic
            </div>
            <div className="text-lg font-semibold">{clinic.name}</div>
            <div className="text-xs text-gray-500">{clinic.slug}</div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Badge
              label="Moderation"
              value={clinic.moderation_status ?? "pending"}
            />
            <Badge label="Status" value={clinic.status ?? "draft"} />
            <Badge
              label="Published"
              value={clinic.is_published ? "Yes" : "No"}
              tone={clinic.is_published ? "success" : "neutral"}
            />
            {draft?.status && (
              <Badge label="Draft" value={draft.status} tone="info" />
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
          <InfoBlock
            title="Location"
            lines={[
              [undefined, [clinic.city, clinic.country].filter(Boolean).join(", ")],
              ["Address", clinic.address || "-"],
            ]}
          />
          <InfoBlock
            title="Meta"
            lines={[
              ["Clinic ID", clinic.id],
              ["Updated at", formatDateTime(clinic.updated_at as any)],
            ]}
          />
          <InfoBlock
            title="Draft meta"
            lines={[
              ["Status", (draft?.status as any) || "-"],
              ["Updated at", formatDateTime(draft?.updated_at as any)],
            ]}
          />
        </div>
      </div>

      {/* MAIN CONTENT PANEL */}
      <div className="space-y-8 rounded-2xl border bg-white p-6 shadow-sm">
        {/* BASIC + LOCATION */}
        <section className="space-y-4">
          <SectionHeader title="Basic information" />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 text-sm">
              <KV k="Name" v={basic.name} />
              <KV k="Slug (draft)" v={basic.slug} />
              <KV k="Specialty" v={basic.specialty} />
              <KV k="Country" v={basic.country} />
              <KV k="City" v={basic.city} />
              <KV k="Province" v={basic.province} />
              <KV k="District" v={basic.district} />
            </div>

            <div className="space-y-3 text-sm">
              <KV k="Google Maps URL" v={location.mapUrl} />
              <div>
                <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                  Description
                </div>
                <div className="whitespace-pre-wrap rounded-lg border bg-gray-50/60 px-3 py-2 text-sm leading-relaxed text-gray-800">
                  {basic.description || "—"}
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                  Directions
                </div>
                <div className="whitespace-pre-wrap rounded-lg border bg-gray-50/60 px-3 py-2 text-sm leading-relaxed text-gray-800">
                  {location.directions || "—"}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES + DOCTORS */}
        <section className="space-y-4">
          <SectionHeader
            title="Services & doctors"
            meta={`${services.length} service(s) • ${doctors.length} doctor(s)`}
          />

          <div className="grid gap-6 md:grid-cols-2">
            {/* Services */}
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Services ({services.length})
              </div>
              {!services.length ? (
                <EmptyHint>No services specified.</EmptyHint>
              ) : (
                <ul className="space-y-1 text-sm leading-relaxed">
                  {services.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-0.5 h-1 w-1 flex-shrink-0 rounded-full bg-gray-400" />
                      <span>
                        <span className="font-medium">{s?.name || "-"}</span>
                        {s?.price ? (
                          <>
                            {" "}
                            — {s.price} {s?.currency || ""}
                          </>
                        ) : null}
                        {s?.description ? (
                          <span className="text-gray-600">
                            {" "}
                            • {s.description}
                          </span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Doctors */}
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Doctors ({doctors.length})
              </div>
              {!doctors.length ? (
                <EmptyHint>No doctors specified.</EmptyHint>
              ) : (
                <ul className="space-y-1 text-sm leading-relaxed">
                  {doctors.map((d, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-0.5 h-1 w-1 flex-shrink-0 rounded-full bg-gray-400" />
                      <span>
                        <span className="font-medium">
                          {d?.fullName || d?.name || "-"}
                        </span>
                        {d?.title ? <> — {d.title}</> : null}
                        {d?.specialty ? (
                          <span className="text-gray-600">
                            {" "}
                            • {d.specialty}
                          </span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* FACILITIES / HOURS / PAYMENTS */}
        <section className="space-y-4">
          <SectionHeader title="Operations" />

          <div className="grid gap-6 lg:grid-cols-[2fr,1.5fr]">
            {/* Facilities */}
            <div className="space-y-4">
              <div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Facilities & languages
                </div>
                <div className="grid gap-3 text-sm md:grid-cols-2">
                  <TagRow label="Premises" values={facilities.premises} />
                  <TagRow
                    label="Clinic services"
                    values={facilities.clinic_services}
                  />
                  <TagRow
                    label="Travel services"
                    values={facilities.travel_services}
                  />
                  <TagRow
                    label="Languages"
                    values={facilities.languages_spoken}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Payment methods ({payments.length})
                </div>
                {!payments.length ? (
                  <EmptyHint>No payment methods specified.</EmptyHint>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {payments.map((p, i) => (
                      <span
                        key={i}
                        className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Hours */}
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Working hours
              </div>
              {!hours.length ? (
                <EmptyHint>No working hours specified.</EmptyHint>
              ) : (
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-2 py-1.5">Day</th>
                      <th className="px-2 py-1.5">Status</th>
                      <th className="px-2 py-1.5">Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hours.map((h, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="px-2 py-1.5">{h.day}</td>
                        <td className="px-2 py-1.5 text-gray-700">
                          {h.status || "—"}
                        </td>
                        <td className="px-2 py-1.5 text-gray-700">
                          {[h.start, h.end].filter(Boolean).join(" – ") || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>

        {/* GALLERY */}
        <section className="space-y-3">
          <SectionHeader title="Gallery" meta={`${gallery.length} image(s)`} />
          {!gallery.length ? (
            <EmptyHint>No images uploaded.</EmptyHint>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {gallery.map((g, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-xl border bg-gray-50"
                >
                  <div className="aspect-[4/3] bg-gray-100">
                    {g?.url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={g.url}
                        alt={g?.title || "Image"}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  {g?.title && (
                    <div className="truncate px-3 py-2 text-xs text-gray-600">
                      {g.title}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
        <div className="text-xs text-gray-500">
          Approve will publish clinic and sync data from this draft. Reject will
          return clinic to draft state.
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <form action={approveClinic}>
            <input type="hidden" name="clinicId" value={clinic.id} />
            <button className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700">
              Approve &amp; Publish
            </button>
          </form>

          <form action={rejectClinic} className="flex items-center gap-2">
            <input type="hidden" name="clinicId" value={clinic.id} />
            <input
              name="reason"
              placeholder="Reason"
              className="h-9 rounded-md border px-3 text-sm"
            />
            <button className="h-9 rounded-md border px-4 text-sm font-medium hover:bg-gray-50">
              Reject
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ===== small UI helpers ===== */

function SectionHeader({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </h2>
      {meta && <span className="text-xs text-gray-400">{meta}</span>}
    </div>
  );
}

function KV({ k, v }: { k: string; v?: string | null }) {
  return (
    <div className="flex gap-2 text-sm">
      <div className="w-28 shrink-0 text-xs font-medium uppercase tracking-wide text-gray-500">
        {k}
      </div>
      <div className="flex-1 text-gray-800">{v || "-"}</div>
    </div>
  );
}

function TagRow({ label, values }: { label: string; values?: string[] }) {
  const arr = Array.isArray(values) ? values : [];
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>
      {!arr.length ? (
        <div className="text-sm text-gray-400">—</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {arr.map((x, i) => (
            <span
              key={i}
              className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm"
            >
              {x}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Badge({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "success" | "info";
}) {
  const toneClasses =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "info"
      ? "border-sky-200 bg-sky-50 text-sky-700"
      : "border-gray-200 bg-gray-50 text-gray-700";

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs ${toneClasses}`}
    >
      <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
        {label}
      </span>
      <span className="text-xs">{value}</span>
    </div>
  );
}

function InfoBlock({
  title,
  lines,
}: {
  title: string;
  lines: ([string | undefined, string | null | undefined])[];
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </div>
      {lines.map(([label, value], i) =>
        label ? (
          <KV key={i} k={label} v={value ?? undefined} />
        ) : (
          <div key={i} className="text-sm text-gray-800">
            {value || "-"}
          </div>
        ),
      )}
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
      {children}
    </div>
  );
}
"""
app\(admin)\admin\moderation\[id].tsx: """
// app/(admin)/admin/moderation/[id]/page.tsx

import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/adminClient";
import { approveClinic, rejectClinic } from "./actions";
import { clinicPath } from "@/lib/clinic-url";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const dynamicParams = true;

export default async function ModerationDetail({
  params,
}: {
  params: { id: string };
}) {
  const sb = createAdminClient();
  const id = params.id;

  // пробуем забрать клинику + драфт
  const [{ data: clinic, error: cErr }, { data: draft, error: dErr }] =
    await Promise.all([
      sb
        .from("clinics")
        .select("*")
        .eq("id", id)
        .maybeSingle(), // <= maybeSingle, чтобы не падать
      sb
        .from("clinic_profile_drafts")
        .select("*")
        .eq("clinic_id", id)
        .maybeSingle(),
    ]);

  if (cErr || dErr) {
    return (
      <div className="p-6">
        <h1 className="mb-4 text-xl font-semibold">Moderation detail error</h1>
        <pre className="rounded-lg bg-red-50 p-4 text-xs text-red-700 whitespace-pre-wrap">
          {cErr && `clinics error: ${cErr.message}\n\n`}
          {dErr && `drafts error: ${dErr.message}\n\n`}
        </pre>
        <Link href="/admin/moderation" className="mt-4 inline-block text-blue-600">
          ← Back to list
        </Link>
      </div>
    );
  }

  // если клиника не найдена — покажем сообщение, но НЕ 404
  if (!clinic) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-semibold">Clinic not found</h1>
        <p className="text-sm text-gray-600">
          We could not find a clinic with id: <code className="font-mono">{id}</code>
        </p>
        <Link href="/admin/moderation" className="text-blue-600 hover:underline">
          ← Back to list
        </Link>
      </div>
    );
  }

  const c: any = clinic;

  // URL публичной страницы
  const publicPath =
    c.slug &&
    (clinicPath({
      slug: c.slug,
      country: c.country,
      province: c.province ?? undefined,
      city: c.city ?? undefined,
      district: c.district ?? undefined,
    }) || `/clinic/${c.slug}`);

  // распаковка драфта
  const basic = (draft?.basic_info ?? {}) as any;
  const services = Array.isArray(draft?.services) ? (draft!.services as any[]) : [];
  const doctors = Array.isArray(draft?.doctors) ? (draft!.doctors as any[]) : [];
  const facilities = (draft?.facilities ?? {
    premises: [],
    clinic_services: [],
    travel_services: [],
    languages_spoken: [],
  }) as any;
  const hours = Array.isArray(draft?.hours) ? (draft!.hours as any[]) : [];
  const gallery = Array.isArray(draft?.gallery) ? (draft!.gallery as any[]) : [];
  const location = (draft?.location ?? {}) as any;
  const payments = Array.isArray(draft?.pricing) ? (draft!.pricing as any[]) : [];

  return (
    <div className="space-y-6 p-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{c.name || "(no name)"}</h1>
        <div className="flex items-center gap-4">
          {publicPath && (
            <Link
              href={publicPath}
              className="text-sm text-gray-600 hover:underline"
              target="_blank"
            >
              Open public page →
            </Link>
          )}
          <Link
            href="/admin/moderation"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to list
          </Link>
        </div>
      </div>

      {/* iframe-предпросмотр */}
      {publicPath && (
        <Card title="Public page preview">
          <div className="aspect-[16/9] w-full overflow-hidden rounded-lg border bg-gray-50">
            <iframe
              src={publicPath}
              className="h-full w-full border-0"
              loading="lazy"
            />
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Clinic">
          <KV k="ID" v={c.id} />
          <KV k="Slug" v={c.slug} />
          <KV
            k="Moderation / Status"
            v={`${c.moderation_status} / ${c.status}`}
          />
          <KV k="Published" v={String(Boolean(c.is_published))} />
          <KV
            k="Location"
            v={[c.city, c.country].filter(Boolean).join(", ")}
          />
          <KV k="Address" v={c.address} />
          <KV k="Map URL" v={c.map_embed_url || "(empty)"} />
          <KV k="Updated" v={c.updated_at as any} />
        </Card>

        <Card title="Draft meta">
          <KV k="Draft status" v={(draft?.status as any) || "-"} />
          <KV k="Updated at" v={(draft?.updated_at as any) || "-"} />
          {!draft && (
            <div className="text-sm text-gray-500">No draft yet.</div>
          )}
        </Card>

        <Card title="Basic (draft)">
          <KV k="Name" v={basic.name} />
          <KV k="Slug" v={basic.slug} />
          <KV k="Specialty" v={basic.specialty} />
          <KV k="Country" v={basic.country} />
          <KV k="City" v={basic.city} />
          <KV k="Province" v={basic.province} />
          <KV k="District" v={basic.district} />
          <div className="mt-2 text-sm">
            <div className="mb-1 text-gray-500">Description</div>
            <div className="whitespace-pre-wrap">
              {basic.description || "-"}
            </div>
          </div>
        </Card>

        <Card title="Location (draft)">
          <KV k="Google Maps URL" v={location.mapUrl} />
          <div className="mt-2 text-sm">
            <div className="mb-1 text-gray-500">Directions</div>
            <div className="whitespace-pre-wrap">
              {location.directions || "-"}
            </div>
          </div>
        </Card>

        <Card title={`Services (${services.length})`}>
          {!services.length ? (
            <div className="text-sm text-gray-500">No services.</div>
          ) : (
            <ul className="space-y-1 list-disc pl-5 text-sm">
              {services.map((s, i) => (
                <li key={i}>
                  <span className="font-medium">{s?.name || "-"}</span>
                  {s?.price ? ` — ${s.price} ${s?.currency || ""}` : ""}
                  {s?.description ? ` • ${s.description}` : ""}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title={`Doctors (${doctors.length})`}>
          {!doctors.length ? (
            <div className="text-sm text-gray-500">No doctors.</div>
          ) : (
            <ul className="space-y-1 list-disc pl-5 text-sm">
              {doctors.map((d, i) => (
                <li key={i}>
                  <span className="font-medium">
                    {d?.fullName || d?.name || "-"}
                  </span>
                  {d?.title ? ` — ${d.title}` : ""}
                  {d?.specialty ? ` • ${d.specialty}` : ""}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Facilities & Languages">
          <TagRow label="Premises" values={facilities.premises} />
          <TagRow label="Clinic services" values={facilities.clinic_services} />
          <TagRow label="Travel services" values={facilities.travel_services} />
          <TagRow label="Languages" values={facilities.languages_spoken} />
        </Card>

        <Card title={`Hours (${hours.length})`}>
          {!hours.length ? (
            <div className="text-sm text-gray-500">No working hours.</div>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {hours.map((h, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-1 pr-3">{h.day}</td>
                    <td className="py-1 pr-3">{h.status}</td>
                    <td className="py-1">
                      {[h.start, h.end].filter(Boolean).join(" - ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title={`Payments (${payments.length})`}>
          {!payments.length ? (
            <div className="text-sm text-gray-500">No payment methods.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {payments.map((p, i) => (
                <span
                  key={i}
                  className="rounded-full bg-gray-100 px-2 py-1 text-sm"
                >
                  {String(p)}
                </span>
              ))}
            </div>
          )}
        </Card>

        <Card title={`Gallery (${gallery.length})`}>
          {!gallery.length ? (
            <div className="text-sm text-gray-500">No images.</div>
          ) : (
            <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
              {gallery.map((g, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-lg border"
                >
                  <div className="aspect-[4/3] bg-gray-100">
                    {g?.url && (
                      <img
                        src={g.url}
                        alt={g?.title || "Image"}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  {g?.title && (
                    <div className="truncate px-2 py-1 text-xs text-gray-600">
                      {g.title}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <form action={approveClinic}>
          <input type="hidden" name="clinicId" value={c.id} />
          <button className="rounded-md bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700">
            Approve & Publish
          </button>
        </form>

        <form action={rejectClinic} className="flex items-center gap-2">
          <input type="hidden" name="clinicId" value={c.id} />
          <input
            name="reason"
            placeholder="Reason"
            className="rounded-md border px-2 py-2 text-sm"
          />
          <button className="rounded-md border px-3 py-2 hover:bg-gray-50">
            Reject
          </button>
        </form>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="mb-2 text-sm text-gray-500">{title}</div>
      {children}
    </div>
  );
}

function KV({ k, v }: { k: string; v?: string | null }) {
  return (
    <div className="flex gap-2 text-sm">
      <div className="w-40 text-gray-500">{k}</div>
      <div className="flex-1 break-words">{v || "-"}</div>
    </div>
  );
}

function TagRow({ label, values }: { label: string; values?: string[] }) {
  const arr = Array.isArray(values) ? values : [];
  return (
    <div className="mb-2">
      <div className="mb-1 text-xs text-gray-500">{label}</div>
      {!arr.length ? (
        <div className="text-sm text-gray-500">—</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {arr.map((x, i) => (
            <span
              key={i}
              className="rounded-full bg-gray-100 px-2 py-1 text-sm"
            >
              {x}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
"""
next.config.js: """
/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  reactStrictMode: true,

  experimental: {
    optimizePackageImports: [
      '@heroui/react',
      '@iconify/react',
      'react-i18next',
      'framer-motion',
    ],
    ppr: false,
  },

  serverExternalPackages: ['@supabase/supabase-js'],

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          heroui: {
            test: /[\\/]node_modules[\\/]@heroui[\\/]/,
            name: 'heroui',
            chunks: 'all',
            priority: 10,
          },
          supabase: {
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            name: 'supabase',
            chunks: 'all',
            priority: 10,
          },
        },
      }
    }

    config.optimization.usedExports = true
    config.resolve.alias['@'] = path.resolve(__dirname)

    return config
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline'; object-src 'none';",
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/_next/static/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },

  /**
   * ВАЖНО:
   * - clinic rewrites делаем afterFiles, чтобы НЕ перехватывать реальные /api/** роуты
   * - исключаем зарезервированные префиксы из :country, чтобы даже теоретически не матчить /api, /customer, /patient и т.д.
   * - используем :path* чтобы поддержать любую глубину country/province/city/district/...
   * - порядок: review/inquiry ПЕРЕД detail (иначе detail схватит "inquiry" как slug)
   */
  async rewrites() {
    const RESERVED =
  'api|_next|static|favicon\\.ico|robots\\.txt|sitemap\\.xml|manifest\\.json|customer|patient|partner|admin|login|auth|settings|labs|ref' +
  '|dentistry|plastic-surgery|hair-transplant|crowns|veneers|dental-implants';

    const country = `:country((?!${RESERVED})(?:[^/]+))`;

    const clinicRewrites = [
      { source: `/${country}/:path*/:slug/review`, destination: '/clinic/:slug/review' },
      { source: `/${country}/:path*/:slug/inquiry`, destination: '/clinic/:slug/inquiry' },
      { source: `/${country}/:path*/:slug`, destination: '/clinic/:slug' },
    ];

    return { afterFiles: clinicRewrites, fallback: [] };
  },

  // async redirects() {
  //   return [
  //     {
  //       source:
  //         '/:category(dentistry|plastic-surgery|hair-transplant|crowns|veneers|dental-implants)/:country/:province?/:city?/:district?/:clinic',
  //       destination: '/clinic/:clinic',
  //       permanent: false,
  //     },
  //   ]
  // },

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'encrypted-tbn0.gstatic.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'cdn.whatclinic.com' },
      { protocol: 'https', hostname: 'www.whatclinic.com' },
      { protocol: 'https', hostname: 'whatclinic.com' },
      { protocol: 'https', hostname: 'atlantis-dental.ru' },
      { protocol: 'https', hostname: 'pixsector.com' },
      { protocol: 'https', hostname: 'img.icons8.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.in' },
    ],
  },
}

module.exports = nextConfig
"""
middleware.ts: """
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const LOC_KIND_ORDER = ["country", "province", "city", "district"] as const;
type NodeKind = (typeof LOC_KIND_ORDER)[number];

const CATEGORY_PREFIXES = new Set([
  "dentistry",
  "plastic-surgery",
  "hair-transplant",
  "crowns",
  "veneers",
  // если вдруг это реально категория — оставь, если нет — можно убрать
  "dental-implants",
]);

function splitPath(pathname: string) {
  return pathname.split("/").filter(Boolean);
}

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // ---------------------------
  // 1) SMART redirect for legacy clinic urls:
  // /{category}/{country}/{...maybeLocation}/{clinicSlug}
  // but NOT for filters (/category/treatment/... or /category/country/province)
  // ---------------------------
  {
    const segs = splitPath(pathname);
    const maybeCategory = segs[0];

    if (maybeCategory && CATEGORY_PREFIXES.has(maybeCategory)) {
      const tail = segs.slice(1);

      // минимум 2 сегмента после категории, иначе это точно не "клиника"
      if (tail.length >= 2) {
        const res = NextResponse.next();

        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              getAll: () =>
                req.cookies.getAll().map((c) => ({ name: c.name, value: c.value })),
              setAll: (all: Array<{ name: string; value: string; options?: any }>) =>
                all.forEach((cookie) =>
                  res.cookies.set(cookie.name, cookie.value, cookie.options),
                ),
            },
          },
        );

        // category id
        const { data: cat } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", maybeCategory)
          .maybeSingle();

        const categoryId = Number((cat as any)?.id || 0);
        if (categoryId) {
          // 1) try to consume location path
          let parentId: number | null = null;
          let idx = 0;

          for (let k = 0; k < LOC_KIND_ORDER.length && idx < tail.length; ) {
            const kind = LOC_KIND_ORDER[k];
            const seg = tail[idx];

            let q = supabase
              .from("category_location_nodes")
              .select("id")
              .eq("category_id", categoryId)
              .eq("kind", kind)
              .eq("slug", seg);

            parentId === null ? q = q.is("parent_id", null) : q = q.eq("parent_id", parentId);

            const { data } = await q.maybeSingle();

            if (data?.id) {
              parentId = Number((data as any).id);
              idx += 1;
              k += 1;
            } else {
              // allow skipping levels (как у тебя в клиенте)
              k += 1;
            }
          }

          const remaining = tail.slice(idx);

          // если после локации осталось НЕ ровно 1 — это фильтры (тритменты/глубже) → не редиректим
          if (remaining.length === 1) {
            const candidate = remaining[0];

            // A) если candidate — это локация следующего уровня, то это фильтр → не редиректим
            // проверяем candidate как child location node
            {
              let isLocation = false;
              for (const kind of LOC_KIND_ORDER) {
                // ищем candidate как ноду любого kind, но с правильным parent_id
                let q = supabase
                  .from("category_location_nodes")
                  .select("id")
                  .eq("category_id", categoryId)
                  .eq("slug", candidate);

                parentId === null ? q = q.is("parent_id", null) : q = q.eq("parent_id", parentId);

                const { data } = await q.maybeSingle();
                if (data?.id) {
                  isLocation = true;
                  break;
                }
              }
              if (isLocation) return res;
            }

            // B) если candidate — это подкатегория (treatment node), то это фильтр → не редиректим
            {
              const { data: sub } = await supabase
                .from("category_subcategory_nodes")
                .select("id")
                .eq("category_id", categoryId)
                .eq("slug", candidate)
                .maybeSingle();

              if (sub?.id) return res;
            }

            // C) иначе проверяем, существует ли клиника с таким slug → тогда редиректим
            const { data: clinic } = await supabase
              .from("clinics")
              .select("id")
              .eq("slug", candidate)
              .maybeSingle();

            if (clinic?.id) {
              const url = req.nextUrl.clone();
              url.pathname = `/clinic/${candidate}`;
              url.search = ""; // можно сохранить search если нужно
              return NextResponse.redirect(url);
            }
          }
        }

        // по умолчанию — ничего не делаем
        return res;
      }
    }
  }

  // ---------------------------
  // 2) твоя текущая auth логика (НЕ трогаем)
  // ---------------------------
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () =>
          req.cookies.getAll().map((c) => ({
            name: c.name,
            value: c.value,
          })),
        setAll: (all: Array<{ name: string; value: string; options?: any }>) =>
          all.forEach((cookie) =>
            res.cookies.set(cookie.name, cookie.value, cookie.options),
          ),
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute = pathname.startsWith("/auth");
  const isAdminRoute = pathname.startsWith("/admin");
  const isCustomerRoute = pathname.startsWith("/customer");
  const isPartnerRoute = pathname.startsWith("/partner");
  const isPatientRoute = pathname.startsWith("/patient");

  let isAdmin = false;

  if (user) {
    const metaRoles =
      ((user.app_metadata?.roles as string[] | undefined) ?? []).map((r) =>
        String(r).toUpperCase(),
      );
    if (metaRoles.includes("ADMIN")) {
      isAdmin = true;
    }

    if (!isAdmin) {
      const { data: rows, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (!error && rows?.length) {
        if (rows.some((r) => r.role?.toUpperCase() === "ADMIN")) {
          isAdmin = true;
        }
      }
    }
  }

  if (isAuthRoute && user) {
    const next =
      searchParams.get("next") ||
      (isAdmin
        ? "/admin"
        : isCustomerRoute
        ? "/customer"
        : isPartnerRoute
        ? "/partner"
        : isPatientRoute
        ? "/patient"
        : "/");
    return NextResponse.redirect(new URL(next, req.url));
  }

  if (!user && (isAdminRoute || isCustomerRoute || isPartnerRoute || isPatientRoute)) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);

    const asParam = isAdminRoute
      ? "ADMIN"
      : isPartnerRoute
      ? "PARTNER"
      : isCustomerRoute
      ? "CUSTOMER"
      : isPatientRoute
      ? "PATIENT"
      : "GUEST";

    loginUrl.searchParams.set("as", asParam);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/auth/:path*",
    "/admin/:path*",
    "/customer/:path*",
    "/partner/:path*",
    "/patient/:path*",

    // важно: чтобы наш "умный редирект" срабатывал
    "/(dentistry|plastic-surgery|hair-transplant|crowns|veneers|dental-implants)/:path*",
  ],
};
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
    "column_default": "false"
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
public.clinic_profile_drafts: """
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
    "column_name": "status",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "NO",
    "column_default": "'draft'::text"
  },
  {
    "ordinal_position": 3,
    "column_name": "basic_info",
    "data_type": "jsonb",
    "udt_or_enum": "jsonb",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 4,
    "column_name": "services",
    "data_type": "jsonb",
    "udt_or_enum": "jsonb",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 5,
    "column_name": "doctors",
    "data_type": "jsonb",
    "udt_or_enum": "jsonb",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 6,
    "column_name": "facilities",
    "data_type": "jsonb",
    "udt_or_enum": "jsonb",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 7,
    "column_name": "hours",
    "data_type": "jsonb",
    "udt_or_enum": "jsonb",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 8,
    "column_name": "gallery",
    "data_type": "jsonb",
    "udt_or_enum": "jsonb",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 9,
    "column_name": "location",
    "data_type": "jsonb",
    "udt_or_enum": "jsonb",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 10,
    "column_name": "pricing",
    "data_type": "jsonb",
    "udt_or_enum": "jsonb",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 11,
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "udt_or_enum": "timestamptz",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "NO",
    "column_default": "now()"
  }
]
"""
public.moderation_queue_v2: """
[
  {
    "ordinal_position": 1,
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
    "ordinal_position": 2,
    "column_name": "name",
    "data_type": "text",
    "udt_or_enum": "text",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
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
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "ordinal_position": 4,
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
    "ordinal_position": 5,
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
    "ordinal_position": 6,
    "column_name": "moderation_status",
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
    "column_name": "draft_status",
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
    "column_name": "draft_updated_at",
    "data_type": "timestamp with time zone",
    "udt_or_enum": "timestamptz",
    "character_maximum_length": null,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_nullable": "YES",
    "column_default": null
  }
]
"""
функции:
publish_clinic_from_draft: """
declare
  d record;
  v_specialty_slug text;
  v_category_id    integer;
  -- локальный helper-выражение для slug (используем как инлайн-функцию)
  -- Пример: select slugify('  --Эндо*процедура!! ') -> 'endoprocedura'
  -- NB: внутри plpgsql нельзя объявить SQL-функцию, поэтому просто дублируем выражение там, где нужно.
begin
  -- 0) забираем черновик
  select *
    into d
  from public.clinic_profile_drafts
  where clinic_id = p_clinic_id;

  if not found then
    raise exception 'Draft not found for clinic %', p_clinic_id;
  end if;

  -- 1) чистим боевые таблицы
  delete from public.clinic_services       where clinic_id = p_clinic_id;
  delete from public.clinic_staff          where clinic_id = p_clinic_id;
  delete from public.clinic_images         where clinic_id = p_clinic_id;
  delete from public.clinic_hours          where clinic_id = p_clinic_id;
  delete from public.clinic_accreditations where clinic_id = p_clinic_id;

  ---------------------------------------------------------------------------
  -- 2) SERVICES: d.services -> services (upsert по slug) -> clinic_services
  ---------------------------------------------------------------------------
  insert into public.services (name, slug, description)
  select
    s->>'name' as name,
    lower(
      regexp_replace(
        regexp_replace(unaccent(coalesce(s->>'slug', s->>'name')), '[^A-Za-z0-9]+', '-', 'g'),
        '(^-|-$)', '', 'g'
      )
    ) as slug,
    nullif(s->>'description','') as description
  from jsonb_array_elements(coalesce(d.services, '[]'::jsonb)) as s
  on conflict (slug) do update
    set name        = excluded.name,
        description = coalesce(excluded.description, services.description);

  insert into public.clinic_services (clinic_id, service_id, price, currency)
  select
    p_clinic_id,
    sv.id,
    nullif((s->>'price')::numeric, 0)::numeric,
    coalesce(nullif(s->>'currency',''), 'USD')
  from jsonb_array_elements(coalesce(d.services, '[]'::jsonb)) as s
  join public.services sv
    on sv.slug = lower(
      regexp_replace(
        regexp_replace(unaccent(coalesce(s->>'slug', s->>'name')), '[^A-Za-z0-9]+', '-', 'g'),
        '(^-|-$)', '', 'g'
      )
    );

  ---------------------------------------------------------------------------
  -- 3) STAFF: d.doctors -> clinic_staff
  ---------------------------------------------------------------------------
  insert into public.clinic_staff (id, clinic_id, name, title, bio, languages, photo_url, position)
  select
    gen_random_uuid(),
    p_clinic_id,
    nullif(s->>'fullName',''),
    nullif(s->>'title',''),
    nullif(s->>'description',''),
    '{}'::text[],
    nullif(s->>'photo',''),
    nullif(s->>'specialty','')
  from jsonb_array_elements(coalesce(d.doctors, '[]'::jsonb)) as s;

  ---------------------------------------------------------------------------
  -- 4) GALLERY: d.gallery -> clinic_images (порядок через WITH ORDINALITY)
  ---------------------------------------------------------------------------
  with gallery_images as (
    select
      p_clinic_id                 as clinic_id,
      g.elem->>'url'              as url,
      g.ord::int                  as ord,
      nullif(g.elem->>'title','') as title
    from jsonb_array_elements(coalesce(d.gallery, '[]'::jsonb))
         with ordinality as g(elem, ord)
    where g.elem->>'url' is not null
      and g.elem->>'url' <> ''
  ),
  uniq_gallery as (
    -- убираем дубли по (clinic_id, url), берём первую по порядку ord
    select distinct on (clinic_id, url)
      clinic_id,
      url,
      ord,
      title
    from gallery_images
    order by clinic_id, url, ord
  )
  insert into public.clinic_images (id, clinic_id, url, sort, title, created_at)
  select
    gen_random_uuid(),
    clinic_id,
    url,
    ord,
    title,
    now()
  from uniq_gallery
  on conflict (clinic_id, url) do update
  set
    sort  = excluded.sort,
    title = coalesce(excluded.title, clinic_images.title);

  ---------------------------------------------------------------------------
  -- 5) HOURS: d.hours -> clinic_hours
  ---------------------------------------------------------------------------
  insert into public.clinic_hours (id, clinic_id, weekday, open, close, is_closed, dow, hours_text)
  select
    gen_random_uuid(),
    p_clinic_id,
    case upper(left(h->>'day',3))
      when 'MON' then 1 when 'TUE' then 2 when 'WED' then 3
      when 'THU' then 4 when 'FRI' then 5 when 'SAT' then 6
      when 'SUN' then 7 else 1 end as weekday,
    case when coalesce(h->>'status','Open') = 'Open' then nullif(h->>'start','')::time end as open,
    case when coalesce(h->>'status','Open') = 'Open' then nullif(h->>'end','')::time end   as close,
    case when coalesce(h->>'status','Open') = 'Closed' then true else false end            as is_closed,
    case upper(left(h->>'day',3))
      when 'MON' then 1 when 'TUE' then 2 when 'WED' then 3
      when 'THU' then 4 when 'FRI' then 5 when 'SAT' then 6
      when 'SUN' then 7 else 1 end as dow,
    case when coalesce(h->>'status','Open') = 'Closed'
         then (upper(left(h->>'day',3)) || ': Closed')
         else (upper(left(h->>'day',3)) || ': ' ||
               coalesce(nullif(h->>'start',''),'') || ' - ' ||
               coalesce(nullif(h->>'end',''),''))
    end
  from jsonb_array_elements(coalesce(d.hours, '[]'::jsonb)) as h;

  ---------------------------------------------------------------------------
  -- 6) ACCREDITATIONS: facilities.accreditations -> accreditations -> link
  ---------------------------------------------------------------------------
  insert into public.accreditations (name, country, description, logo_url, slug)
  select
    a->>'name',
    null,
    nullif(a->>'description',''),
    nullif(a->>'logo_url',''),
    lower(
      regexp_replace(
        regexp_replace(unaccent(coalesce(a->>'slug', a->>'name')), '[^A-Za-z0-9]+', '-', 'g'),
        '(^-|-$)', '', 'g'
      )
    ) as slug
  from jsonb_array_elements(coalesce(d.facilities->'accreditations', '[]'::jsonb)) as a
  on conflict (slug) do update
    set name        = excluded.name,
        description = coalesce(excluded.description, accreditations.description),
        logo_url    = coalesce(excluded.logo_url,    accreditations.logo_url);

  insert into public.clinic_accreditations (clinic_id, accreditation_id)
  select p_clinic_id, acc.id
  from jsonb_array_elements(coalesce(d.facilities->'accreditations', '[]'::jsonb)) as a
  join public.accreditations acc
    on acc.slug = lower(
      regexp_replace(
        regexp_replace(unaccent(coalesce(a->>'slug', a->>'name')), '[^A-Za-z0-9]+', '-', 'g'),
        '(^-|-$)', '', 'g'
      )
    );

  ---------------------------------------------------------------------------
  -- 6.5) CATEGORY LINK: по slug из basic_info.specialty
  ---------------------------------------------------------------------------
  v_specialty_slug := nullif(trim((d.basic_info->>'specialty')::text), '');

  if v_specialty_slug is not null then
    select id
      into v_category_id
    from public.categories
    where slug = v_specialty_slug
    limit 1;

    if v_category_id is not null then
      delete from public.clinic_categories
      where clinic_id = p_clinic_id
        and category_id <> v_category_id;

      insert into public.clinic_categories (clinic_id, category_id)
      values (p_clinic_id, v_category_id)
      on conflict (clinic_id, category_id) do nothing;
    end if;
  end if;

  ---------------------------------------------------------------------------
  -- 7) Флаги публикации + бейджи партнёра в clinics
  ---------------------------------------------------------------------------
  update public.clinics
  set is_published          = true,
      moderation_status     = 'approved',
      status                = 'published',
      verified_by_medtravel = true,
      is_official_partner   = true
  where id = p_clinic_id;
end
"""
reject_clinic_draft: """

begin
  if not public.is_admin() then
    raise exception 'Only ADMIN can reject' using errcode = '42501';
  end if;

  -- обновляем очередь модерации
  update public.moderation_queue_v2
  set status        = 'rejected',
      reject_reason = coalesce(p_reason, ''),
      processed_at  = now()
  where clinic_id = p_clinic_id;   -- <-- тут подставь свой ключ, если отличается

  -- опционально: помечаем сам драфт
  update public.clinic_profile_drafts
  set status = 'draft'
  where clinic_id = p_clinic_id;   -- или id = p_clinic_id, см. твою схему
end;
"""
approve_clinic: """

declare
  v_clinic_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Only ADMIN can approve' using errcode = '42501';
  end if;

  -- 1) берём черновик
  perform 1 from public.clinic_profile_drafts d where d.id = p_draft_id;
  if not found then
    raise exception 'Draft not found' using errcode = '22023';
  end if;

  -- 2) создаём/обновляем clinics (пример: upsert по clinic_id из драфта)
  insert into public.clinics as c (id, name, url_slug, country, city, address, status, published_at)
  select
      coalesce(d.clinic_id, gen_random_uuid()) as id,
      d.clinic_name,
      d.url_slug,
      d.country,
      d.city,
      d.full_address,
      'published',
      now()
  from public.clinic_profile_drafts d
  where d.id = p_draft_id
  on conflict (id) do update set
      name = excluded.name,
      url_slug = excluded.url_slug,
      country = excluded.country,
      city = excluded.city,
      address = excluded.address,
      status = 'published',
      published_at = now()
  returning c.id into v_clinic_id;

  -- 3) переносим услуги/изображения, если есть отдельные таблицы черновика
  --    (оставь или закомментируй, если не используешь draft-версии этих таблиц)

  insert into public.clinic_services (clinic_id, service_code, price_from, price_to, currency)
  select v_clinic_id, s.service_code, s.price_from, s.price_to, s.currency
  from public.clinic_services_draft s
  where s.draft_id = p_draft_id
  on conflict (clinic_id, service_code) do update set
    price_from = excluded.price_from,
    price_to   = excluded.price_to,
    currency   = excluded.currency;

  insert into public.clinic_images (clinic_id, storage_path, kind, sort)
  select v_clinic_id, i.storage_path, i.kind, i.sort
  from public.clinic_images_draft i
  where i.draft_id = p_draft_id
  on conflict (clinic_id, storage_path) do nothing;

  -- 4) помечаем очередь модерации
  update public.moderation_queue_v2 mq
  set status = 'approved', processed_at = now(), clinic_id = v_clinic_id
  where mq.draft_id = p_draft_id;

  -- 5) (опционально) удаляем черновик
  -- delete from public.clinic_profile_drafts where id = p_draft_id;

  return v_clinic_id;
end;
"""


-------------------------------------

отлично, теперь идем дальше. нам нужно создать новый раздел в партнерской панели с таким путем - app\(partner)\partner\leads\page.tsx, (в сайдбаре я его уже добавил). в этот раздел должны будут приходить лиды, сейчас объясню как. вот каким должен быть флоу: пользователь заполняет и отправляет форму на нашем лендинге, данные с формы у нас уже приходят в раздел админ панели Partner Leads(до этого момента мы уже реализовали), далее админ должен вручную распределить этот лид кому-то из партнеров и уже выбранному партнеру в раздел Leads его партнерской панели должен прийти его лид. то есть из готового раздела Partner Leads в админ панели нужно сделать раздел управления лидами, чтобы не только собирать эти лиды, но и распределять их партнерам. сейчас мы будем реализовывать ручное распределение лидов, но в последствии дойдем и до автоматического распределения, так что имей в виду при реализации. также смотри скриншоты, в админ панели у нас еще есть раздел Partners, в котором находятся зарегистрированные партнеры(в кратце объясню, это пользователи которые зарегистрировались партнерами и подали заявку на какую-либо программу, эта заявка пришла админу в раздел Partners и в нем уже админ модерирует его заявку на получение реферальной ссылки на конкретную программу, их всего две: для категории Dentistry и категории Hair Transplant). сам функционал распределения реализуем в разделе Partner Leads, партнеры для распределения будут браться из supabase, то есть пользователи у которых роль partner. еще я тебе загрузил файл lib\supabase\types.ts типов таблиц и тд. из supabase, прочитай, изучи его, там много чего есть. components\admin\PartnerLeadsClient.tsx: """ "use client"; import { useEffect, useMemo, useState } from "react"; type Row = { id: string; source: string; full_name: string; phone: string; email: string; age: number | null; image_paths: string[]; status: string; admin_note: string | null; created_at: string; }; function fmt(dt?: string | null) { if (!dt) return "—"; try { return new Date(dt).toLocaleString(); } catch { return dt; } } export default function PartnerLeadsClient() { const [status, setStatus] = useState<"all" | "new">("all"); const [q, setQ] = useState(""); const [items, setItems] = useState<Row[]>([]); const [total, setTotal] = useState(0); const [limit] = useState(20); const [offset, setOffset] = useState(0); const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null); // modal const [attachOpen, setAttachOpen] = useState(false); const [attachUrls, setAttachUrls] = useState<string[]>([]); const [attachTitle, setAttachTitle] = useState("Images"); const [activeIdx, setActiveIdx] = useState(0); const canPrev = offset > 0; const canNext = offset + limit < total; const queryUrl = useMemo(() => { const sp = new URLSearchParams(); sp.set("status", status); if (q.trim()) sp.set("q", q.trim()); sp.set("limit", String(limit)); sp.set("offset", String(offset)); return /api/admin/partner-leads?${sp.toString()}; }, [status, q, limit, offset]); async function readError(res: Response) { const ct = res.headers.get("content-type") ?? ""; if (ct.includes("application/json")) { const j = await res.json().catch(() => null); return j?.error ? String(j.error) : JSON.stringify(j); } return ${res.status} ${res.statusText}; } async function load() { setError(null); setBusy(true); try { const res = await fetch(queryUrl, { cache: "no-store" }); if (!res.ok) throw new Error(await readError(res)); const json = await res.json().catch(() => ({})); setItems(json.items ?? []); setTotal(Number(json.total ?? 0)); } catch (e: any) { setError(String(e?.message ?? e)); } finally { setBusy(false); } } useEffect(() => { load(); // eslint-disable-next-line react-hooks/exhaustive-deps }, [queryUrl]); async function openImages(r: Row) { setBusy(true); setError(null); try { const paths = (r.image_paths ?? []) .map((p) => String(p ?? "").trim()) .filter(Boolean) .slice(0, 3); if (!paths.length) { setAttachTitle(Images for ${r.full_name}); setAttachUrls([]); setAttachOpen(true); return; } // ВАЖНО: endpoint возвращает image bytes, поэтому URL = сам endpoint с path const urls = paths.map( (p) => /api/admin/partner-leads/images?path=${encodeURIComponent(p)} ); setAttachTitle(Images for ${r.full_name}); setAttachUrls(urls); setActiveIdx(0); setAttachOpen(true); } catch (e: any) { setError(String(e?.message ?? e)); } finally { setBusy(false); } } useEffect(() => { if (!attachOpen) return; const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setAttachOpen(false); setAttachUrls([]); setActiveIdx(0); } }; document.addEventListener("keydown", onKey); const prev = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; }; }, [attachOpen]); return ( <div className="p-6 space-y-5"> <div className="flex items-start justify-between gap-4"> <div> <h1 className="text-xl font-semibold">Partner Leads</h1> <p className="text-sm text-slate-500">Leads from landing forms</p> </div> <button onClick={() => load()} disabled={busy} className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60" > Refresh </button> </div> {error ? ( <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"> {error} </div> ) : null} <div className="rounded-2xl border bg-white p-4 space-y-4"> <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"> <div className="flex gap-2 flex-wrap"> {(["all", "new"] as const).map((s) => ( <button key={s} onClick={() => { setOffset(0); setStatus(s); }} className={[ "rounded-full px-3 py-1 text-sm border", status === s ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-200 hover:bg-slate-50", ].join(" ")} > {s} </button> ))} </div> <div className="flex gap-2"> <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name / phone / email..." className="h-9 w-72 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200" /> <button disabled={busy} onClick={() => { setOffset(0); load(); }} className="h-9 rounded-lg border border-slate-200 px-3 text-sm hover:bg-slate-50 disabled:opacity-60" > Search </button> </div> </div> <div className="text-sm text-slate-500"> Showing <b>{items.length}</b> of <b>{total}</b> </div> <div className="overflow-x-auto"> <table className="w-full text-sm"> <thead> <tr className="text-left border-b"> <th className="py-2 pr-3">Name</th> <th className="py-2 pr-3">Phone</th> <th className="py-2 pr-3">Email</th> <th className="py-2 pr-3">Age</th> <th className="py-2 pr-3">Created</th> <th className="py-2 pr-3">Images</th> <th className="py-2 pr-3">Source</th> </tr> </thead> <tbody> {items.map((r) => ( <tr key={r.id} className="border-b last:border-b-0"> <td className="py-3 pr-3"> <div className="font-medium text-slate-900">{r.full_name}</div> <div className="text-xs text-slate-500">{r.id}</div> </td> <td className="py-3 pr-3">{r.phone}</td> <td className="py-3 pr-3">{r.email}</td> <td className="py-3 pr-3">{r.age ?? "—"}</td> <td className="py-3 pr-3">{fmt(r.created_at)}</td> <td className="py-3 pr-3"> {r.image_paths?.length ? ( <button type="button" onClick={() => openImages(r)} disabled={busy} className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60" > View ({Math.min(3, r.image_paths.length)}) </button> ) : ( <span className="text-xs text-slate-500">—</span> )} </td> <td className="py-3 pr-3 text-slate-600">{r.source}</td> </tr> ))} {!items.length ? ( <tr> <td colSpan={7} className="py-8 text-center text-slate-500"> No leads found </td> </tr> ) : null} </tbody> </table> </div> <div className="flex items-center justify-between"> <button disabled={busy || !canPrev} onClick={() => setOffset((o) => Math.max(0, o - limit))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60" > ← Prev </button> <div className="text-sm text-slate-500"> Page {Math.floor(offset / limit) + 1} / {Math.max(1, Math.ceil(total / limit))} </div> <button disabled={busy || !canNext} onClick={() => setOffset((o) => o + limit)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60" > Next → </button> </div> </div> {attachOpen && ( <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onMouseDown={() => { setAttachOpen(false); setAttachUrls([]); setActiveIdx(0); }} > <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl" onMouseDown={(e) => e.stopPropagation()} > <div className="flex items-center justify-between border-b px-4 py-3"> <div className="text-sm font-semibold text-gray-900">{attachTitle}</div> <button type="button" onClick={() => { setAttachOpen(false); setAttachUrls([]); setActiveIdx(0); }} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-gray-50" aria-label="Close" > ✕ </button> </div> <div className="bg-gray-50 p-4"> {!attachUrls.length ? ( <div className="text-sm text-gray-600">No images.</div> ) : ( <div className="space-y-4"> {/* Main viewer */} <div className="flex items-center justify-center rounded-2xl border bg-white p-3"> <img src={attachUrls[Math.min(activeIdx, attachUrls.length - 1)]} alt="Lead image" className="h-[60vh] w-full max-w-full rounded-xl object-contain" /> </div> {/* Thumbnails row */} <div className="flex max-w-full gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"> {attachUrls.map((u, i) => { const active = i === activeIdx; return ( <button key={u} type="button" onClick={() => setActiveIdx(i)} className={[ "shrink-0 overflow-hidden rounded-xl border bg-white", active ? "ring-2 ring-emerald-400 border-emerald-300" : "hover:border-slate-300", ].join(" ")} style={{ width: 110, height: 80 }} aria-label={Open image ${i + 1}} > <img src={u} alt="Lead thumbnail" className="h-full w-full object-cover" loading="lazy" /> </button> ); })} </div> <div className="text-xs text-slate-500"> {activeIdx + 1} / {attachUrls.length} </div> </div> )} </div> </div> </div> )} </div> ); } """ ddl public.profiles: """ create table public.profiles ( id uuid not null, first_name text null, last_name text null, email text not null, phone text null, role text not null default 'guest'::text, date_of_birth date null, locale text not null default 'en'::text, created_at timestamp with time zone not null default now(), updated_at timestamp with time zone null, email_verified boolean not null default false, constraint profiles_pkey primary key (id), constraint profiles_email_key unique (email), constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE, constraint profiles_role_check check ( ( role = any ( array[ 'guest'::text, 'patient'::text, 'customer'::text, 'partner'::text, 'admin'::text ] ) ) ) ) TABLESPACE pg_default; create trigger _profiles_updated_at BEFORE update on profiles for EACH row execute FUNCTION set_updated_at (); create trigger set_updated_at_on_profiles BEFORE update on profiles for EACH row execute FUNCTION set_updated_at (); create trigger trg_profiles_updated BEFORE update on profiles for EACH row execute FUNCTION set_updated_at (); create trigger trg_profiles_updated_at BEFORE update on profiles for EACH row execute FUNCTION set_updated_at (); """ ddl public.user_roles: """ create table public.user_roles ( user_id uuid not null, role text not null, constraint user_roles_pkey primary key (user_id, role), constraint user_roles_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE, constraint user_roles_role_check check ( ( role = any ( array[ 'admin'::text, 'customer'::text, 'partner'::text, 'patient'::text ] ) ) ) ) TABLESPACE pg_default; create unique INDEX IF not exists user_roles_user_id_role_uniq on public.user_roles using btree (user_id, role) TABLESPACE pg_default; """ в общем нужно составить четкий план разработки функционала, чтобы потом не было проблем. также говори если тебе что-то надо, я не могу тебе дать все что есть, но если ты попросишь что-то конкретное, я без проблем предоставлю тебе файлы, таблицы, rpc функции, rls политики таблиц и так далее.

------------------------------

хорошо, я чуть позже дам AuthLoginClient, сейчас нужно срочно разобраться с другим.
в компоненте формы мы же реализовали событие form1step, но оно не рабочее. объясни как оно должно работать, что это такое и тд. потому что я не нашел нигде конкретно определение form1step, но насколько понял это трекинг после отправки формы. нам нужно связать тогда нашу форму с лендинга с google analytics(личный кабинет гугл аналитики у меня есть, главное чтобы это можно было реализовать с любой формой, а не только с google form).

app\ru\hair-transplant\lp\_components\LeadForm.tsx: """
'use client';

import { useMemo, useState } from "react";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import LeadImageUpload from "./LeadImageUpload";

type Props = {
  submitText?: string;
  onSubmitted?: () => void;
  className?: string;
  disclaimerText?: string;
  buttonClassName?: string;
};

function fireForm1Step() {
  // 1) универсально для GTM
  (window as any).dataLayer?.push?.({ event: "form1step" });

  // 2) если у тебя подключена метрика и ты хочешь goal
  // (window as any).ym?.(<COUNTER_ID>, "reachGoal", "form1step");

  // 3) на всякий — кастомное событие
  window.dispatchEvent(new Event("form1step"));
}

export default function LeadForm({
  submitText = "Отправить",
  onSubmitted,
  className,
  disclaimerText = "Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности",
  buttonClassName,
}: Props) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const [patientEmailSent, setPatientEmailSent] = useState(false);

  const canSubmit = useMemo(() => {
    return fullName.trim() && phone.trim() && email.trim();
  }, [fullName, phone, email]);

  async function submit() {
    setError(null);
    setOk(false);
    setPatientEmailSent(false);
    setBusy(true);

    try {
      const fd = new FormData();
      fd.set("source", "hair-transplant-lp");
      fd.set("full_name", fullName.trim());
      fd.set("phone", phone.trim());
      fd.set("email", email.trim());
      if (age.trim()) fd.set("age", age.trim());
      files.slice(0, 3).forEach((f) => fd.append("images", f));

      const res = await fetch("/api/leads/partner", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Submit failed");

      setOk(true);
      setPatientEmailSent(Boolean(json?.patient?.emailSent));
      fireForm1Step();

      onSubmitted?.();

      // опционально: очистить форму
      setFullName("");
      setPhone("");
      setEmail("");
      setAge("");
      setFiles([]);
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className={className ?? "space-y-3"}
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit || busy) return;
        submit();
      }}
    >
      <Input placeholder="ФИО*" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      <Input placeholder="Телефон*" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <Input placeholder="Email*" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input placeholder="Возраст" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} />

      <div className="mt-4">
        <LeadImageUpload files={files} onFilesChange={setFiles} />
      </div>

      {ok ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Спасибо! Мы получили заявку и свяжемся с вами.
        </div>
      ) : null}

      {ok && patientEmailSent ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Мы также создали ваш личный кабинет пациента и отправили на email ссылку для входа.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <Button type="submit" className={buttonClassName ?? "w-full"} size="lg" disabled={!canSubmit || busy}>
        {busy ? "Отправляем..." : submitText}
      </Button>

      <p className="text-center text-xs text-slate-500">{disclaimerText}</p>
    </form>
  );
}
"""

----------------------------------

у нас оказывается вообще не был поставлен google tag manager.
я надеюсь это он, взял в гугл аналитике: """
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-0JF7EP829T"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-0JF7EP829T');
</script>
"""
так что давай его поставим и идеально все настроим как в файлах, так и в самой гугл аналитике.

app\layout.tsx: """
// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import { headers, cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import "@/styles/globals.css";
import { detectLocale } from "@/lib/i18n-server";
import { SupabaseProvider } from "@/lib/supabase/supabase-provider";
import ThemeRoot from "@/components/ThemeRoot";
import AppChrome from "@/components/layout/AppChrome";
import Script from "next/script";

// Font
const roboto = Roboto({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-roboto",
  weight: ["300", "400", "500", "700"],
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "MedTravel — Medical Tourism Platform",
    template: "%s | MedTravel",
  },
  description:
    "MedTravel connects patients with verified clinics worldwide. Compare treatments and book a consultation safely.",
  keywords: ["medical tourism","clinics","treatments","healthcare abroad","medtravel"],
  authors: [{ name: "MedTravel Team" }],
  creator: "MedTravel",
  publisher: "MedTravel",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://medtravel.me",
    siteName: "MedTravel",
    title: "MedTravel — Medical Tourism Platform",
    description: "Find the best clinics and treatments abroad. Request a free consultation.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MedTravel — Medical Tourism Platform",
    description: "Find the best clinics and treatments abroad. Request a free consultation.",
    creator: "@medtravel",
  },
  metadataBase: new URL("https://medtravel.me"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F4F5" },
    { media: "(prefers-color-scheme: dark)", color: "#0C0C0E" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");
  const locale = detectLocale(acceptLanguage || undefined);

  // server-side session
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll().map(c => ({ name: c.name, value: c.value })),
        setAll: () => {}, // не меняем куки тут
      },
    }
  );
  const { data } = await supabase.auth.getSession();

  return (
    <html suppressHydrationWarning className={roboto.variable} lang={locale}>
      <head>
        <link href="//fonts.googleapis.com" rel="dns-prefetch" />
        <link href="//api.supabase.co" rel="dns-prefetch" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <style>{`:root{--site-header-h:64px}`}</style>
      </head>
      <body suppressHydrationWarning className={`${roboto.className} bg-background text-foreground antialiased`}>
        {/* Yandex.Metrika counter */}
        <Script
          id="yandex-metrika"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
(function(m,e,t,r,i,k,a){
  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  m[i].l=1*new Date();
  for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
})(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=106694543', 'ym');

ym(106694543, 'init', {
  ssr:true,
  webvisor:true,
  clickmap:true,
  ecommerce:"dataLayer",
  referrer: document.referrer,
  url: location.href,
  accurateTrackBounce:true,
  trackLinks:true
});
    `,
          }}
        />
        <noscript>
          <div>
            <img
              src="https://mc.yandex.ru/watch/106694543"
              style={{ position: "absolute", left: "-9999px" }}
              alt=""
            />
          </div>
        </noscript>
        {/* /Yandex.Metrika counter */}
        <SupabaseProvider initialSession={data.session}>
          <ThemeRoot>
            <div id="app-root" className="relative z-0 flex min-h-screen flex-col">
              <AppChrome>{children}</AppChrome>
            </div>
          </ThemeRoot>
        </SupabaseProvider>
      </body>
    </html>
  );
}
"""

-------------------------------------

хорошо. ниже я дал тебе полные файлы в которых выполнил изменения по твоим ответам, проверь все пожалуйста, если ничего править не надо, то продолжим.

components\customer\PatientsListClient.tsx: """
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/browserClient";

type Status = "pending" | "confirmed" | "cancelled" | "completed" | "cancelled_by_patient";

type Row = {
  booking_id: string;
  patient_id: string;
  patient_public_id: number | null;
  patient_name: string | null;
  phone: string | null;
  service_name: string | null;
  status: Status;
  pre_cost: number | null;
  currency: string | null;
  actual_cost: number | null;
  created_at: string;
  clinic_name: string | null;
  xray_path: string | null;
  photo_path: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  scheduled_at: string | null;
};

const PAGE_SIZE = 15;

const RU_DT = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function fmtPreferred(d: string | null, t: string | null) {
  if (!d) return "—";

  // d приходит как "YYYY-MM-DD"
  const [yyyy, mm, dd] = d.split("-");
  const date = `${dd}.${mm}.${yyyy}`;

  if (!t) return date;

  // t может быть "10:00" или "10:00:00" — режем до HH:MM
  const time = t.slice(0, 5);
  return `${date}, ${time}`;
}

function fmtScheduled(ts: string | null) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;

  // будет "02.02.2026, 14:00"
  return RU_DT.format(d);
}

function fmtMoney(v: number | null, cur: string | null) {
  if (v == null) return "—";
  return `${v} ${cur ?? "USD"}`;
}

function normalizeTime(t: string | null) {
  if (!t) return "";
  // "10:00:00" -> "10:00"
  const m = t.match(/^(\d{2}:\d{2})/);
  return m ? m[1] : t;
}

export default function PatientsListClient() {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);

  const [status, setStatus] = useState<
    "all" | "pending" | "confirmed" | "cancelled" | "completed" | "cancelled_by_patient"
  >("all");

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [attachOpen, setAttachOpen] = useState(false);
  const [attachUrls, setAttachUrls] = useState<string[]>([]);
  const [attachTitle, setAttachTitle] = useState<string>("Attachments");
  const [activeIdx, setActiveIdx] = useState(0);


  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const abortRef = useRef<AbortController | null>(null);

  const [schedOpen, setSchedOpen] = useState(false);
  const [schedBookingId, setSchedBookingId] = useState<string | null>(null);
  const [schedDate, setSchedDate] = useState<string>(""); // yyyy-mm-dd
  const [schedTime, setSchedTime] = useState<string>(""); // HH:MM
  const [schedTitle, setSchedTitle] = useState<string>("Schedule appointment");

  function openSchedule(r: Row) {
    setSchedBookingId(r.booking_id);
    setSchedTitle(`Schedule for ${r.patient_name ?? "patient"}`);
    setSchedTime(normalizeTime(r.preferred_time));

    // prefill: scheduled_at -> date/time, иначе preferred_date/time
    if (r.scheduled_at) {
      const d = new Date(r.scheduled_at);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const mi = String(d.getMinutes()).padStart(2, "0");
      setSchedDate(`${yyyy}-${mm}-${dd}`);
      setSchedTime(`${hh}:${mi}`);
    } else {
      setSchedDate(r.preferred_date ?? "");
      setSchedTime(r.preferred_time ?? "");
    }

    setSchedOpen(true);
  }

  async function saveSchedule() {
    if (!schedBookingId) return;

    // можно разрешить сохранить только дату без времени — тогда ставим 00:00
    const date = schedDate.trim();
    if (!date) {
      setErr("Please select a date.");
      return;
    }

    const time = (schedTime || "00:00").trim();
    const local = new Date(`${date}T${time}:00`);
    if (Number.isNaN(local.getTime())) {
      setErr("Invalid date/time.");
      return;
    }

    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/customer/patients/${encodeURIComponent(schedBookingId)}/schedule`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scheduled_at: local.toISOString() }),
      });
      if (!res.ok) throw new Error(await readError(res));

      // оптимистично обновим локально (чтобы не ждать realtime)
      setItems((prev) =>
        prev.map((r) => (r.booking_id === schedBookingId ? { ...r, scheduled_at: local.toISOString() } : r))
      );

      setSchedOpen(false);
      setSchedBookingId(null);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  async function readError(res: Response) {
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      const j = await res.json().catch(() => null);
      return j?.error ? String(j.error) : JSON.stringify(j);
    }
    return `${res.status} ${res.statusText}`;
  }

  async function openAttachment(r: Row) {
    setBusy(true);
    setErr(null);

    try {
      // 1) сначала пробуем lead images (если есть связь)
      {
        const res = await fetch(
          `/api/customer/patients/${encodeURIComponent(r.booking_id)}/lead-images`,
          { cache: "no-store" }
        );

        if (res.ok) {
          const j = await res.json().catch(() => ({}));
          const urls: string[] = (j?.urls ?? []).filter(Boolean);

          if (urls.length) {
            setAttachTitle("Lead images");
            setAttachUrls(urls);
            setActiveIdx(0);
            setAttachOpen(true);
            return;
          }
        }
        // если 400/403/500 — мы не падаем, просто идём дальше (обычные вложения)
      }

      // 2) обычные xray/photo (1 картинка)
      let endpoint: string | null = null;

      if (r.xray_path) endpoint = `/api/customer/patients/${encodeURIComponent(r.booking_id)}/xray-url`;
      else if (r.photo_path) endpoint = `/api/customer/patients/${encodeURIComponent(r.booking_id)}/photo-url`;

      if (!endpoint) {
        setErr("No attachment for this booking.");
        return;
      }

      const res = await fetch(endpoint, { cache: "no-store" });
      if (!res.ok) throw new Error(await readError(res));

      const j = await res.json().catch(() => ({}));
      const url = j?.url ?? null;

      if (!url) {
        setErr("Attachment not found or not available.");
        return;
      }

      setAttachTitle(r.xray_path ? "X-ray attachment" : "Photo attachment");
      setAttachUrls([url]);
      setActiveIdx(0);
      setAttachOpen(true);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  async function load(p = page) {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setBusy(true);
    setErr(null);

    try {
      const q = new URLSearchParams();
      q.set("page", String(p));
      q.set("limit", String(PAGE_SIZE));
      q.set("status", status);
      if (startDate) q.set("startDate", startDate);
      if (endDate) q.set("endDate", endDate);

      const res = await fetch(`/api/customer/patients?${q.toString()}`, {
        cache: "no-store",
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error(await readError(res));
      const json = await res.json();

      setItems(json.items ?? []);
      setTotal(json.total ?? 0);
      setPage(json.page ?? p);
    } catch (e: any) {
      if (e?.name !== "AbortError") setErr(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    setPage(1);
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, startDate, endDate]);

  useEffect(() => {
    const channel = supabase
      .channel("customer-patients-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "patient_bookings" }, () => {
        setTimeout(() => load(1), 150);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, status, startDate, endDate]);

  useEffect(() => {
    if (!attachOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAttachOpen(false);
        setAttachUrls([]);
        setActiveIdx(0);
      }
    };

    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [attachOpen]);

  async function updateStatus(bookingId: string, next: Status) {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/customer/patients/${encodeURIComponent(bookingId)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error(await readError(res));
      setItems((prev) => prev.map((r) => (r.booking_id === bookingId ? { ...r, status: next } : r)));
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  async function deleteOne(bookingId: string) {
    if (!confirm("Delete this patient record? This action cannot be undone.")) return;

    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/customer/patients/${encodeURIComponent(bookingId)}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await readError(res));
      await load(page);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  async function deleteAll() {
    if (!confirm("Delete ALL patient records for current filters? This action cannot be undone.")) return;
    if (!confirm("Are you absolutely sure?")) return;

    setBusy(true);
    setErr(null);
    try {
      const q = new URLSearchParams();
      q.set("status", status);
      if (startDate) q.set("startDate", startDate);
      if (endDate) q.set("endDate", endDate);

      const res = await fetch(`/api/customer/patients?${q.toString()}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await readError(res));
      await load(1);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="max-h-40 overflow-auto whitespace-pre-wrap break-words">{err}</div>
        </div>
      )}

      <div className="rounded-xl border bg-white p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={deleteAll}
            disabled={busy}
            className="rounded-md px-3 py-2 text-sm bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-60"
          >
            Delete All
          </button>
          <div className="ml-auto text-sm text-gray-500 flex items-center gap-2">
            {busy ? "Updating…" : "Live updates enabled"}
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>

            <option value="cancelled_by_patient" disabled>
              Cancelled by Patient
            </option>
          </select>

          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
      </div>

      <div className="rounded-xl border bg-white overflow-hidden">
        <div className="p-4 border-b">
          <div className="text-lg font-semibold">Patients ({total})</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">Patient ID</th>
                <th className="px-4 py-3 text-left">Patient Name</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Treatment</th>
                <th className="px-4 py-3 text-left">Preferred</th>
                <th className="px-4 py-3 text-left">Scheduled</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Pre-cost</th>
                <th className="px-4 py-3 text-left">Actual</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-gray-500">
                    No patients added yet
                  </td>
                </tr>
              ) : (
                items.map((r) => {
                  const isLocked = r.status === "cancelled_by_patient";

                  return (
                    <tr key={r.booking_id} className="border-t">
                      <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                        {r.patient_public_id ? `#${r.patient_public_id}` : "—"}
                      </td>
                      <td className="px-4 py-3">{r.patient_name ?? "—"}</td>
                      <td className="px-4 py-3">{r.phone ?? "—"}</td>
                      <td className="px-4 py-3">{r.service_name ?? "—"}</td>
                      <td className="px-4 py-3">{fmtPreferred(r.preferred_date, r.preferred_time)}</td>
                      <td className="px-4 py-3">{fmtScheduled(r.scheduled_at)}</td>

                      <td className="px-4 py-3">
                        <select
                          disabled={busy || isLocked}
                          value={r.status}
                          onChange={(e) => updateStatus(r.booking_id, e.target.value as any)}
                          className={"border rounded-md px-2 py-1 " + (isLocked ? "opacity-60 cursor-not-allowed bg-gray-50" : "")}
                        >
                          <option value="pending">pending</option>
                          <option value="confirmed">confirmed</option>
                          <option value="cancelled">cancelled</option>
                          <option value="completed">completed</option>
                        </select>
                      </td>

                      <td className="px-4 py-3">{fmtMoney(r.pre_cost, r.currency)}</td>
                      <td className="px-4 py-3">{fmtMoney(r.actual_cost, r.currency)}</td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openSchedule(r)}
                            disabled={busy || r.status === "cancelled_by_patient" || r.status === "cancelled" || r.status === "completed"}
                            className="inline-flex items-center rounded-md border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100 disabled:opacity-60"
                          >
                            Schedule
                          </button>

                          <button
                            type="button"
                            onClick={() => openAttachment(r)}
                            disabled={busy || (!r.xray_path && !r.photo_path)}
                            className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60 disabled:pointer-events-none"
                          >
                            View attachment
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteOne(r.booking_id)}
                            disabled={busy}
                            className="inline-flex items-center rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 text-sm text-gray-500 flex items-center justify-between">
          <div>
            Showing {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
          </div>
          <div className="flex gap-2">
            <button disabled={busy || page <= 1} onClick={() => load(page - 1)} className="border rounded-md px-3 py-2 hover:bg-gray-50 disabled:opacity-60">
              Prev
            </button>
            <button disabled={busy || page >= totalPages} onClick={() => load(page + 1)} className="border rounded-md px-3 py-2 hover:bg-gray-50 disabled:opacity-60">
              Next
            </button>
          </div>
        </div>
      </div>

      {attachOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={() => {
            setAttachOpen(false);
            setAttachUrls([]);
            setActiveIdx(0);
          }}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="text-sm font-semibold text-gray-900">{attachTitle}</div>

              <button
                type="button"
                onClick={() => {
                  setAttachOpen(false);
                  setAttachUrls([]);
                  setActiveIdx(0);
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-gray-50"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="bg-gray-50 p-4">
              {!attachUrls.length ? (
                <div className="text-sm text-gray-600">No attachment.</div>
              ) : (
                <div className="space-y-4">
                  {/* Main viewer */}
                  <div className="flex items-center justify-center rounded-2xl border bg-white p-3">
                    <img
                      src={attachUrls[Math.min(activeIdx, attachUrls.length - 1)]}
                      alt="Attachment"
                      className="h-[60vh] w-full max-w-full rounded-xl object-contain"
                    />
                  </div>

                  {/* Thumbnails row */}
                  {attachUrls.length > 1 ? (
                    <div className="flex max-w-full gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {attachUrls.map((u, i) => {
                        const active = i === activeIdx;
                        return (
                          <button
                            key={u}
                            type="button"
                            onClick={() => setActiveIdx(i)}
                            className={[
                              "shrink-0 overflow-hidden rounded-xl border bg-white",
                              active
                                ? "ring-2 ring-emerald-400 border-emerald-300"
                                : "hover:border-slate-300",
                            ].join(" ")}
                            style={{ width: 110, height: 80 }}
                            aria-label={`Open image ${i + 1}`}
                          >
                            <img
                              src={u}
                              alt="Attachment thumbnail"
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  <div className="text-xs text-slate-500">
                    {activeIdx + 1} / {attachUrls.length}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {schedOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={() => {
            setSchedOpen(false);
            setSchedBookingId(null);
          }}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="text-sm font-semibold text-gray-900">{schedTitle}</div>
              <button
                type="button"
                onClick={() => {
                  setSchedOpen(false);
                  setSchedBookingId(null);
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-gray-50"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <div className="mb-1 text-xs font-medium text-gray-600">Date</div>
                  <input
                    type="date"
                    value={schedDate}
                    onChange={(e) => setSchedDate(e.target.value)}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <div className="mb-1 text-xs font-medium text-gray-600">Time (optional)</div>
                  <input
                    type="time"
                    value={schedTime}
                    onChange={(e) => setSchedTime(e.target.value)}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSchedOpen(false);
                    setSchedBookingId(null);
                  }}
                  className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveSchedule}
                  disabled={busy}
                  className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  Save schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
"""
app\api\customer\patients\[id]\lead-images\route.ts(это созданный, ты мне его давал полностью готовый, тут ничего не менялось): """
import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";
import { createServiceClient } from "@/lib/supabase/serviceClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function extractLeadId(notes: string | null, autoWhen: string | null) {
  const s = `${notes ?? ""} ${autoWhen ?? ""}`;
  // поддержим оба формата:
  // 1) [lead:<uuid>]
  // 2) lead:<uuid>
  const m =
    s.match(/\[lead:([0-9a-f-]{36})\]/i) ||
    s.match(/\blead:([0-9a-f-]{36})\b/i);
  return m?.[1] ?? null;
}

export async function GET(_req: Request, ctx: any) {
  const bookingId = String(ctx?.params?.id ?? "").trim();
  if (!bookingId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // 1) auth как customer (route client)
  const route = await createRouteClient();
  const { data: au } = await route.auth.getUser();
  const user = au?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 2) узнаём clinic_id текущего customer
  const { data: clinicId, error: eClinic } = await route.rpc("customer_current_clinic_id");
  if (eClinic) return NextResponse.json({ error: eClinic.message }, { status: 500 });
  if (!clinicId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // 3) service role: читаем booking (чтобы достать notes/auto_when и сравнить clinic_id)
  const admin = createServiceClient();

  const { data: booking, error: bErr } = await admin
    .from("patient_bookings")
    .select("id, clinic_id, notes, auto_when")
    .eq("id", bookingId)
    .maybeSingle();

  if (bErr) return NextResponse.json({ error: bErr.message }, { status: 500 });
  if (!booking) return NextResponse.json({ urls: [] });

  if (String(booking.clinic_id) !== String(clinicId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 4) достаём leadId из notes/auto_when
  const leadId = extractLeadId(booking.notes ?? null, booking.auto_when ?? null);
  if (!leadId) return NextResponse.json({ urls: [] });

  // 5) тянем image_paths из partner_leads
  const { data: lead, error: lErr } = await admin
    .from("partner_leads")
    .select("image_paths")
    .eq("id", leadId)
    .maybeSingle();

  if (lErr) return NextResponse.json({ error: lErr.message }, { status: 500 });

  const paths: string[] = (lead as any)?.image_paths ?? [];
  const sliced = paths.map((p) => String(p ?? "").trim()).filter(Boolean).slice(0, 3);
  if (!sliced.length) return NextResponse.json({ urls: [] });

  // 6) подписанные ссылки (bucket partner-leads)
  const urls: string[] = [];
  for (const p of sliced) {
    const { data: signed, error: sErr } = await admin.storage
      .from("partner-leads")
      .createSignedUrl(p, 60 * 10);

    if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });
    if (signed?.signedUrl) urls.push(signed.signedUrl);
  }

  return NextResponse.json({ urls });
}
"""
app\api\admin\partners\route.ts: """
import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";
import { createServiceClient } from "@/lib/supabase/serviceClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function isAdmin(route: any, userId: string) {
  const { data } = await route.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r: any) => String(r.role ?? "").toLowerCase());
  return roles.includes("admin");
}

export async function GET() {
  // 1) auth + admin check
  const route = await createRouteClient();
  const { data: auth } = await route.auth.getUser();
  const user = auth?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ok = await isAdmin(route, user.id);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // 2) service client for data
  const admin = createServiceClient();

  // ✅ берём всех user_id у кого есть роль customer
  const { data: roles, error: rErr } = await admin
    .from("user_roles")
    .select("user_id")
    .eq("role", "customer");

  if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 });

  const ids = Array.from(new Set((roles ?? []).map((x: any) => x.user_id).filter(Boolean)));
  if (!ids.length) return NextResponse.json({ items: [] });

  // ✅ оставляем только approved заявки (не обязательно, но правильно)
  const { data: approved, error: aErr } = await admin
    .from("customer_registration_requests")
    .select("user_id")
    .in("user_id", ids)
    .eq("status", "approved");

  if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 });

  const approvedIds = new Set((approved ?? []).map((x: any) => x.user_id).filter(Boolean));
  const filtered = ids.filter((id) => approvedIds.has(id));
  if (!filtered.length) return NextResponse.json({ items: [] });

  // ✅ оставляем только тех, у кого есть customer_clinic_membership
  const { data: mem, error: mErr } = await admin
    .from("customer_clinic_membership")
    .select("user_id, clinic_id")
    .in("user_id", filtered);

  if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 });

  const memMap = new Map<string, string>();
  (mem ?? []).forEach((x: any) => {
    if (x?.user_id && x?.clinic_id) memMap.set(String(x.user_id), String(x.clinic_id));
  });

  const finalIds = filtered.filter((id) => memMap.has(id));
  if (!finalIds.length) return NextResponse.json({ items: [] });

  // профили этих пользователей
  const { data: prof, error: pErr } = await admin
    .from("profiles")
    .select("id,first_name,last_name,email")
    .in("id", finalIds)
    .order("created_at", { ascending: false });

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  // (опционально) подтянем название клиники
  const clinicIds = Array.from(new Set(Array.from(memMap.values())));
  const { data: clinics } = await admin
    .from("clinics")
    .select("id,name")
    .in("id", clinicIds);

  const clinicNameById = new Map<string, string>();
  (clinics ?? []).forEach((c: any) => clinicNameById.set(String(c.id), String(c.name)));

  const items = (prof ?? []).map((p: any) => {
    const personName = [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
    const clinicId = memMap.get(String(p.id)) || "";
    const clinicName = clinicId ? (clinicNameById.get(clinicId) ?? "") : "";

    return {
      id: p.id,              // customer user_id (то что кладём в partner_leads.assigned_partner_id)
      clinic_id: clinicId,   // удобно на будущее
      name: clinicName || personName || p.email || p.id,
      email: p.email ?? "",
    };
  });

  return NextResponse.json({ items });
}
"""
app\api\admin\partner-leads\assign\route.ts: """
import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";
import { createServiceClient } from "@/lib/supabase/serviceClient";
import { resendSend, partnerNewLeadTemplate } from "@/lib/mail/resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function isAdmin(route: any, userId: string) {
  const { data } = await route.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r: any) => String(r.role ?? "").toLowerCase());
  return roles.includes("admin");
}

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

export async function PATCH(req: NextRequest) {
  // 1) auth + admin check
  const route = await createRouteClient();
  const { data: auth } = await route.auth.getUser();
  const user = auth?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ok = await isAdmin(route, user.id);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // 2) body
  const body = await req.json().catch(() => null);
  const lead_id = String(body?.lead_id ?? "").trim();
  const partner_id = String(body?.partner_id ?? "").trim();
  const note = String(body?.note ?? "").trim().slice(0, 500);

  if (!isUuid(lead_id)) return NextResponse.json({ error: "Invalid lead_id" }, { status: 400 });
  if (!isUuid(partner_id)) return NextResponse.json({ error: "Invalid partner_id" }, { status: 400 });

  // 3) service client
  const admin = createServiceClient();

  // (опционально) убедимся что partner_id реально partner
  const { data: roleCheck, error: rcErr } = await admin
    .from("user_roles")
    .select("user_id")
    .eq("user_id", partner_id)
    .eq("role", "customer")
    .maybeSingle();

  if (rcErr) return NextResponse.json({ error: rcErr.message }, { status: 500 });
  if (!roleCheck) return NextResponse.json({ error: "User is not a customer" }, { status: 400 });

  // 4) прочитаем текущий lead, чтобы:
  // - понять изменилось ли назначение (без миграций / без дублей)
  // - взять данные лида для письма
  const { data: before, error: beforeErr } = await admin
    .from("partner_leads")
    .select("id,assigned_partner_id,full_name,phone,email,source,created_at")
    .eq("id", lead_id)
    .maybeSingle();

  if (beforeErr) return NextResponse.json({ error: beforeErr.message }, { status: 500 });
  if (!before) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const prevPartnerId = before.assigned_partner_id ?? null;
  const partnerChanged = prevPartnerId !== partner_id;

  // ✅ resolve clinic_id by customer user_id
  const { data: mem, error: memErr } = await admin
    .from("customer_clinic_membership")
    .select("clinic_id")
    .eq("user_id", partner_id)
    .maybeSingle();

  if (memErr) return NextResponse.json({ error: memErr.message }, { status: 500 });
  if (!mem?.clinic_id) return NextResponse.json({ error: "Customer has no clinic membership" }, { status: 400 });

  const clinicId = String(mem.clinic_id);

  // ✅ resolve patient_id by lead email
  const leadEmail = String(before.email ?? "").trim().toLowerCase();
  const { data: pat, error: patErr } = await admin
    .from("profiles")
    .select("id")
    .eq("email", leadEmail)
    .maybeSingle();

  if (patErr) return NextResponse.json({ error: patErr.message }, { status: 500 });
  if (!pat?.id) return NextResponse.json({ error: "Patient profile not found for lead email" }, { status: 400 });

  const patientId = String(pat.id);

  // ✅ create booking from lead (чтобы появилось в /customer/patients)
  const leadMarker = `[lead:${lead_id}]`; // будем использовать для изображений и отличия источника
  const { data: booking, error: bookErr } = await admin
    .from("patient_bookings")
    .insert({
      patient_id: patientId,
      clinic_id: clinicId,
      service_id: 803,               // Hair Transplant
      booking_method: "automatic",   // лид
      status: "pending",
      full_name: before.full_name,
      phone: before.phone,
      notes: `${leadMarker} Landing lead (${before.source ?? "unknown"})`,
    })
    .select("id")
    .single();

  if (bookErr) return NextResponse.json({ error: bookErr.message }, { status: 500 });

  // 5) update lead
  const patch: any = {
    assigned_partner_id: partner_id,
    assigned_at: new Date().toISOString(),
    assigned_by: user.id,
    assigned_note: note || null,
    status: "assigned",
  };

  const { data, error } = await admin
    .from("partner_leads")
    .update(patch)
    .eq("id", lead_id)
    .select(
      "id,source,full_name,phone,email,age,image_paths,status,admin_note,created_at,assigned_partner_id,assigned_at,assigned_by,assigned_note"
    )
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 6) email notify (best-effort: не ломаем assignment если email упал)
  let emailSent = false;
  let emailError: string | null = null;

  if (partnerChanged) {
    try {
      // email партнёра берём из profiles
      const { data: partnerProfile, error: pErr } = await admin
        .from("profiles")
        .select("email,first_name,last_name")
        .eq("id", partner_id)
        .maybeSingle();

      if (pErr) throw new Error(pErr.message);
      const partnerEmail = partnerProfile?.email?.trim();
      if (!partnerEmail) throw new Error("Partner email not found in profiles");

      const partnerName = `${partnerProfile?.first_name ?? ""} ${partnerProfile?.last_name ?? ""}`.trim() || null;

      const origin = req.nextUrl.origin;
      const patientsUrl = `${origin}/customer/patients`;

      const tpl = partnerNewLeadTemplate({
        partnerName,
        leadsUrl: patientsUrl,
        lead: {
          full_name: before.full_name,
          phone: before.phone,
          email: before.email,
          source: before.source,
          created_at: before.created_at,
        },
      });

      await resendSend({ to: partnerEmail, subject: tpl.subject, html: tpl.html });
      emailSent = true;
    } catch (e: any) {
      emailError = String(e?.message ?? e);
      // не бросаем ошибку — assignment уже сделан
    }
  }

  return NextResponse.json({
    ok: true,
    item: data,
    email: {
      attempted: partnerChanged,
      sent: emailSent,
      error: emailError,
    },
  });
}
"""

-------------------------------

app\(admin)\admin\customer-signup-requests\page.tsx: """
import CustomerSignupRequestsClient from "@/components/admin/CustomerSignupRequestsClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return <CustomerSignupRequestsClient />;
}
"""
components\admin\CustomerSignupRequestsClient.tsx: """
"use client";

import { useEffect, useMemo, useState } from "react";

type Row = {
  id: string;
  user_id: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  decided_at: string | null;
  admin_note: string | null;
};

function fmt(dt?: string | null) {
  if (!dt) return "—";
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
}

export default function CustomerSignupRequestsClient() {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | "all">("all");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);

  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const canPrev = offset > 0;
  const canNext = offset + limit < total;

  const queryUrl = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("status", status);
    if (q.trim()) sp.set("q", q.trim());
    sp.set("limit", String(limit));
    sp.set("offset", String(offset));
    return `/api/admin/customer-signup-requests?${sp.toString()}`;
  }, [status, q, limit, offset]);

  async function load() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(queryUrl, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Failed to load");
      setItems(json.items ?? []);
      setTotal(Number(json.total ?? 0));
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryUrl]);

  async function approve(id: string) {
    if (!confirm("Approve this customer request?")) return;
    setToast(null);
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/customer-signup-requests/approve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Approve failed");
      setToast("Approved and email sent.");
      await load();
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setBusy(false);
      setTimeout(() => setToast(null), 2500);
    }
  }

  async function reject(id: string) {
    const note = prompt("Reject note (optional):", "") ?? "";
    if (!confirm("Reject this customer request?")) return;

    setToast(null);
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/customer-signup-requests/reject", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, note: note.trim() || null }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Reject failed");
      setToast("Rejected and email sent.");
      await load();
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setBusy(false);
      setTimeout(() => setToast(null), 2500);
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Customer signup requests</h1>
          <p className="text-sm text-slate-500">
            Approve or reject clinic (customer) registration requests
          </p>
        </div>

        <button
          onClick={() => load()}
          disabled={busy}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
        >
          Refresh
        </button>
      </div>

      {toast ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {toast}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border bg-white p-4 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex gap-2 flex-wrap">
            {(["pending", "approved", "rejected", "all"] as const).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setOffset(0);
                  setStatus(s);
                }}
                className={[
                  "rounded-full px-3 py-1 text-sm border",
                  status === s
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "border-slate-200 hover:bg-slate-50",
                ].join(" ")}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by email..."
              className="h-9 w-64 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
            <button
              disabled={busy}
              onClick={() => {
                setOffset(0);
                load();
              }}
              className="h-9 rounded-lg border border-slate-200 px-3 text-sm hover:bg-slate-50 disabled:opacity-60"
            >
              Search
            </button>
          </div>
        </div>

        <div className="text-sm text-slate-500">
          Showing <b>{items.length}</b> of <b>{total}</b>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Created</th>
                <th className="py-2 pr-3">Decided</th>
                <th className="py-2 pr-3">Note</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-b last:border-b-0">
                  <td className="py-3 pr-3">
                    <div className="font-medium text-slate-900">{r.email}</div>
                    <div className="text-xs text-slate-500">{r.user_id}</div>
                  </td>

                  <td className="py-3 pr-3">
                    <span
                      className={[
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                        r.status === "pending"
                          ? "bg-amber-50 text-amber-700"
                          : r.status === "approved"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700",
                      ].join(" ")}
                    >
                      {r.status}
                    </span>
                  </td>

                  <td className="py-3 pr-3">{fmt(r.created_at)}</td>
                  <td className="py-3 pr-3">{fmt(r.decided_at)}</td>
                  <td className="py-3 pr-3 text-slate-600">{r.admin_note || "—"}</td>

                  <td className="py-3 text-right">
                    {r.status === "pending" ? (
                      <div className="inline-flex gap-2">
                        <button
                          disabled={busy}
                          onClick={() => approve(r.id)}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => reject(r.id)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">—</span>
                    )}
                  </td>
                </tr>
              ))}

              {!items.length ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No requests found
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between">
          <button
            disabled={busy || !canPrev}
            onClick={() => setOffset((o) => Math.max(0, o - limit))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
          >
            ← Prev
          </button>

          <div className="text-sm text-slate-500">
            Page {Math.floor(offset / limit) + 1} / {Math.max(1, Math.ceil(total / limit))}
          </div>

          <button
            disabled={busy || !canNext}
            onClick={() => setOffset((o) => o + limit)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
"""
app\api\admin\customer-signup-requests\route.ts: """
import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function isAdmin(supabase: any, userId: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  const roles = (data ?? []).map((r: any) => String(r.role ?? "").toLowerCase());
  return roles.includes("admin");
}

export async function GET(req: NextRequest) {
  const supabase = await createRouteClient();

  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ok = await isAdmin(supabase, user.id);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);

  const status = (url.searchParams.get("status") || "pending").toLowerCase(); // pending/approved/rejected/all
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();

  const limit = Math.min(Number(url.searchParams.get("limit") || "20"), 100);
  const offset = Math.max(Number(url.searchParams.get("offset") || "0"), 0);

  let query = supabase
    .from("customer_registration_requests")
    .select(
      "id,user_id,email,status,created_at,decided_at,decided_by,admin_note",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (status !== "all") query = query.eq("status", status);
  if (q) query = query.ilike("email", `%${q}%`);

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    items: data ?? [],
    total: Number(count ?? 0),
    limit,
    offset,
  });
}
"""
app\api\admin\customer-signup-requests\approve\route.ts: """
import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";
import { createServiceClient } from "@/lib/supabase/serviceClient";
import { resendSend, customerApprovedTemplate } from "@/lib/mail/resend";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function isAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r: any) => String(r.role ?? "").toLowerCase());
  return roles.includes("admin");
}

export async function POST(req: Request) {
  const supabase = await createRouteClient();

  const { data: auth } = await supabase.auth.getUser();
  const me = auth?.user;
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ok = await isAdmin(supabase, me.id);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const id = String(body?.id || "");
  const note = body?.note ? String(body.note).slice(0, 500) : null;

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const sb = createServiceClient();

  const { data: row, error: selErr } = await sb
    .from("customer_registration_requests")
    .select("id,user_id,email,status")
    .eq("id", id)
    .maybeSingle();

  if (selErr) return NextResponse.json({ error: selErr.message }, { status: 500 });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (row.status !== "pending") {
    return NextResponse.json({ error: "Request already processed" }, { status: 400 });
  }

  // 1) роль customer
  await sb.from("user_roles").upsert(
    { user_id: row.user_id, role: "customer" },
    { onConflict: "user_id,role" }
  );

  await sb.from("profiles").upsert(
    { id: row.user_id, email: row.email, role: "customer" },
    { onConflict: "id" }
  );

  // 2) обновляем заявку
  const { error: updErr } = await sb
    .from("customer_registration_requests")
    .update({
      status: "approved",
      decided_at: new Date().toISOString(),
      decided_by: me.id,
      admin_note: note,
    })
    .eq("id", id);

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  // 3) письмо
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://medtravel.me";
  const loginUrl = `${origin}/auth/login?as=CUSTOMER&next=%2Fcustomer`;

  const tpl = customerApprovedTemplate(loginUrl);
  await resendSend({ to: String(row.email).toLowerCase(), subject: tpl.subject, html: tpl.html });

  return NextResponse.json({ ok: true });
}
"""
app\api\admin\customer-signup-requests\reject\route.ts: """
import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";
import { createServiceClient } from "@/lib/supabase/serviceClient";
import { resendSend, customerRejectedTemplate } from "@/lib/mail/resend";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function isAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r: any) => String(r.role ?? "").toLowerCase());
  return roles.includes("admin");
}

export async function POST(req: Request) {
  const supabase = await createRouteClient();

  const { data: auth } = await supabase.auth.getUser();
  const me = auth?.user;
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ok = await isAdmin(supabase, me.id);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const id = String(body?.id || "");
  const note = body?.note ? String(body.note).slice(0, 500) : null;

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const sb = createServiceClient();

  const { data: row, error: selErr } = await sb
    .from("customer_registration_requests")
    .select("id,user_id,email,status")
    .eq("id", id)
    .maybeSingle();

  if (selErr) return NextResponse.json({ error: selErr.message }, { status: 500 });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (row.status !== "pending") {
    return NextResponse.json({ error: "Request already processed" }, { status: 400 });
  }

  const { error: updErr } = await sb
    .from("customer_registration_requests")
    .update({
      status: "rejected",
      decided_at: new Date().toISOString(),
      decided_by: me.id,
      admin_note: note,
    })
    .eq("id", id);

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  const tpl = customerRejectedTemplate();
  await resendSend({ to: String(row.email).toLowerCase(), subject: tpl.subject, html: tpl.html });

  return NextResponse.json({ ok: true });
}
"""
lib\mail\resend.ts: """
export async function resendSend(params: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? process.env.EMAIL_FROM;

  if (!apiKey) throw new Error("Missing RESEND_API_KEY");
  if (!from) throw new Error("Missing RESEND_FROM (or EMAIL_FROM)");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Resend: failed to send email");
  }
}

export function customerApprovedTemplate(loginUrl: string) {
  return {
    subject: "Your MedTravel Clinic account is approved",
    html: `
      <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;line-height:1.5">
        <h2 style="margin:0 0 12px">Approved ✅</h2>
        <p style="margin:0 0 12px">Your request to access the Clinic (Customer) panel has been approved.</p>
        <p style="margin:0 0 12px">You can now sign in using the email and password you set during registration.</p>
        <a href="${loginUrl}"
           style="display:inline-block;margin-top:10px;padding:10px 14px;background:#10b981;color:white;text-decoration:none;border-radius:10px;font-weight:600">
          Sign in to Clinic panel
        </a>
      </div>
    `,
  };
}

export function customerRejectedTemplate() {
  return {
    subject: "Your MedTravel Clinic request was rejected",
    html: `
      <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;line-height:1.5">
        <h2 style="margin:0 0 12px">Request rejected</h2>
        <p style="margin:0 0 12px">Unfortunately, your request to access the Clinic (Customer) panel was rejected.</p>
        <p style="margin:0;color:#71717a">If you think this is a mistake, please contact support.</p>
      </div>
    `,
  };
}

export function patientMagicLinkTemplate(loginUrl: string) {
  return {
    subject: "Your MedTravel Patient account is ready",
    html: `
      <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;line-height:1.5">
        <h2 style="margin:0 0 12px">Your patient account is ready ✅</h2>
        <p style="margin:0 0 12px">
          We created your MedTravel Patient account and linked it to this email.
        </p>
        <p style="margin:0 0 12px">
          Click the button below to sign in to your Patient dashboard:
        </p>

        <a href="${loginUrl}"
           style="display:inline-block;margin-top:10px;padding:10px 14px;background:#10b981;color:white;text-decoration:none;border-radius:10px;font-weight:600">
          Sign in to Patient dashboard
        </a>

        <p style="margin:16px 0 0;color:#71717a;font-size:12px">
          After signing in, we recommend setting a password in Settings for faster access next time.
        </p>
      </div>
    `,
  };
}

export function partnerNewLeadTemplate(params: {
  partnerName?: string | null;
  leadsUrl: string;
  lead: {
    full_name?: string | null;
    phone?: string | null;
    email?: string | null;
    source?: string | null;
    created_at?: string | null;
  };
}) {
  const partnerName = params.partnerName?.trim() || "Partner";
  const leadName = params.lead.full_name?.trim() || "New lead";

  return {
    subject: `New lead assigned — MedTravel`,
    html: `
      <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;line-height:1.5">
        <h2 style="margin:0 0 12px">New lead assigned ✅</h2>
        <p style="margin:0 0 12px">Hi ${partnerName}, a new lead has been assigned to you.</p>

        <div style="margin:12px 0;padding:12px;border:1px solid #e5e7eb;border-radius:12px;background:#fafafa">
          <div style="font-weight:600;margin:0 0 6px">${leadName}</div>
          ${params.lead.phone ? `<div style="margin:0 0 4px;color:#374151"><b>Phone:</b> ${params.lead.phone}</div>` : ""}
          ${params.lead.email ? `<div style="margin:0 0 4px;color:#374151"><b>Email:</b> ${params.lead.email}</div>` : ""}
          ${params.lead.source ? `<div style="margin:0 0 4px;color:#6b7280;font-size:12px"><b>Source:</b> ${params.lead.source}</div>` : ""}
          ${params.lead.created_at ? `<div style="margin:0;color:#6b7280;font-size:12px"><b>Created:</b> ${params.lead.created_at}</div>` : ""}
        </div>

        <a href="${params.leadsUrl}"
           style="display:inline-block;margin-top:10px;padding:10px 14px;background:#10b981;color:white;text-decoration:none;border-radius:10px;font-weight:600">
          Open Partner leads
        </a>

        <p style="margin:16px 0 0;color:#71717a;font-size:12px">
          If you didn’t expect this email, just ignore it.
        </p>
      </div>
    `,
  };
}
"""

---------------------------- last

app\auth\callback\route.ts: """
// app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createServiceClient } from "@/lib/supabase/serviceClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RoleName = "CUSTOMER" | "PARTNER" | "PATIENT" | "ADMIN" | "GUEST";

function normalizeRole(asParam?: string | null): RoleName {
  const as = (asParam ?? "").toUpperCase();
  if (as === "CUSTOMER") return "CUSTOMER";
  if (as === "PARTNER") return "PARTNER";
  if (as === "PATIENT") return "PATIENT";
  if (as === "ADMIN") return "ADMIN";
  return "GUEST";
}

function normCode(v: string) {
  return String(v || "").trim().toUpperCase();
}

async function ensureProfileAndRole(supabase: any, asParam: string | null) {
  const { data: u } = await supabase.auth.getUser();
  const user = u?.user;
  if (!user) return;

  const userId = user.id;
  const email = user.email ?? null;
  const meta: any = user.user_metadata ?? {};

  const fromAs = normalizeRole(asParam);

  const metaRoleRaw = (meta.requested_role as string | undefined)?.toUpperCase();
  const metaRole: RoleName =
    metaRoleRaw === "ADMIN" ||
    metaRoleRaw === "CUSTOMER" ||
    metaRoleRaw === "PARTNER" ||
    metaRoleRaw === "PATIENT"
      ? (metaRoleRaw as RoleName)
      : "GUEST";

  const finalRole: RoleName = fromAs !== "GUEST" ? fromAs : metaRole;

  // ✅ CUSTOMER: выдаём доступ ТОЛЬКО если заявка approved
  if (finalRole === "CUSTOMER") {
    const sb = createServiceClient();

    const { data: reqRow, error: reqErr } = await sb
      .from("customer_registration_requests")
      .select("status")
      .eq("user_id", userId)
      .maybeSingle();

    const st = String(reqRow?.status ?? "").toLowerCase();

    if (!reqErr && st === "approved") {
      // ✅ уже одобрен — даём роль customer и пускаем
      await supabase
        .from("profiles")
        .upsert({ id: userId, email, role: "customer" }, { onConflict: "id" });

      await supabase
        .from("user_roles")
        .upsert(
          { user_id: userId, role: "customer" } as any,
          { onConflict: "user_id,role" } as any
        );

      return { finalRole, customerPending: false };
    }

    // ❗ не одобрен — держим как guest и создаём/обновляем pending
    await supabase
      .from("profiles")
      .upsert({ id: userId, email, role: "guest" }, { onConflict: "id" });

    await createCustomerRequestIfNeeded(userId, email);

    return { finalRole, customerPending: true };
  }

  // ✅ остальные роли — как раньше
  await supabase
    .from("profiles")
    .upsert({ id: userId, email, role: finalRole.toLowerCase() }, { onConflict: "id" });

  if (finalRole !== "GUEST") {
    await supabase
      .from("user_roles")
      .upsert(
        { user_id: userId, role: finalRole.toLowerCase() } as any,
        { onConflict: "user_id,role" } as any
      );
  }

  return { finalRole, customerPending: false };
}

async function createCustomerRequestIfNeeded(userId: string, email: string | null) {
  if (!email) return;
  const sb = createServiceClient();

  await sb
    .from("customer_registration_requests")
    .upsert(
      { user_id: userId, email, status: "pending" },
      { onConflict: "user_id" }
    );
}

/**
 * IMPORTANT:
 * - делаем attach через SERVICE ROLE (RLS не мешает)
 * - cookie очищаем всегда, чтобы не висела
 */
async function attachReferralIfAny(
  res: NextResponse,
  asParam: string | null,
  store: Awaited<ReturnType<typeof cookies>>,
  patientUserId: string | null,
) {
  // прикрепляем только при входе как PATIENT
  if (normalizeRole(asParam) !== "PATIENT") return;

  const refCode = normCode(store.get("mt_ref_code")?.value ?? "");
  if (!refCode) return;

  const clear = () => {
    res.cookies.set("mt_ref_code", "", { path: "/", maxAge: 0 });
  };

  if (!patientUserId) {
    clear();
    return;
  }

  const sb = createServiceClient();

  // 1) найдём владельца кода (approved)
  const { data: owner, error: ownerErr } = await sb
    .from("partner_program_requests")
    .select("user_id, program_key")
    .eq("ref_code", refCode)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (ownerErr || !owner?.user_id) {
    clear();
    return;
  }

  // 2) пишем регистрацию (на дубль — ок)
  // если у тебя unique на patient_user_id или на (patient_user_id, partner_user_id) — upsert/ignore must be safe
  const { error: insErr } = await sb.from("partner_referrals").upsert(
    {
      ref_code: refCode,
      partner_user_id: owner.user_id,
      program_key: owner.program_key,
      patient_user_id: patientUserId,
    } as any,
    { onConflict: "patient_user_id" }, // <-- если у тебя уникальность другая — скажешь, поправим
  );

  // если конфликт/дубль — не ломаем логин
  // если ошибка реальная — тоже не ломаем, но можно поставить debug-cookie
  if (insErr) {
    res.cookies.set("mt_ref_attach_error", encodeURIComponent(insErr.message), {
      path: "/",
      httpOnly: false,
      maxAge: 60,
    });
  }

  clear();
}

type CookieToSet = { name: string; value: string; options?: any };

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";
  const asParam = url.searchParams.get("as");

  const res = NextResponse.redirect(new URL(next, req.url));
  const store = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll().map((c) => ({ name: c.name, value: c.value })),
        setAll: (all: CookieToSet[]) => {
          all.forEach((cookie) => {
            res.cookies.set(cookie.name, cookie.value, cookie.options);
          });
        },
      },
    },
  );

  if (!code) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  const result = await ensureProfileAndRole(supabase, asParam);

  // CUSTOMER pending: разлогинить и показать сообщение
  if (result?.customerPending) {
    // очистит cookies через твою setAll()
    await supabase.auth.signOut();

    const pendingUrl = new URL("/auth/login", req.url);
    pendingUrl.searchParams.set("as", "CUSTOMER");
    pendingUrl.searchParams.set("pending", "1");
    pendingUrl.searchParams.set("next", "/customer"); // на будущее
    return NextResponse.redirect(pendingUrl);
  }

  await attachReferralIfAny(res, asParam, store, data?.user?.id ?? null);
  return res;
}
"""
app\api\auth\email\signup\route.ts: """
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const runtime = "nodejs";

function isValidEmail(email: unknown) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normRefCode(v: unknown) {
  const s = String(v ?? "").trim().toUpperCase();
  return s.length >= 6 ? s : "";
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    const as = String(body?.as || "").trim().toUpperCase();

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }
    if (!["PATIENT", "PARTNER", "CUSTOMER"].includes(as)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      return NextResponse.json(
        { error: "Server auth is not configured (missing Supabase envs)" },
        { status: 500 },
      );
    }

    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // ✅ refCode берём либо из body.ref (если ты когда-то начнёшь слать),
    // ✅ либо из httpOnly cookie mt_ref_code, которую ставит /ref/[code]
    const store = await cookies();
    const refFromCookie = store.get("mt_ref_code")?.value;
    const refCode = normRefCode(body?.ref || refFromCookie);

    // 1) создаём пользователя (НЕ шлём письма)
    const { data: created, error: createErr } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: {
          requested_role: as,
          // можно сохранить ref в метадате на будущее (не обязательно)
          ...(refCode ? { ref_code: refCode } : {}),
        },
      });

    if (createErr) {
      const msg = String(createErr.message || "");
      if (msg.toLowerCase().includes("already")) {
        return NextResponse.json(
          { error: "Account already exists. Please sign in." },
          { status: 409 },
        );
      }
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const userId = created?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    // 2) profiles (+ user_roles для НЕ customer)
    if (as === "CUSTOMER") {
      // customer: НЕ выдаём роль сразу
      await supabase.from("profiles").upsert(
        { id: userId, email, role: "guest", email_verified: false },
        { onConflict: "id" }
      );

      // ❌ НЕ вставляем user_roles customer здесь
    } else {
      await supabase.from("profiles").upsert(
        { id: userId, email, role: as.toLowerCase(), email_verified: false },
        { onConflict: "id" }
      );

      await supabase.from("user_roles").upsert(
        { user_id: userId, role: as.toLowerCase() },
        { onConflict: "user_id,role" }
      );
    }

    // 3) ✅ если это PATIENT и есть refCode — пишем регистрацию в partner_referrals
    if (as === "PATIENT" && refCode) {
      const { data: rows, error: lookupErr } = await supabase.rpc(
        "partner_referral_code_lookup",
        { p_ref_code: refCode }
      );

      const owner = Array.isArray(rows) ? rows[0] : rows;
      const partner_user_id = owner?.partner_user_id;
      const program_key = owner?.program_key;

      if (!lookupErr && partner_user_id && program_key) {
        // вставляем (если у тебя есть unique constraint — лучше сделать upsert)
        await supabase.from("partner_referrals").upsert(
          {
            ref_code: refCode,
            partner_user_id,
            program_key,
            patient_user_id: userId,
          } as any,
          { onConflict: "patient_user_id" }
        );
      }
    }

    const res = NextResponse.json({ ok: true });

    // (опционально) очищаем cookie, чтобы не засчитывать повторно
    res.cookies.set("mt_ref_code", "", { path: "/", maxAge: 0 });

    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
"""
app\api\customer\registration\request\route.ts: """
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, service, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body?.email ?? "").trim().toLowerCase();

  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const supabase = adminClient();

  // найти пользователя в auth по email
  const { data: users, error: e1 } = await supabase.auth.admin.listUsers({ page: 1, perPage: 2000 });
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });

  const u = users.users.find((x) => String(x.email || "").toLowerCase() === email);
  if (!u) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // upsert заявки (одна на user_id)
  const { error } = await supabase
    .from("customer_registration_requests")
    .upsert(
      { user_id: u.id, email, status: "pending" },
      { onConflict: "user_id" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
"""
components\auth\CredentialsForm.tsx: """
// components/auth/CredentialsForm.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useSupabase } from "@/lib/supabase/supabase-provider";

type Mode = "signin" | "signup";

type Props = {
  mode: Mode;
  role: string; // PATIENT | PARTNER | CUSTOMER
  next: string;

  onOtpRequired: (payload: { email: string; password: string }) => void;
  onSignedIn?: () => void; // для модалки: закрыть
};

export default function CredentialsForm({
  mode,
  role,
  next,
  onOtpRequired,
  onSignedIn,
}: Props) {
  const { supabase, refreshRoles, setActiveRole } = useSupabase();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  const schema = useMemo(() => {
    const base = {
      email: z.string().email("Enter a valid email"),
      password: z.string().min(8, "Password must be at least 8 characters"),
    };

    if (mode === "signin") {
      return z.object(base);
    }

    return z
      .object({
        ...base,
        password2: z.string().min(8, "Password must be at least 8 characters"),
      })
      .refine((v) => v.password === v.password2, {
        message: "Passwords do not match",
        path: ["password2"],
      });
  }, [mode]);

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setErrorMsg(null);

    const email = String(data.email).trim().toLowerCase();
    const password = String(data.password);

    try {
      if (mode === "signin") {
        const { data: signData, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setErrorMsg(error.message);
          return;
        }

        const userId = signData.user?.id;
        if (!userId) {
          setErrorMsg("No user");
          return;
        }

        const roleUpper = role.toUpperCase();

        if (roleUpper === "CUSTOMER") {
          // подтянуть роли (должна появиться только после одобрения админом)
          await refreshRoles();

          // проверим, есть ли CUSTOMER в user_roles
          const { data: ur } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", userId)
            .eq("role", "customer")
            .maybeSingle();

          if (!ur) {
            // читаем статус заявки (разрешено политикой "customer can read own request")
            const { data: reqRow } = await supabase
              .from("customer_registration_requests")
              .select("status")
              .eq("user_id", userId)
              .maybeSingle();

            const st = String(reqRow?.status ?? "pending");

            await supabase.auth.signOut();

            if (st === "rejected") {
              setErrorMsg("Ваша заявка на доступ к customer-панели отклонена. Свяжитесь с поддержкой.");
            } else {
              setErrorMsg("Ваша заявка на доступ к customer-панели ещё рассматривается. Дождитесь письма об одобрении.");
            }
            return;
          }

          // роль есть — всё ок
          setActiveRole("CUSTOMER" as any);
          await refreshRoles();

          onSignedIn?.();
          return;
        }

        // ✅ для PATIENT/PARTNER оставляем как было (можно слегка почистить, но пусть)
        const roleSlug = role.toLowerCase();

        await supabase.from("user_roles").upsert(
          { user_id: userId, role: roleSlug },
          { onConflict: "user_id,role" }
        );

        await supabase.from("profiles").upsert(
          { id: userId, email, role: roleSlug },
          { onConflict: "id" }
        );

        setActiveRole(roleUpper as any);
        await refreshRoles();

        await supabase.auth.updateUser({ data: { requested_role: role } });

        onSignedIn?.();
        return;
      }

      // signup
      const res = await fetch("/api/auth/email/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password, as: role, next }),
        cache: "no-store",
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(json?.error || "Failed to sign up");
        return;
      }

      // отправляем OTP (теперь user уже существует, send-otp пропустит)
      const res2 = await fetch("/api/auth/email/send-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, as: role, next, purpose: "verify_email" }),
        cache: "no-store",
      });

      const json2 = await res2.json().catch(() => ({}));
      if (!res2.ok) {
        setErrorMsg(json2?.error || "Failed to send code");
        return;
      }

      onOtpRequired({ email, password });
    } catch (e: any) {
      setErrorMsg(e?.message || "Network error");
    }
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
      <Input
        isRequired
        type="email"
        variant="bordered"
        placeholder="you@email.com"
        errorMessage={errors.email?.message as any}
        {...register("email")}
      />

      <Input
        isRequired
        type={showPass ? "text" : "password"}
        variant="bordered"
        placeholder="Password"
        errorMessage={errors.password?.message as any}
        endContent={
          <button
            type="button"
            className="text-default-500"
            onClick={() => setShowPass((s) => !s)}
            aria-label="toggle password"
          >
            <Icon icon={showPass ? "solar:eye-closed-linear" : "solar:eye-linear"} width={18} />
          </button>
        }
        {...register("password")}
      />

      {mode === "signup" ? (
        <Input
          isRequired
          type={showPass ? "text" : "password"}
          variant="bordered"
          placeholder="Confirm password"
          errorMessage={(errors as any).password2?.message}
          {...register("password2" as any)}
        />
      ) : null}

      {errorMsg && <p className="text-danger text-small">{errorMsg}</p>}

      <Button
        color="primary"
        isLoading={isSubmitting}
        type="submit"
        className="justify-center"
        startContent={<Icon icon={mode === "signin" ? "solar:login-3-linear" : "solar:user-plus-linear"} width={18} />}
      >
        {mode === "signin" ? "Sign in" : "Create account"}
      </Button>
    </form>
  );
}
"""