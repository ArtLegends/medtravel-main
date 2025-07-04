"use client";

import type { SupabaseContextType } from "@/lib/supabase/supabase-provider";

import React, { useMemo, useCallback } from "react";
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
import NextLink from "next/link";
import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";
import { usePathname } from "next/navigation";

import { useSupabase } from "@/lib/supabase/supabase-provider";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { ThemeSwitch } from "@/components/shared/ThemeSwitch";
import {
  getAccessibleNavItems,
  getAccessibleProfileMenuItems,
} from "@/config/nav";

// Мемоизированный компонент навигационного элемента
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

NavItem.displayName = "NavItem";

// Мемоизированный компонент мобильного элемента навигации
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
        {t(item.label)}
      </Link>
    </NavbarMenuItem>
  )
);

MobileNavItem.displayName = "MobileNavItem";

// Мемоизированный компонент профиля
const ProfileDropdown = React.memo(
  ({
    session,
    role,
    supabase,
    t,
    profileMenuItems,
  }: {
    session: any;
    role: any;
    supabase: any;
    t: any;
    profileMenuItems: any[];
  }) => {
    const handleLogout = useCallback(async () => {
      await supabase.auth.signOut();
      window.location.href = "/login";
    }, [supabase]);

    return (
      <NavbarItem className="px-2">
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
                {t("navbar.signedInAs")}
              </p>
              <p className="font-medium text-tiny text-default-500">
                {session?.user?.email ?? ""}
              </p>
            </DropdownItem>
            <DropdownItem key="settings" as={NextLink} href="/settings">
              {t("navbar.mySettings")}
            </DropdownItem>
            {role === "ADMIN" || role === "SUPER_ADMIN" ?
              <DropdownItem key="admin" as={NextLink} href="/admin">
                {t("navbar.adminPanel")}
              </DropdownItem>
            : null}
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
      </NavbarItem>
    );
  }
);

ProfileDropdown.displayName = "ProfileDropdown";

export const Navbar = React.memo(() => {
  const { t } = useTranslation();
  const { supabase, session, role } = useSupabase() as SupabaseContextType;
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // Мемоизируем навигационные элементы на основе роли
  const navItems = useMemo(() => getAccessibleNavItems(role), [role]);

  // Мемоизируем элементы профильного меню
  const profileMenuItems = useMemo(
    () => getAccessibleProfileMenuItems(role),
    [role]
  );

  // Мемоизируем проверку auth-страниц
  const isAuth = useMemo(
    () => pathname.startsWith("/login") || pathname.startsWith("/auth"),
    [pathname]
  );

  // Упрощенный navbar для auth страниц
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
    <HeroUINavbar
      className="border-b border-divider bg-background/80 backdrop-blur-md"
      height="64px"
      maxWidth="xl"
      shouldHideOnScroll
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
    >
      {/* Brand & Mobile menu toggle */}
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

      {/* Desktop navigation */}
      <NavbarContent
        className="absolute left-1/2 transform -translate-x-1/2 hidden sm:flex gap-6"
        justify="center"
      >
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return <NavItem key={item.key} active={active} item={item} t={t} />;
        })}
      </NavbarContent>

      {/* Right side actions */}
      <NavbarContent
        className="ml-auto flex h-12 max-w-fit items-center gap-1 rounded-full p-0"
        justify="end"
      >
        {/* Language switcher */}
        <NavbarItem>
          <LanguageSwitcher />
        </NavbarItem>

        {/* Theme switcher */}
        <NavbarItem>
          <ThemeSwitch />
        </NavbarItem>

        {/* Profile dropdown */}
        <ProfileDropdown
          profileMenuItems={profileMenuItems}
          role={role}
          session={session}
          supabase={supabase}
          t={t}
        />
      </NavbarContent>

      {/* Mobile menu */}
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
  );
});

Navbar.displayName = "Navbar";
