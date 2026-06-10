/* Веб-шим react-native-safe-area-context: в браузере безопасные зоны нулевые. */
import React from 'react';
import { View } from './react-native';

export type EdgeInsets = { top: number; bottom: number; left: number; right: number };

export function SafeAreaProvider({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

export function useSafeAreaInsets(): EdgeInsets {
  return { top: 0, bottom: 0, left: 0, right: 0 };
}

export const SafeAreaView = View;
