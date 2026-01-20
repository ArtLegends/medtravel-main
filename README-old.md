<!-- Сделать страницу клиники (/clinic/[slug]):
– Hero + подробный контент
– Прайс-лист (таблица услуг/цен)
– Форма сбора контактов / заказа калькуляции
– Кнопки «Назад к списку» и «Позвонить в клинику»

Статические страницы каталога:
– /treatments (список всех категорий-услуг)
– /locations (список стран/городов)
– Ссылки-картинки, ведущие на /treatments/[slug] и /locations/[slug]

SEO и маркетинг:
– Обновить metadata, Open Graph, Twitter Cards
– Добавить фавиконки и микроразметку JSON-LD

Рефактор и тесты:
– Покрыть ключевые компоненты Cypress/jest
– Проверить доступность (a11y) и оптимизировать Lighthouse -->

<!-- npx supabase gen types typescript --project-id oymahnxwcajvaggbydim --schema public > lib/supabase/types.ts -->

<!-- "$(brew --prefix)/bin/supabase" gen types typescript \
  --project-id oymahnxwcajvaggbydim \
  --schema public > lib/supabase/types.ts -->

<!-- npx.cmd supabase gen types typescript --project-id oymahnxwcajvaggbydim --schema public > lib/supabase/types.ts -->

