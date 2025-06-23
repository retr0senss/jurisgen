"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  actualTheme: 'light' | 'dark'; // System tema için gerçek tema
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = 'light' }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Hydration mismatch'i önlemek için
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Load theme from localStorage on mount
    try {
      const savedTheme = localStorage.getItem('jurisgen-theme') as Theme;
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    // Calculate actual theme
    const newActualTheme: 'light' | 'dark' = theme;
    setActualTheme(newActualTheme);

    // Apply theme to document
    const root = document.documentElement;
    const body = document.body;

    // Tüm tema sınıflarını temizle
    root.classList.remove('light', 'dark');
    body.classList.remove('light', 'dark');

    // Yeni temayı ekle
    root.classList.add(newActualTheme);
    body.classList.add(newActualTheme);

    // Data attribute'u da ekle (ek güvenlik için)
    root.setAttribute('data-theme', newActualTheme);
    body.setAttribute('data-theme', newActualTheme);

    // Save to localStorage
    try {
      localStorage.setItem('jurisgen-theme', theme);
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    actualTheme,
  };

  // Hydration mismatch'i önlemek için
  if (!mounted) {
    return <div className="opacity-0">{children}</div>;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
} 