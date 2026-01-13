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

import type { UserRole } from "@/lib/supabase/supabase-provider";
import { useSupabase } from "@/lib/supabase/supabase-provider";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { ThemeSwitch } from "@/components/shared/ThemeSwitch";
import {
  getAccessibleNavItems,
} from "@/config/nav";
import UnifiedAuthModal from "@/components/auth/UnifiedAuthModal";
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

/** Дропдаун авторизованного */
function ProfileDropdownAuth({
  session,
  roles,
  activeRole,
  setActiveRole,
  supabase,
  t,
  onAddRole,
}: {
  session: any;
  roles: UserRole[];
  activeRole: UserRole;
  setActiveRole: (r: UserRole) => void;
  supabase: any;
  t: any;
  onAddRole: () => void;
}) {
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }, [supabase, router]);

  const hasAdmin = roles.includes("ADMIN");
  const canAccessCustomer = hasAdmin || roles.includes("CUSTOMER");
  const canAccessPartner = hasAdmin || roles.includes("PARTNER");
  const canAccessPatient = hasAdmin || roles.includes("PATIENT");

  const goPortal = (role: UserRole) => {
    setActiveRole(role);

    const map: Record<UserRole, string> = {
      GUEST: "/",
      PATIENT: "/patient",
      PARTNER: "/partner",
      CUSTOMER: "/customer",
      ADMIN: "/admin",
    };

    router.push(map[role] ?? "/");
  };

  const portalItems = ([
    {
      role: "PATIENT" as const,
      label: "Patient portal",
      icon: "solar:heart-pulse-2-linear",
      show: canAccessPatient,
    },
    {
      role: "PARTNER" as const,
      label: "Partner dashboard",
      icon: "solar:users-group-two-rounded-linear",
      show: canAccessPartner,
    },
    {
      role: "CUSTOMER" as const,
      label: "Clinic panel",
      icon: "solar:hospital-linear",
      show: canAccessCustomer,
    },
    {
      role: "ADMIN" as const,
      label: "Admin panel",
      icon: "solar:shield-user-bold",
      show: hasAdmin,
    },
  ] satisfies ReadonlyArray<{
    role: UserRole;
    label: string;
    icon: string;
    show: boolean;
  }>).filter((x) => x.show);

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
            <Icon className="text-default-500" icon="solar:user-linear" width={24} />
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

        <DropdownItem
          key="settings"
          onPress={() => router.push("/settings")}
          startContent={<Icon icon="solar:settings-linear" width={16} />}
        >
          {tSafe(t, "navbar.mySettings", "My settings")}
        </DropdownItem>

        {/* ПАНЕЛИ (вернули) */}
        {portalItems.length ? (
          <>
            <DropdownItem key="portals-title" className="cursor-default text-default-500">
              Portals
            </DropdownItem>

            {portalItems.map((it) => (
              <DropdownItem
                key={`portal-${it.role}`}
                onPress={() => goPortal(it.role)}
                startContent={<Icon icon={it.icon} width={16} />}
              >
                {it.label}
              </DropdownItem>
            ))}
          </>
        ) : null}

        {!hasAdmin && roles.length < 3 ? (
          <DropdownItem
            key="add-role"
            onPress={onAddRole}
            startContent={<Icon icon="solar:add-circle-linear" width={16} />}
          >
            Sign in another panel
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
  const { supabase, session, roles, activeRole, setActiveRole } = useSupabase();

  const pathname = usePathname() ?? "";
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [authOpen, setAuthOpen] = React.useState(false);
  const [authRole, setAuthRole] = React.useState<"CUSTOMER" | "PARTNER" | "PATIENT" | null>(null);

  const navItems = useMemo(() => getAccessibleNavItems(activeRole), [activeRole]);

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
                roles={roles}
                activeRole={activeRole}
                setActiveRole={setActiveRole}
                supabase={supabase}
                t={t}
                onAddRole={() => { setAuthRole(null); setAuthOpen(true); }}
                />
            ) : (
                <Button
                  variant="ghost"
                  color="primary"
                  startContent={<Icon icon="solar:user-linear" width={18} />}
                  onPress={() => { setAuthRole(null); setAuthOpen(true); }}
                  className="hidden sm:flex"
                >
                  Sign up / Sign in
                </Button>
            )}

            {!session ? (
              <Button
                className="h-8 w-8 min-w-0 p-0 sm:hidden"
                size="sm"
                variant="ghost"
                onPress={() => {
                  setAuthRole(null);
                  setAuthOpen(true);
                }}
              >
                <Icon className="text-default-500" icon="solar:user-linear" width={24} />
              </Button>
            ) : null}
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

      <UnifiedAuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        initialRole={authRole}
        next={pathname || "/"}
      />
    </>
  );
});
Navbar.displayName = "Navbar";