# MedTravel - Digital Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.3.1-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue)](https://www.typescriptlang.org/)
[![HeroUI](https://img.shields.io/badge/HeroUI-2.7.10-purple)](https://heroui.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.16-cyan)](https://tailwindcss.com/)

MedTravel - современная цифровая платформа для креаторов и коллекционеров, построенная на Next.js 15 с полной поддержкой SSR, многоуровневой системой ролей, интернационализацией и оптимизацией производительности.

## 🌟 Особенности

- **🚀 Modern Stack**: Next.js 15, React 18, TypeScript 5.6
- **🎨 Beautiful UI**: HeroUI 2.7 с кастомной темой
- **🔐 Advanced Auth**: Supabase Auth с ролевой системой
- **🌍 i18n**: Поддержка EN/ES/RU языков
- **📱 Responsive**: Адаптивный дизайн для всех устройств
- **⚡ Performance**: SSR, кэширование, оптимизация бандла
- **🛡️ Security**: RLS, CSRF защита, безопасные headers
- **♿ Accessibility**: WCAG 2.1 совместимость

## 📋 Содержание

1. [Технологический Стек](#-технологический-стек)
2. [Архитектура](#-архитектура)
3. [Структура Проекта](#-структура-проекта)
4. [Роутинг и Layout](#-роутинг-и-layout)
5. [Система Ролей](#-система-ролей)
6. [UI/UX Компоненты](#-uiux-компоненты)
7. [Server-Side Logic](#-server-side-logic)
8. [Клиентская Логика](#-клиентская-логика)
9. [Интернационализация](#-интернационализация)
10. [Стили и Темы](#-стили-и-темы)
11. [Производительность](#-производительность)
12. [Безопасность](#-безопасность)
13. [Разработка](#-разработка)
14. [Развертывание](#-развертывание)

## 🛠 Технологический Стек

### Frontend Core

```json
{
  "next": "15.3.1", // React фреймворк с SSR/SSG
  "react": "18.3.1", // UI библиотека
  "react-dom": "18.3.1", // DOM рендерер
  "typescript": "5.6.3" // Типизация
}
```

### UI Framework & Styling

```json
{
  "@heroui/react": "2.7.10", // UI компоненты
  "tailwindcss": "3.4.16", // CSS фреймворк
  "tailwind-merge": "3.3.1", // Условные классы
  "tailwind-variants": "0.3.0", // Варианты компонентов
  "clsx": "2.1.1", // Утилита для классов
  "framer-motion": "11.13.1" // Анимации
}
```

### Backend & Database

```json
{
  "@supabase/ssr": "0.6.1", // Supabase SSR
  "@supabase/supabase-js": "2.49.10", // Supabase клиент
  "ws": "8.18.2" // WebSocket поддержка
}
```

### Internationalization

```json
{
  "i18next": "23.8.1", // Ядро i18n
  "react-i18next": "14.1.2", // React интеграция
  "i18next-browser-languagedetector": "7.0.1", // Автодетект языка
  "intl-messageformat": "10.7.16" // Форматирование сообщений
}
```

### Forms & Validation

```json
{
  "react-hook-form": "7.49.1", // Формы
  "@hookform/resolvers": "3.3.4", // Резолверы валидации
  "zod": "3.22.4" // Schema валидация
}
```

### Development Tools

```json
{
  "@iconify/react": "6.0.0", // Иконки
  "@vercel/analytics": "1.5.0", // Аналитика
  "@vercel/speed-insights": "1.2.0", // Метрики скорости
  "eslint": "9.25.1", // Линтер
  "prettier": "3.5.3" // Форматтер
}
```

## 🏗 Архитектура

### Общая Архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (Client)                         │
├─────────────────────────────────────────────────────────────┤
│  React Components │ HeroUI │ Framer Motion │ i18next        │
├─────────────────────────────────────────────────────────────┤
│                    Next.js 15 (SSR/SSG)                     │
├─────────────────────────────────────────────────────────────┤
│  Middleware │ API Routes │ Server Components │ Auth Guards  │
├─────────────────────────────────────────────────────────────┤
│                    Supabase (Backend)                       │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL │ Auth Service │ RLS │ Real-time │ Storage      │
└─────────────────────────────────────────────────────────────┘
```

### Layout Архитектура

```
app/layout.tsx (Root)
├── Providers (HeroUI, Supabase, Theme, i18n)
├── Navbar (Global, всегда отображается)
├── Main Content (меняется в зависимости от роута)
│   ├── (auth)/ - Анонимные пользователи
│   ├── (user)/ - Аутентифицированные пользователи
│   ├── (creator)/ - Роль CREATOR+
│   └── (admin)/ - Роль ADMIN+
└── Footer (Global, всегда отображается)
```

### Component Архитектура

```
components/
├── auth/           # Аутентификация
├── layout/         # Layout компоненты (Navbar, Footer)
├── shared/         # Переиспользуемые компоненты
├── charts/         # Графики и чарты
└── ThemeProvider.tsx # Провайдер темы
```

## 📁 Структура Проекта

```
frontend/
├── 📁 app/                     # Next.js App Router
│   ├── 📁 (admin)/            # Route Group: Админка
│   │   ├── 📁 admin/
│   │   │   └── 📄 page.tsx    # /admin - админ панель
│   │   ├── 📄 layout.tsx      # Layout для админов (требует ADMIN+)
│   │   └── 📄 loading.tsx     # Loading UI для админки
│   ├── 📁 (auth)/             # Route Group: Аутентификация
│   │   ├── 📁 login/
│   │   │   └── 📄 page.tsx    # /login - страница входа
│   │   ├── 📄 layout.tsx      # Layout для неавторизованных
│   │   └── 📄 loading.tsx     # Loading UI для auth
│   ├── 📁 (creator)/          # Route Group: Креаторы
│   │   ├── 📁 labs/
│   │   │   └── 📄 page.tsx    # /labs - экспериментальные функции
│   │   ├── 📄 layout.tsx      # Layout для креаторов (требует CREATOR+)
│   │   └── 📄 loading.tsx     # Loading UI для креаторов
│   ├── 📁 (user)/             # Route Group: Пользователи
│   │   ├── 📁 docs/
│   │   │   └── 📄 page.tsx    # /docs - документация
│   │   ├── 📁 inventory/
│   │   │   └── 📄 page.tsx    # /inventory - инвентарь
│   │   ├── 📁 marketplace/
│   │   │   └── 📄 page.tsx    # /marketplace - маркетплейс
│   │   ├── 📁 settings/
│   │   │   └── 📄 page.tsx    # /settings - настройки
│   │   ├── 📄 page.tsx        # / - главная страница
│   │   ├── 📄 layout.tsx      # Layout для пользователей (требует аутентификации)
│   │   └── 📄 loading.tsx     # Loading UI для пользователей
│   ├── 📁 auth/               # API аутентификации
│   │   └── 📁 callback/
│   │       └── 📄 route.ts    # OAuth callback handler
│   ├── 📄 error.tsx           # Global error boundary
│   ├── 📄 layout.tsx          # Root layout (глобальные провайдеры)
│   └── 📄 providers.tsx       # Клиентские провайдеры
├── 📁 components/             # React компоненты
│   ├── 📁 auth/              # Компоненты аутентификации
│   │   ├── 📄 EmailForm.tsx   # Форма ввода email
│   │   ├── 📄 LoginManager.tsx # Менеджер состояний логина
│   │   └── 📄 OtpForm.tsx     # Форма ввода OTP кода
│   ├── 📁 charts/            # Компоненты графиков
│   │   └── 📄 DynamicChart.tsx # Динамические чарты
│   ├── 📁 layout/            # Layout компоненты
│   │   ├── 📄 Footer.tsx      # Глобальный футер
│   │   └── 📄 Navbar.tsx      # Глобальная навигация
│   ├── 📁 shared/            # Переиспользуемые компоненты
│   │   ├── 📄 HeroUIComponents.tsx # HeroUI утилиты
│   │   ├── 📄 LanguageSwitcher.tsx # Переключатель языка
│   │   ├── 📄 PageSkeleton.tsx     # Skeleton загрузка
│   │   ├── 📄 PageTransition.tsx   # Анимации переходов
│   │   └── 📄 ThemeSwitch.tsx      # Переключатель темы
│   └── 📄 ThemeProvider.tsx   # Провайдер темы
├── 📁 config/                # Конфигурационные файлы
│   ├── 📄 env.ts             # Переменные окружения
│   ├── 📄 fonts.ts           # Конфигурация шрифтов
│   ├── 📄 nav.ts             # Конфигурация навигации и ролей
│   └── 📄 site.ts            # Общие настройки сайта
├── 📁 lib/                   # Утилиты и библиотеки
│   ├── 📁 supabase/         # Supabase интеграция
│   │   ├── 📄 browserClient.ts    # Клиентский Supabase клиент
│   │   ├── 📄 index.ts            # Единый экспорт
│   │   ├── 📄 server.ts           # Серверный Supabase клиент + auth guards
│   │   ├── 📄 supabase-provider.tsx # React контекст провайдер
│   │   └── 📄 types.ts            # TypeScript типы БД
│   └── 📄 i18n-server.ts     # Серверная i18n утилита
├── 📁 locales/               # Файлы переводов
│   ├── 📄 en.json            # Английский
│   ├── 📄 es.json            # Испанский
│   └── 📄 ru.json            # Русский
├── 📁 public/                # Статические файлы
│   └── 📄 favicon.ico        # Иконка сайта
├── 📁 styles/                # Глобальные стили
│   └── 📄 globals.css        # Tailwind CSS + кастомные стили
├── 📁 types/                 # TypeScript определения
│   └── 📄 index.ts           # Общие типы
├── 📄 middleware.ts          # Next.js middleware (auth + role guards)
├── 📄 i18n.ts               # Клиентская i18n конфигурация
├── 📄 next.config.js        # Next.js конфигурация
├── 📄 tailwind.config.js    # Tailwind CSS конфигурация
├── 📄 tsconfig.json         # TypeScript конфигурация
├── 📄 package.json          # NPM зависимости
└── 📄 .env.local            # Переменные окружения (локальные)
```

# 🚀 Роутинг и Система Ролей

## 📍 Layout Groups (Route Groups)

Next.js App Router использует layout groups для организации роутов по логическим группам без влияния на URL структуру.

### Layout Group Architecture

```
app/
├── layout.tsx              # ✅ Root Layout (всегда активен)
│   ├── Navbar              # 🌐 Глобальная навигация
│   ├── Main Content        # 📄 Меняется в зависимости от роута
│   └── Footer              # 🌐 Глобальный футер
│
├── (auth)/                 # 👤 Route Group: Неавторизованные
│   ├── layout.tsx          # Auth Guard: редирект если авторизован
│   ├── loading.tsx         # Loading для auth страниц
│   └── login/page.tsx      # /login
│
├── (user)/                 # 👥 Route Group: Аутентифицированные (USER+)
│   ├── layout.tsx          # Auth Guard: требует аутентификации
│   ├── loading.tsx         # Loading для user страниц
│   ├── page.tsx           # / (главная)
│   ├── marketplace/page.tsx # /marketplace
│   ├── inventory/page.tsx  # /inventory
│   ├── docs/page.tsx      # /docs
│   └── settings/page.tsx  # /settings
│
├── (creator)/              # 🎨 Route Group: Креаторы (CREATOR+)
│   ├── layout.tsx          # Role Guard: требует CREATOR+
│   ├── loading.tsx         # Loading для creator страниц
│   └── labs/page.tsx      # /labs
│
└── (admin)/               # 🛡️ Route Group: Администраторы (ADMIN+)
    ├── layout.tsx          # Role Guard: требует ADMIN+
    ├── loading.tsx         # Loading для admin страниц
    └── admin/page.tsx     # /admin
```

## 🔐 Система Ролей

### Иерархия Ролей

```typescript
type UserRole = "USER" | "CREATOR" | "ADMIN" | "SUPER_ADMIN";

const roleHierarchy: Record<UserRole, number> = {
  USER: 1, // Базовый пользователь
  CREATOR: 2, // Создатель контента + USER права
  ADMIN: 3, // Администратор + CREATOR + USER права
  SUPER_ADMIN: 4, // Супер админ + все права
};
```

### Права Доступа

| Роль            | Доступные Роуты                                         | Описание                       |
| --------------- | ------------------------------------------------------- | ------------------------------ |
| **Анонимный**   | `/login`, `/auth/*`                                     | Только страницы аутентификации |
| **USER**        | `/`, `/marketplace`, `/inventory`, `/docs`, `/settings` | Базовая функциональность       |
| **CREATOR**     | USER + `/labs`                                          | Экспериментальные функции      |
| **ADMIN**       | CREATOR + `/admin`                                      | Административная панель        |
| **SUPER_ADMIN** | Полный доступ                                           | Все функции системы            |

### Проверка Доступа (config/nav.ts)

```typescript
// Проверка доступа к навигационному элементу
export function hasAccess(userRole: UserRole | null, item: NavItem): boolean {
  if (!userRole) return false;

  // Проверка точной роли (если указана)
  if (item.exactRole) {
    return item.exactRole.includes(userRole);
  }

  // Проверка минимальной роли (иерархическая)
  if (item.minRole) {
    return roleHierarchy[userRole] >= roleHierarchy[item.minRole];
  }

  return true;
}

// Получение доступных элементов навигации
export function getAccessibleNavItems(userRole: UserRole | null): NavItem[] {
  return navigationConfig.filter((item) => hasAccess(userRole, item));
}
```

## 🛡️ Auth Guards (Security Layers)

### 1. Middleware Guard (middleware.ts)

```typescript
// Первый уровень - на уровне запроса
export async function middleware(req: NextRequest) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Проверка аутентификации
  if (!user && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Проверка ролей для специальных роутов
  if (pathname.startsWith("/labs") && userRole === "USER") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (
    pathname.startsWith("/admin") &&
    !(userRole === "ADMIN" || userRole === "SUPER_ADMIN")
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }
}
```

### 2. Layout Guards (Server-Side)

```typescript
// app/(user)/layout.tsx
export default async function UserLayout({ children }: { children: React.ReactNode }) {
  await requireAuth(); // Требует аутентификации
  return <>{children}</>;
}

// app/(creator)/layout.tsx
export default async function CreatorLayout({ children }: { children: React.ReactNode }) {
  await requireRole("CREATOR"); // Требует роль CREATOR+
  return <>{children}</>;
}

// app/(admin)/layout.tsx
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("ADMIN"); // Требует роль ADMIN+
  return <>{children}</>;
}
```

### 3. Server-Side Auth Utilities (lib/supabase/server.ts)

```typescript
// Кэшированное получение пользователя
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

// Проверка аутентификации с редиректом
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

// Проверка роли с редиректом
export async function requireRole(
  requiredRole: UserRole | UserRole[]
): Promise<User> {
  const user = await requireAuth();
  const userData = await getCurrentUserData();

  if (!hasRequiredRole(userData.role, requiredRole)) {
    redirect("/");
  }

  return user;
}
```

## 🗺️ Navigation Configuration

### Main Navigation (config/nav.ts)

```typescript
export const navigationConfig: NavItem[] = [
  {
    key: "discover",
    label: "navbar.discover",
    href: "/",
    icon: "solar:compass-bold",
    minRole: "USER",
  },
  {
    key: "marketplace",
    label: "navbar.marketplace",
    href: "/marketplace",
    icon: "solar:bag-4-bold",
    minRole: "USER",
  },
  {
    key: "inventory",
    label: "navbar.inventory",
    href: "/inventory",
    icon: "solar:archive-bold",
    minRole: "USER",
  },
  {
    key: "labs",
    label: "navbar.labs",
    href: "/labs",
    icon: "solar:test-tube-bold",
    minRole: "CREATOR", // Только для CREATOR+
  },
  {
    key: "docs",
    label: "navbar.docs",
    href: "/docs",
    icon: "solar:book-bold",
    minRole: "USER",
  },
];
```

### Profile Menu

```typescript
export const profileMenuConfig: NavItem[] = [
  {
    key: "settings",
    label: "navbar.mySettings",
    href: "/settings",
    icon: "solar:settings-linear",
    minRole: "USER",
  },
  {
    key: "admin",
    label: "navbar.adminPanel",
    href: "/admin",
    icon: "solar:shield-user-bold",
    minRole: "ADMIN", // Только для ADMIN+
  },
];
```

## 🎯 SPA Navigation (Single Page Application)

### Проблема Layout Re-rendering

**Проблема**: При переходах между layout группами вся страница перезагружалась.

**Решение**: Перенос Navbar и Footer в root layout.

```typescript
// app/layout.tsx - Root Layout
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Providers>
          <SupabaseProvider>
            <ThemeProvider>
              <div className="min-h-screen flex flex-col bg-background">
                <Navbar />           {/* ✅ Всегда отображается */}
                <main className="flex-1">
                  {children}         {/* 🔄 Меняется в зависимости от роута */}
                </main>
                <Footer />           {/* ✅ Всегда отображается */}
              </div>
            </ThemeProvider>
          </SupabaseProvider>
        </Providers>
      </body>
    </html>
  );
}
```

### Layout Group Simplification

```typescript
// app/(user)/layout.tsx - Упрощенный User Layout
export default async function UserLayout({ children }: { children: React.ReactNode }) {
  await requireAuth(); // Только проверка авторизации

  return (
    <Suspense fallback={<UserLayoutSkeleton />}>
      <PageTransition>{children}</PageTransition>
    </Suspense>
  );
}
```

**Результат**: Navbar и Footer остаются постоянными при всех переходах, меняется только контент внутри main.

## 🔄 Page Transitions

### PageTransition Component

```typescript
export const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};
```

### Loading States

Каждая layout группа имеет свой loading.tsx:

```typescript
// app/(user)/loading.tsx
export default function UserLayoutSkeleton() {
  return (
    <div className="flex-1 p-6">
      <div className="container mx-auto space-y-6">
        <div className="h-8 w-64 bg-default-200 rounded animate-pulse" />
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-default-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
```

## 🎪 Route Examples

### Successful Flows

| URL            | Route Group | Required Role | Layout Chain                   |
| -------------- | ----------- | ------------- | ------------------------------ |
| `/`            | `(user)`    | USER+         | Root → User → Home Page        |
| `/marketplace` | `(user)`    | USER+         | Root → User → Marketplace Page |
| `/labs`        | `(creator)` | CREATOR+      | Root → Creator → Labs Page     |
| `/admin`       | `(admin)`   | ADMIN+        | Root → Admin → Admin Page      |
| `/login`       | `(auth)`    | None          | Root → Auth → Login Page       |

### Failed Flows (Redirects)

| URL      | User Role | Redirect To | Reason                 |
| -------- | --------- | ----------- | ---------------------- |
| `/`      | Анонимный | `/login`    | Требует аутентификации |
| `/labs`  | USER      | `/`         | Недостаточно прав      |
| `/admin` | CREATOR   | `/`         | Недостаточно прав      |
| `/login` | USER      | `/`         | Уже авторизован        |

# 🎨 UI/UX Компоненты

## 🧩 Структура Компонентов

```
components/
├── 🔐 auth/              # Аутентификация
│   ├── EmailForm.tsx     # Форма ввода email
│   ├── LoginManager.tsx  # Состояние логина
│   └── OtpForm.tsx      # Форма OTP кода
├── 📊 charts/           # Графики
│   └── DynamicChart.tsx # Recharts интеграция
├── 🏗️ layout/           # Layout компоненты
│   ├── Footer.tsx       # Глобальный футер
│   └── Navbar.tsx       # Глобальная навигация
├── 🔄 shared/           # Переиспользуемые
│   ├── HeroUIComponents.tsx  # HeroUI утилиты
│   ├── LanguageSwitcher.tsx  # Переключатель языка
│   ├── PageSkeleton.tsx      # Loading состояния
│   ├── PageTransition.tsx    # Анимации переходов
│   └── ThemeSwitch.tsx       # Переключатель темы
└── ThemeProvider.tsx    # Провайдер темы
```

## 🏗️ Layout Components

### Navbar (components/layout/Navbar.tsx)

**Архитектура**: Мемоизированный компонент с role-based навигацией

```typescript
interface NavbarProps {}

export const Navbar = React.memo(() => {
  const { t } = useTranslation();
  const { supabase, session, role } = useSupabase() as SupabaseContextType;
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // 🎯 Мемоизированные вычисления
  const navItems = useMemo(() => getAccessibleNavItems(role), [role]);
  const profileMenuItems = useMemo(
    () => getAccessibleProfileMenuItems(role),
    [role]
  );
  const isAuth = useMemo(
    () => pathname.startsWith("/login") || pathname.startsWith("/auth"),
    [pathname]
  );
});
```

**Особенности**:

- ✅ React.memo для предотвращения re-render
- 🔄 Мемоизация навигационных элементов по роли
- 📱 Адаптивное мобильное меню с auto-close
- 🎨 Центрированная навигация на десктопе
- 🔐 Role-based отображение элементов

**Структура**:

```typescript
<HeroUINavbar>
  {/* Brand & Mobile toggle */}
  <NavbarBrand>
    <NavbarMenuToggle className="sm:hidden" />
    <NextLink href="/">MedTravel</NextLink>
  </NavbarBrand>

  {/* Desktop navigation - центрирована */}
  <NavbarContent className="absolute left-1/2 transform -translate-x-1/2 hidden sm:flex gap-6" justify="center">
    {navItems.map(item => <NavItem key={item.key} {...item} />)}
  </NavbarContent>

  {/* Right side actions */}
  <NavbarContent justify="end">
    <LanguageSwitcher />
    <ThemeSwitch />
    <ProfileDropdown />
  </NavbarContent>

  {/* Mobile menu */}
  <NavbarMenu>
    {navItems.map(item => <MobileNavItem key={item.key} {...item} onClose={() => setIsMenuOpen(false)} />)}
  </NavbarMenu>
</HeroUINavbar>
```

### Footer (components/layout/Footer.tsx)

**Архитектура**: Статический футер с условным рендерингом

```typescript
export const Footer = React.memo(() => {
  const { t } = useTranslation();
  const { session } = useSupabase() as SupabaseContextType;
  const pathname = usePathname();

  // Скрыть футер на auth страницах
  const shouldHideFooter = useMemo(
    () => pathname.startsWith("/login") || pathname.startsWith("/auth"),
    [pathname]
  );

  if (shouldHideFooter) return null;
});
```

## 🔐 Auth Components

### LoginManager (components/auth/LoginManager.tsx)

**Архитектура**: State manager для аутентификации

```typescript
type AuthStep = "email" | "otp";

export const LoginManager = () => {
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");

  return (
    <div>
      {step === "email" && (
        <EmailForm
          onSuccess={(email) => {
            setEmail(email);
            setStep("otp");
          }}
        />
      )}
      {step === "otp" && (
        <OtpForm
          email={email}
          onBack={() => setStep("email")}
        />
      )}
    </div>
  );
};
```

### EmailForm (components/auth/EmailForm.tsx)

**Функциональность**:

- 📧 Email OTP аутентификация
- 🔍 Google OAuth
- ✅ React Hook Form + Zod валидация

```typescript
const emailSchema = z.object({
  email: z.string().email("auth.invalidEmail"),
});

export const EmailForm = ({ onSuccess }: Props) => {
  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
  });

  const handleEmailAuth = async (values: z.infer<typeof emailSchema>) => {
    const { error } = await supabase.auth.signInWithOtp({
      email: values.email,
      options: { shouldCreateUser: true },
    });

    if (!error) onSuccess(values.email);
  };

  const handleGoogleAuth = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };
};
```

### OtpForm (components/auth/OtpForm.tsx)

**Функциональность**:

- 🔢 6-значный OTP код
- ⏰ Таймер для повторной отправки
- 🔄 Автоматическая верификация

```typescript
export const OtpForm = ({ email, onBack }: Props) => {
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (otp.length === 6) {
      handleVerifyOtp(otp);
    }
  }, [otp]);

  const handleVerifyOtp = async (token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (!error) {
      window.location.href = "/";
    }
  };
};
```

## 🔄 Shared Components

### LanguageSwitcher (components/shared/LanguageSwitcher.tsx)

**Архитектура**: Dropdown с флагами стран

```typescript
const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
] as const;

export const LanguageSwitcher = React.memo(() => {
  const { i18n } = useTranslation();

  const currentLanguage = useMemo(
    () => languages.find(lang => lang.code === i18n.language) || languages[0],
    [i18n.language]
  );

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button startContent={<Icon icon="solar:translation-linear" width={24} />} variant="ghost">
          <span className="hidden sm:inline">{currentLanguage.flag}</span>
        </Button>
      </DropdownTrigger>
      <DropdownMenu onSelectionChange={(keys) => {
        const selectedKey = Array.from(keys)[0] as string;
        if (selectedKey) i18n.changeLanguage(selectedKey);
      }}>
        {languages.map(language => (
          <DropdownItem key={language.code}>
            <div className="flex items-center gap-2">
              <span>{language.flag}</span>
              <span>{language.name}</span>
            </div>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
});
```

### ThemeSwitch (components/shared/ThemeSwitch.tsx)

**Архитектура**: Toggle между light/dark темами

```typescript
export const ThemeSwitch = React.memo(() => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  return (
    <Button
      isIconOnly
      aria-label="Toggle theme"
      variant="ghost"
      onPress={toggleTheme}
    >
      {theme === "light" ? (
        <Icon icon="solar:moon-linear" width={24} />
      ) : (
        <Icon icon="solar:sun-linear" width={24} />
      )}
    </Button>
  );
});
```

### PageTransition (components/shared/PageTransition.tsx)

**Архитектура**: Framer Motion анимации между страницами

```typescript
export const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};
```

## 🎯 Memoization Strategy

### Component Optimization

**NavItem - Мемоизированный навигационный элемент**:

```typescript
const NavItem = React.memo(
  ({ item, active, t }: { item: any; active: boolean; t: any }) => (
    <NavbarItem isActive={active}>
      <NextLink
        prefetch
        className={`font-medium transition-colors ${
          active ? "text-primary" : "text-foreground hover:text-primary"
        }`}
        href={item.href}
      >
        {t(item.label)}
      </NextLink>
    </NavbarItem>
  )
);
```

**MobileNavItem - С функцией закрытия меню**:

```typescript
const MobileNavItem = React.memo(
  ({ item, active, t, onClose }: Props) => (
    <NavbarMenuItem isActive={active}>
      <Link
        as={NextLink}
        href={item.href}
        onPress={onClose} // 🔄 Закрывает мобильное меню
      >
        {t(item.label)}
      </Link>
    </NavbarMenuItem>
  )
);
```

**ProfileDropdown - Мемоизированный dropdown профиля**:

```typescript
const ProfileDropdown = React.memo(
  ({ session, role, supabase, t, profileMenuItems }: Props) => {
    const handleLogout = useCallback(async () => {
      await supabase.auth.signOut();
      window.location.href = "/login";
    }, [supabase]);

    return (
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Button>
            <Badge color="success" content="" placement="bottom-right" shape="circle">
              <Icon icon="solar:user-linear" width={24} />
            </Badge>
          </Button>
        </DropdownTrigger>
        <DropdownMenu>
          <DropdownItem key="profile" className="cursor-default">
            <p className="font-semibold">{t("navbar.signedInAs")}</p>
            <p className="text-default-500">{session?.user?.email}</p>
          </DropdownItem>
          <DropdownItem as={NextLink} href="/settings">
            {t("navbar.mySettings")}
          </DropdownItem>
          {(role === "ADMIN" || role === "SUPER_ADMIN") && (
            <DropdownItem as={NextLink} href="/admin">
              {t("navbar.adminPanel")}
            </DropdownItem>
          )}
          <DropdownItem
            key="logout"
            color="danger"
            startContent={<Icon icon="solar:logout-linear" width={16} />}
            onPress={handleLogout}
          >
            {t("navbar.logOut")}
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );
  }
);
```

## 📱 Responsive Design

### Breakpoint Strategy

```css
/* Tailwind CSS breakpoints */
sm: 640px   /* Small devices (landscape phones) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (laptops/desktops) */
xl: 1280px  /* Extra large devices (large laptops/desktops) */
2xl: 1536px /* 2x Extra large devices (larger desktops) */
```

### Adaptive Components

**Navbar Responsiveness**:

```typescript
// Desktop navigation - скрыта на мобильных
<NavbarContent className="absolute left-1/2 transform -translate-x-1/2 hidden sm:flex gap-6">

// Mobile menu toggle - показан только на мобильных
<NavbarMenuToggle className="mr-1 h-6 sm:hidden" />

// Language switcher - флаг скрыт на мобильных
<span className="hidden sm:inline">{currentLanguage.flag}</span>
```

**Content Layout**:

```typescript
// Адаптивная ширина контейнера
<div className="rounded-large bg-content1 px-8 py-12 w-full max-w-screen-xl mx-4 text-center shadow-small">

// Мобильное меню с центрированием
<div className="w-full max-w-screen-md mx-auto space-y-2">
```

## 🎨 HeroUI Integration

### Theme Configuration

```typescript
// tailwind.config.js
plugins: [
  heroui({
    prefix: "heroui",
    addCommonColors: false,
    defaultTheme: "light",
    themes: {
      light: {
        colors: {
          primary: {
            DEFAULT: "#3b82f6", // Blue-500
            foreground: "#FFFFFF",
          },
          // ... остальные цвета
        },
      },
      dark: {
        colors: {
          primary: {
            DEFAULT: "#60a5fa", // Blue-400
            foreground: "#0d1117",
          },
        },
      },
    },
  }),
];
```

### Component Usage

```typescript
// Примеры использования HeroUI компонентов
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Badge,
} from "@heroui/react";
```

# ⚡ Производительность и Оптимизации

## 🚀 Next.js 15 Optimizations

### Bundle Optimization (next.config.js)

```javascript
const nextConfig = {
  // Экспериментальные оптимизации
  experimental: {
    optimizePackageImports: [
      "@heroui/react", // Tree-shaking UI компонентов
      "@iconify/react", // Оптимизация иконок
      "react-i18next", // i18n оптимизация
      "framer-motion", // Анимации tree-shaking
    ],
    ppr: false, // Partial Prerendering (когда стабилизируется)
  },

  // Внешние серверные пакеты
  serverExternalPackages: ["@supabase/supabase-js"],

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production", // Удаление console.log в продакшене
    reactRemoveProperties: process.env.NODE_ENV === "production", // Удаление React dev свойств
  },

  // Webpack оптимизации
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
          heroui: {
            test: /[\\/]node_modules[\\/]@heroui[\\/]/,
            name: "heroui",
            chunks: "all",
            priority: 10, // Высокий приоритет для UI библиотеки
          },
          supabase: {
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            name: "supabase",
            chunks: "all",
            priority: 10,
          },
        },
      };
    }
    return config;
  },
};
```

## 📦 Bundle Analysis

### Current Bundle Sizes

```
Route (app)                                Size  First Load JS
┌ ƒ /                                     154 B         341 kB
├ ƒ /_not-found                           195 B         341 kB
├ ƒ /admin                                154 B         341 kB
├ ƒ /auth/callback                        154 B         341 kB
├ ƒ /docs                                 154 B         341 kB
├ ƒ /inventory                            154 B         341 kB
├ ƒ /labs                                 154 B         341 kB
├ ƒ /login                              2.03 kB         417 kB
├ ƒ /marketplace                          154 B         341 kB
└ ƒ /settings                             154 B         341 kB
+ First Load JS shared by all            342 kB
  ├ chunks/vendors-e366cc834430827a.js   338 kB
  └ other shared chunks (total)         3.74 kB
```

**Анализ**:

- ✅ **Маленькие страницы**: Все страницы ~154B (только контент)
- ✅ **Общий бандл**: 342kB shared chunks
- ✅ **Vendor chunk**: 338kB (HeroUI + React + Supabase)
- ✅ **Login страница**: +76kB (формы + валидация)

## 🔄 React Performance

### Memoization Strategy

**1. Component Memoization**

```typescript
// Navbar - предотвращает re-render при изменении роута
export const Navbar = React.memo(() => {
  // Мемоизация навигационных элементов
  const navItems = useMemo(() => getAccessibleNavItems(role), [role]);
  const profileMenuItems = useMemo(
    () => getAccessibleProfileMenuItems(role),
    [role]
  );

  // Мемоизация проверки auth страниц
  const isAuth = useMemo(
    () => pathname.startsWith("/login") || pathname.startsWith("/auth"),
    [pathname]
  );
});

// Footer - статический мемоизированный компонент
export const Footer = React.memo(() => {
  const shouldHideFooter = useMemo(
    () => pathname.startsWith("/login") || pathname.startsWith("/auth"),
    [pathname]
  );
});

// ThemeSwitch - мемоизированный переключатель
export const ThemeSwitch = React.memo(() => {
  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);
});
```

**2. Context Optimization**

```typescript
// SupabaseProvider с мемоизированным значением контекста
export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);

  // Мемоизация значения контекста для предотвращения re-render
  const contextValue = useMemo(
    () => ({ supabase, session, role }),
    [supabase, session, role]
  );

  return (
    <SupabaseContext.Provider value={contextValue}>
      {children}
    </SupabaseContext.Provider>
  );
}
```

**3. Expensive Computations**

```typescript
// Мемоизация дорогих вычислений в навигации
const getAccessibleNavItems = useMemo(() => {
  return (userRole: UserRole | null): NavItem[] => {
    return navigationConfig.filter((item) => hasAccess(userRole, item));
  };
}, []);

