"use client";

import React, { useCallback } from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";

export const ThemeSwitch = React.memo(() => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  return (
    <Button
      isIconOnly
      aria-label="Toggle theme"
      className="min-w-unit-0"
      size="sm"
      variant="ghost"
      onPress={toggleTheme}
    >
      {theme === "light" ?
        <Icon
          className="text-default-500"
          icon="solar:moon-linear"
          width={24}
        />
      : <Icon className="text-default-500" icon="solar:sun-linear" width={24} />
      }
    </Button>
  );
});

ThemeSwitch.displayName = "ThemeSwitch";
