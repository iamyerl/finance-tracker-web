// ─────────────────────────────────────────────
// Тосты — короткие feedback-сообщения после действий
// (экспорт прошёл, импорт восстановлен, профиль сброшен и т. п.).
// ─────────────────────────────────────────────

export type ToastVariant = 'success' | 'error' | 'info';

export type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
};

export const TOAST_QUEUE_LIMIT = 3 as const;
