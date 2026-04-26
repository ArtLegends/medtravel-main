# MedTravel — Цифровая платформа для медицинского туризма

[![Next.js](https://img.shields.io/badge/Next.js-15.3.6-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue)](https://www.typescriptlang.org/)
[![HeroUI](https://img.shields.io/badge/HeroUI-2.7.10-purple)](https://heroui.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.49.10-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.16-cyan)](https://tailwindcss.com/)

MedTravel (`medtravel.me`) — платформа, которая связывает пациентов с клиниками по всему миру. Пациенты оставляют заявки через лендинги, система автоматически распределяет их клиникам-партнёрам, а клиники ведут CRM прямо в личном кабинете.

---

## Оглавление

1. [Архитектура и стек](#архитектура-и-стек)
2. [Ролевая модель](#ролевая-модель)
3. [Структура проекта](#структура-проекта)
4. [Маршрутизация (App Router)](#маршрутизация-app-router)
5. [База данных (Supabase)](#база-данных-supabase)
6. [Edge Functions (Supabase)](#edge-functions-supabase)
7. [API Routes (Next.js)](#api-routes-nextjs)
8. [Лендинги и лидогенерация](#лендинги-и-лидогенерация)
9. [Комиссионная система](#комиссионная-система)
10. [SEO и мета-теги](#seo-и-мета-теги)
11. [Окружение и переменные](#окружение-и-переменные)
12. [Внешние сервисы](#внешние-сервисы)
13. [Гайд: передача проекта новому разработчику](#гайд-передача-проекта-новому-разработчику)
14. [Команды разработки](#команды-разработки)

---

## Архитектура и стек

### Frontend
| Технология | Версия | Назначение |
|---|---|---|
| Next.js (App Router) | 15.3.6 | SSR/SSG фреймворк, маршрутизация, API routes |
| React | 18.3.1 | UI библиотека |
| TypeScript | 5.6.3 | Типизация |
| HeroUI (NextUI) | 2.7.10 | Компонентная UI-библиотека |
| Tailwind CSS | 3.4.16 | Утилитарные стили |
| Framer Motion | 11.13.1 | Анимации |
| React Hook Form + Zod | 7.49 / 3.22 | Формы и валидация |
| i18next | 23.8.1 | Интернационализация (EN, RU, ES) |
| Recharts | 2.15.3 | Графики и диаграммы |
| Lucide React | 0.544.0 | Иконки |

### Backend и данные
| Технология | Назначение |
|---|---|
| Supabase (PostgreSQL) | База данных, Auth, Storage, Edge Functions, Realtime |
| Supabase Auth | Аутентификация (email/password, magic link) |
| Supabase RLS | Row Level Security — контроль доступа на уровне БД |
| Supabase Edge Functions | Серверные функции (email, SMS, Google Reviews) |
| Vercel | Хостинг, CI/CD, serverless functions |

### Хостинг и домены
| Сервис | Что обслуживает |
|---|---|
| Vercel | Основной сайт `medtravel.me` |
| OVH | DNS-управление доменом `medtravel.me` |
| Flexbe | Внешние лендинги `lp.medtravel.me` |

---

## Ролевая модель

В системе 5 ролей пользователей. Роль хранится в таблице `user_roles` (связь user_id → role). Один пользователь может иметь несколько ролей.

### 1. Patient (Пациент)
- Оставляет заявку через форму на лендинге
- При указании email → автоматически создаётся аккаунт + magic link на почту
- Личный кабинет `/patient` — видит свои заявки, статус, назначенную клинику
- Может отменить заявку (`cancelled_by_patient`)

### 2. Customer (Клиника-партнёр)
- Регистрируется через `/auth/signup` → выбирает роль "Clinic"
- Админ одобряет заявку → клиника получает доступ к `/customer`
- Личный кабинет: Dashboard, Bookings, Patients, Reviews, Inquiries, Clinic Profile, Transactions, Reports
- Получает лидов автоматически (через `autoAssignLead`) или вручную (через admin)
- Видит CRM-статусы, может менять стоимость, назначать даты
- Видит условия комиссии в разделе Transactions

### 3. Partner (Партнёр-аффилейт)
- Привлекает трафик через партнёрские ссылки
- Регистрируется → админ одобряет
- Личный кабинет `/partner` — видит статистику кликов, лидов, выплат
- Получает процент от комиссии (обычно 5% от стоимости процедуры)

### 4. Supervisor (Партнёр-супервайзер)
- Привлекает партнёров-аффилейтов
- Личный кабинет `/supervisor` — видит своих партнёров и их лидов
- Получает 1% от прибыли (10% от комиссии платформы)
- Отдельные отчёты и фильтры

### 5. Admin (Администратор)
- Полный доступ ко всем данным
- `/admin` — модерация клиник, управление пользователями, Partner Leads, финансы
- Одобрение/отклонение заявок на регистрацию
- Ручное назначение лидов клиникам
- Настройка комиссионных правил

### Middleware и защита маршрутов
Файл `middleware.ts` в корне проекта проверяет сессию и роль пользователя, перенаправляя неавторизованных на `/login`. Каждый префикс (`/admin`, `/customer`, `/patient`, `/partner`, `/supervisor`) защищён соответствующей ролью.

---

## Структура проекта

```
medtravel-main/
├── app/                           # Next.js App Router
│   ├── (admin)/admin/             # Админ-панель
│   │   ├── bookings/              # Бронирования
│   │   ├── clinics/               # Управление клиниками
│   │   │   └── detail/            # Детальная страница клиники
│   │   ├── commissions/           # Комиссионные правила
│   │   ├── partner-leads/         # Лиды с лендингов
│   │   ├── partners/              # Список партнёров
│   │   └── ...                    # Moderation, Users, etc.
│   │
│   ├── (customer)/customer/       # Кабинет клиники
│   │   ├── bookings/              # Входящие заявки
│   │   ├── clinic-profile/        # Профиль клиники
│   │   ├── patients/              # CRM пациентов
│   │   ├── reviews/               # Отзывы
│   │   ├── transactions/          # Комиссии и транзакции
│   │   └── reports/               # Жалобы
│   │
│   ├── (patient)/patient/         # Кабинет пациента
│   ├── (partner)/partner/         # Кабинет партнёра
│   ├── (supervisor)/supervisor/   # Кабинет супервайзера
│   ├── (auth)/                    # Логин, регистрация
│   ├── (site)/                    # Публичные страницы
│   │
│   ├── ru/hair-transplant/lp/     # Встроенный лендинг (Next.js)
│   │
│   ├── api/                       # API routes
│   │   ├── admin/                 # API для админки
│   │   ├── customer/              # API для кабинета клиники
│   │   ├── leads/                 # Webhook и лиды
│   │   │   ├── partner/route.ts   # POST — лид с нашего лендинга
│   │   │   └── webhook/route.ts   # POST — лид с Flexbe
│   │   └── ...
│   │
│   └── clinic/[slug]/             # Публичная страница клиники
│
├── components/                    # React-компоненты
│   ├── admin/                     # Компоненты для админки
│   ├── customer/                  # Компоненты для кабинета клиники
│   ├── clinic/                    # Публичные компоненты клиник
│   ├── landing/                   # Компоненты лендинга
│   ├── shared/                    # Общие компоненты
│   └── ui/                        # Базовые UI-элементы
│
├── lib/                           # Утилиты и библиотеки
│   ├── supabase/
│   │   ├── browserClient.ts       # Supabase клиент для браузера
│   │   ├── routeClient.ts         # Клиент для API routes (с cookies)
│   │   ├── serviceClient.ts       # Service Role клиент (обходит RLS)
│   │   └── types.ts               # Автогенерированные типы Supabase
│   ├── leads/
│   │   └── autoAssign.ts          # Автораспределение лидов клиникам
│   ├── mail/
│   │   └── resend.ts              # Email-отправка (Resend API)
│   └── utils.ts                   # Общие хелперы
│
├── config/                        # Конфигурация (site, SEO)
├── data/                          # Статические данные
├── hooks/                         # React hooks
├── locales/                       # i18n переводы (en, ru, es)
├── styles/                        # CSS/Tailwind стили
├── types/                         # TypeScript типы
│
├── middleware.ts                   # Защита маршрутов
├── next.config.js                 # Конфиг Next.js (rewrites, headers)
├── tailwind.config.js             # Конфиг Tailwind
└── tsconfig.json                  # Конфиг TypeScript
```

---

## Маршрутизация (App Router)

### Rewrites (next.config.js)
Next.js проксирует некоторые пути:
- `/:country/hair-transplant/lp/:code` → `/ru/hair-transplant/lp/:code` — лендинг с партнёрской ссылкой
- `/:country/:path*/:slug/review` → `/clinic/:slug/review` — страница отзыва клиники
- `/:country/:path*/:slug/inquiry` → `/clinic/:slug/inquiry` — форма запроса
- `/:country/:path*/:slug` → `/clinic/:slug` — публичная страница клиники

Зарезервированные префиксы (не обрабатываются rewrites): `api`, `_next`, `customer`, `patient`, `partner`, `admin`, `auth`, `settings`.

### Лендинги на Flexbe (внешний домен)
- `lp.medtravel.me/short/` — короткий лендинг (форма: имя + телефон)
- `lp.medtravel.me/quiz/` — квиз-лендинг (6 шагов + телефон)

Подключены через CNAME запись в OVH: `lp` → `lp826051.myflexbe.ru.`
Webhook из Flexbe отправляет данные форм на `medtravel.me/api/leads/webhook`.

---

## База данных (Supabase)

**Project ID:** `oymahnxwcajvaggbydim`
**URL:** `https://oymahnxwcajvaggbydim.supabase.co`

### Основные таблицы

#### Пользователи и роли
| Таблица | Назначение |
|---|---|
| `profiles` | Профили пользователей (id, email, first_name, last_name, phone, role, avatar_url) |
| `user_roles` | Роли пользователей (user_id, role). Связь many-to-many с auth.users |
| `notifications` | Уведомления в системе (user_id, type, data, is_read) |

#### Клиники
| Таблица | Назначение |
|---|---|
| `clinics` | Основные данные клиник (name, slug, status, country, city, address, owner_id, google_place_id). ~1882 клиники |
| `clinic_profile_drafts` | Черновики профилей (клиника редактирует → админ одобряет → publish) |
| `clinic_services` | Связь клиника-услуга (clinic_id, service_id, price, currency). ~30K записей |
| `clinic_staff` | Врачи и персонал клиник |
| `clinic_images` | Изображения клиник |
| `clinic_hours` | Часы работы |
| `clinic_accreditations` | Аккредитации клиник |
| `clinic_amenities` | Удобства клиник |
| `clinic_commission_rules` | Комиссионные правила (rate_pct, fixed_amount, threshold_min/max, service_id) |

#### Заявки и пациенты
| Таблица | Назначение |
|---|---|
| `partner_leads` | Все лиды с лендингов (full_name, phone, email, source, quiz_answers, assigned_partner_id) |
| `patient_bookings` | Бронирования (clinic_id, patient_id, service_id, status, actual_cost, scheduled_at). Привязка к лиду через notes `[lead:UUID]` |
| `bookings` | Старая таблица бронирований (legacy) |
| `clinic_inquiries` | Запросы от пациентов через страницу клиники |
| `clinic_patient_public_ids` | Публичные ID пациентов для каждой клиники (#1001, #1002, ...) |

#### Финансы
| Таблица | Назначение |
|---|---|
| `transactions` | Комиссионные транзакции (clinic_id, booking_id, amount, rate_pct, status: pending/confirmed/paid/void) |
| `invoices` | Счета (пока не используется) |

#### Партнёрская программа
| Таблица | Назначение |
|---|---|
| `partner_referrals` | Партнёрские ссылки |
| `partner_referral_clicks` | Клики по ссылкам |
| `partner_program_requests` | Заявки на партнёрскую программу |
| `supervisor_referrals` | Реферальные ссылки супервайзеров |

#### Контент
| Таблица | Назначение |
|---|---|
| `services` | Каталог услуг (id, name, slug). ~3500 услуг |
| `categories` | Категории (Dentistry, Hair Transplant) |
| `reviews` | Отзывы пациентов |
| `google_reviews` | Отзывы из Google Places |
| `blog_posts` | Блог |
| `contact_messages` | Сообщения с формы обратной связи |

#### Регистрационные заявки
| Таблица | Назначение |
|---|---|
| `customer_registration_requests` | Заявки на регистрацию клиник |
| `partner_registration_requests` | Заявки на регистрацию партнёров |
| `supervisor_registration_requests` | Заявки на регистрацию супервайзеров |
| `new_clinic_requests` | Заявки на добавление новых клиник |

### Views (представления)
Все view-имена начинаются с `v_` и собирают данные из нескольких таблиц с нужными JOIN:

| View | Для кого | Что показывает |
|---|---|---|
| `v_customer_patients` | Customer | Пациенты клиники (booking + lead + service + public_id + quiz_answers) |
| `v_customer_bookings` | Customer | Бронирования клиники |
| `v_customer_transactions` | Customer | Транзакции (комиссии) |
| `v_customer_reviews` | Customer | Отзывы клиники |
| `v_customer_reports` | Customer | Жалобы |
| `v_customer_clinic_requests` | Customer | Заявки на клинику |
| `v_admin_patients` | Admin | Все пациенты с деталями |
| `v_public_clinics` | Public | Публичный каталог клиник |
| `v_clinic_dashboard` | Customer | Метрики для дашборда |

### Ключевые RPC-функции

#### Для Customer Panel
| Функция | Назначение |
|---|---|
| `customer_patients_list(p_status, p_start_date, p_end_date, p_limit, p_offset)` | Список пациентов клиники с фильтрацией и пагинацией |
| `customer_patient_update_status(p_booking_id, p_status)` | Обновление CRM-статуса |
| `customer_patient_set_actual_cost(p_booking_id, p_actual_cost, p_currency)` | Установка фактической стоимости процедуры |
| `customer_patient_set_schedule(p_booking_id, p_scheduled_at)` | Назначение даты приёма |
| `customer_clinic_balance()` | Баланс клиники (outstanding, paid) |
| `customer_commission_dashboard()` | Расширенные метрики: total_owed, total_paid, total_bookings_revenue, revenue_after_commission, limit_reached |
| `customer_commission_terms()` | Условия комиссии для клиники (rule_type, rate_pct, service_name) |

#### Для Admin
| Функция | Назначение |
|---|---|
| `approve_clinic(p_draft_id)` | Одобрение черновика клиники |
| `admin_patients_list(...)` | Список всех пациентов |

#### Для Supervisor
| Функция | Назначение |
|---|---|
| `supervisor_report(p_start_date, p_end_date, p_partner_id, ...)` | Отчёт по лидам с фильтрами |
| `supervisor_stats()` | Общая статистика |
| `supervisor_partners_list(...)` | Список партнёров супервайзера |

#### CRM статусы (patient_bookings.status)
Основные: `pending`, `confirmed`, `cancelled`, `completed`, `cancelled_by_patient`
CRM: `no_answer`, `interested`, `waiting_for_photo`, `consultation`, `consultation_done`, `not_interested`, `not_available`, `sent_ticket`

---

## Edge Functions (Supabase)

| Функция | Назначение | JWT |
|---|---|---|
| `sendBookingEmail` | Отправка email при новом бронировании | Да |
| `send-sms` | Отправка SMS (Twilio) | Нет |
| `send-notification-email` | Email-уведомления (Resend) | Нет |
| `sync-google-reviews` | Синхронизация отзывов из Google Places | Нет |

Секреты Edge Functions настраиваются в Supabase Dashboard → Project Settings → Edge Functions → Secrets:
- `RESEND_API_KEY` — для email через Resend
- `RESEND_FROM` — адрес отправителя
- `SITE_URL` — `https://medtravel.me`
- `GOOGLE_PLACES_API_KEY` — для Google Reviews (если настроен)

---

## API Routes (Next.js)

### Лиды
| Метод | Путь | Назначение |
|---|---|---|
| POST | `/api/leads/partner` | Приём лида с нашего лендинга (формат: FormData) |
| POST | `/api/leads/webhook` | Приём лида с Flexbe (формат: `x-www-form-urlencoded`). Защищён `?token=LEADS_WEBHOOK_SECRET` |

### Admin API
| Метод | Путь | Назначение |
|---|---|---|
| GET | `/api/admin/partner-leads` | Список лидов с пагинацией и фильтрацией |
| PATCH | `/api/admin/partner-leads/assign` | Назначение лида клинике |
| GET | `/api/admin/partners` | Список партнёров |
| CRUD | `/api/admin/commission-rules` | Управление комиссионными правилами |

### Customer API
| Метод | Путь | Назначение |
|---|---|---|
| GET | `/api/customer/patients` | Список пациентов (через RPC) |
| PATCH | `/api/customer/patients/[id]` | Обновление статуса бронирования |
| PATCH | `/api/customer/patients/[id]/actual-cost` | Установка стоимости |
| PATCH | `/api/customer/patients/[id]/schedule` | Назначение даты |

---

## Лендинги и лидогенерация

### Путь лида

1. Пользователь заполняет форму на лендинге
2. Данные отправляются на API (`/api/leads/partner` или `/api/leads/webhook`)
3. Создаётся запись в `partner_leads` (source: `hair-transplant-lp`, `flexbe-short`, `flexbe-quiz`)
4. `autoAssignLead()` — автоматически назначает лид клинике-партнёру:
   - Находит опубликованные клиники с владельцем
   - Выбирает с наименьшим количеством лидов (round-robin)
   - Создаёт `patient_bookings` запись (даже без patient_id)
   - Помечает lead_id в notes: `[lead:UUID]`
5. Email-уведомление клинике о новом лиде
6. Лид появляется в Admin → Partner Leads и Customer → Patients

### autoAssignLead (lib/leads/autoAssign.ts)
Ключевой файл системы распределения. Логика:
- Берёт лид из `partner_leads` по ID
- Если есть email → ищет/создаёт пользователя → устанавливает `patient_id`
- Находит все опубликованные клиники с `owner_id IS NOT NULL`
- Выбирает клинику с минимальным количеством назначенных лидов
- Обновляет `partner_leads.assigned_partner_id`
- Создаёт запись в `patient_bookings` (service_id = 803 — Hair Transplant)
- Отправляет email клинике

### Webhook формат (Flexbe)
Flexbe отправляет `application/x-www-form-urlencoded`:
```
data[client][name]=Имя
data[client][phone]=+7 (123) 4567890
data[page][url]=https://lp.medtravel.me/short/
data[form_data][fld_1][name]=Пол
data[form_data][fld_1][value]=Мужчина
```

Quiz ответы сохраняются в `partner_leads.quiz_answers` как JSON-массив `[{question, answer}, ...]`.

---

## Комиссионная система

### Как работает
1. Админ устанавливает правила в Admin → Commissions:
   - Clinic-wide: процент или фиксированная сумма для всех услуг
   - Per-service: правила для конкретных услуг (service_id)
   - Пороги: threshold_min/threshold_max — правило применяется когда стоимость в диапазоне
2. Когда booking переходит в статус `completed` → trigger `fn_booking_completed_create_commissions` создаёт запись в `transactions`
3. Клиника видит комиссии в Customer → Transactions
4. При достижении $1000 outstanding → `limit_reached = true` → warning banner

### Пример для Este Clinic
- Стоимость процедуры < 1800 EUR → комиссия 250 EUR
- Стоимость процедуры ≥ 1800 EUR → комиссия 300 EUR

### Таблица clinic_commission_rules
| Поле | Описание |
|---|---|
| clinic_id | FK → clinics |
| service_id | FK → services (NULL = clinic-wide) |
| rule_type | `percentage` или `fixed` |
| rate_pct | Процент (если percentage) |
| fixed_amount | Фиксированная сумма (если fixed) |
| threshold_min | Минимальная стоимость (≥) |
| threshold_max | Максимальная стоимость (<) |
| priority | Порядок применения (lower = first) |
| is_active | Активно/неактивно |
| label | Метка, видимая клинике |

---

## SEO и мета-теги

### Где менять мета-теги
- **Глобальные (для всего сайта):** `app/layout.tsx` → объект `metadata`
- **Для отдельных страниц:** каждый `page.tsx` может экспортировать свой `metadata` или `generateMetadata()`
- **Для клиник:** `app/clinic/[slug]/page.tsx` → `generateMetadata()` подтягивает данные клиники
- **Для лендинга:** `app/ru/hair-transplant/lp/page.tsx`
- **Open Graph / Twitter Card:** настраиваются в тех же объектах metadata
- **robots.txt:** `public/robots.txt`
- **sitemap:** генерируется динамически или статически

### Конфигурация сайта
Файл `config/site.ts` — содержит name, description, навигацию и другие базовые настройки.

---

## Окружение и переменные

### .env.local (для локальной разработки)
```env
NEXT_PUBLIC_SUPABASE_URL=https://oymahnxwcajvaggbydim.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Vercel Environment Variables
Все переменные задаются в Vercel Dashboard → Project Settings → Environment Variables:

| Переменная | Назначение |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase проекта |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Публичный anon key Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (обходит RLS, не публиковать!) |
| `LEADS_WEBHOOK_SECRET` | Секретный токен для webhook Flexbe |
| `RESEND_API_KEY` | API-ключ Resend (email) |
| `RESEND_FROM` | Email-адрес отправителя |

Эти же ключи доступны в Supabase Dashboard → Project Settings → API.

---

## Внешние сервисы

| Сервис | URL | Для чего | Credentials |
|---|---|---|---|
| Supabase | supabase.com | БД, Auth, Storage, Edge Functions | Email + пароль |
| Vercel | vercel.com | Хостинг, CI/CD | Email (primary) |
| OVH | ovh.com | Домен `medtravel.me`, DNS-записи | Логин + пароль |
| Flexbe | flexbe.com | Лендинги `lp.medtravel.me` | Логин + пароль |
| GitHub | github.com | Репозиторий исходного кода | Логин + пароль |
| Resend | resend.com | Email-рассылка | API key |

---

## Клонирование и настройка проекта

### Шаг 1: Клонировать репозиторий
```bash
git clone https://github.com/OWNER/medtravel-main.git
cd medtravel-main
```

### Шаг 2: Установить зависимости
```bash
yarn install
```
Проект использует Yarn 4 (berry). Если yarn не установлен:
```bash
corepack enable
corepack prepare yarn@4.11.0 --activate
```

### Шаг 3: Настроить окружение
Создать `.env.local` в корне:
```env
NEXT_PUBLIC_SUPABASE_URL=https://oymahnxwcajvaggbydim.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<скопировать из Supabase → Settings → API → anon/public>
SUPABASE_SERVICE_ROLE_KEY=<скопировать из Supabase → Settings → API → service_role>
LEADS_WEBHOOK_SECRET=<скопировать из Vercel → Environment Variables>
```

### Шаг 4: Запустить локально
```bash
yarn dev
```
Приложение на `http://localhost:3000`.

### Шаг 5: Подключить свой GitHub
Если репозиторий ещё на старом аккаунте:
1. Fork репозиторий или создать свой
2. Добавить как remote: `git remote set-url origin https://github.com/NEW_OWNER/medtravel-main.git`
3. Push: `git push -u origin main`

### Шаг 6: Подключить к Vercel
Если используется существующий Vercel аккаунт:
1. Vercel Dashboard → проект уже подключён к GitHub репозиторию
2. Если нужно переподключить к другому репо: Project Settings → Git → Connected Git Repository → изменить

Если создаётся новый Vercel аккаунт:
1. Зарегистрироваться на vercel.com
2. Import Project → выбрать репозиторий из GitHub
3. Framework Preset: Next.js
4. Перенести все Environment Variables из старого проекта
5. Deploy
6. Подключить домен: Domains → Add Domain → `medtravel.me`
7. В OVH обновить A-запись на новый IP Vercel (если изменился)

### Шаг 7: Проверить что всё работает
1. `medtravel.me` — сайт должен работать
2. `/admin` — админ панель и остальные панели должны работать
3. Отправить тестовую заявку с лендинга → лид появляется в Partner Leads
4. Проверить `lp.medtravel.me/short/` — лендинг Flexbe работает

---

## Команды разработки

```bash
# Разработка
yarn dev              # Dev-сервер с Turbopack (hot reload)

# Сборка
yarn build            # Production build
yarn start            # Запуск production build

# Линтинг
yarn lint             # ESLint

# Обновление типов Supabase (после изменений в БД)
# Windows:
npx.cmd supabase gen types typescript --project-id oymahnxwcajvaggbydim --schema public > lib/supabase/types.ts

# Linux/Mac:
npx supabase gen types typescript --project-id oymahnxwcajvaggbydim --schema public > lib/supabase/types.ts

# Деплой в production
git add .
git commit -m "описание изменений"
git push                # Vercel автоматически задеплоит
```

### Vercel CI/CD
Каждый `git push` в ветку `main` автоматически запускает деплой в Vercel. Preview-деплои создаются для pull requests.

---
