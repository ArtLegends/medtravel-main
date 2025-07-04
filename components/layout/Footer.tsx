"use client";

import type { SupabaseContextType } from "@/lib/supabase/supabase-provider";

import React, { useMemo } from "react";
import { Link } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";
import NextLink from "next/link";

import { useSupabase } from "@/lib/supabase/supabase-provider";
import { getAccessibleNavItems } from "@/config/nav";

// Социальные ссылки
const socialItems = [
  {
    name: "Facebook",
    href: "#",
    icon: "fontisto:facebook",
  },
  {
    name: "Instagram",
    href: "#",
    icon: "fontisto:instagram",
  },
  {
    name: "Twitter",
    href: "#",
    icon: "fontisto:twitter",
  },
  {
    name: "GitHub",
    href: "#",
    icon: "fontisto:github",
  },
  {
    name: "YouTube",
    href: "#",
    icon: "fontisto:youtube-play",
  },
] as const;

// Мемоизированный компонент навигационной ссылки
const NavLink = React.memo(({ item, t }: { item: any; t: any }) => (
  <Link
    prefetch
    as={NextLink}
    className="text-default-500 hover:text-primary transition-colors"
    href={item.href}
    size="sm"
  >
    {t(item.label)}
  </Link>
));

NavLink.displayName = "NavLink";

// Мемоизированный компонент социальной ссылки
const SocialLink = React.memo(
  ({ item }: { item: { name: string; href: string; icon: string } }) => (
    <Link
      isExternal
      aria-label={item.name}
      className="text-default-400 hover:text-primary transition-colors"
      href={item.href}
    >
      <Icon icon={item.icon} width={20} />
    </Link>
  )
);

SocialLink.displayName = "SocialLink";

export const Footer = React.memo(() => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { role } = useSupabase() as SupabaseContextType;

  // Мемоизируем вычисления
  const hideFooter = useMemo(
    () =>
      pathname.startsWith("/login") ||
      pathname.startsWith("/auth") ||
      pathname.startsWith("/admin"),
    [pathname]
  );

  // Мемоизируем доступные ссылки навигации
  const navLinks = useMemo(() => {
    const items = getAccessibleNavItems(role);

    // Исключаем admin и settings из футера
    return items.filter((item) => !["admin", "settings"].includes(item.key));
  }, [role]);

  // Не показываем футер на определенных страницах
  if (hideFooter) {
    return null;
  }

  return (
    <footer className="border-t border-divider bg-content1/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="flex flex-col items-center space-y-8">
          {/* Logo */}
          <div className="flex items-center justify-center">
            <NextLink
              prefetch
              className="text-lg font-bold text-foreground hover:text-primary transition-colors"
              href="/"
            >
              MEDTRAVEL.ME
            </NextLink>
          </div>

          {/* Navigation links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {navLinks.map((item) => (
              <NavLink key={item.key} item={item} t={t} />
            ))}
          </div>

          {/* Social icons */}
          <div className="flex justify-center gap-6">
            {socialItems.map((item) => (
              <SocialLink key={item.name} item={item} />
            ))}
          </div>

          {/* Copyright */}
          <div className="border-t border-divider pt-8 w-full">
            <p className="text-center text-sm text-default-500">
              {t("footer.copyright")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";
