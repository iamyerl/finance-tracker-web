import type { BudgetSnapshot, Profile, ProfilePreferences, Snapshot } from './types';
import { DEFAULT_PROFILE, DEFAULT_PREFERENCES } from './defaults';

export const SNAPSHOT_VERSION = 1 as const;

// ─────────────────────────────────────────────
// Экспорт: собираем JSON-строку c version/createdAt/payload.
// ─────────────────────────────────────────────
export function exportSnapshot(args: {
  profile: Profile;
  preferences: ProfilePreferences;
  budget: BudgetSnapshot;
  now?: () => Date;
}): string {
  const now = (args.now ?? (() => new Date()))();
  const snap: Snapshot = {
    version: SNAPSHOT_VERSION,
    createdAt: now.toISOString(),
    profile: args.profile,
    preferences: args.preferences,
    budget: args.budget,
  };
  // Pretty-print: удобнее открыть в текстовом редакторе при ручном разборе.
  return JSON.stringify(snap, null, 2);
}

// ─────────────────────────────────────────────
// Импорт: строгая валидация, любой неожиданный shape → { ok: false }.
// ─────────────────────────────────────────────
export type ImportResult =
  | { ok: true; snapshot: Snapshot }
  | { ok: false; reason: string };

export function importSnapshot(raw: string): ImportResult {
  if (typeof raw !== 'string' || raw.trim() === '') {
    return { ok: false, reason: 'Пустой ввод' };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, reason: 'Не удалось разобрать JSON' };
  }
  if (!isObject(parsed)) {
    return { ok: false, reason: 'Ожидался объект на верхнем уровне' };
  }
  const version = (parsed as { version?: unknown }).version;
  if (version !== SNAPSHOT_VERSION) {
    return { ok: false, reason: `Неподдерживаемая версия: ${String(version)}` };
  }
  const createdAt = (parsed as { createdAt?: unknown }).createdAt;
  if (typeof createdAt !== 'string') {
    return { ok: false, reason: 'Поле createdAt должно быть строкой' };
  }

  const profile = mergeProfile((parsed as { profile?: unknown }).profile);
  const preferences = mergePreferences((parsed as { preferences?: unknown }).preferences);
  const budget = parseBudget((parsed as { budget?: unknown }).budget);
  if (!budget) {
    return { ok: false, reason: 'Поле budget некорректное' };
  }

  return {
    ok: true,
    snapshot: {
      version: SNAPSHOT_VERSION,
      createdAt,
      profile,
      preferences,
      budget,
    },
  };
}

// ─────────────────────────────────────────────
// helpers
// ─────────────────────────────────────────────
function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function mergeProfile(x: unknown): Profile {
  if (!isObject(x)) return { ...DEFAULT_PROFILE };
  return {
    name: typeof x.name === 'string' ? x.name : DEFAULT_PROFILE.name,
    email: typeof x.email === 'string' ? x.email : DEFAULT_PROFILE.email,
    tier: x.tier === 'pro' ? 'pro' : 'free',
    avatarIcon: typeof x.avatarIcon === 'string' ? x.avatarIcon : DEFAULT_PROFILE.avatarIcon,
    avatarColor: typeof x.avatarColor === 'string' ? x.avatarColor : DEFAULT_PROFILE.avatarColor,
  };
}

function mergePreferences(x: unknown): ProfilePreferences {
  if (!isObject(x)) return { ...DEFAULT_PREFERENCES };
  const tm = x.themeMode;
  return {
    themeMode: tm === 'light' || tm === 'system' || tm === 'dark' ? tm : DEFAULT_PREFERENCES.themeMode,
    autoDistributeIncome:
      typeof x.autoDistributeIncome === 'boolean'
        ? x.autoDistributeIncome
        : DEFAULT_PREFERENCES.autoDistributeIncome,
    overspendAlerts:
      typeof x.overspendAlerts === 'boolean' ? x.overspendAlerts : DEFAULT_PREFERENCES.overspendAlerts,
    overspendThresholdPct:
      typeof x.overspendThresholdPct === 'number'
        ? Math.max(0, Math.min(100, Math.round(x.overspendThresholdPct)))
        : DEFAULT_PREFERENCES.overspendThresholdPct,
  };
}

function parseBudget(x: unknown): BudgetSnapshot | null {
  if (!isObject(x)) return null;
  const envelopes = Array.isArray(x.envelopes) ? (x.envelopes as BudgetSnapshot['envelopes']) : [];
  const goals = Array.isArray(x.goals) ? (x.goals as BudgetSnapshot['goals']) : [];
  const expenses = Array.isArray(x.expenses) ? (x.expenses as BudgetSnapshot['expenses']) : [];
  const budgets = isObject(x.budgets)
    ? (x.budgets as BudgetSnapshot['budgets'])
    : ({} as BudgetSnapshot['budgets']);
  const mortgage = isObject(x.mortgage)
    ? (x.mortgage as BudgetSnapshot['mortgage'])
    : null;
  return { envelopes, goals, budgets, expenses, mortgage };
}