// Мемоизация проверки роли
const hasAccessMemo = useMemo(() => {
  return (userRole: UserRole | null, item: NavItem): boolean => {
    if (!userRole) return false;

    if (item.exactRole) {
      return item.exactRole.includes(userRole);
    }

    if (item.minRole) {
      return roleHierarchy[userRole] >= roleHierarchy[item.minRole];
    }

    return true;
  };
}, []);
```

## 🗄️ Caching Strategy

### Server-Side Caching

**1. React Cache для Server Components**

```typescript
// lib/supabase/server.ts
import { cache } from "react";

// Кэшированный Supabase клиент
export const getServerSupabase = cache(() => {
  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: async () => {
          const store = await cookies();
          return store.getAll().map(({ name, value }) => ({ name, value }));
        },
      },
    }
  );
});

// Кэшированное получение пользователя
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

// Кэшированное получение профиля
export const getUserProfile = cache(async (userId: string) => {
  const supabase = getServerSupabase();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  return data;
});
```

**2. Middleware Caching**

```typescript
// middleware.ts
const roleCache = new Map<string, { role: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 минут

export async function middleware(req: NextRequest) {
  if (user) {
    const cacheKey = user.id;
    const cached = roleCache.get(cacheKey);
    const now = Date.now();

    // Проверка кэша сначала
    if (cached && now - cached.timestamp < CACHE_TTL) {
      userRole = cached.role;
    } else {
      // Загрузка из БД если нет в кэше или истек срок
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      userRole = data?.role ?? "USER";

      // Обновление кэша
      if (userRole) {
        roleCache.set(cacheKey, { role: userRole, timestamp: now });
      }

      // Очистка старых записей кэша
      if (roleCache.size > 1000) {
        for (const [key, value] of roleCache.entries()) {
          if (now - value.timestamp > CACHE_TTL) {
            roleCache.delete(key);
          }
        }
      }
    }
  }
}
```

### Client-Side Caching

**1. i18n Resource Caching**

```typescript
// i18n.ts
const resources = {
  en: { translation: en },
  es: { translation: es },
  ru: { translation: ru },
};

i18n.init({
  resources,
  fallbackLng: "en",
  detection: {
    order: ["localStorage", "navigator", "htmlTag"],
    caches: ["localStorage"], // Кэширование выбранного языка
  },
});
```

**2. Font Optimization**

```typescript
// config/fonts.ts & app/layout.tsx
const roboto = Roboto({
  subsets: ["latin", "cyrillic"],
  display: "swap", // Быстрая загрузка с fallback
  variable: "--font-roboto",
  weight: ["300", "400", "500", "700"],
  preload: true, // Предзагрузка критических шрифтов
});
```

## 🖼️ Image Optimization

### Next.js Image Config

```javascript
// next.config.js
images: {
  formats: ['image/avif', 'image/webp'],          // Современные форматы
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // Адаптивные размеры
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],            // Иконки и маленькие изображения
  dangerouslyAllowSVG: true,                      // SVG поддержка
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
}
```

## 🌐 HTTP Optimizations

### Headers Configuration

```javascript
// next.config.js
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',              // MIME type защита
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',                 // Clickjacking защита
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',        // XSS защита
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin', // Referrer политика
        }
      ],
    },
    {
      source: '/static/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable', // Долгосрочное кэширование статики
        },
      ],
    },
    {
      source: '/_next/static/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable', // Next.js статика
        },
      ],
    },
  ];
}
```

## 📊 Performance Monitoring

### Vercel Analytics Integration

```typescript
// app/layout.tsx
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />      {/* 📊 Аналитика пользователей */}
        <SpeedInsights />  {/* ⚡ Метрики производительности */}
      </body>
    </html>
  );
}
```

### Custom Performance Monitoring

```typescript
// Отслеживание времени загрузки компонентов
export const withPerformanceTracking = <P extends object>(
  Component: React.ComponentType<P>,
  name: string
) => {
  return React.memo((props: P) => {
    useEffect(() => {
      const start = performance.now();

      return () => {
        const end = performance.now();
        console.log(`${name} render time: ${end - start}ms`);
      };
    }, []);

    return <Component {...props} />;
  });
};
```

## 🚀 SSR Optimizations

### Loading States для каждой Route Group

```typescript
// app/(user)/loading.tsx
export default function UserLayoutSkeleton() {
  return (
    <div className="flex-1 p-6">
      <div className="container mx-auto space-y-6">
        <div className="h-8 w-64 bg-default-200 rounded animate-pulse" />
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-default-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

// app/(creator)/loading.tsx - такая же структура
// app/(admin)/loading.tsx - такая же структура
```

### Suspense Boundaries

```typescript
// Использование Suspense для асинхронных компонентов
export default async function UserLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();

  return (
    <Suspense fallback={<UserLayoutSkeleton />}>
      <PageTransition>{children}</PageTransition>
    </Suspense>
  );
}
```

## 🎯 Performance Metrics

### Core Web Vitals Targets

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTFB** (Time to First Byte): < 800ms

### Current Performance

- ✅ **First Load**: 341kB shared bundle
- ✅ **Page Loads**: ~154B per page
- ✅ **SSR**: Instant server rendering
- ✅ **Hydration**: Fast React hydration
- ✅ **Navigation**: SPA-like transitions без перезагрузки layout

### Optimization Checklist

- [x] Bundle splitting по библиотекам
- [x] Tree-shaking неиспользуемого кода
- [x] React memoization для предотвращения re-render
- [x] Server-side caching с React cache()
- [x] Middleware role caching
- [x] Font optimization с preload
- [x] Image optimization с современными форматами
- [x] HTTP headers для кэширования
- [x] Loading states для UX
- [x] Suspense boundaries для async компонентов
- [x] Console.log removal в продакшене
- [x] CSS оптимизация с Tailwind purging

# 🔐 Безопасность и База Данных

## 🛡️ Security Architecture

### Row Level Security (RLS)

```sql
-- Профили пользователей
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

-- Админы могут видеть все профили
CREATE POLICY "Admins can view all profiles" ON profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('ADMIN', 'SUPER_ADMIN')
  )
);
```

### Authentication Flow

```typescript
// Supabase Auth с Email OTP + Google OAuth
const authMethods = {
  emailOtp: {
    signIn: () =>
      supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      }),
    verify: () => supabase.auth.verifyOtp({ email, token, type: "email" }),
  },

  googleOAuth: {
    signIn: () =>
      supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      }),
  },
};
```

### Database Schema

```sql
-- Пользователи (расширение auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'CREATOR', 'ADMIN', 'SUPER_ADMIN')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Автоматическое создание профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'USER');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 🌍 Интернационализация (i18n)

