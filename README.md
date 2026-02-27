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

-------------------------------------------------

отлично. пока еще нет никаких ендпоинтов, ниже дал тебе все файлы включая components\auth\UnifiedAuthModal.tsx и app\auth\magic\page.tsx, в самой модалке регистрации/авторизации нужно это также аккуратно реализовать, чтобы нигде ничего не ломалось, ни по логике, ни по ui.

мы ведь планируем не только при отправке лендинг формы создавать личный кабинет пациента использую номер телефона при таком сценарии, а также в принципе добавить в функционал и регистрацию по номеру телефона/авторизацию по номеру телефона, но это пока что только для роли patient, для остальных ничего трогать не будем.

по остальному, да давай использовать localStorage/cookie для lead_id после отправки формы, если это самый чистый способ связки.
в supabase phone провайдер еще не включен, а использовать будем Twilio, да, нужно чтобы ты помог настроить провайдера через twilio.

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
  // лучше жёстко разрешить только verify_email, чтобы не плодить мусор:
  return p === "verify_email" ? "verify_email" : "verify_email";
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

    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (profErr) return NextResponse.json({ error: profErr.message }, { status: 500 });

    if (!profile?.id) {
      // вариант 1 (как у тебя сейчас): честно говорим что нет юзера
      // return NextResponse.json({ error: "User not found" }, { status: 404 });

      // вариант 2 (безопаснее): не палим существование email
      return NextResponse.json({ ok: true });
    }

    // 1) генерим OTP + hash (как у тебя в verify-otp)
    const code = generateOtp6();
    const otpSecret = process.env.OTP_SECRET || "dev-secret-change-me";
    const codeHash = sha256(`${email}:${purpose}:${code}:${otpSecret}`);

    const expiresInMinutes = 10;
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();

    // 2) удаляем старые и вставляем новый
    const del = await supabase
      .from("email_otps")
      .delete()
      .eq("email", email)
      .eq("purpose", purpose);

    if (del.error) return NextResponse.json({ error: del.error.message }, { status: 500 });

    const ins = await supabase.from("email_otps").insert({
      email,
      purpose,
      code_hash: codeHash,
      expires_at: expiresAt,
      attempts: 0,
    });

    if (ins.error) {
      return NextResponse.json({ error: ins.error.message }, { status: 500 });
    }

    // 3) письмо
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
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 });
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
    const purpose = String(body?.purpose || "verify_email").trim() || "verify_email";

    if (!email || !/^[0-9]{6}$/.test(token)) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

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

    const otpSecret = process.env.OTP_SECRET || "dev-secret-change-me";
    const expected = sha256(`${email}:${purpose}:${token}:${otpSecret}`);

    if (expected !== row.code_hash) {
      const attempts = Number(row.attempts || 0) + 1;
      await supabase.from("email_otps").update({ attempts }).eq("id", row.id);

      if (attempts >= 5) {
        await supabase.from("email_otps").delete().eq("id", row.id);
        return NextResponse.json(
          { error: "Too many attempts. Request new code." },
          { status: 400 },
        );
      }

      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    // валидно → удаляем OTP
    await supabase.from("email_otps").delete().eq("id", row.id);

    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (profErr) return NextResponse.json({ error: profErr.message }, { status: 500 });
    if (!profile?.id) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const userId = profile.id;

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
app\auth\magic\page.tsx: """
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function parseHash(hash: string) {
  const h = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(h);
  return {
    access_token: params.get("access_token") ?? "",
    refresh_token: params.get("refresh_token") ?? "",
    expires_in: params.get("expires_in") ?? "",
    token_type: params.get("token_type") ?? "",
    type: params.get("type") ?? "",
  };
}

export default function MagicAuthPage() {
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    const next = sp.get("next") || "/patient";
    const as = sp.get("as") || "PATIENT";

    const { access_token, refresh_token } = parseHash(window.location.hash);

    // если токенов нет — просто на логин
    if (!access_token || !refresh_token) {
      router.replace(`/auth/login?as=${encodeURIComponent(as)}&next=${encodeURIComponent(next)}`);
      return;
    }

    (async () => {
      const res = await fetch("/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token, refresh_token, as, next }),
      });

      // сервер уже сделает redirect, но на всякий:
      if (res.ok) {
        router.replace(next);
        router.refresh();
      } else {
        router.replace(`/auth/login?as=${encodeURIComponent(as)}&next=${encodeURIComponent(next)}`);
      }
    })();
  }, [router, sp]);

  return (
    <div className="mx-auto max-w-md px-4 py-10 text-center">
      <div className="text-lg font-semibold">Signing you in…</div>
      <div className="mt-2 text-sm text-default-500">Please wait.</div>
    </div>
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

  const [otpPassword, setOtpPassword] = useState("");

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
                      color={mode === "signin" ? "primary" : "primary"}
                      variant={mode === "signin" ? "solid" : "ghost"}
                      onPress={() => setMode("signin")}
                    >
                      Sign in
                    </Button>
                    <Button
                      className="flex-1"
                      color={mode === "signup" ? "primary" : "primary"}
                      variant={mode === "signup" ? "solid" : "ghost"}
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
                    onOtpRequired={({ email, password }) => {
                      setEmail(email);
                      setOtpPassword(password);
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
                    password={otpPassword}
                    as={role}
                    next={safeNext}
                    onBack={() => setStep("auth")}
                    onSuccess={() => {
                      close();   // закрывает ModalContent
                      onClose(); // твой внешний флаг open=false
                    }}
                  />
                </div>
              ) : null}
            </ModalBody>

            <Divider />

            <ModalFooter className="flex items-center justify-between">
              <Button
                variant="ghost"
                color="primary"
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
                  variant="ghost"
                  color="primary"
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

-------------------

хорошо. в supabase подключил phone provider используя twilio, указал Twilio Account SID, Twilio Auth Token и Twilio Message Service SID. в самом twilio создал аккаунт, также все настроил откда и брал данные для supabse phone provider.

в таблице partner_leads вообще-то email text null, мы это уже делали, ниже дал ddl.

app\api\leads\partner\route.ts: """
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/serviceClient";
import { resendSend, patientMagicLinkTemplate } from "@/lib/mail/resend";
import crypto from "crypto";

export const runtime = "nodejs";

function safeEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function splitName(full: string) {
  const s = String(full || "").trim().replace(/\s+/g, " ");
  if (!s) return { first_name: null as string | null, last_name: null as string | null };
  const parts = s.split(" ");
  const first = parts[0] ?? "";
  const last = parts.slice(1).join(" ").trim();
  return { first_name: first || null, last_name: last || null };
}

async function ensurePatientAndSendMagicLink(params: {
  supabase: ReturnType<typeof createServiceClient>;
  origin: string;
  email: string;
  full_name: string;
  phone: string;
}) {
  const { supabase, origin, email, full_name, phone } = params;

  const { data: prof, error: profErr } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (profErr) throw new Error(profErr.message);

  let userId: string | null = prof?.id ?? null;
  let created = false;

  if (!userId) {
    const { data: createdUser, error: createErr } = await supabase.auth.admin.createUser({
      email,
      email_confirm: false,
      user_metadata: { requested_role: "PATIENT" },
    });

    if (createErr) {
      const msg = String(createErr.message || "");
      if (!msg.toLowerCase().includes("already")) throw new Error(msg);

      const { data: prof2, error: prof2Err } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (prof2Err) throw new Error(prof2Err.message);
      userId = prof2?.id ?? null;
      if (!userId) throw new Error("User exists but profile not found");
    } else {
      userId = createdUser?.user?.id ?? null;
      created = true;
    }
  }

  if (!userId) throw new Error("Failed to resolve user id");

  const { first_name, last_name } = splitName(full_name);

  await supabase.from("profiles").upsert(
    {
      id: userId,
      email,
      role: "patient",
      first_name,
      last_name,
      phone: phone || null,
    } as any,
    { onConflict: "id" },
  );

  await supabase
    .from("user_roles")
    .upsert({ user_id: userId, role: "patient" } as any, { onConflict: "user_id,role" } as any);

  await supabase.auth.admin.updateUserById(userId, {
    user_metadata: {
      first_name,
      last_name,
      phone: phone || null,
      display_name: full_name || null,
      requested_role: "PATIENT",
    },
  });

  const settingsUrl = `${origin}/settings`;

  await supabase.from("notifications").insert({
    user_id: userId,
    type: "set_password",
    data: {
      title: "Secure your account",
      message: "Set a password to sign in faster next time.",
      action_url: settingsUrl,
    },
    is_read: false,
  });

  const redirectTo = `${origin}/auth/magic?as=PATIENT&next=${encodeURIComponent("/patient")}`;

  const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });

  if (linkErr) throw new Error(linkErr.message);

  const actionLink =
    (linkData as any)?.properties?.action_link ||
    (linkData as any)?.action_link ||
    null;

  if (!actionLink) throw new Error("Failed to generate magic link");

  const tpl = patientMagicLinkTemplate(actionLink);
  await resendSend({ to: email, subject: tpl.subject, html: tpl.html });

  return { userId, created };
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();

  try {
    const fd = await req.formData();

    const source = String(fd.get("source") ?? "unknown").slice(0, 80);
    const full_name = String(fd.get("full_name") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const ageRaw = String(fd.get("age") ?? "").trim();

    const emailRaw = String(fd.get("email") ?? "").trim().toLowerCase();
    const email = emailRaw || null;

    if (!full_name) return NextResponse.json({ error: "Введите ФИО" }, { status: 400 });
    if (!phone) return NextResponse.json({ error: "Введите телефон" }, { status: 400 });

    if (email && !safeEmail(email)) {
      return NextResponse.json({ error: "Некорректный email" }, { status: 400 });
    }

    const ageNum = ageRaw ? Number(ageRaw) : null;
    const age = Number.isFinite(ageNum as any) ? (ageNum as number) : null;

    const images = fd.getAll("images").filter(Boolean) as File[];
    const image_paths: string[] = [];

    const leadId = crypto.randomUUID();

    for (const file of images.slice(0, 3)) {
      if (!(file instanceof File)) continue;
      if (!file.type.startsWith("image/")) continue;

      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().slice(0, 10);
      const path = `${leadId}/${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("partner-leads")
        .upload(path, file, { contentType: file.type, upsert: false, cacheControl: "3600" });

      if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

      image_paths.push(path);
    }

    const { error: insErr } = await supabase.from("partner_leads").insert({
      id: leadId,
      source,
      full_name,
      phone,
      email, // ✅ теперь допустим null (после миграции)
      age,
      image_paths,
      status: "new",
    });

    if (insErr) {
      if (image_paths.length) await supabase.storage.from("partner-leads").remove(image_paths);
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    const origin = req.nextUrl.origin;

    // ✅ создаём пациента и шлём письмо ТОЛЬКО если есть email
    if (email) {
      const patient = await ensurePatientAndSendMagicLink({
        supabase,
        origin,
        email,
        full_name,
        phone,
      });

      return NextResponse.json({
        ok: true,
        id: leadId,
        patient: { userId: patient.userId, created: patient.created, emailSent: true },
      });
    }

    return NextResponse.json({
      ok: true,
      id: leadId,
      patient: { emailSent: false },
    });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}
"""
ddl partner_leads: """
create table public.partner_leads (
  id uuid not null default gen_random_uuid (),
  source text not null default 'hair-transplant-lp'::text,
  full_name text not null,
  phone text not null,
  email text null,
  age integer null,
  image_paths text[] null,
  status text not null default 'new'::text,
  admin_note text null,
  created_at timestamp with time zone not null default now(),
  processed_at timestamp with time zone null,
  processed_by uuid null,
  assigned_partner_id uuid null,
  assigned_at timestamp with time zone null,
  assigned_by uuid null,
  assigned_note text null,
  constraint partner_leads_pkey primary key (id),
  constraint partner_leads_status_check check (
    (
      status = any (
        array[
          'new'::text,
          'assigned'::text,
          'processed'::text,
          'archived'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists partner_leads_assigned_partner_idx on public.partner_leads using btree (assigned_partner_id) TABLESPACE pg_default;

create index IF not exists partner_leads_status_idx on public.partner_leads using btree (status) TABLESPACE pg_default;

create index IF not exists partner_leads_created_idx on public.partner_leads using btree (created_at desc) TABLESPACE pg_default;

create index IF not exists partner_leads_email_idx on public.partner_leads using btree (email) TABLESPACE pg_default;

create index IF not exists partner_leads_phone_idx on public.partner_leads using btree (phone) TABLESPACE pg_default;
"""

---------------

отлично. sql запрос выполнился успешно. файлы components\auth\PhoneAuthForm.tsx и app\api\patient\lead\attach\route.ts также создал.
в app\ru\hair-transplant\lp\_components\LeadForm.tsx есть ошибки на phone и fullName такого типа: """
[{
	"resource": "/c:/Users/Artem/Desktop/artem/medtravel-main/app/ru/hair-transplant/lp/_components/LeadForm.tsx",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Cannot find name 'phone'.",
	"source": "ts",
	"startLineNumber": 47,
	"startColumn": 23,
	"endLineNumber": 47,
	"endColumn": 28,
	"modelVersionId": 41,
	"origin": "extHost1"
}]
"""
а в остальном проверь файлы app\ru\hair-transplant\lp\_components\LeadForm.tsx и components\auth\UnifiedAuthModal.tsx, корректно ли я там все сделал?

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
import PhoneAuthForm from "@/components/auth/PhoneAuthForm";

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
  const [patientAuthMode, setPatientAuthMode] = useState<"email" | "phone">("email");

  useEffect(() => {
    if (!open) return;

    const r = isAllowedRole(initialRole) ? initialRole : null;
    setRole(r);
    setEmail("");
    setMode("signin");
    setStep(r ? "auth" : "role");
  }, [open, initialRole]);

  setPatientAuthMode("email");

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

  const [otpPassword, setOtpPassword] = useState("");

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
                      color={mode === "signin" ? "primary" : "primary"}
                      variant={mode === "signin" ? "solid" : "ghost"}
                      onPress={() => setMode("signin")}
                    >
                      Sign in
                    </Button>
                    <Button
                      className="flex-1"
                      color={mode === "signup" ? "primary" : "primary"}
                      variant={mode === "signup" ? "solid" : "ghost"}
                      onPress={() => setMode("signup")}
                    >
                      Sign up
                    </Button>
                  </div>

                  {role === "PATIENT" ? (
                    <div className="w-full rounded-xl border border-divider bg-default-50 p-1 flex gap-1">
                      <Button
                        className="flex-1"
                        variant={patientAuthMode === "email" ? "solid" : "ghost"}
                        color="primary"
                        onPress={() => setPatientAuthMode("email")}
                      >
                        Email
                      </Button>
                      <Button
                        className="flex-1"
                        variant={patientAuthMode === "phone" ? "solid" : "ghost"}
                        color="primary"
                        onPress={() => setPatientAuthMode("phone")}
                      >
                        Phone
                      </Button>
                    </div>
                  ) : null}

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
                    onOtpRequired={({ email, password }) => {
                      setEmail(email);
                      setOtpPassword(password);
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
                    password={otpPassword}
                    as={role}
                    next={safeNext}
                    onBack={() => setStep("auth")}
                    onSuccess={() => {
                      close();   // закрывает ModalContent
                      onClose(); // твой внешний флаг open=false
                    }}
                  />
                </div>
              ) : null}
            </ModalBody>

            <Divider />

            <ModalFooter className="flex items-center justify-between">
              <Button
                variant="ghost"
                color="primary"
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
                  variant="ghost"
                  color="primary"
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
app\ru\hair-transplant\lp\_components\LeadForm.tsx: """
'use client';

import { useMemo, useState } from "react";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import LeadImageUpload from "./LeadImageUpload";
import { createClient } from "@/lib/supabase/browserClient";

type Props = {
  submitText?: string;
  onSubmitted?: () => void;
  className?: string;
  disclaimerText?: string;
  buttonClassName?: string;
};

const supabase = useMemo(() => createClient(), []);
const [phoneOtpMode, setPhoneOtpMode] = useState<"idle" | "sent" | "verified">("idle");
const [otp, setOtp] = useState("");
const [otpBusy, setOtpBusy] = useState(false);
const [otpError, setOtpError] = useState<string | null>(null);

function fireForm1Step(meta?: { source?: string; patient_email_sent?: boolean }) {
  // 1) можно оставить — пригодится для GTM в будущем, и для метрики ecommerce
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({
    event: "lead_submit",
    form_name: "hair-transplant-lp",
    ...meta,
  });

  // 2) GA4 (важно: НЕ передавать email/phone — это PII)
  (window as any).gtag?.("event", "generate_lead", {
    form_name: "hair-transplant-lp",
    source: meta?.source || "hair-transplant-lp",
    patient_email_sent: Boolean(meta?.patient_email_sent),
  });

  // 3) optional: DOM event
  window.dispatchEvent(new Event("lead_submit"));
}

async function sendPhoneOtp() {
  setOtpError(null);
  setOtpBusy(true);
  try {
    const phoneE164 = phone.trim(); // лучше: хранить уже E.164
    const { error } = await supabase.auth.signInWithOtp({
      phone: phoneE164,
      options: { channel: "sms" as any },
    } as any);
    if (error) throw error;
    setPhoneOtpMode("sent");
  } catch (e: any) {
    setOtpError(e?.message ?? String(e));
  } finally {
    setOtpBusy(false);
  }
}

async function verifyPhoneOtp() {
  setOtpError(null);
  setOtpBusy(true);
  try {
    const phoneE164 = phone.trim();
    const token = otp.trim();

    const { data, error } = await supabase.auth.verifyOtp({
      phone: phoneE164,
      token,
      type: "sms",
    } as any);

    if (error) throw error;

    // attach lead -> patient
    let leadId = "";
    try { leadId = localStorage.getItem("mt_lead_id") || ""; } catch {}
    if (leadId) {
      const r = await fetch("/api/patient/lead/attach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lead_id: leadId, full_name: fullName.trim(), phone: phone.trim() }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || "Failed to attach lead");
      try { localStorage.removeItem("mt_lead_id"); } catch {}
    }

    setPhoneOtpMode("verified");
    // переходим в кабинет
    window.location.href = "/patient";
  } catch (e: any) {
    setOtpError(e?.message ?? String(e));
  } finally {
    setOtpBusy(false);
  }
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
    return fullName.trim() && phone.trim()
  }, [fullName, phone]);

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
      const em = email.trim().toLowerCase();
      if (em) fd.set("email", em);
      if (age.trim()) fd.set("age", age.trim());
      files.slice(0, 3).forEach((f) => fd.append("images", f));

      const res = await fetch("/api/leads/partner", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Submit failed");

      setOk(true);
      setPatientEmailSent(Boolean(json?.patient?.emailSent));
      fireForm1Step({
        source: "hair-transplant-lp",
        patient_email_sent: Boolean(json?.patient?.emailSent),
      });

      onSubmitted?.();

      const leadId = String(json?.id ?? "");
      if (leadId) {
        try { localStorage.setItem("mt_lead_id", leadId); } catch { }
      }

      setOk(true);

      const hasEmail = Boolean(em);
      if (!hasEmail) {
        // email нет => запускаем phone OTP флоу
        setPhoneOtpMode("idle");
      }

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
      <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
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

      {ok && !email.trim() ? (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
          <div className="font-semibold">Вход в личный кабинет по SMS</div>
          <div className="mt-1 text-slate-600">
            Мы можем открыть кабинет по номеру телефона. Отправим код в SMS.
          </div>

          {otpError ? (
            <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {otpError}
            </div>
          ) : null}

          {phoneOtpMode === "idle" ? (
            <Button className="mt-3 w-full" onClick={sendPhoneOtp} disabled={otpBusy}>
              {otpBusy ? "Отправляем..." : "Отправить код"}
            </Button>
          ) : null}

          {phoneOtpMode === "sent" ? (
            <div className="mt-3 space-y-2">
              <Input
                placeholder="Код из SMS (6 цифр)"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <Button className="w-full" onClick={verifyPhoneOtp} disabled={otpBusy || otp.trim().length !== 6}>
                {otpBusy ? "Проверяем..." : "Подтвердить и войти"}
              </Button>
            </div>
          ) : null}

          <div className="mt-2 text-xs text-slate-500">
            Номер должен быть в международном формате, например: +905551112233
          </div>
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

-----------------------

отлично, выполнил правки, а ниже полный app\api\admin\partner-leads\assign\route.ts

app\api\admin\partner-leads\assign\route.ts: """
// app/api/admin/partner-leads/assign/route.ts
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
  const partner_id = String(body?.partner_id ?? "").trim(); // (исторически) в UI поле называется partner_id, но это customer user_id
  const note = String(body?.note ?? "").trim().slice(0, 500);

  if (!isUuid(lead_id)) return NextResponse.json({ error: "Invalid lead_id" }, { status: 400 });
  if (!isUuid(partner_id)) return NextResponse.json({ error: "Invalid partner_id" }, { status: 400 });

  // 3) service client
  const admin = createServiceClient();

  // 3.1) убедимся что user реально customer
  const { data: roleCheck, error: rcErr } = await admin
    .from("user_roles")
    .select("user_id")
    .eq("user_id", partner_id)
    .eq("role", "customer")
    .maybeSingle();

  if (rcErr) return NextResponse.json({ error: rcErr.message }, { status: 500 });
  if (!roleCheck) return NextResponse.json({ error: "User is not a customer" }, { status: 400 });

  // 4) прочитаем текущий lead (до обновления)
  const { data: before, error: beforeErr } = await admin
    .from("partner_leads")
    .select("id,assigned_partner_id,full_name,phone,email,patient_id,source,created_at")
    .eq("id", lead_id)
    .maybeSingle();

  if (beforeErr) return NextResponse.json({ error: beforeErr.message }, { status: 500 });
  if (!before) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const prevPartnerId = before.assigned_partner_id ?? null;
  const customerChanged = String(prevPartnerId ?? "") !== String(partner_id);

  // 5) resolve clinic_id by customer user_id
  const { data: mem, error: memErr } = await admin
    .from("customer_clinic_membership")
    .select("clinic_id")
    .eq("user_id", partner_id)
    .maybeSingle();

  if (memErr) return NextResponse.json({ error: memErr.message }, { status: 500 });
  if (!mem?.clinic_id) return NextResponse.json({ error: "Customer has no clinic membership" }, { status: 400 });

  const clinicId = String(mem.clinic_id);

  // ✅ resolve patient_id (email OR patient_id)
  let patientId: string | null = null;

  if (before.patient_id) {
    patientId = String(before.patient_id);
  } else {
    const leadEmail = String(before.email ?? "").trim().toLowerCase();
    if (leadEmail) {
      const { data: pat, error: patErr } = await admin
        .from("profiles")
        .select("id")
        .eq("email", leadEmail)
        .maybeSingle();

      if (patErr) return NextResponse.json({ error: patErr.message }, { status: 500 });
      if (pat?.id) patientId = String(pat.id);
    }
  }

  if (!patientId) {
    return NextResponse.json(
      { error: "Patient not found for lead (no email and not attached by phone OTP yet)" },
      { status: 400 }
    );
  }

  // 7) create booking from lead (ТОЛЬКО если customerChanged)
  //    + защита от дублей: ищем booking с таким lead маркером
  const leadMarker = `[lead:${lead_id}]`;

  let bookingId: string | null = null;

  if (customerChanged) {
    // 7.1) check duplicate booking (same clinic + same patient + same marker in notes)
    const { data: exists, error: exErr } = await admin
      .from("patient_bookings")
      .select("id")
      .eq("clinic_id", clinicId)
      .eq("patient_id", patientId)
      .ilike("notes", `%${leadMarker}%`)
      .maybeSingle();

    if (exErr) return NextResponse.json({ error: exErr.message }, { status: 500 });

    bookingId = exists?.id ?? null;

    if (!bookingId) {
      const { data: booking, error: bookErr } = await admin
        .from("patient_bookings")
        .insert({
          patient_id: patientId,
          clinic_id: clinicId,
          service_id: 803, // Hair Transplant
          booking_method: "automatic", // лид
          status: "pending",
          full_name: before.full_name,
          phone: before.phone,
          notes: `${leadMarker} Landing lead (${before.source ?? "unknown"})`,
        })
        .select("id")
        .single();

      if (bookErr) return NextResponse.json({ error: bookErr.message }, { status: 500 });
      bookingId = booking?.id ?? null;
    }
  }

  // 8) update lead assignment
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
      "id,source,full_name,phone,email,age,image_paths,status,admin_note,created_at,assigned_partner_id,assigned_at,assigned_by,assigned_note",
    )
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 9) email notify (best-effort: не ломаем assignment если email упал)
  let emailSent = false;
  let emailError: string | null = null;

  if (customerChanged) {
    try {
      const { data: customerProfile, error: pErr } = await admin
        .from("profiles")
        .select("email,first_name,last_name")
        .eq("id", partner_id)
        .maybeSingle();

      if (pErr) throw new Error(pErr.message);
      const customerEmail = customerProfile?.email?.trim();
      if (!customerEmail) throw new Error("Customer email not found in profiles");

      const customerName =
        `${customerProfile?.first_name ?? ""} ${customerProfile?.last_name ?? ""}`.trim() || null;

      const origin = req.nextUrl.origin;
      const patientsUrl = `${origin}/customer/patients`;

      const tpl = partnerNewLeadTemplate({
        partnerName: customerName,
        leadsUrl: patientsUrl,
        lead: {
          full_name: before.full_name,
          phone: before.phone,
          email: before.email,
          source: before.source,
          created_at: before.created_at,
        },
      });

      await resendSend({ to: customerEmail, subject: tpl.subject, html: tpl.html });
      emailSent = true;
    } catch (e: any) {
      emailError = String(e?.message ?? e);
    }
  }

  return NextResponse.json({
    ok: true,
    item: data,
    booking: {
      attempted: customerChanged,
      id: bookingId,
    },
    email: {
      attempted: customerChanged,
      sent: emailSent,
      error: emailError,
    },
  });
}
"""