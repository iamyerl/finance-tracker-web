import type { Toast } from './types';
import { TOAST_QUEUE_LIMIT } from './types';

// ─────────────────────────────────────────────
// Чистая логика очереди тостов: add / remove / clear.
// Очередь ограничена сверху, чтобы при спаме не «забивать» экран.
// ─────────────────────────────────────────────

export type ToastAction =
  | { type: 'add'; toast: Toast }
  | { type: 'remove'; id: string }
  | { type: 'clear' };

export function toastReducer(state: Toast[], action: ToastAction): Toast[] {
  switch (action.type) {
    case 'add': {
      // Дедупликация по id (на случай гонок).
      const filtered = state.filter((t) => t.id !== action.toast.id);
      const next = [...filtered, action.toast];
      // Если переполнили лимит — выкидываем самый старый.
      if (next.length > TOAST_QUEUE_LIMIT) return next.slice(next.length - TOAST_QUEUE_LIMIT);
      return next;
    }
    case 'remove':
      return state.filter((t) => t.id !== action.id);
    case 'clear':
      return [];
  }
}
