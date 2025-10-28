"use client";

import React from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";

export const ThemeSwitch = React.memo(() => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const current = (theme === "system" ? resolvedTheme : theme) || "light";
  const isLight = current === "light";

  return (
    <Button
      isIconOnly
      aria-label="Toggle theme"
      className="min-w-unit-0"
      size="sm"
      variant="ghost"
      onPress={() => setTheme(isLight ? "dark" : "light")}
    >
      {mounted ? (
        isLight ? (
          <Icon className="text-default-500" icon="solar:moon-linear" width={24} />
        ) : (
          <Icon className="text-default-500" icon="solar:sun-linear" width={24} />
        )
      ) : null}
    </Button>
  );
});
ThemeSwitch.displayName = "ThemeSwitch";
