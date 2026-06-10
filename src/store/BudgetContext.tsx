import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_ENVELOPES,
  Envelope,
  monthKey,
  newEnvelopeId,
  shiftMonthKey,
} from '../theme';
import {
  Mortgage,
  Prepayment,
  OneTimePrepayment,
  RecurringPrepayment,
  newPrepaymentId,
} from '../utils/mortgage';

// Union of Omit-id keeps each variant's properties intact
// (Omit on the union loses kind-specific keys like `date` and `frequency`).
type PrepaymentInput =
  | Omit<OneTimePrepayment, 'id'>
  | Omit<RecurringPrepayment, 'id'>;

export type MonthBudget = {
  income: number;
  // План в тенге по каждому конверту (по id). Отсутствие записи = 0.
  plans: Record<string, number>;
};

export type Expense = {
  id: string;
  envelopeId: string;
  amount: number;
  note?: string;
  date: string; // ISO
};

export type Goal = {
  id: string;
  name: string;
  target: number;
  saved: number;
  color: string;
  icon: string; // ionicons name
};

export type Persisted = {
  envelopes: Envelope[];
  goals: Goal[];
  budgets: Record<string /* YYYY-MM */, MonthBudget>;
  expenses: Expense[];
  mortgage: Mortgage | null;
};

type Ctx = {
  hydrated: boolean;
  currentMonth: string;
  selectedMonth: string;
  envelopes: Envelope[];
  goals: Goal[];
  budget: MonthBudget | null;
  budgets: Record<string, MonthBudget>;
  expensesThisMonth: Expense[];
  allExpenses: Expense[];
  spentByEnvelope: Record<string, number>;

  setSelectedMonth: (m: string) => void;
  shiftMonth: (delta: number) => void;
  goToCurrentMonth: () => void;

  setBudget: (b: MonthBudget) => void;

  addEnvelope: (env: Omit<Envelope, 'id'>) => Envelope;
  updateEnvelope: (id: string, patch: Partial<Omit<Envelope, 'id'>>) => void;
  removeEnvelope: (id: string) => void;

  addGoal: (g: Omit<Goal, 'id'>) => Goal;
  updateGoal: (id: string, patch: Partial<Omit<Goal, 'id'>>) => void;
  removeGoal: (id: string) => void;

  mortgage: Mortgage | null;
  setMortgage: (m: Mortgage | null) => void;
  updateMortgage: (patch: Partial<Omit<Mortgage, 'id' | 'prepayments'>>) => void;
  addPrepayment: (pp: PrepaymentInput) => void;
  removePrepayment: (id: string) => void;

  addExpense: (envelopeId: string, amount: number, note?: string) => void;
  removeExpense: (id: string) => void;

  resetAll: () => void;
  exportData: () => Persisted;
  importData: (next: Persisted) => void;
};

const KEY = 'vault:store:v1';
const INITIAL: Persisted = {
  envelopes: DEFAULT_ENVELOPES,
  goals: [],
  budgets: {},
  expenses: [],
  mortgage: null,
};

