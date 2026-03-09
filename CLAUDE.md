# CLAUDE.md — MedTravel Codebase Guide

This file provides context for AI assistants working on the MedTravel codebase.

---

## Project Overview

**MedTravel** is a production-grade medical tourism SaaS platform that connects patients with international clinics. It supports multi-role access (Admin, Clinic/Customer, Partner/Affiliate, Patient), a booking lifecycle, real-time updates, and transactional emails.

- **Production URL**: https://medtravel.me
- **Hosting**: Vercel (auto-deploys on push to main)
- **Database**: Supabase (PostgreSQL + Auth + Storage + Realtime)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.3.6 (App Router, Turbopack in dev) |
| Language | TypeScript 5.6.3 (strict mode) |
| UI | HeroUI v2.7.10 + shadcn/ui components |
| Styling | Tailwind CSS 3.4.16 (class-based dark mode) |
| Forms | React Hook Form v7.49 + Zod v3.22 |
| Animations | Framer Motion v11.13 |
| Charts | Recharts v2.15.3 |
| i18n | i18next v23.8 + react-i18next v14.1 |
| Auth | Supabase Auth (email/OTP, Google OAuth, Twilio phone) |
| Email | Resend API |
| Analytics | Google Analytics 4 + Yandex Metrika |
| Package manager | Yarn 4.11.0 (`nodeLinker: node-modules`) |

---

## Repository Structure

```
/
├── app/                        # Next.js App Router
│   ├── (admin)/admin/          # ADMIN role: clinic mgmt, moderation, leads
│   ├── (auth)/                 # Public auth flows (login, magic link, callback)
│   ├── (customer)/customer/    # CUSTOMER role: clinic portal (patients, bookings)
│   ├── (partner)/partner/      # PARTNER role: affiliate programs, finance
│   ├── (patient)/patient/      # PATIENT role: my bookings
│   ├── (site)/                 # Public site pages (localized)
│   ├── (user)/                 # Shared profile & settings
│   ├── api/                    # Route handlers (~54 routes)
│   ├── clinic/[slug]/          # Public clinic detail page
│   ├── blog/[slug]/            # Blog articles
│   └── [category]/[[...filters]]/ # Category/filter browse
├── components/                 # React components (~98 files)
│   ├── admin/                  # Admin panel UI
│   ├── auth/                   # Auth forms (UnifiedAuthModal, etc.)
│   ├── clinic/                 # Clinic cards, detail components
│   ├── customer/               # Clinic portal components
│   ├── patient/                # Patient dashboard
│   ├── partner/                # Partner portal
│   ├── layout/                 # Navbar, Footer, AppChrome
│   ├── ui/                     # Base UI primitives
│   └── shared/                 # Reusable cross-feature components
├── lib/                        # Utilities, DB queries, services
│   ├── supabase/               # Supabase clients (browser/server/route)
│   └── mail/resend.ts          # Email templates (Resend)
├── hooks/                      # Custom React hooks
├── types/                      # Shared TypeScript types
├── config/                     # App configuration
│   ├── env.ts                  # Runtime env validation
│   ├── site.ts                 # Site metadata
│   ├── nav.ts                  # Navigation structure
│   ├── fonts.ts                # Font loading
│   └── flags.ts                # Feature flags
├── locales/                    # i18n translation files
├── supabase/                   # Supabase local config & migrations
├── styles/                     # Global CSS (Tailwind base)
├── public/                     # Static assets
├── data/                       # Static seed data (JSON)
├── middleware.ts               # Auth + role-based routing
├── next.config.js              # Next.js config (headers, rewrites, webpack)
├── tailwind.config.js          # Theme + HeroUI integration
└── tsconfig.json               # TypeScript config
```

---

## Development Commands

```bash
yarn dev        # Start dev server with Turbopack (hot reload)
yarn build      # Production build
yarn start      # Start production server
yarn lint       # Run ESLint with auto-fix (eslint --fix)
```

> **Note**: No test framework is configured. There are no unit/integration/E2E tests in this repo.

---

## Supabase Clients — Which to Use

| File | Use case |
|---|---|
| `lib/supabase/client.ts` | Browser/Client Components (anon key) |
| `lib/supabase/server.ts` | Server Components, Server Actions (service role) |
| `lib/supabase/routeClient.ts` | Route handlers (`api/` routes) |

Never use the service role key in client-side code. Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.

---

## Authentication & Roles

Roles are stored in both `user_roles` table and `app_metadata.roles`. Middleware (`middleware.ts`) enforces role-based access:

| Role | Route group | Portal |
|---|---|---|
| `ADMIN` | `(admin)/admin/` | Full platform management |
| `CUSTOMER` | `(customer)/customer/` | Clinic portal (their patients & bookings) |
| `PARTNER` | `(partner)/partner/` | Affiliate programs, leads, finance |
| `PATIENT` | `(patient)/patient/` | Personal bookings |

Unauthenticated users are redirected to `/login`. Middleware also handles legacy clinic URL rewrites (from `/category/country/...clinic` to `/clinic/slug`).

---

## Database Schema (Key Tables)

