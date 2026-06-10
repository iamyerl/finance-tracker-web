import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { DARK_COLORS, LIGHT_COLORS, ThemeColors } from '../theme';
import type { ThemeMode } from './profile/types';

type Resolved = 'dark' | 'light';

type Ctx = {
  mode: ThemeMode;             // выбранная пользователем настройка
  resolved: Resolved;          // фактически применённая (system → dark/light)
  colors: ThemeColors;
};

// Дефолт — тёмная тема, чтобы хук работал даже без провайдера (например в jest).
const FallbackCtx: Ctx = { mode: 'dark', resolved: 'dark', colors: DARK_COLORS };

const ThemeReactCtx = createContext<Ctx>(FallbackCtx);

export function ThemeProvider({
  mode,
  children,
}: {
  mode: ThemeMode;
  children: React.ReactNode;
}) {
  const system = useColorScheme();
  const value = useMemo<Ctx>(() => {
    const resolved: Resolved = mode === 'system' ? (system === 'light' ? 'light' : 'dark') : mode;
    return {
      mode,
      resolved,
      colors: resolved === 'light' ? LIGHT_COLORS : DARK_COLORS,
    };
  }, [mode, system]);

  return <ThemeReactCtx.Provider value={value}>{children}</ThemeReactCtx.Provider>;
}

export function useTheme(): Ctx {
  return useContext(ThemeReactCtx);
}

export function useThemeColors(): ThemeColors {
  return useContext(ThemeReactCtx).colors;
}

export function useResolvedTheme(): Resolved {
  return useContext(ThemeReactCtx).resolved;
}
