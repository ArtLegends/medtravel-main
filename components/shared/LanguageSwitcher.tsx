"use client";

import React, { useMemo, useCallback } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
] as const;

export const LanguageSwitcher = React.memo(() => {
  const { i18n } = useTranslation();

  const currentLanguage = useMemo(
    () => languages.find((lang) => lang.code === i18n.language) || languages[0],
    [i18n.language]
  );

  const handleLanguageChange = useCallback(
    (langCode: string) => {
      i18n.changeLanguage(langCode);
    },
    [i18n]
  );

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button
          className="min-w-unit-0 px-2"
          size="sm"
          startContent={
            <Icon
              className="text-default-500"
              icon="solar:translation-linear"
              width={24}
            />
          }
          variant="ghost"
        >
          <span className="hidden sm:inline">{currentLanguage.flag}</span>
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Language selection"
        selectedKeys={[currentLanguage.code]}
        selectionMode="single"
        onSelectionChange={(keys) => {
          const selectedKey = Array.from(keys)[0] as string;

          if (selectedKey) {
            handleLanguageChange(selectedKey);
          }
        }}
      >
        {languages.map((language) => (
          <DropdownItem key={language.code} textValue={language.name}>
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

LanguageSwitcher.displayName = "LanguageSwitcher";