### Архитектура i18n

```typescript
// Поддерживаемые языки
const locales = ["en", "es", "ru"] as const;
type Locale = (typeof locales)[number];

// Серверная детекция языка
export function detectLocale(acceptLanguage?: string): Locale {
  if (!acceptLanguage) return "en";

  const preferredLocales = acceptLanguage
    .split(",")
    .map((lang) => lang.split(";")[0].trim().toLowerCase());

  for (const preferred of preferredLocales) {
    if (locales.includes(preferred as Locale)) {
      return preferred as Locale;
    }

    // Проверка языка без кода страны (en-US -> en)
    const langCode = preferred.split("-")[0];
    if (locales.includes(langCode as Locale)) {
      return langCode as Locale;
    }
  }

  return "en";
}
```

### Структура переводов

```json
// locales/en.json
{
  "navbar.discover": "Discover",
  "navbar.marketplace": "Marketplace",
  "navbar.labs": "Labs",
  "navbar.docs": "Docs",
  "navbar.inventory": "Inventory",
  "navbar.adminPanel": "Admin Panel",
  "navbar.mySettings": "My Settings",
  "navbar.signedInAs": "Signed in as",
  "navbar.logOut": "Log Out",

  "auth.emailLabel": "Email Address",
  "auth.emailPlaceholder": "Enter your email",
  "auth.continueWithEmail": "Continue with Email",
  "auth.continueWithGoogle": "Continue with Google",
  "auth.codeLabel": "Authentication code",
  "auth.resendCode": "Resend code",
  "auth.verify": "Verify",

  "theme.light": "Light",
  "theme.dark": "Dark",
  "theme.toggleLabel": "Toggle Theme",

  "footer.copyright": "© 2024 MEDTRAVEL.ME Inc. All rights reserved."
}
```

