'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type ThemeName = 'midnight' | 'light' | 'ocean';

interface ThemeColors {
  bg: string;           // main background
  card: string;         // card background
  cardHover: string;    // card hover border
  sidebar: string;      // sidebar background
  header: string;       // header background
  input: string;        // input background
  inputBorder: string;  // input border
  border: string;       // general border
  text: string;         // primary text
  textMuted: string;    // muted text
  textSubtle: string;   // very subtle text
  accent: string;       // primary accent
  accentHover: string;  // accent hover
  accentBg: string;     // accent light bg
  accentBorder: string; // accent border
  accentText: string;   // accent text color
}

interface ThemeConfig {
  name: ThemeName;
  label: string;
  icon: string;
  colors: ThemeColors;
}

const themes: Record<ThemeName, ThemeConfig> = {
  midnight: {
    name: 'midnight',
    label: 'Midnight',
    icon: '🌙',
    colors: {
      bg: '#0a0a0f',
      card: '#16161f',
      cardHover: '#27272a',
      sidebar: '#111118',
      header: '#0a0a0f',
      input: '#0a0a0f',
      inputBorder: '#3f3f46',
      border: '#27272a',
      text: '#e4e4e7',
      textMuted: '#a1a1aa',
      textSubtle: '#71717a',
      accent: '#6366f1',
      accentHover: '#4f46e5',
      accentBg: 'rgba(99,102,241,0.15)',
      accentBorder: 'rgba(99,102,241,0.30)',
      accentText: '#818cf8',
    },
  },
  light: {
    name: 'light',
    label: 'Light',
    icon: '☀️',
    colors: {
      bg: '#f8f9fa',
      card: '#ffffff',
      cardHover: '#d4d4d8',
      sidebar: '#f1f3f5',
      header: '#f8f9fa',
      input: '#ffffff',
      inputBorder: '#d4d4d8',
      border: '#e5e7eb',
      text: '#18181b',
      textMuted: '#52525b',
      textSubtle: '#a1a1aa',
      accent: '#6366f1',
      accentHover: '#4f46e5',
      accentBg: 'rgba(99,102,241,0.10)',
      accentBorder: 'rgba(99,102,241,0.25)',
      accentText: '#4f46e5',
    },
  },
  ocean: {
    name: 'ocean',
    label: 'Ocean',
    icon: '🌊',
    colors: {
      bg: '#0b1120',
      card: '#111b2e',
      cardHover: '#1e3a5f',
      sidebar: '#0d1526',
      header: '#0b1120',
      input: '#0d1526',
      inputBorder: '#1e3a5f',
      border: '#1a2744',
      text: '#e2e8f0',
      textMuted: '#94a3b8',
      textSubtle: '#64748b',
      accent: '#06b6d4',
      accentHover: '#0891b2',
      accentBg: 'rgba(6,182,212,0.12)',
      accentBorder: 'rgba(6,182,212,0.25)',
      accentText: '#22d3ee',
    },
  },
};

interface ThemeContextType {
  theme: ThemeName;
  themeConfig: ThemeConfig;
  setTheme: (theme: ThemeName) => void;
  allThemes: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('civitra_theme') as ThemeName | null;
      if (saved && themes[saved]) return saved;
    }
    return 'midnight';
  });

  useEffect(() => {
    const root = document.documentElement;
    const colors = themes[theme].colors;
    root.style.setProperty('--c-bg', colors.bg);
    root.style.setProperty('--c-card', colors.card);
    root.style.setProperty('--c-card-hover', colors.cardHover);
    root.style.setProperty('--c-sidebar', colors.sidebar);
    root.style.setProperty('--c-header', colors.header);
    root.style.setProperty('--c-input', colors.input);
    root.style.setProperty('--c-input-border', colors.inputBorder);
    root.style.setProperty('--c-border', colors.border);
    root.style.setProperty('--c-text', colors.text);
    root.style.setProperty('--c-text-muted', colors.textMuted);
    root.style.setProperty('--c-text-subtle', colors.textSubtle);
    root.style.setProperty('--c-accent', colors.accent);
    root.style.setProperty('--c-accent-hover', colors.accentHover);
    root.style.setProperty('--c-accent-bg', colors.accentBg);
    root.style.setProperty('--c-accent-border', colors.accentBorder);
    root.style.setProperty('--c-accent-text', colors.accentText);
  }, [theme]);

  const setTheme = useCallback((t: ThemeName) => {
    setThemeState(t);
    localStorage.setItem('civitra_theme', t);
  }, []);

  const themeConfig = themes[theme];
  const allThemes = Object.values(themes);

  return (
    <ThemeContext.Provider value={{ theme, themeConfig, setTheme, allThemes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
