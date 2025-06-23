"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/theme-provider";

export function ThemeToggle() {
  const { toggleTheme, actualTheme } = useTheme();

  const getIcon = () => {
    switch (actualTheme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      default:
        return <Sun className="h-4 w-4" />;
    }
  };

  const getTooltip = () => {
    switch (actualTheme) {
      case 'light':
        return 'Açık tema (Koyu temaya geç)';
      case 'dark':
        return 'Koyu tema (Açık temaya geç)';
      default:
        return 'Tema değiştir';
    }
  };

  const handleToggle = () => {
    // Production: Logging disabled
    toggleTheme();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className="h-9 w-9 px-0 hover:bg-accent/50 transition-colors"
      title={getTooltip()}
    >
      {getIcon()}
      <span className="sr-only">Tema değiştir</span>
    </Button>
  );
} 