| Table | Purpose |
|---|---|
| `clinics` | Clinic profiles (slug, name, location, images) |
| `categories` | Medical treatment categories |
| `services` | Clinic services with pricing |
| `patient_bookings` | Core booking table (status, scheduling, costs, files) |
| `profiles` | User profile data |
| `user_roles` | Role assignments |
| `partner_leads` | Lead submissions |
| `customer_registration_requests` | Clinic approval workflow |
| `partner_registration_requests` | Partner approval workflow |
| `clinics_reviews` | Patient reviews |
| `clinic_reports` | Complaints/reports |
| `category_location_nodes` | Hierarchical location tree |

**Booking statuses**: `pending` → `confirmed` → `completed` (or `cancelled` / `cancelled_by_patient`)

**Key View**: `v_customer_patients` — denormalized view for the clinic patient list panel.

### PostgreSQL RPC Functions

Complex operations are handled by SECURITY DEFINER stored procedures:

- `customer_patients_list(p_status, p_start_date, p_end_date, p_limit, p_offset)` — Paginated patient list for clinic
- `customer_patient_update_status(p_booking_id, p_status)` — Status transitions
- `customer_patient_set_schedule(p_booking_id, p_scheduled_at)` — Appointment scheduling
- `customer_patient_delete_one(p_booking_id)` / `customer_patients_delete_all(...)` — Deletion
- `patient_cancel_booking(p_booking_id)` — Patient-side cancellation
- `customer_current_clinic_id()` — Returns the clinic ID for the currently authenticated user

---

## API Routes Structure

All routes live under `app/api/` and use `force-dynamic` (no caching):

| Prefix | Domain |
|---|---|
| `/api/admin/` | Platform administration |
| `/api/auth/` | Session, OAuth callback |
| `/api/customer/patients/` | Clinic patient management (CRUD, scheduling, file URLs) |
| `/api/leads/` | Lead submission from landing page |
| `/api/patient/` | Patient actions |
| `/api/partner/` | Partner portal |
| `/api/reviews/`, `/api/bookings/`, `/api/search/` | General domain APIs |

---

## Environment Variables

### Public (safe in browser)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_GA_ID
NEXT_PUBLIC_AUTH_ENABLED
```

### Server-only (never expose to browser)
```
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
```

---

## Styling Conventions

- **Tailwind CSS** is the primary styling system.
- Use `cn()` (from `lib/utils.ts` or `tailwind-merge`) to merge class names conditionally.
- Custom colors are CSS variables mapped in `tailwind.config.js`: `medblue`, `medteal`, `background`, `foreground`, `divider`.
- Dark mode: class-based (`dark:`). Toggled via `next-themes`.
- HeroUI components follow HeroUI v2 API (uses `@heroui/react`).
- shadcn/ui components (Accordion, Dialog, etc.) live in `components/ui/`.

---

## Component Conventions

- **Server Components by default** — only add `"use client"` when truly needed (interactivity, hooks, browser APIs).
- Props and data types live in `/types/`.
- Use Zod schemas for form validation with React Hook Form.
- Framer Motion for page/element animations.
- Icons: prefer **Lucide React** (`lucide-react`), with Iconify for broader icon sets.

---

## Internationalization

- i18next with browser language detection.
- Translation files in `/locales/`.
- Languages supported: English, Russian (and potentially Spanish).
- Localized public pages are under `app/(site)/[lang]/`.

---

## Email (Resend)

Transactional email templates are in `lib/mail/resend.ts`:
- Customer (clinic) approval / rejection
- Patient magic link welcome
- Partner new lead notification

All emails are sent via the Resend API using the `RESEND_API_KEY` environment variable.

---

## Analytics

- **Google Analytics 4**: `NEXT_PUBLIC_GA_ID` (gtag, `send_page_view: false` — manual tracking)
- **Yandex Metrika**: ID `106694543`
- **Vercel Analytics + Speed Insights**: Integrated in root layout

---

## Security Considerations

1. **RLS (Row Level Security)** is enforced at the PostgreSQL level — always verify policies when adding new tables.
2. **SECURITY DEFINER** functions are used for operations requiring elevated privileges.
3. **CSP headers** in `next.config.js` restrict external scripts (Google Tag Manager, Yandex allowed).
4. **Signed URLs** are generated server-side for Supabase Storage file access (X-rays, photos).
5. Never commit or expose `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, or any other secret.
6. Avoid SQL injection — always use parameterized queries via the Supabase client.

---

## Key Architecture Decisions

- **Route groups** (`(admin)`, `(customer)`, etc.) isolate role-specific layouts without affecting URL paths.
- **RPC for business logic** — complex operations like status transitions and scheduling are PostgreSQL functions, not JS.
- **Hybrid RSC/Client** — Server Components for data fetching; Client Components for interactivity and Realtime subscriptions.
- **View-based read models** — `v_customer_patients` denormalizes for performance rather than joining in JS.
- **Supabase Realtime** — WebSocket subscriptions in the clinic patient list panel for live updates.
- **Webpack chunk splitting** — vendor, heroui, and supabase have dedicated chunks for optimal loading.

---

## Deployment

- Push to the designated branch triggers a Vercel preview deployment.
- Push to `main` triggers a production deployment.
- No CI/CD pipeline configured beyond Vercel's native build system.
- ESLint errors are **ignored during `next build`** (see `next.config.js`) — always run `yarn lint` manually.
