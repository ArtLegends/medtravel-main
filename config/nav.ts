// config/nav.ts
export type UserRole = "GUEST" | "PATIENT" | "CUSTOMER" | "PARTNER" | "SUPERVISOR" | "ADMIN";

export interface NavItem {
  key: string;
  label: string;
  href: string;
  icon?: string;
  description?: string;
  minRole?: UserRole;     // минимальная роль для доступа
  exactRole?: UserRole[]; // точные роли
}

// Иерархия доступа
const roleHierarchy: Record<UserRole, number> = {
  GUEST: 0,
  PATIENT: 1,
  CUSTOMER: 1,
  PARTNER: 2,
  SUPERVISOR: 2,
  ADMIN: 3,
};

export const navigationConfig: NavItem[] = [];

export const mobileNavigationConfig: NavItem[] = navigationConfig;

export const profileMenuConfig: NavItem[] = [
  {
    key: "settings",
    label: "My settings",
    href: "/settings",
    minRole: "PATIENT",
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

export function canAccessRoute(
  userRole: UserRole | null,
  pathname: string
): boolean {
  const publicRoutes = ["/"];
  if (publicRoutes.includes(pathname)) return true;

  const matchingItem = navigationConfig.find(
    (item) => pathname.startsWith(item.href) && item.href !== "/"
  );
  if (matchingItem) return hasAccess(userRole, matchingItem);

  // По умолчанию — требуется аутентификация
  return userRole !== null;
}

// Группа лэйаута
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
