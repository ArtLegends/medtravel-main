// components/layout/Navbar.tsx
"use client";

import React, { useMemo, useCallback } from "react";
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

/** Дропдаун гостя — выбор: клиника или партнёр */
function ProfileDropdownGuest({
  onOpenCustomerAuth,
  onOpenPartnerAuth,
}: {
  onOpenCustomerAuth: () => void;
  onOpenPartnerAuth: () => void;
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

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }, [supabase, router]);

  const upperRole = String(role || "").toUpperCase();

  // единая система ролей
  const canAccessAdmin =
    upperRole === "ADMIN" || upperRole === "SUPER_ADMIN";
  const canAccessCustomer = upperRole === "CUSTOMER" || canAccessAdmin;
  const canAccessPartner = upperRole === "PARTNER" || canAccessAdmin;

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

        {/* Клиентская панель (кастомер) */}
        {canAccessCustomer ? (
          <DropdownItem
            key="my-clinic"
            onPress={() => router.push("/customer")}
            startContent={<Icon icon="solar:hospital-linear" width={16} />}
          >
            My clinic
          </DropdownItem>
        ) : null}

        {/* Партнёрская панель — доступна партнёру и админу */}
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
            My dashboard
          </DropdownItem>
        ) : null}

        {/* Admin panel */}
        {canAccessAdmin ? (
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

          {/* колокольчик только для авторизованных */}
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
                onOpenPartnerAuth={() =>
                  setPartnerAuthOpen(true)
                }
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
                  (item.href !== "/" && pathname.startsWith(item.href))
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
    </>
  );
});
Navbar.displayName = "Navbar";