### Клиентская i18n конфигурация

```typescript
// i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: { translation: en },
  es: { translation: es },
  ru: { translation: ru },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
  });
```

## 🎨 Стили и Темы

### Tailwind + HeroUI Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-roboto)", "Inter", "ui-sans-serif", "system-ui"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            background: "#FFFFFF",
            foreground: "#11181C",
            primary: {
              50: "#eff6ff",
              500: "#3b82f6", // Blue-500
              DEFAULT: "#3b82f6",
              foreground: "#FFFFFF",
            },
            // ... полная цветовая палитра
          },
        },
        dark: {
          colors: {
            background: "#0d1117",
            foreground: "#e6edf3",
            primary: {
              500: "#60a5fa", // Blue-400
              DEFAULT: "#60a5fa",
              foreground: "#0d1117",
            },
            // ... темная цветовая палитра
          },
        },
      },
    }),
  ],
};
```

### Theme Provider Implementation

```typescript
// components/ThemeProvider.tsx
"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      {...props}
    >
      {children}
    </NextThemeProvider>
  );
}
```

### CSS Custom Properties

```css
/* styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-roboto: "Roboto", "Inter", ui-sans-serif, system-ui;
}

/* Custom animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* HeroUI custom overrides */
.heroui-navbar {
  backdrop-filter: blur(12px);
  background-color: rgb(255 255 255 / 0.8);
}

.dark .heroui-navbar {
  background-color: rgb(13 17 23 / 0.8);
}
```

## 🚀 Развертывание

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Production only
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Vercel Deployment

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

### Build Optimization

```json
// package.json scripts
{
  "scripts": {
    "dev": "next dev --turbopack", // Turbopack для dev
    "build": "next build", // Production build
    "start": "next start", // Production server
    "lint": "eslint --fix", // Linting с автофиксом
    "analyze": "ANALYZE=true npm run build" // Bundle анализ
  }
}
```

## 🛠 Development Setup

### Prerequisites

```bash
Node.js 18.17+ or 20.0+
npm 9+ or yarn 1.22+
Git 2.0+
```

### Installation

```bash
# Клонирование репозитория
git clone <repository-url>
cd frontend

# Установка зависимостей
npm install

# Настройка переменных окружения
cp .env.example .env.local
# Заполните SUPABASE_URL и ANON_KEY

# Запуск в режиме разработки
npm run dev
```

### Development Scripts

```bash
npm run dev          # Запуск dev сервера с Turbopack
npm run build        # Production build
npm run start        # Запуск production сервера
npm run lint         # ESLint проверка с автофиксом
npm run type-check   # TypeScript проверка типов
```

### Code Quality

```javascript
// eslint.config.mjs
export default [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      "react-hooks/exhaustive-deps": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "import/order": "warn",
      "prettier/prettier": "warn",
    },
  },
];
```

### Git Hooks (рекомендуется)

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run type-check"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

## 📱 Testing Strategy

### Unit Testing (рекомендуется добавить)

```bash
# Добавить в зависимости
npm install --save-dev @testing-library/react @testing-library/jest-dom jest

