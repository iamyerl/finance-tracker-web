// ─────────────────────────────────────────────
// Контекст профиля и preferences пользователя.
// Хранит профиль, тёмную/светлую тему, тогглы.
// Поддерживает экспорт/импорт всех данных приложения.
// ─────────────────────────────────────────────

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_PROFILE, DEFAULT_PREFERENCES } from './profile/defaults';
import {
  applyPreferencesPatch,
  applyProfilePatch,
  resetPreferences,
  resetProfile,
} from './profile/reducer';
import { exportSnapshot, importSnapshot } from './profile/serializer';
import type { ImportResult } from './profile/serializer';
import type {
  Profile,
  ProfilePreferences,
  Snapshot,
  ThemeMode,
} from './profile/types';
import type { Persisted } from './BudgetContext';

const KEY = 'vault:profile:v1';

type Persisted_Profile = {
  profile: Profile;
  preferences: ProfilePreferences;
};

const INITIAL: Persisted_Profile = {
  profile: DEFAULT_PROFILE,
  preferences: DEFAULT_PREFERENCES,
};

type Ctx = {
  hydrated: boolean;
  profile: Profile;
  preferences: ProfilePreferences;
  setProfile: (patch: Partial<Profile>) => void;
  setPreferences: (patch: Partial<ProfilePreferences>) => void;
  setThemeMode: (mode: ThemeMode) => void;
  resetProfileFully: () => void;
  // Bridges over BudgetContext for export/import:
  buildSnapshot: (budget: Persisted) => string;
  parseSnapshot: (raw: string) => ImportResult;
  applyImported: (snap: Snapshot, applyBudget: (b: Persisted) => void) => void;
};

const Context = createContext<Ctx | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Persisted_Profile>(INITIAL);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<Persisted_Profile>;
          setState({
            profile: { ...DEFAULT_PROFILE, ...(parsed.profile ?? {}) },
            preferences: { ...DEFAULT_PREFERENCES, ...(parsed.preferences ?? {}) },
          });
        }
      } catch {
        // ignore
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state, hydrated]);

  const setProfile = useCallback((patch: Partial<Profile>) => {
    setState((s) => ({ ...s, profile: applyProfilePatch(s.profile, patch) }));
  }, []);

  const setPreferences = useCallback((patch: Partial<ProfilePreferences>) => {
    setState((s) => ({ ...s, preferences: applyPreferencesPatch(s.preferences, patch) }));
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setState((s) => ({
      ...s,
      preferences: applyPreferencesPatch(s.preferences, { themeMode: mode }),
    }));
  }, []);

  const resetProfileFully = useCallback(() => {
    setState({
      profile: resetProfile(),
      preferences: resetPreferences(),
    });
  }, []);

  const buildSnapshot = useCallback(
    (budget: Persisted): string =>
      exportSnapshot({
        profile: state.profile,
        preferences: state.preferences,
        budget,
      }),
    [state.profile, state.preferences]
  );

  const parseSnapshot = useCallback((raw: string): ImportResult => importSnapshot(raw), []);

  const applyImported = useCallback(
    (snap: Snapshot, applyBudget: (b: Persisted) => void) => {
      setState({
        profile: snap.profile,
        preferences: snap.preferences,
      });
      applyBudget(snap.budget);
    },
    []
  );

  const value = useMemo<Ctx>(
    () => ({
      hydrated,
      profile: state.profile,
      preferences: state.preferences,
      setProfile,
      setPreferences,
      setThemeMode,
      resetProfileFully,
      buildSnapshot,
      parseSnapshot,
      applyImported,
    }),
    [
      hydrated,
      state.profile,
      state.preferences,
      setProfile,
      setPreferences,
      setThemeMode,
      resetProfileFully,
      buildSnapshot,
      parseSnapshot,
      applyImported,
    ]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useProfile(): Ctx {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('useProfile must be used inside <ProfileProvider>');
  return ctx;
}
