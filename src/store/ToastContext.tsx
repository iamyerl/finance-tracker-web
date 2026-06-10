import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import { toastReducer } from '../components/toast/reducer';
import type { Toast, ToastVariant } from '../components/toast/types';

// ─────────────────────────────────────────────
// Контекст для показа тостов из любого экрана/шита.
// Логика очереди вынесена в чистый редьюсер (см. tests).
// ─────────────────────────────────────────────

type ShowToastFn = (message: string, variant?: ToastVariant) => string;

type Ctx = {
  showToast: ShowToastFn;
  dismiss: (id: string) => void;
  clear: () => void;
  toasts: Toast[];
};

const NoopCtx: Ctx = {
  showToast: () => '',
  dismiss: () => {},
  clear: () => {},
  toasts: [],
};

const ReactCtx = createContext<Ctx>(NoopCtx);

let counter = 0;
const genId = () => {
  counter += 1;
  return `toast-${Date.now()}-${counter}`;
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const showToast = useCallback<ShowToastFn>((message, variant = 'success') => {
    const id = genId();
    dispatch({ type: 'add', toast: { id, message, variant } });
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    dispatch({ type: 'remove', id });
  }, []);

  const clear = useCallback(() => {
    dispatch({ type: 'clear' });
  }, []);

  const value = useMemo<Ctx>(
    () => ({ showToast, dismiss, clear, toasts }),
    [showToast, dismiss, clear, toasts]
  );

  return <ReactCtx.Provider value={value}>{children}</ReactCtx.Provider>;
}

export function useToast(): { showToast: ShowToastFn } {
  const { showToast } = useContext(ReactCtx);
  return { showToast };
}

// Внутренний хук для ToastHost: ему нужна вся очередь + dismiss.
export function useToastQueue(): { toasts: Toast[]; dismiss: (id: string) => void } {
  const { toasts, dismiss } = useContext(ReactCtx);
  return { toasts, dismiss };
}