const Context = createContext<Ctx | null>(null);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Persisted>(INITIAL);
  const [hydrated, setHydrated] = useState(false);

  const currentMonth = monthKey();
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<Persisted>;
          // Миграция: если поле envelopes отсутствует или пустое — засеиваем дефолтами.
          const envelopes =
            Array.isArray(parsed.envelopes) && parsed.envelopes.length > 0
              ? parsed.envelopes
              : DEFAULT_ENVELOPES;
          setState({
            envelopes,
            goals: Array.isArray(parsed.goals) ? parsed.goals : [],
            budgets: parsed.budgets ?? {},
            expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
            mortgage: parsed.mortgage ?? null,
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

  const shiftMonth = useCallback((delta: number) => {
    setSelectedMonth((m) => shiftMonthKey(m, delta));
  }, []);

  const goToCurrentMonth = useCallback(() => {
    setSelectedMonth(currentMonth);
  }, [currentMonth]);

  const setBudget = useCallback(
    (b: MonthBudget) => {
      setState((s) => ({ ...s, budgets: { ...s.budgets, [selectedMonth]: b } }));
    },
    [selectedMonth]
  );

  const addEnvelope = useCallback((env: Omit<Envelope, 'id'>): Envelope => {
    const created: Envelope = { id: newEnvelopeId(), ...env };
    setState((s) => ({ ...s, envelopes: [...s.envelopes, created] }));
    return created;
  }, []);

  const updateEnvelope = useCallback(
    (id: string, patch: Partial<Omit<Envelope, 'id'>>) => {
      setState((s) => ({
        ...s,
        envelopes: s.envelopes.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      }));
    },
    []
  );

  const removeEnvelope = useCallback((id: string) => {
    setState((s) => {
      // Удаляем конверт, его планы во всех месяцах и связанные расходы.
      const budgets: Record<string, MonthBudget> = {};
      for (const [k, v] of Object.entries(s.budgets)) {
        const { [id]: _omit, ...rest } = v.plans;
        budgets[k] = { income: v.income, plans: rest };
      }
      return {
        envelopes: s.envelopes.filter((e) => e.id !== id),
        goals: s.goals,
        budgets,
        expenses: s.expenses.filter((e) => e.envelopeId !== id),
        mortgage: s.mortgage,
      };
    });
  }, []);

  const addGoal = useCallback((g: Omit<Goal, 'id'>): Goal => {
    const created: Goal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ...g,
    };
    setState((s) => ({ ...s, goals: [...s.goals, created] }));
    return created;
  }, []);

  const updateGoal = useCallback(
    (id: string, patch: Partial<Omit<Goal, 'id'>>) => {
      setState((s) => ({
        ...s,
        goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
      }));
    },
    []
  );

  const removeGoal = useCallback((id: string) => {
    setState((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== id) }));
  }, []);

  // ─── Mortgage ─────────────────────────────────
  const setMortgage = useCallback((m: Mortgage | null) => {
    setState((s) => ({ ...s, mortgage: m }));
  }, []);

  const updateMortgage = useCallback(
    (patch: Partial<Omit<Mortgage, 'id' | 'prepayments'>>) => {
      setState((s) => (s.mortgage ? { ...s, mortgage: { ...s.mortgage, ...patch } } : s));
    },
    []
  );

  const addPrepayment = useCallback((pp: PrepaymentInput) => {
    setState((s) => {
      if (!s.mortgage) return s;
      const created = { id: newPrepaymentId(), ...pp } as Prepayment;
      return {
        ...s,
        mortgage: { ...s.mortgage, prepayments: [...s.mortgage.prepayments, created] },
      };
    });
  }, []);

  const removePrepayment = useCallback((id: string) => {
    setState((s) => {
      if (!s.mortgage) return s;
      return {
        ...s,
        mortgage: {
          ...s.mortgage,
          prepayments: s.mortgage.prepayments.filter((p) => p.id !== id),
        },
      };
    });
  }, []);

  const addExpense = useCallback(
    (envelopeId: string, amount: number, note?: string) => {
      const exp: Expense = {
        id: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        envelopeId,
        amount,
        note,
        date: new Date().toISOString(),
      };
      setState((s) => ({ ...s, expenses: [exp, ...s.expenses] }));
    },
    []
  );

  const removeExpense = useCallback((id: string) => {
    setState((s) => ({ ...s, expenses: s.expenses.filter((e) => e.id !== id) }));
  }, []);

  const resetAll = useCallback(() => {
    setState(INITIAL);
    setSelectedMonth(currentMonth);
  }, [currentMonth]);

  const exportData = useCallback((): Persisted => state, [state]);

  const importData = useCallback((next: Persisted) => {
    setState({
      envelopes: Array.isArray(next.envelopes) && next.envelopes.length > 0 ? next.envelopes : DEFAULT_ENVELOPES,
      goals: Array.isArray(next.goals) ? next.goals : [],
      budgets: next.budgets ?? {},
      expenses: Array.isArray(next.expenses) ? next.expenses : [],
      mortgage: next.mortgage ?? null,
    });
  }, []);

  const budget = state.budgets[selectedMonth] ?? null;

  const expensesThisMonth = useMemo(
    () => state.expenses.filter((e) => monthKey(new Date(e.date)) === selectedMonth),
    [state.expenses, selectedMonth]
  );

  const spentByEnvelope = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const e of expensesThisMonth) {
      acc[e.envelopeId] = (acc[e.envelopeId] ?? 0) + e.amount;
    }
    return acc;
  }, [expensesThisMonth]);

  const value: Ctx = {
    hydrated,
    currentMonth,
    selectedMonth,
    envelopes: state.envelopes,
    goals: state.goals,
    budget,
    budgets: state.budgets,
    expensesThisMonth,
    allExpenses: state.expenses,
    spentByEnvelope,
    setSelectedMonth,
    shiftMonth,
    goToCurrentMonth,
    setBudget,
    addEnvelope,
    updateEnvelope,
    removeEnvelope,
    addGoal,
    updateGoal,
    removeGoal,
    mortgage: state.mortgage,
    setMortgage,
    updateMortgage,
    addPrepayment,
    removePrepayment,
    addExpense,
    removeExpense,
    resetAll,
    exportData,
    importData,
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useBudget(): Ctx {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('useBudget must be used inside <BudgetProvider>');
  return ctx;
}
