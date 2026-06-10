import { DEFAULT_PROFILE, DEFAULT_PREFERENCES } from './defaults';
import type { Profile, ProfilePreferences, ThemeMode } from './types';

// Тонкие чистые «редьюсеры» — мерджим patch-и в текущее состояние.
// Используются и в ProfileContext, и в тестах.

export function applyProfilePatch(current: Profile, patch: Partial<Profile>): Profile {
  return {
    ...current,
    ...patch,
    // Защита от undefined → пустой строки или дефолта
    name: typeof patch.name === 'string' ? patch.name : current.name,
    email: typeof patch.email === 'string' ? patch.email : current.email,
    tier: patch.tier ?? current.tier,
    avatarIcon: patch.avatarIcon ?? current.avatarIcon,
    avatarColor: patch.avatarColor ?? current.avatarColor,
  };
}

const VALID_THEME_MODES: readonly ThemeMode[] = ['dark', 'light', 'system'];

export function applyPreferencesPatch(
  current: ProfilePreferences,
  patch: Partial<ProfilePreferences>
): ProfilePreferences {
  const next: ProfilePreferences = {
    ...current,
    ...patch,
  };
  // Валидация themeMode — отбрасываем мусор, оставляем текущее.
  if (!VALID_THEME_MODES.includes(next.themeMode)) {
    next.themeMode = current.themeMode;
  }
  // Клампим порог в 0..100
  if (typeof next.overspendThresholdPct === 'number') {
    next.overspendThresholdPct = Math.max(
      0,
      Math.min(100, Math.round(next.overspendThresholdPct))
    );
  } else {
    next.overspendThresholdPct = current.overspendThresholdPct;
  }
  return next;
}

export function resetProfile(): Profile {
  return { ...DEFAULT_PROFILE };
}

export function resetPreferences(): ProfilePreferences {
  return { ...DEFAULT_PREFERENCES };
}
