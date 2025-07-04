// config/nav.ts
export type UserRole = "USER" | "CREATOR" | "ADMIN" | "SUPER_ADMIN";

export interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: string;
  description?: string;
  minRole?: UserRole;
  exactRole?: UserRole[];
}

// Иерархия ролей для проверки доступа
const roleHierarchy: Record<UserRole, number> = {
  USER: 1,
  CREATOR: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
};

// Основная навигация по ролям
export const navigationConfig: NavItem[] = [
  // Доступно всем аутентифицированным пользователям
  {
    key: "discover",
    label: "navbar.discover",
    href: "/",
    icon: "solar:compass-bold",
    description: "Discover amazing content",
    minRole: "USER",
  },
  {
    key: "marketplace",
    label: "navbar.marketplace",
    href: "/marketplace",
    icon: "solar:bag-4-bold",
    description: "Buy and sell items",
    minRole: "USER",
  },
  {
    key: "inventory",
    label: "navbar.inventory",
    href: "/inventory",
    icon: "solar:archive-bold",
    description: "Manage your items",
    minRole: "USER",
  },

  // Доступно только CREATOR+
  {
    key: "labs",
    label: "navbar.labs",
    href: "/labs",
    icon: "solar:test-tube-bold",
    description: "Experimental tools and features",
    minRole: "CREATOR",
  },

  // Доступно всем
  {
    key: "docs",
    label: "navbar.docs",
    href: "/docs",
    icon: "solar:book-bold",
    description: "Documentation and guides",
    minRole: "USER",
  },
];

// Мобильное меню (может отличаться от основного)
export const mobileNavigationConfig: NavItem[] = navigationConfig;

// Профильное меню
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
    minRole: "ADMIN",
  },
];

// Функции для проверки доступа
export function hasAccess(userRole: UserRole | null, item: NavItem): boolean {
  if (!userRole) return false;

  // Проверка точной роли
  if (item.exactRole) {
    return item.exactRole.includes(userRole);
  }

  // Проверка минимальной роли
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

// Проверка роли для маршрутов
export function canAccessRoute(
  userRole: UserRole | null,
  pathname: string
): boolean {
  // Публичные маршруты
  const publicRoutes = ["/", "/docs"];

  if (publicRoutes.includes(pathname)) return true;

  // Проверка по навигационной конфигурации
  const matchingItem = navigationConfig.find(
    (item) => pathname.startsWith(item.href) && item.href !== "/"
  );

  if (matchingItem) {
    return hasAccess(userRole, matchingItem);
  }

  // По умолчанию требуется аутентификация
  return userRole !== null;
}

// Получение группы маршрута для layout
export function getRouteGroup(pathname: string): string {
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/auth")
  ) {
    return "(auth)";
  }

  if (pathname.startsWith("/labs")) {
    return "(creator)";
  }

  if (pathname.startsWith("/admin")) {
    return "(admin)";
  }

  // Все остальные аутентифицированные маршруты
  return "(user)";
}
