// ─────────────────────────────────────────────
// Типы для профиля, preferences и снапшота-бэкапа.
// Чистые типы без зависимостей от RN/AsyncStorage,
// чтобы их можно было тестировать в jest без рендера.
// ─────────────────────────────────────────────

import type { Envelope } from '../../theme';
import type { Mortgage } from '../../utils/mortgage';
import type { Goal, Expense, MonthBudget } from '../BudgetContext';

export type ThemeMode = 'dark' | 'light' | 'system';
export type Tier = 'free' | 'pro';

export type Profile = {
  name: string;
  email: string;
  tier: Tier;
  avatarIcon: string;   // имя из ICON_OPTIONS (Ionicons), e.g. 'person'
  avatarColor: string;  // hex из COLOR_OPTIONS
};

export type ProfilePreferences = {
  themeMode: ThemeMode;
  autoDistributeIncome: boolean;
  overspendAlerts: boolean;
  overspendThresholdPct: number; // 0..100
};

// Тот же набор, что хранится в BudgetContext (`Persisted`).
// Дублируется здесь, чтобы избежать круговой зависимости с BudgetContext в тестах.
export type BudgetSnapshot = {
  envelopes: Envelope[];
  goals: Goal[];
  budgets: Record<string, MonthBudget>;
  expenses: Expense[];
  mortgage: Mortgage | null;
};

// Формат файла бэкапа (экспорт/импорт).
export type Snapshot = {
  version: 1;
  createdAt: string;          // ISO
  profile: Profile;
  preferences: ProfilePreferences;
  budget: BudgetSnapshot;
};
