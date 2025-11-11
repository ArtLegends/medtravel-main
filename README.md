# MedTravel — Customer Panel & Platform

MedTravel — платформа для медицинского туризма: пациенты ищут клиники, читают профили/отзывы и записываются на приём.  
Этот репозиторий содержит **Customer Panel** (кабинет клиники) и базовые части фронтенда.

## TL;DR
- **Stack:** Next.js (App Router) + TypeScript + TailwindCSS  
- **Data:** Supabase (Postgres + RLS), вьюхи `v_customer_*`  
- **UI:** наши локальные компоненты (+ `@heroui` выборочно)  
- **Фокус:** Bookings, Reports, **Clinic Profile (многошаговая анкета)**

---

## Содержание
- [Архитектура](#архитектура)
- [Стандарты UI/UX](#стандарты-uiux)
- [База данных](#база-данных)
- [RLS и безопасность](#rls-и-безопасность)
- [Локальный запуск](#локальный-запуск)
- [ENV переменные](#env-переменные)
- [Команды](#команды)
- [Дорожная карта](#дорожная-карта)
- [Contribution](#contribution)

---

## Архитектура

app/
(customer)/customer/
bookings/ # Bookings list + filters + actions
reports/ # Reports list (user-submitted about clinic)
clinic/
basic/ # Basic Information
services/
doctors/
facilities/
hours/
gallery/
location/
pricing/ # Payment methods
dashboard/
patients/
reviews/
transactions/
settings/
components/
customer/
TableShell.tsx
clinic/ClinicProfileLayout.tsx
ui/ # общие UI (button, input, select, card, ...)
contexts/
ClinicProfileContext.tsx
lib/
supabase/
adminClient.ts
serverClient.ts
server-actions/
clinic-profile.ts # saveDraftSection/getDraft/submitForReview
export.ts # CSV экспорты
types/
clinic.ts # типы: ClinicStatus, Doctor, PaymentMethod, ...


**Ключевые принципы**
- App Router, серверные компоненты там, где уместно (списки/таблицы).
- Никаких внешних шаблонов «как есть» — только наш слой UI/контексты/экшены.
- Фильтры синхронизируются с URL query params.
- Опасные действия — с явным подтверждением.

---

## Стандарты UI/UX

- Заголовок слева, действия справа (Refresh / Export / Delete All).
- Фильтры в `Card` со стандартными полями и кнопкой `Reset Filters` справа снизу.
- Таблицы через `TableShell`; пустое состояние — в пропсе `empty`.
- Цвета действий:
  - Primary: синий (submit/save),
  - Destructive: розовый/красный (Delete All),
  - Outline: вторичное действие.
- Даты — короткий локализованный формат.
- Кликабельные ряды — с hover, но без сюрпризов (никаких «скрытых» действий).

---

## База данных

### Вьюхи

**`v_customer_bookings` (пример полей)**

```sql
create or replace view v_customer_bookings as
select
  b.id            as booking_id,
  b.clinic_id,
  b.created_at,
  p.full_name     as patient_name,
  p.phone,
  b.contact_method,
  s.name          as service,
  b.status
from bookings b
join patients p on p.id = b.patient_id
left join services s on s.id = b.service_id;

Индексы на исходных таблицах:

bookings (clinic_id, created_at desc),

bookings (clinic_id, status),

patients (phone).

v_customer_reports

Уже используется: id, clinic_id, created_at, reporter, contact, relationship, details, status.

Черновик клиники

clinic_profile_drafts (рекомендуемая схема)

create table if not exists clinic_profile_drafts (
  clinic_id uuid primary key references clinics(id) on delete cascade,
  status text not null default 'draft', -- draft|pending|published|rejected
  basic_info jsonb,
  services jsonb,
  doctors jsonb,
  facilities jsonb,
  hours jsonb,
  gallery jsonb,
  location jsonb,
  pricing jsonb,
  updated_at timestamptz not null default now()
);


JSON-формы (shape)

basic_info: { name, specialty, country, city, province?, district?, address, description?, slug? }

services: [{ name, price, category, description }]

doctors: [{ name, specialty, experience, qualifications, photo_url? }]

facilities: { premises: string[], clinic_services: string[], travel_services: string[], languages_spoken: string[] }

hours: [{ day: "Monday", hours: "9:00 AM - 5:00 PM" | "Closed" }]

gallery: [{ url, title? }]

location: { google_maps_url, directions, latitude?, longitude? }

pricing: { paymentMethods: string[] }

RLS и безопасность

Все селекты в Customer Panel фильтруются по clinic_id текущей клиники.

RLS политики:

using (clinic_id = auth.uid()::uuid or clinic_id in (... mapping ...)) — зависит от вашей модели маппинга аккаунта ↔ клиника.

Запись в clinic_profile_drafts разрешена только владельцу клиники.

Массовые операции (Delete All) — только в рамках своего clinic_id.

Экспорты CSV — формируются на сервере и включают только доступные пользователю данные.


------------------------------------------------

кастомер панель нужна для клиники, которая хочет пользоваться нашим сервисом агрегатором и загрузить свою клинику на сервис. мы уже реализовали некоторые страницы в кастомер панели полностью статичные и с самым базовым дизайном, сейчас мы полностью переходим на ее разработку. и прежде всего нужно подготовить все в supabase, это также и новая роль customer. в этой панели нужен будет функционал добавления клиники вручную в точности такой же, который мы реализовали в админ панели, лишь одно дополнение будет, это то, что при коли customer клиника не сразу будет грузиться в публичный каталог, она должна будет пройти модерацию, у нас в таблице clinics уже есть кое-какие колонки для этого как owner_id и moderation_status, и я думаю модерацией будет заниматься роль admin, то есть просто в админ панели реализуем для начала какой-то раздел, чтобы модерировать клиники поступающие на добавление в каталог от роли customer. далее разделы в кастомер панели это Bookings - принятие заявок для конкретно этой клиники, которая ее опубликовала и прошла модерацию(практически как в админ панели уже реализовывали), раздел Patients - список пациентов этой клиники, которые записались на какие-либо услуги клиники, раздел Reviews - список отзывов, который пользователи оставляли конкретно этой клинике, причем у клиники должна быть возможность модерировать своими отзывами, который пользователи оставляют для этой клиники, то есть клиники может его опубликовать и он должен будет отобразиться на странице этой клиники в той секции где отзывы или же отклонить и не публиковать отзыв, раздел Transactions - список транзакций, раздел Reports - это список репортов как мы реализовывали в админ панели, только для этой конкретной клиники, раздел Settings - это настройки профиля этой клиники, такие как смена пароля, поле с главным email, дополнительным email, настройкой time zone, раздел Dashboard - такой же раздел как в админ панели, только статистика ведется конкретной этой клиники, количество заявок, репортов и так далее. это я расписал по разделам кастомер панели, в которые будут приходить данные в виде списков(кроме раздела settings) и это колонки в каком виде для каждого раздела должны будут приходить данные конкретной клиники из supabase: bookings_customer - name, phone, contact method, service, status, created at, actions. patiens_customer - patient id, patient name, phone, service, status, preliminary cost of service, actual cost of service, actions. reviews_customer - date, reviewer, rating, comment, status, actions. transactions_customer - invoice id, status, invoice price, actions. settings - main email, password, additional email, time zone. reports_customer - date, reporter, contact, relationship, details, status, actions.

--------------------------------------------------

Этап 0. Базовые определения, роли, справочники
0.1. Роли и аккаунты

В profiles (или вашей users-профиль таблице) добавляем поле:

role text check (role in ('admin','customer','patient') ) default 'patient'

Для клиник с несколькими операторами сразу предусмотрим членство:

clinic_members(id, clinic_id uuid, user_id uuid, role text check (role in ('owner','manager','agent')), created_at)

Один владелец (owner) = тот, кто создал клинику; остальные — менеджеры.

0.2. Статусы/enum’ы

clinics.moderation_status ∈ ('pending','approved','rejected'), default 'pending'

reviews.status ∈ ('pending','published','rejected'), default 'pending'

bookings.status ∈ ('new','in_progress','done','cancelled')

invoices.status ∈ ('draft','awaiting_payment','paid','void')

Этап 1. Схема БД (миграции)
1.1. Клиники и модерация

Если уже есть clinics, проверяем/добавляем:

alter table public.clinics
  add column if not exists owner_id uuid references auth.users(id) on delete set null,
  add column if not exists moderation_status text check (moderation_status in ('pending','approved','rejected')) default 'pending',
  add column if not exists moderation_comment text;

create index if not exists clinics_owner_id_idx on public.clinics(owner_id);
create index if not exists clinics_moderation_idx on public.clinics(moderation_status);

1.2. Заявки/бронирования (Bookings)

(если есть — сверяем поля)

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  patient_id uuid null references public.patients(id) on delete set null,
  name text not null,
  phone text not null,
  contact_method text, -- 'phone','whatsapp','telegram','email'
  service text,
  status text check (status in ('new','in_progress','done','cancelled')) default 'new',
  preliminary_cost numeric null,
  actual_cost numeric null,
  created_at timestamptz default now()
);
create index if not exists bookings_clinic_idx on public.bookings(clinic_id);

1.3. Пациенты

Можно хранить плоско (или агрегировать из bookings):

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  name text not null,
  phone text,
  created_at timestamptz default now()
);
create index if not exists patients_clinic_idx on public.patients(clinic_id);

1.4. Отзывы
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  reviewer text,
  rating int check (rating between 1 and 5),
  comment text,
  status text check (status in ('pending','published','rejected')) default 'pending',
  created_at timestamptz default now()
);
create index if not exists reviews_clinic_idx on public.reviews(clinic_id);
create index if not exists reviews_status_idx on public.reviews(status);

1.5. Транзакции/Счета
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  amount numeric not null,
  currency text default 'USD',
  status text check (status in ('draft','awaiting_payment','paid','void')) default 'draft',
  created_at timestamptz default now()
);
create index if not exists invoices_clinic_idx on public.invoices(clinic_id);

1.6. Репорты (жалобы/сообщения)
create table if not exists public.clinic_reports (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  reporter text,
  contact text,
  relationship text,  -- e.g. 'patient','visitor'
  details text,
  status text check (status in ('new','in_review','resolved','rejected')) default 'new',
  created_at timestamptz default now()
);
create index if not exists clinic_reports_clinic_idx on public.clinic_reports(clinic_id);

1.7. Вьюхи под SEO/дашборды (есть часть уже)

mv_catalog_clinics (с min_price) — уже обсудили ранее.

Счётчики для Dashboard:

create view public.v_clinic_dashboard as
select
  c.id as clinic_id,
  count(distinct b.id) filter (where b.status = 'new') as bookings_new,
  count(distinct b.id) filter (where b.status = 'done') as bookings_done,
  count(distinct r.id) filter (where r.status = 'pending') as reviews_pending,
  count(distinct cr.id) filter (where cr.status = 'new') as reports_new,
  sum(i.amount) filter (where i.status = 'paid') as revenue_paid
from clinics c
left join bookings b on b.clinic_id = c.id
left join reviews r on r.clinic_id = c.id
left join clinic_reports cr on cr.clinic_id = c.id
left join invoices i on i.clinic_id = c.id
group by c.id;

Этап 2. RLS-политики (Supabase Row-Level Security)

Включаем RLS на таблицах и прописываем правила:

2.1. Клиники
alter table public.clinics enable row level security;

-- Владельцы и члены видят ТОЛЬКО свои клиники
create policy "clinic_owner_or_member_select"
on public.clinics for select
using (
  owner_id = auth.uid()
  or exists (select 1 from public.clinic_members m where m.clinic_id = clinics.id and m.user_id = auth.uid())
);

-- Создание клиник разрешено CUSTOMER
create policy "customer_insert_clinic"
on public.clinics for insert
with check ( auth.uid() = owner_id );

-- Обновлять может только владелец/менеджер (но НЕ менять moderation_status)
create policy "clinic_owner_update"
on public.clinics for update
using (
  owner_id = auth.uid()
  or exists (select 1 from public.clinic_members m where m.clinic_id = clinics.id and m.user_id = auth.uid())
)
with check (
  owner_id = auth.uid()
  or exists (select 1 from public.clinic_members m where m.clinic_id = clinics.id and m.user_id = auth.uid())
);


Модерацию (moderation_status) меняем через админ-API (серверный ключ) — RLS на UPDATE для админов можно не писать, т.к. это будет идти от Service Role.

2.2. Остальные таблицы (аналогично)

Для каждой: bookings, patients, reviews, invoices, clinic_reports:

alter table public.bookings enable row level security;

create policy "bookings_select_own_clinic"
on public.bookings for select
using (
  exists (select 1 from clinics c
          where c.id = bookings.clinic_id
            and (c.owner_id = auth.uid()
                 or exists(select 1 from clinic_members m where m.clinic_id = c.id and m.user_id = auth.uid())))
);

create policy "bookings_ins_own_clinic"
on public.bookings for insert
with check (
  exists (select 1 from clinics c
          where c.id = bookings.clinic_id
            and (c.owner_id = auth.uid()
                 or exists(select 1 from clinic_members m where m.clinic_id = c.id and m.user_id = auth.uid())))
);

create policy "bookings_upd_own_clinic"
on public.bookings for update
using (
  exists (select 1 from clinics c
          where c.id = bookings.clinic_id
            and (c.owner_id = auth.uid()
                 or exists(select 1 from clinic_members m where m.clinic_id = c.id and m.user_id = auth.uid())))
)
with check (
  exists (select 1 from clinics c
          where c.id = bookings.clinic_id
            and (c.owner_id = auth.uid()
                 or exists(select 1 from clinic_members m where m.clinic_id = c.id and m.user_id = auth.uid())))
);


То же — для patients, reviews, invoices, clinic_reports.

2.3. Публичный каталог

Публичные страницы читают только approved:

create or replace view public.v_public_clinics as
select * from public.clinics where moderation_status = 'approved';


(или фильтровать = 'approved' в селектах.)

Этап 3. Модерация клиник (админ)

В админ-панели раздел “Moderation”:

листинг всех клиник moderation_status in ('pending','rejected') (+ поиск/фильтры)

действия: Approve/Reject с комментарием → апдейт clinics.moderation_status (через серверные действия/роуты с сервис-ключом).

Нотификации (опционально): письмо/телеграм владельцу.

Этап 4. Customer-панель: структура роутинга (Next.js)

Под /customer/*:

/customer → Dashboard (виджеты по v_clinic_dashboard + графики)

/customer/clinics/new → форма «Добавить клинику» (создаёт запись clinics со status='pending')

/customer/bookings → таблица заявок (колонки: name, phone, contact method, service, status, created at, actions)

/customer/patients → таблица пациентов (patient id, name, phone, service, status, preliminary cost, actual cost, actions)

/customer/reviews → список отзывов (date, reviewer, rating, comment, status, actions [Publish/Reject])

/customer/transactions → счета (invoice id, status, price, actions [оплатить/скачать])

/customer/reports → репорты (date, reporter, contact, relationship, details, status, actions)

/customer/settings → настройки: main email (readonly из auth?), password (reset), additional email(s), time zone

Пока простые серверные компоненты + server actions со Zod-валидацией.

Этап 5. API/Server Actions (первый набор)
5.1. Клиника

createClinic(payload) — owner_id = auth.uid(), moderation_status='pending'

updateClinicBasics(payload) — только для owner/manager; без права менять moderation_status

5.2. Bookings

listBookings(clinic_id, paging, search)

updateBookingStatus(id, status)

createBooking (если надо из панели)

setCosts(id, preliminary_cost, actual_cost)

5.3. Patients

listPatients(clinic_id, paging, search)

createPatient / updatePatient (опционально). В простом варианте пациенты автосоздаются при подтверждённых заявках.

5.4. Reviews

listReviews(clinic_id, status?)

moderateReview(id, 'published'|'rejected')

5.5. Invoices

listInvoices(clinic_id)

payInvoice(id) (интеграция с платежкой позже; пока — заглушка ‘paid’)

5.6. Reports

listReports(clinic_id)

updateReportStatus(id, status)

Этап 6. UI-компоненты таблиц

Единая таблица (DataTable) с:

серверной пагинацией, сортировкой

сохранением фильтров в query-строке

«Actions» (кнопки/меню)

Колонки:

Bookings: name | phone | contact_method | service | status | created_at | actions

Patients: id | name | phone | service | status | preliminary_cost | actual_cost | actions

Reviews: date | reviewer | rating | comment | status | actions (Publish / Reject)

Transactions: invoice id | status | amount | actions

Reports: date | reporter | contact | relationship | details | status | actions

Этап 7. Settings

Main email: тянем из Supabase Auth; редактирование через Magic Link / email change flow (родной Supabase)

Password: reset password (Supabase)

Additional emails: массив/таблица clinic_emails(clinic_id, email, is_primary bool default false) или jsonb-поле

Time zone: хранить в clinics.time_zone / clinic_settings(time_zone, …)

RLS: редактировать может только владелец/менеджер

Этап 8. Права доступа/гард для маршрутов

Серверные layout-guard: если profile.role !== 'customer' → 403

Если customer привязан к нескольким клиникам:

быстрый селектор «Current clinic» в шапке панели → передавать clinic_id в запросы

Фолбэк: если клиник нет → редирект на /customer/clinics/new

Этап 9. Модуль модерации отзывов клиникой

В панели клиника видит только свои отзывы в status='pending'|'rejected'|'published'

Действия:

Publish → reviews.status='published'

Reject → reviews.status='rejected'

На публичной карточке клиники выводим только status='published'

Этап 10. Отчётность и аудит

Таблица audit_log(id, user_id, clinic_id, entity, entity_id, action, meta jsonb, created_at)

пишем через DB trigger или в Server Action

поможет в разборе инцидентов/споров

Для админки — сводка по изменениями клиник/цен/отказам

Этап 11. Уведомления (после MVP)

Email/SMS/Telegram о:

новой заявке клинике

новом отзыве (ожидает модерации)

решении по модерации клиники

Хранить настройки уведомлений в clinic_settings

Этап 12. Безопасность / хозяйка

Все критичные операции — через Server Actions (с проверкой auth.uid() и RLS)

Маскирование телефонов в таблицах по умолчанию (показывать целиком в модалке “View”)

Rate limiting на публичные формы (Cloudflare Turnstile/ReCAPTCHA + edge-rate-limit)

Политики доступа перепроверить на каждой таблице (select/insert/update/delete)

Логи и алерты Supabase + Vercel (ошибки/латентность)

Этап 13. План внедрения по спринтам

Спринт 1 (бэкенд база + доступы)

Миграции (таблицы из Этапа 1)

RLS-политики (Этап 2)

Вьюха mv_catalog_clinics/v_clinic_dashboard

Базовые серверные функции createClinic, listBookings

Спринт 2 (UI каркас панели)

/customer layout, селектор текущей клиники

Dashboard (счётчики из v_clinic_dashboard)

/customer/clinics/new форма отправки на модерацию

Спринт 3 (Bookings + Patients)

Таблицы, фильтры, смена статусов

Автосоздание пациента при подтверждении заявки

Спринт 4 (Reviews + Moderation by clinic)

Таблица отзывов, кнопки publish/reject

Публичный вывод только published

Спринт 5 (Transactions + Reports)

Таблицы, минимум действий (оплата — заглушка)

Обработка статусов репортов

Спринт 6 (Settings + polish)

Emails/timezone/password

Улучшение UX, пустые состояния, экспорт CSV

Спринт 7 (Админ-модерация клиник)

Раздел в админке: approve/reject + комментарий

Почтовые нотификации

Спринт 8 (Нотификации и защита)

Email/Telegram уведомления

Rate limiting, captcha на формы

Соответствие колонок из ТЗ ↔ источники

bookings_customer: name, phone, contact_method, service, status, created_at → bookings

patients_customer: patient id, patient name, phone → patients; service, status, preliminary/actual cost → из bookings (последняя заявка/связь по patient_id)

reviews_customer: date(created_at), reviewer, rating, comment, status → reviews

transactions_customer: invoice id, status, invoice price → invoices (id, status, amount)

reports_customer: date, reporter, contact, relationship, details, status → clinic_reports

settings: main email (Auth), password (reset flow), additional email(s) (таблица/поле), time zone (clinic_settings/clinics)




------------------------------------------


Отчёт: импорт клиник из WhatClinic в Supabase
1) Общая схема процесса (ETL)

Staging загрузка «как есть» → таблица public.whatclinic_raw (CSV/NDJSON/JSONL).

Очистка и нормализация в stg_* представлениях/CTE: тримы, lower-case e-mail/URL, нормализация телефонов, разбор JSON-полей (услуги/языки/часы/врачи), выравнивание страны/города, генерация slug.

Дедупликация по устойчивым ключам (src='whatclinic' + src_id, или fallback по (normalized_name, city, phone)), вычисление content_hash для идемпотентных upsert’ов.

Upsert в боевые таблицы:

clinics (мастер-карточка клиники),

clinic_services, clinic_doctors, clinic_images, clinic_hours, clinic_accreditations, clinic_languages,

clinic_sources (линк на первоисточник + content_hash).

Обогащение (опц.): геокодинг недостающих координат, нормализация категорий к нашему справочнику service_categories.

Индексы + FTS: быстрый поиск и фильтрация.

Аудит/повторная загрузка: идемпотентность через content_hash + updated_at, обновляем только изменившиеся записи.

2) Схема стейджинга: public.whatclinic_raw

Храним всё из WhatClinic без потерь, включая сложные поля как jsonb.

create table if not exists public.whatclinic_raw (
  id                bigserial primary key,
  src               text not null default 'whatclinic',  -- источник
  src_id            text not null,                       -- id в источнике
  fetched_at        timestamptz not null default now(),  -- когда скачали
  url               text,
  website           text,
  email             text,
  phones            jsonb,         -- массив строк телефонов
  name              text,
  description       text,
  country           text,
  country_code      text,          -- если отдаёт ISO2/3, сохраняем
  city              text,
  district          text,
  address           text,
  latitude          numeric,       -- как пришло
  longitude         numeric,
  services          jsonb,         -- массив строк/объектов
  specialties       jsonb,         -- массив строк
  pricing           jsonb,
  opening_hours     jsonb,         -- массив объектов {day, open, close}
  languages         jsonb,         -- массив строк
  accreditations    jsonb,         -- массив объектов {name, logo_url?}
  images            jsonb,         -- массив URL'ов или объектов
  doctors           jsonb,         -- массив объектов {name, specialty, ...}
  reviews           jsonb,         -- опц.
  raw               jsonb,         -- оригинальный JSON (как бэкап)
  content_hash      text,          -- md5 от нормализованных ключевых полей
  unique (src, src_id)
);


Замечания

content_hash вычисляем на этапе загрузки/очистки из подмножества ключевых полей (имя, адрес, телефоны, услуги и т.п.) — помогает определять, менялась ли запись с прошлого импорта.

3) Нормализация/очистка (ключевые правила)

name, city, country — trim(), переизбыточные пробелы → одиночный пробел.

email → lower(email), валидация простой regex.

website/url → добавляем https:// если отсутствует схема; убираем UTM-хвосты.

телефоны: оставляем только цифры и +, приводим к E.164 когда возможно (через страну), храним и «сырое», и нормализованное.

slug генерируем как slugify(name + '-' + city) с латиницей.

country → ISO2 через мэппинг; city/district — без диакритики (для поиска).

latitude/longitude: если отсутствуют, можем попробовать геокодер позже (отложенное обогащение).

services/specialties/languages — к нижнему регистру и trim; в дальнейшем сопоставляем со справочником категорий (опционально уже на этапе upsert).

4) Боевая модель (фрагмент)
-- мастер
create table if not exists public.clinics (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text not null unique,
  description      text,
  country_code     text not null,       -- ISO2
  city             text not null,
  district         text,
  address          text,
  latitude         numeric,
  longitude        numeric,
  website          text,
  email            text,
  phone_primary    text,
  phone_alt        text[],
  status           text not null default 'imported', -- imported|enriched|published|hidden
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists public.clinic_sources (
  clinic_id        uuid references public.clinics(id) on delete cascade,
  src              text not null,
  src_id           text not null,
  content_hash     text not null,
  first_seen_at    timestamptz not null default now(),
  last_seen_at     timestamptz not null default now(),
  primary key (clinic_id, src, src_id)
);

create table if not exists public.clinic_services (
  clinic_id        uuid references public.clinics(id) on delete cascade,
  service_name     text not null,
  category         text,          -- нормализованная категория (из справочника), опц.
  price_text       text,
  description      text,
  primary key (clinic_id, service_name)  -- грубый, ок для импорта
);

create table if not exists public.clinic_doctors (
  clinic_id        uuid references public.clinics(id) on delete cascade,
  idx              int not null,
  full_name        text not null,
  specialty        text,
  experience       text,
  qualifications   text,
  photo_url        text,
  primary key (clinic_id, idx)
);

create table if not exists public.clinic_images (
  clinic_id        uuid references public.clinics(id) on delete cascade,
  idx              int not null,
  url              text not null,
  title            text,
  primary key (clinic_id, idx)
);

create table if not exists public.clinic_hours (
  clinic_id        uuid references public.clinics(id) on delete cascade,
  day              text not null,        -- Monday..Sunday
  status           text not null,        -- open|closed
  time_open        text,
  time_close       text,
  primary key (clinic_id, day)
);

create table if not exists public.clinic_accreditations (
  clinic_id        uuid references public.clinics(id) on delete cascade,
  idx              int not null,
  name             text not null,
  logo_url         text,
  description      text,
  primary key (clinic_id, idx)
);

create table if not exists public.clinic_languages (
  clinic_id        uuid references public.clinics(id) on delete cascade,
  language         text not null,
  primary key (clinic_id, language)
);

5) Индексы и поиск
-- поиск по названию/городу
create index if not exists clinics_city_idx on clinics (lower(city));
create index if not exists clinics_country_idx on clinics (country_code);

-- FTS
alter table clinics add column if not exists search_tsv tsvector;
create index if not exists clinics_search_tsv_idx on clinics using gin(search_tsv);

create or replace function clinics_tsv_update() returns trigger as $$
begin
  new.search_tsv :=
    setweight(to_tsvector('simple', coalesce(new.name,'')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.city,'')), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.address,'')), 'C');
  return new;
end $$ language plpgsql;

drop trigger if exists trg_clinics_tsv on clinics;
create trigger trg_clinics_tsv
before insert or update on clinics
for each row execute function clinics_tsv_update();

6) Стратегия upsert и идемпотентность

Уникальный внешний ключ: (src, src_id).

Таблица clinic_sources хранит content_hash.

Алгоритм:

Находим существующую clinic_id по (src, src_id). Если нет — создаём новую клинику (status='imported').

Если content_hash совпадает с последним clinic_sources.content_hash → пропускаем обновление (ничего не менялось).

Если хэш различается — обновляем поля клиники и зависимые коллекции атомарно (транзакция).

В clinic_sources.last_seen_at и content_hash — апдейт.

7) RLS/безопасность (кратко)

Для всех публичных страниц поиска RLS не включаем или используем публичную роль чтения.

Для Customer Panel RLS фильтрует по clinic_id, связанной с текущим пользователем/организацией.

В импортных таблицах (whatclinic_raw) RLS можно отключить — это админский стейджинг.

Инструкция: как повторить импорт с нуля
A. Подготовка

Создайте таблицы (из секций выше): whatclinic_raw и боевые (clinics, clinic_*, clinic_sources).
Выполните SQL в Supabase SQL Editor.

Создайте функцию tsv/триггер (см. раздел про FTS).

(Опц.) Добавьте справочник категорий service_categories и таблицу соответствий, если хотите нормализовать названия услуг.

B. Загрузка сырых данных (CSV/NDJSON)
Вариант 1 — через psql \copy (быстро и надёжно)
# CSV с хедерами, поля: как в whatclinic_raw, сложные поля в JSON строках
psql "$SUPABASE_DB_URL" \
  -c "\copy public.whatclinic_raw (src,src_id,url,website,email,phones,name,description,country,country_code,city,district,address,latitude,longitude,services,specialties,pricing,opening_hours,languages,accreditations,images,doctors,reviews,raw,content_hash) from 'whatclinic_dump.csv' with (format csv, header true, quote '\"', escape '\"')"


Если у вас NDJSON/JSONL, можно временно грузить в raw jsonb, а затем jsonb_populate_record/-> разложить по целевым колонкам.

Вариант 2 — Supabase Studio → «Import data»

Таблица public.whatclinic_raw → Import → CSV.

Поставьте галочку «First row is header».

C. Очистка/трансформация (CTE или временные представления)

Ниже — пример запроса, который нормализует ключевые поля и готовит данные к upsert в clinics:

with base as (
  select
    r.*,
    trim(regexp_replace(r.name, '\s+', ' ', 'g')) as name_clean,
    trim(regexp_replace(coalesce(r.city,''), '\s+', ' ', 'g')) as city_clean,
    trim(regexp_replace(coalesce(r.country,''), '\s+', ' ', 'g')) as country_clean,
    lower(r.email) as email_lower,
    case
      when r.website ~* '^(http|https)://' then r.website
      when r.website is null or r.website = '' then null
      else 'https://' || r.website
    end as website_norm
  from whatclinic_raw r
),
phones_norm as (
  select
    b.id,
    array_agg(distinct regexp_replace(x::text, '[^0-9+]', '', 'g')) filter (where x is not null and x <> '') as phones_e164
  from base b
  left join lateral jsonb_array_elements_text(b.phones) as x on true
  group by b.id
),
prep as (
  select
    b.*, p.phones_e164,
    lower(regexp_replace(b.city_clean, '[^a-z0-9]+', '-', 'g')) as city_slug,
    lower(regexp_replace(b.name_clean || '-' || b.city_clean, '[^a-z0-9]+', '-', 'g')) as clinic_slug
  from base b
  left join phones_norm p on p.id = b.id
)
select * from prep;


Этот CTE можно сохранить как view stg_whatclinic_prepared для удобства.

D. Upsert в clinics (мастер) и clinic_sources
-- 1) вставляем/обновляем клинику
with prepared as (
  select * from stg_whatclinic_prepared
),
upsert_clinic as (
  insert into clinics as c (
    name, slug, description,
    country_code, city, district, address,
    latitude, longitude, website, email, phone_primary, phone_alt, status
  )
  select
    p.name_clean,
    p.clinic_slug,
    p.description,
    coalesce(nullif(p.country_code,''), p.country_clean),  -- если есть ISO2, используем
    p.city_clean,
    p.district,
    p.address,
    p.latitude, p.longitude,
    p.website_norm,
    p.email_lower,
    coalesce(p.phones_e164[1], null),
    case when array_length(p.phones_e164,1) > 1 then p.phones_e164[2:array_length(p.phones_e164,1)] else null end,
    'imported'
  from prepared p
  on conflict (slug) do update set
    description   = excluded.description,
    address       = excluded.address,
    latitude      = excluded.latitude,
    longitude     = excluded.longitude,
    website       = excluded.website,
    email         = excluded.email,
    phone_primary = excluded.phone_primary,
    phone_alt     = excluded.phone_alt,
    updated_at    = now()
  returning c.id, c.slug
),
link_source as (
  -- сопоставляем prepared к clinics по slug
  select p.id as raw_id, c.id as clinic_id, p.src, p.src_id, p.content_hash
  from stg_whatclinic_prepared p
  join clinics c on c.slug = p.clinic_slug
)
insert into clinic_sources (clinic_id, src, src_id, content_hash, first_seen_at, last_seen_at)
select clinic_id, src, src_id, content_hash, now(), now()
from link_source
on conflict (clinic_id, src, src_id) do update
set content_hash = excluded.content_hash,
    last_seen_at = excluded.last_seen_at;


Если вы хотите строже матчить по (src, src_id) (а не по slug), то сначала найдите clinic_id по clinic_sources, и только если не нашли — создайте новую clinic и сразу вставьте строку в clinic_sources.

E. Upsert зависимых коллекций
Services
with items as (
  select
    c.id as clinic_id,
    trim(x->> 'name') as service_name,
    nullif(trim(x->> 'category'),'') as category,
    nullif(trim(x->> 'price'),'')    as price_text,
    nullif(trim(x->> 'description'),'') as description
  from whatclinic_raw r
  join clinic_sources cs on cs.src='whatclinic' and cs.src_id = r.src_id
  join clinics c on c.id = cs.clinic_id
  left join lateral jsonb_array_elements(
    case when jsonb_typeof(r.services) = 'array' then r.services else '[]'::jsonb end
  ) x on true
)
insert into clinic_services (clinic_id, service_name, category, price_text, description)
select clinic_id, service_name, category, price_text, description
from items
where coalesce(service_name,'') <> ''
on conflict (clinic_id, service_name) do update
set category   = excluded.category,
    price_text = excluded.price_text,
    description= excluded.description;


Аналогично — clinic_doctors, clinic_images, clinic_hours, clinic_accreditations, clinic_languages, меняя парсер jsonb_array_elements под конкретную структуру.

Пример для hours (если в raw [{ "day": "Monday", "open": "09:00", "close": "17:00" }]):

with items as (
  select
    c.id as clinic_id,
    x->> 'day'  as day,
    case when (x->> 'open') is null then 'closed' else 'open' end as status,
    x->> 'open'  as time_open,
    x->> 'close' as time_close
  from whatclinic_raw r
  join clinic_sources cs on cs.src='whatclinic' and cs.src_id = r.src_id
  join clinics c on c.id = cs.clinic_id
  left join lateral jsonb_array_elements(
    case when jsonb_typeof(r.opening_hours)='array' then r.opening_hours else '[]'::jsonb end
  ) x on true
)
insert into clinic_hours (clinic_id, day, status, time_open, time_close)
select clinic_id, day, status, time_open, time_close
from items
where coalesce(day,'') <> ''
on conflict (clinic_id, day) do update
set status    = excluded.status,
    time_open = excluded.time_open,
    time_close= excluded.time_close;

F. Идемпотентные перезагрузки (только изменения)

Чтобы не трогать неизменившиеся клиники:

-- список src_id, у которых изменился content_hash
with changed as (
  select r.src_id, r.content_hash
  from whatclinic_raw r
  join clinic_sources cs
    on cs.src = r.src and cs.src_id = r.src_id
  where cs.content_hash is distinct from r.content_hash
)
-- дальше ограничивайте upsert коллекций join'ом на changed


Либо в каждом upsert делать where exists (select 1 from changed where changed.src_id = r.src_id).

G. Контроль качества (QA) — быстрые проверки
-- 1) Сколько клиник импортировано
select count(*) from clinics;

-- 2) Сколько привязано источников WhatClinic
select count(*) from clinic_sources where src = 'whatclinic';

-- 3) Пустые координаты (кандидаты на геокодинг)
select id, name, city, address from clinics where latitude is null or longitude is null limit 50;

-- 4) Клиники без услуг
select c.id, c.name from clinics c
left join clinic_services s on s.clinic_id = c.id
group by c.id, c.name
having count(s.service_name)=0;

-- 5) Дубликаты по slug (не должно быть)
select slug, count(*) from clinics group by slug having count(*)>1;

H. Роллбэк / повторная сборка

Стейджинг whatclinic_raw не трогаем — это история.

Для полной пересборки боевых таблиц:

truncate clinics cascade; (сотрёт все зависимые clinic_*),

затем заново запустить шаги D/E.

Для частичной пересборки по набору src_id — ограничиваем upsert join’ом на подмножество.

I. Мини-скрипт Node (если импортировать из app)

Иногда удобнее подтянуть CSV и выполнить upsert через supabase-js на сервере (Node script), но для больших объёмов предпочтительнее psql \copy.

// scripts/import-whatclinic.ts
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs/promises';
import { parse } from 'csv-parse/sync';
import crypto from 'node:crypto';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

function hashRecord(r: any) {
  const key = JSON.stringify({
    name: r.name?.trim(),
    city: r.city?.trim(),
    address: r.address?.trim(),
    phones: r.phones,
    services: r.services,
  });
  return crypto.createHash('md5').update(key).digest('hex');
}

async function main() {
  const csv = await fs.readFile('whatclinic_dump.csv', 'utf8');
  const rows = parse(csv, { columns: true, skip_empty_lines: true });

  for (const r of rows) {
    r.content_hash = hashRecord(r);
  }

  // батчами по 1000 строк
  const chunk = 1000;
  for (let i = 0; i < rows.length; i += chunk) {
    const part = rows.slice(i, i + chunk);
    const { error } = await supabase.from('whatclinic_raw').upsert(part, {
      onConflict: 'src,src_id'
    });
    if (error) throw error;
    console.log(`upserted: ${i + part.length}/${rows.length}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

J. Что ещё запланировано/зарезервировано

Нормализация услуг к внутреннему справочнику service_categories + Many-to-many таблица clinic_service_tags.

Отложенный геокодинг пустых координат (batch через cron function).

Правила публикации: status → после ручной модерации published, тогда клиника становится доступной в публичном каталоге.

Единая «история импорта»/лог в таблице import_runs (timestamp, source, rows_total, inserted, updated, skipped, duration_ms).



--------------------

⨯ Error: Not authenticated
    at ensureClinicForOwner (app/(customer)/customer/clinic-profile/actions.ts:21:39)
    at async saveDraftSection (app/(customer)/customer/clinic-profile/actions.ts:85:19)
  19 |
  20 |   const { data: userRes, error: userErr } = await sb.auth.getUser();
> 21 |   if (userErr || !userRes?.user) throw new Error("Not authenticated");
     |                                       ^
  22 |   const user = userRes.user;
  23 |
  24 |   // есть ли уже членство? {
  digest: '4225088468'
}
 POST /customer/clinic-profile 500 in 598ms

Failed to load resource: the server responded with a status of 500 (Internal Server Error)Understand this error
error-boundary-callbacks.ts:80 Error: Not authenticated
    at ensureClinicForOwner (actions.ts:21:40)
    at async saveDraftSection (actions.ts:85:20)
    at resolveErrorDev (react-server-dom-turbopack-client.browser.development.js:1858:46)
    at processFullStringRow (react-server-dom-turbopack-client.browser.development.js:2238:17)
    at processFullBinaryRow (react-server-dom-turbopack-client.browser.development.js:2226:7)
    at progress (react-server-dom-turbopack-client.browser.development.js:2472:17)

The above error occurred in the <ClinicProfilePage> component. It was handled by the <ErrorBoundaryHandler> error boundary.
onCaughtError @ error-boundary-callbacks.ts:80Understand this error
2intercept-console-error.ts:40 Error: Not authenticated
    at ensureClinicForOwner (actions.ts:21:40)
    at async saveDraftSection (actions.ts:85:20)
    at resolveErrorDev (react-server-dom-turbopack-client.browser.development.js:1858:46)
    at processFullStringRow (react-server-dom-turbopack-client.browser.development.js:2238:17)
    at processFullBinaryRow (react-server-dom-turbopack-client.browser.development.js:2226:7)
    at progress (react-server-dom-turbopack-client.browser.development.js:2472:17)










    The key fingerprint is:
SHA256:gQVXSlZE/KM5DjIruSofhpMkJgcoX16wS7iq7WD/WgE norik.artemka@gmail.com
The key's randomart image is:
+--[ED25519 256]--+
|    . ..=*=      |
|.  . o * ..      |
|+ .E+ o o  .     |
|.o =.o   .  o    |
|oo+ o.  S  o .   |
|==    + . +      |
|*.o  o + o .     |
|+=..+ .   .      |
|.+=+++           |
+----[SHA256]-----+