# Jest конфигурация
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
```

### E2E Testing (рекомендуется добавить)

```bash
# Playwright для E2E тестов
npm install --save-dev @playwright/test

# Playwright конфигурация
// playwright.config.ts
export default {
  testDir: './e2e',
  fullyParallel: true,
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
};
```

## 🔮 Future Improvements

### Планируемые функции

- [ ] **Real-time features**: WebSocket интеграция с Supabase Realtime
- [ ] **PWA support**: Service Worker + Web App Manifest
- [ ] **Mobile app**: React Native версия с shared компонентами
- [ ] **Advanced analytics**: Custom events tracking
- [ ] **Content management**: Admin панель для управления контентом
- [ ] **Payment integration**: Stripe/PayPal для маркетплейса
- [ ] **File upload**: Supabase Storage интеграция
- [ ] **Search functionality**: Full-text search с PostgreSQL
- [ ] **Notifications**: Push уведомления + email
- [ ] **API rate limiting**: Защита от злоупотреблений

### Performance Improvements

- [ ] **Partial Prerendering**: Когда стабилизируется в Next.js
- [ ] **Edge runtime**: Для API routes
- [ ] **Service Worker**: Для offline функциональности
- [ ] **Bundle analyzer**: Регулярный мониторинг размера бандла
- [ ] **Lazy loading**: Дополнительная оптимизация компонентов
- [ ] **CDN optimization**: Оптимизация доставки статических ресурсов

## 📊 Project Metrics

### Codebase Statistics

- **Total Files**: 63 файлов
- **Components**: 15+ React компонентов
- **Pages**: 8 страниц приложения
- **Layouts**: 4 layout группы
- **Languages**: 3 языка (EN/ES/RU)
- **Dependencies**: 25+ production пакетов
- **Dev Dependencies**: 20+ development пакетов

### Performance Metrics

- **Bundle Size**: 341kB shared + ~154B per page
- **First Load**: < 500ms (target)
- **Time to Interactive**: < 1s (target)
- **Lighthouse Score**: 90+ (target)
- **Core Web Vitals**: Green (target)

---

**MedTravel** - это современная, масштабируемая и высокопроизводительная платформа, построенная с использованием лучших практик веб-разработки 2024 года. Архитектура приложения обеспечивает отличный developer experience, безопасность, производительность и готовность к продакшену.

----------------------------------------------

-блог *
-метатеги *
-парсинг *
-темная тема
-весь ux/ui
-локализация

------------------------------------------------

Общий контекст проекта

Проект: MedTravel — агрегатор клиник и приёмов (медтуризм).

Текущая зона работ: личный кабинет клиники (Customer Panel) + базовые справочники/операции (Bookings, Reports, Clinic Profile и т.д.).

Технологии и стандарты

Next.js (App Router), TypeScript, TailwindCSS.

UI-компоненты: наши локальные (TableShell, Button, и т.п.) + установленный @heroui (используем выборочно).

Supabase (Postgres + RLS), запросы через sbAdmin/server client. Вьюшки вида v_customer_* для выборок под клинику.

Стиль: модульная архитектура, строго следуем нашим путям/папкам и не подтягиваем чужие React-заготовки «как есть».

Что уже реализовано (по ключевым разделам)
1) Bookings (Customer → Bookings)

UI: сверстано по шаблону (см. твой второй скриншот — «идеал»):

Хедер с действиями: Refresh / Test DB / Export CSV / Delete All.

Фильтры: два Pick a date (start/end), текстовый поиск, селекты для Status / Service / Method, Reset Filters.

Табличная шапка в TableShell: Name, Phone, Contact, Service, Status, Created, Actions.

Состояние данных: пока макет. Таблица и фильтры не связаны с БД, пагинации/CSV/удаления нет.

Готовность: ~40% (верстка и структура готова).

2) Reports (Customer → Reports)

Данные: серверный компонент получает clinicId и тянет из v_customer_reports, фильтрует .eq("clinic_id", clinicId), сортирует по created_at desc.

UI: таблица с колонками: Date, Reporter, Contact, Relationship, Details, Status, Actions. Пустое состояние отображается корректно.

Не хватает: фильтров (статус, дата-диапазон), «Refresh», «Delete All», «Export».

Готовность: ~70% (данные уже подтягиваются, остаётся функционал фильтров/действий).

3) Clinic Profile (многошаговая анкета клиники)

Есть комплект страниц-секций (ты прислал шаблоны, мы их придерживаемся):

Basic Information — форма с валидацией (zod + react-hook-form), автогенерация slug, подсказка specialty-slug.

Services — динамический список услуг (name/price/category/description), add/remove, сохранение как драфта.

Doctors — динамический список докторов (фото, ФИО, специальность, опыт, квалификации), валидация размера/типа файла на клиенте.

Additional Services & Facilities — четыре массива строк (premises, clinic_services, travel_services, languages_spoken) + блок аккредитаций (name/logo_url/description).

Operating Hours — расписание по дням, статус Open/Closed, выбор времени из пресета.

Gallery — список картинок по URL (превью, title), add/remove.

Location & Directions — Google Maps URL + directions.

Payment Methods — через общий компонент PaymentMethodsSection (мы сохраняем только список методов; иконка/цвет — опциональны).

Состояние в коде сейчас:

Секции сверстаны в твоём стиле, используют ClinicProfileLayout (сайдбар прогресса/бейджи у нас в процессе; пока базовый контейнер).

У всех секций есть хэндлеры Save as Draft / Save & Continue или Submit for Review (Basic Info).

Но: контекст/серверные экшены сохранения в БД еще не доведены до единой схемы (см. «План» ниже).

Готовность: ~60–70% (UI и локальная логика секций ок, осталось связать в единый стор + сохранение по секциям в БД и общий прогресс/паблиш).

4) Остальные разделы Customer Panel (каркас)

Dashboard — базовый каркас (пока без метрик).

Patients — пока пустой/заготовка.

Reviews — каркас.

Transactions — каркас.

Settings — каркас.

Что предстоит реализовать (по разделам) и критерии готовности
A. Завершить Bookings (Customer)

Что сделать

Данные: создать v_customer_bookings (или использовать существующую) с фильтрами по clinic_id, статусу, диапазону дат, search по name/phone.

Пагинация: серверная (limit/offset) или keyset, на UI — стандартная пагинация.

Фильтры: связать контролы с query-параметрами и запросом.

Export CSV: серверный Action, выгрузка текущей выборки; файл — text/csv.

Delete All: серверный Action, безопасно (только в рамках клиники + confirm), soft-delete или hard — по твоему правилу.

Actions в строке: просмотр/изменение статуса/контакта, «Delete».

Готовность = Done, если:

таблица показывает актуальные данные для клиники,

фильтры и пагинация синхронизированы с URL,

экспорт выгружает то, что на экране,

удаление работает с подтверждением и RLS не нарушается.

B. Доделать Reports

Что сделать

Фильтры: статус, дата-диапазон (start/end), поиск по reporter/contact.

Кнопки: Refresh (перезапрос), Delete All (с подтверждением), Export CSV.

Actions: пометка статуса (например, resolved), просмотр деталей (модалка).

Готовность = Done, если фильтры/кнопки/экспорт/изменение статуса отрабатывают и сохраняются.

C. Customer → Clinic Profile (единый поток заполнения + публикация)

Задачи

Единый клиентский стор (Context): useClinicProfile должен быть источником правды для всех секций.

Храним черновик профиля клиники по секциям.

Считаем completion по каждой секции (Required поля для Basic Info/Services/Doctors/Location должны быть заполнены).

Сайдбар прогресса: бейджи Required / Complete / Empty как на референс-макетах; проценты и общий статус клиники (Draft/Pending/Published/Rejected).

Сохранение секций: Add server actions:

saveDraftSection({ section, data, clinic_id }) — сохраняет JSON соответствующей секции.

Схема хранения: либо одна таблица clinic_profile_drafts(draft jsonb), либо отдельные таблицы/колонки — выбери один путь и зафиксируем.

Submit for Review / Publish:

Кнопка «Submit for Review» (в Basic Info и/или в сайдбаре), переводит статус в pending.

Отдельный «Publish Clinic» (доступно админу) — перенос данных из черновика в продовые таблицы клиник. Для Customer достаточно статуса pending и блокировки редактирования некоторых полей до ревью.

Валидации: уже подключён zod в Basic Info — распространить на критичные поля других секций.

Роутинг секций: после Save & Continue — переход на следующую секцию. Кнопка «Back to Home» возвращает в Customer Dashboard.

Безопасность: все write-операции — через server actions, RLS: запись только в пределах clinic_id из контекста.

Готовность = Done, если:

Все секции читают/пишут в единый черновик через контекст + server actions.

Прогресс и бейджи корректны и обновляются.

Кнопки Draft/Continue/Submit изменяют состояние и это видно после перезагрузки.

После «Submit for Review» — статус клиники pending, редактирование ограничено (по правилам).

D. Остальные страницы Customer

Dashboard: вывести минимум 3 индикатора: новые брони за 7д, непрочитанные Reports, прогресс профиля (процент).

Patients/Reviews/Transactions/Settings: зафиксировать минимальные таблицы/формы + вьюшки v_customer_* и «пустые состояния».

Архитектура/папки (важно для будущего чата)

app/(customer)/customer/* — страницы кабинета клиники.

components/customer/* — переиспользуемые блоки (в т.ч. TableShell, ClinicProfileLayout).

contexts/ClinicProfileContext.tsx — единый стор черновика.

lib/supabase/* — клиенты Supabase (adminClient, serverClient).

lib/server-actions/* — серверные экшены (сохранение секций, экспорт CSV, массовые операции).

types/* — типы домена (ClinicStatus, Service, Doctor, и т.д.).

db (или миграции) — SQL для v_customer_* вьюшек и таблиц черновиков.

Конвенции UI/UX (для консистентности)

Заголовок страницы слева, действия справа (кнопки).

Фильтры всегда в карточке с отступами и Reset Filters справа снизу.

Пустые состояния табличных страниц — текст в TableShell.empty.

Действия опасные — розовые/красные (как Delete All).

Все даты — локализованные короткие (toLocaleDateString), формат единообразный.

Все списки (услуги/доктора/галерея/часы) — add/remove, кнопка внизу «Save as Draft» слева, «Save & Continue» справа.

Handoff: что считать «истиной» уже сегодня

Reports (готовы данные + таблица).

Bookings (готов шаблон/поведение UI, ждёт подключения к БД/экшенам).

Clinic Profile секции — UI и локальная логика ок, надо:

подключить единый контекст,

дописать server actions для сохранения по секциям,

добавить прогресс/бейджи,

реализовать статус pending при сабмите.

Пошаговый план на продолжение (2 спринта по 1–2 дня каждый)
Спринт 1 — «Данные и сохранение»

Создать вьюшки:

v_customer_bookings(clinic_id, created_at, status, contact_method, service, patient_name, phone, …)

(опционально) добить v_customer_reports полями для фильтров (status, date range), если чего-то нет.

Внедрить ClinicProfileContext + server actions:

saveDraftSection (JSONB/таблица черновиков).

Прописать clinic_id источником — getDevCustomerContext() или токеном из Supabase.

Привязать Bookings к БД, сделать пагинацию и фильтры.

Reports — добавить фильтры + Refresh.

Спринт 2 — «UX и публикация»

Сайдбар прогресса на всех страницах Clinic Profile (бейджи Required/Complete/Empty).

«Submit for Review» → статус клиники pending, блокировка критичных полей (Basic Info) до решения админа.

Массовые операции и экспорт:

Export CSV (Bookings, Reports).

Delete All (Bookings, Reports) с confirm.

Customer Dashboard — метрики + прогресс профиля.

Риски и что важно помнить

Не мешать библиотеки/шаблоны: работаем в рамках Next App Router и наших компонентов, без переносов «чужих» React-фич.

RLS/безопасность: все server actions проверяют clinic_id; никакого «delete all» без жёстких guard’ов.

Производительность: фильтры и пагинация серверные, любые поиски — через индексы (по clinic_id, created_at, status, phone).

Единый источник правды: черновик профиля хранится в БД (JSONB или нормализовано), контекст — лишь клиентская проекция.

Краткая «шпаргалка» для нового чата

Мы доделываем Customer Panel: Bookings (данные+фильтры+экспорт), Reports (фильтры+экспорт), Clinic Profile (единый черновик с прогрессом и сабмитом на ревью).

В коде уже есть страницы секций профиля (UI ок), есть Reports c реальной выборкой.

Следующий шаг — подключить ClinicProfileContext + server actions, привязать Bookings к v_customer_bookings, добавить экспорт/массовые операции, вывести прогресс в сайдбар.


--------------------------------------------

Sprint 1 — «Данные и сохранение»
P0 — Customer/Clinic Profile: единый черновик + server actions

 [P0][area/customer][type/feat] Ввести хранилище черновика профиля клиники

Создать таблицу clinic_profile_drafts (или расширить существующую):

clinic_id uuid PK/FK,

status text (draft|pending|published|rejected),

basic_info jsonb, services jsonb, doctors jsonb, facilities jsonb, hours jsonb, gallery jsonb, location jsonb, pricing jsonb,

updated_at timestamptz.

Индекс по clinic_id.

AC: запись/чтение по clinic_id работает, RLS ограничивает клинику своим черновиком.

 [P0][area/customer][type/feat] Server actions для секций

saveDraftSection({ clinicId, section, data })

getDraft({ clinicId })

submitForReview({ clinicId }) → status = 'pending'

AC: все секции вызывают saveDraftSection, данные переживают перезагрузку; pending меняет доступность полей.

 [P1][area/customer][type/tech] ClinicProfileContext

Единый контекст, который инициализируется getDraft и диспатчит saveDraftSection.

Считает completion per-section (Required → ≥1 валидная запись/значение).

AC: UI бейджей и процентов использует контекст, состояние консистентно между страницами.

P0 — Customer/Bookings: данные + фильтры + пагинация

 [P0][area/customer][type/feat] SQL view v_customer_bookings

Поля: booking_id, clinic_id, created_at, patient_name, phone, contact_method, service, status.

Индексы: (clinic_id, created_at desc), (clinic_id, status), (clinic_id, phone).

AC: выборка по clinic_id, фильтры работают.

 [P0][area/customer][type/feat] Привязка UI к БД

Фильтры (date range, status/service/method, search) → queryParams → серверный запрос.

Пагинация (limit/offset).

AC: таблица заполняется реальными данными, state ↔ URL синхронизированы.

P1 — Customer/Reports: фильтры + refresh

 [P1][area/customer][type/feat] Фильтры и Refresh

Фильтр по status, по диапазону дат, поиск по reporter/contact.

Кнопка Refresh вручную перезагружает данные.

AC: фильтры/refresh корректно влияют на выборку.

Sprint 2 — «UX и публикация»
P0 — Customer/Clinic Profile: UX, прогресс, публикация

 [P0][area/customer][type/feat] Сайдбар прогресса и бейджи

Left-nav: секции с бейджами Required|Complete|Empty как в референсе; общий Progress %.

AC: значения обновляются сразу после сохранения секции.

 [P0][area/customer][type/feat] Submit for Review → pending

«Submit for Review» доступна при 100% completion required-секций: basic_info, services, doctors, location.

После pending — блокируем редактирование критичных полей (минимум Basic Info).

AC: статус сохраняется, ограничения соблюдаются после перезагрузки.

P1 — Массовые операции и экспорт

 [P1][area/customer][type/feat] Export CSV (Bookings/Reports)

Серверный экспорт текущей выборки (применённые фильтры).

AC: загружается корректный CSV, кодировка UTF-8, названия колонок читабельные.

 [P1][area/customer][type/feat] Delete All (Bookings/Reports)

Подтверждение, RLS, soft-delete (рекомендовано) или hard — по финальному правилу.

AC: удаляются только записи своей клиники; UI обновляется.

P2 — Customer/Dashboard + каркасы

 [P2][area/customer][type/feat] Dashboard KPI

Блоки: новые брони за 7 дней, открытые репорты, прогресс профиля.

AC: цифры соответствуют БД.

 [P2][area/customer][type/feat] Patients/Reviews/Transactions/Settings — минимальные таблицы/формы

Заглушки с «empty state», единая шапка и TableShell.

AC: консистентный каркас для дальнейшего наполнения.


-----------------------------------------

1) Что это за система MedTravel — агрегатор медицинского туризма. Фронтенд — Next.js (App Router); БД и аутентификация — Supabase. Роли сервиса: Собирает заявки (лиды) из разных форм. Привязывает их к клинике/категории. Позволяет обрабатывать в админ-панели (статусы, фильтры, удаление, отчёты). SEO-страницы категорий/клиник с автогенерацией метаданных. 2) Архитектура (высокоуровнево) Фронтенд Next.js 14 (app/) RSC для страниц админки: сервером тянем данные из Supabase (через серверный клиент), передаём «табличкам» как props. Клиентские компоненты: модальные формы на публичных страницах (консультации/репорты/бронь), интерактивные таблицы в админке (смена статусов, удаление и т.п.). UI-паттерны Модалки на клинике/категориях небольшие, «как Request на странице клиники». Пагинация в админке: 15 записей/страница. Фильтры по дате (start/end), «Delete all», изменение статуса — одинаково реализованы в соответствующих разделах. Бэкенд (внутри Next) /app/api/ — тонкие API-роуты, валидируют вход, маппят значения к разрешённым БД CHECK-constraint’ам, выполняют insert/select через server-клиент Supabase. Из важных моментов: мы нормализуем поля, которые контролирует БД (например, contact_method), чтобы исключить ошибки 500 из-за CHECK. Supabase Хранит доменные таблицы: bookings, clinic_requests, reports, справочники (clinics, services, …), и набор «представлений для админ-отчётов» (mv_daily_* и т.п.). Констрейнты: clinic_requests.contact_method — CHECK, принимает строго определённые варианты (мы под них маппим UI-значения). clinic_requests.origin — CHECK (источник лида), на стороне API приводим к допустимым значениям. FK: clinic_requests.clinic_id -> clinics(id), service_id -> services(id) и др. Индексы: по PK, по created_at (DESC), по FK-колонкам — для быстрых выборок в админке. 3) Реализованные пользовательские потоки и формы A) Clinic Requests (модалка «Sign up for a consultation» на странице клиники) Где: страница конкретной клиники. Поля: name, phone, preferred contact method, service (из списка услуг клиники). Особенности/фиксы: Был конфликт с CHECK по contact_method. Сейчас UI-опции: Email, Phone, WhatsApp, Telegram. На API мы приводим к допустимому множеству БД (например, WhatsApp/Telegram → «phone», если в CHECK только email/phone; либо расширяем CHECK, если допустимы четыре варианта). Аналогично по origin: маппинг на допустимые значения (у нас был clinic_page, при необходимости приводим к «service/doctor/homepage» или расширяем CHECK). service приходит названием; в API ищем services.id по ilike(name) и вставляем service_id (если не нашли — NULL, это ок). Запись: clinic_requests (FK на клинику, опционально service_id, doctor_id:null, контактный метод, статус). Админ-панель → Clinic Requests Таблица с колонками: Name, Phone, Contact, Clinic, Service (ID), Status, Created, Actions. Здесь добавили JOIN с clinics и показываем название клиники, а в «Service» теперь выводим именно service_id. Интерактив: смена статуса из селекта, удаление записи, Delete all, фильтры по дате, пагинация (15/стр.). Статусы сейчас согласованы по всему проекту (используем единый enum/массив, без null). B) Reports (модалка «Report» под картой на странице клиники) Где: клиника, блок Location → кнопка Report. Поля: name, email, phone, relation to clinic, message. Запись: reports (FK на клинику; инцидент с user_id мы устранили — больше 500-х нет). Админ-панель → Reports Список репортов (дата, клиника, контакты, сообщение), изменение статуса, удаление записи, Delete all, фильтры по дате, пагинация. C) Bookings (форма на главной и/или категориях) Базовая логика аналогична Clinic Requests: нормализация контактного метода, сохранение в таблицу bookings, обработка в админке (фильтры/статусы/удаление/пагинация). На страницах категорий в hero-секциях кнопки Receive a Personalized Offer on Us открывают ту же форму, но с предустановленным Service / Category (выполняем подстановку по текущему slug категории). 4) SEO (реализовано по правилам из файла) Для страниц категорий, подкатегорий и клиник генерируем title/description по шаблонам (EN/RU/PL и т.д.), пропускаем отсутствующие части (например, если нет district). Дублируем в og:title / og:description и Twitter-разметку. Для страниц «лечения» — шаблон «Treatment in country, city, district – Prices and Top Clinics 2025» с вилкой цен при наличии. Для карточек клиник — «Clinic name in country, city, district – Reviews & Prices | Medtravel.me» + краткие USP (free consultation, verified reviews, прозрачные цены). Метаданные собираем в generateMetadata() для страниц категорий/клиник, приоритет — название из БД (если присутствует перевод/нормализованное имя). 5) Админ-панель (секции и унификация) Bookings / Clinic Requests / Reports: везде одинаковые UX-механики: Фильтр по дате (start/end), «Apply / Clear filters». Статусы в select → обновление через server action/api. Пагинация 15/стр. + «Prev/Next» и быстрые страницы. «Delete all» и удаление конкретной записи. Дополнительно: списки клиник, добавление клиники, контакты, отзывы — базовая структура есть; если потребуется, расширяем по аналогии. 6) Детали по БД (важное, чтобы нового чата хватило) Таблица clinic_requests (актуально) Колонки (ключевые): id uuid PK, user_id uuid (nullable), clinic_id uuid FK, service_id int (nullable), doctor_id uuid (nullable), name text, phone text, contact_method text, origin text, status text default 'New', created_at timestamptz default now(). CHECK: contact_method — ограниченный список (в одном из этапов было ‘Phone/WhatsApp/Telegram/Email’ или ‘email/phone’). Мы обеспечиваем нормализацию в API. origin — ограниченный список (например, ‘homepage’, ‘service’, ‘doctor’). Если используем ‘clinic_page’, то либо расширяем CHECK, либо маппим на допустимое. Индексы: PK, created_at DESC, по clinic_id, service_id, user_id. Таблица reports Привязка к клинике, контакты и сообщение. Исторически была ошибка с user_id NOT NULL/FK — исправлено (заявки создаются корректно). Таблица bookings Аналогична по схеме и обработке (статусы, контактный метод, источник). NB: Если появятся новые источники/каналы/методы связи — либо расширяем CHECK в БД миграцией, либо жёстко маппим в API на уже допустимые значения. 7) Ключевые файлы/узлы фронта (что уже есть) Модалки: components/clinic/ConsultationModal.tsx — форма заявки со страницы клиники (мы чисто и аккуратно переписали: минимальные состояния, reset при открытии, «закрытие по ESC/клик вне»). components/clinic/ReportModal.tsx — форма репорта. Страница клиники: components/clinic/ClinicDetailPage.tsx — секционные блоки, таблица «Treatments & Prices» с кнопкой Request, список врачей, фото, часы работы, карта (без пустых src), кнопка Report под картой. Для модалки Consultation сюда прокинуты: clinicId, нормализованный список servicesFromClinic (уникальные названия услуг), preselectedService (если клик на конкретной услуге). Категории: components/category/CategoryHero.tsx — CTA в hero. В страницах категорий по клику открываем ту же форму заявки, с предустановленным значением услуги/категории. Админка: app/(admin)/admin/*: для каждого раздела — page.tsx (серверная выборка из Supabase, фильтры, пагинация) + таблица в components/admin/... (чистый клиент, принимает rows/total/page/pageSize и callback’и). Для Clinic Requests: таблица теперь принимает колонки Clinic (название JOIN’ом) и Service (ID). 8) Интеграционные/технические решения, которые важно помнить Нормализация значений до вставки в БД — обязательна (иначе 500 на CHECK). Мы делаем это в /app/api/clinic-requests/route.ts (и аналогично для bookings, если нужно). JOIN данных в админке делаем прямо на сервере (RSC) — например, clinics:clinics!inner(id,name) — и отдаём в таблицу уже готовое. Пустые строки/URL в публичном UI фильтруем (особенно для <Image> и <iframe> карты), чтобы не было варнингов и 400/404. Единые перечни статусов. В таблицах используем согласованный массив (например, ['New','In review','Contacted','Scheduled','Done','Rejected']) и одинаково рендерим в селектах. 9) Что осталось/что делать дальше (очерёдность) Категорийные CTA → модалка Убедиться, что на всех страницах категорий CTA Receive a Personalized Offer on Us открывает форму, и поле «Service interested in» предзаполнено текущей категорией. Единые статусы и словари Вынести списки статусов/контакт-методов/источников в один модуль, использовать и в админке, и в API. Проверить, что значения в БД (CHECK) совпадают. SEO-метаданные Пройтись по генерации на всех типах страниц: категории, лечение, клиника, гео-сочетания. Дубли в og: и Twitter — уже делаем, но стоит проверить крайние случаи (нет district, нет вилки цен и т.п.). Роли/доступы Если планируется включить RLS и «не сервисный» доступ из клиента — потребуется доп. политика (пока используем серверный клиент для админки и API). Отчёты в админке Уже есть отчёт «Bookings by Services». По CRM-методичке (файл «структура…») можно добавить: конверсию по клиникам/категориям, среднее время до контакта, причины отказов, SLA и т.п. Автоматизации CRM (опционально) Автокатегоризация лида по ключевым словам. Авто-назначение клиники(-к) для общих заявок. Напоминания, если клиника не ответила в 24–48 ч; SLA-метрики; автоархивация неактивных. Еженедельные email-отчёты. 10) Как быстро «въехать» в код в новом чате Начать с components/clinic/ClinicDetailPage.tsx — там видно, как открывается ConsultationModal и что мы прокидываем. Посмотреть components/clinic/ConsultationModal.tsx — увидеть нормализацию и отправку в /api/clinic-requests. Заглянуть в app/api/clinic-requests/route.ts — там маппинг на CHECK и поиск service_id. Для админки — app/(admin)/admin/clinic-requests/page.tsx (серверный select + JOIN клиники + пагинация) и components/admin/clinic-requests/ClinicRequestsTable.tsx (рендер и события). По SEO — app/[category]/page.tsx (есть generateMetadata) и похожие места для клиники/лечений. ниже предоставляю тебе ссылки проекта: github - https://github.com/ArtLegends/medtravel-main website(production) - https://medtravel.me/ сейчас какая-то ошибка с верселем, не получилось задеплоить проект с обновлениями, но в репозитории актуальная версия проекта. на всякий случай пришлю тебе идею проекта: идея сервиса такая: пользователь к примеру живущий в турции хочет сделать запись на прием к врачу, по какой-то проблеме в организме, и вместо того, чтобы искать подходящую клинику по всему поисковику, он может зайти на сервис medtravel, выбрать подходящую для него категорию(на чем специализируется клиника), отфильтровать клиники этой категории(специализации) по городу, услугам, преимуществам и так далее, затем выбрать нужную, на странице этой клиники можно прочитать все о этой клинике, докторах, отзывы пользователей и там же сделать запись на прием(которая после будет видна в личном кабинете пользователя). то есть наш сервис(агрегатор) связывает клиники с клиентами.