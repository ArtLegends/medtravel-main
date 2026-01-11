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