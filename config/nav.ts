// config/nav.ts
export type UserRole = "GUEST" | "PATIENT" | "CUSTOMER" | "PARTNER" | "ADMIN";

export interface NavItem {
  key: string;
  label: string;          // plain label or i18n key — сейчас можно обычный текст
  href: string;
  icon?: string;
  description?: string;
  minRole?: UserRole;     // минимальная роль для доступа
  exactRole?: UserRole[]; // точные роли (если нужно)
}

// Простая иерархия доступа
const roleHierarchy: Record<UserRole, number> = {
  GUEST: 0,
  PATIENT: 1,
  CUSTOMER: 1,
  PARTNER: 2,
  ADMIN: 3,
};

/**
 * ПУБЛИЧНОЕ МЕНЮ КАТАЛОГА
 * Сейчас убираем всё от шаблона: discover/marketplace/inventory/labs/docs.
 * Оставим пусто — верхнее меню не будет показываться.
 * Когда понадобится, добавим, например: Categories, Clinics, About, Contact.
 */
export const navigationConfig: NavItem[] = [];

// Мобильное меню — то же самое
export const mobileNavigationConfig: NavItem[] = navigationConfig;

/**
 * ПРОФИЛЬНОЕ МЕНЮ
 * - Settings (любой залогиненный)
 * - Admin (только ADMIN)
 */
export const profileMenuConfig: NavItem[] = [
  {
    key: "settings",
    label: "My settings",
    href: "/settings",
    minRole: "PATIENT", // любой аутентифицированный
  },
  {
    key: "admin",
    label: "Admin panel",
    href: "/admin",
    minRole: "ADMIN",
  },
];

// Доступ
export function hasAccess(userRole: UserRole | null, item: NavItem): boolean {
  // Гость не имеет доступа к пунктам, требующим аутентификации
  if (!userRole) return !item.minRole || item.minRole === "GUEST";

  if (item.exactRole) {
    return item.exactRole.includes(userRole);
  }
  if (item.minRole) {
    return roleHierarchy[userRole] >= roleHierarchy[item.minRole];
  }
  return true;
}

export function getAccessibleNavItems(userRole: UserRole | null): NavItem[] {
  return navigationConfig.filter((item) => hasAccess(userRole, item));
}

export function getAccessibleMobileNavItems(
  userRole: UserRole | null
): NavItem[] {
  return mobileNavigationConfig.filter((item) => hasAccess(userRole, item));
}

export function getAccessibleProfileMenuItems(
  userRole: UserRole | null
): NavItem[] {
  return profileMenuConfig.filter((item) => hasAccess(userRole, item));
}

/**
 * Проверка доступа к маршрутам (минимально)
 * Публичные: главная и всё, что позже сюда добавим.
 */
export function canAccessRoute(
  userRole: UserRole | null,
  pathname: string
): boolean {
  const publicRoutes = ["/"]; // расширим при необходимости
  if (publicRoutes.includes(pathname)) return true;

  const matchingItem = navigationConfig.find(
    (item) => pathname.startsWith(item.href) && item.href !== "/"
  );
  if (matchingItem) return hasAccess(userRole, matchingItem);

  // По умолчанию — требуется аутентификация
  return userRole !== null;
}

// Группа лэйаута (если используешь)
export function getRouteGroup(pathname: string): string {
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/auth")
  ) {
    return "(auth)";
  }
  if (pathname.startsWith("/admin")) return "(admin)";
  return "(user)";
}
