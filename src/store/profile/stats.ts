import { monthKey, shiftMonthKey } from '../../theme';
import type { BudgetSnapshot } from './types';

export type ProfileStats = {
  monthsActive: number;       // от первой записи до текущего месяца включительно
  totalSavedTg: number;       // сумма goals[].saved
  totalTxCount: number;       // expenses.length
  recurringTxCount: number;   // mortgage.prepayments(kind=recurring).length
  envelopesCount: number;
};

export function deriveProfileStats(
  snap: BudgetSnapshot,
  now: Date = new Date()
): ProfileStats {
  const totalSavedTg = snap.goals.reduce((s, g) => s + (g.saved || 0), 0);
  const totalTxCount = snap.expenses.length;
  const envelopesCount = snap.envelopes.length;

  const recurringTxCount =
    snap.mortgage?.prepayments?.filter((p) => p.kind === 'recurring').length ?? 0;

  const currentKey = monthKey(now);
  const monthsActive = computeMonthsActive(snap, currentKey);

  return {
    monthsActive,
    totalSavedTg,
    totalTxCount,
    recurringTxCount,
    envelopesCount,
  };
}

function computeMonthsActive(snap: BudgetSnapshot, currentKey: string): number {
  // Самый ранний "след" пользователя — самая старая запись бюджета или расхода.
  const keys = Object.keys(snap.budgets);
  let earliestKey: string | null = keys.length > 0 ? keys.slice().sort()[0] : null;

  if (snap.expenses.length > 0) {
    const expenseEarliest = snap.expenses
      .map((e) => monthKey(new Date(e.date)))
      .sort()[0];
    if (!earliestKey || expenseEarliest < earliestKey) earliestKey = expenseEarliest;
  }

  if (!earliestKey) return 0;

  // Проходим вперёд от earliestKey до currentKey, считая месяцы (включительно).
  let months = 1;
  let cursor = earliestKey;
  while (cursor < currentKey) {
    cursor = shiftMonthKey(cursor, 1);
    months += 1;
    if (months > 1200) break; // safety: 100 лет
  }
  return months;
}
