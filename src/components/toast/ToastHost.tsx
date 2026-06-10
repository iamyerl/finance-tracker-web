import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ToastView } from './Toast';
import { useToastQueue } from '../../store/ToastContext';

// Стек тостов поверх UI.
// Pointer-events настроены так, чтобы не блокировать клики мимо тоста.
export function ToastHost() {
  const { toasts, dismiss } = useToastQueue();
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        top: insets.top + 8,
        left: 0,
        right: 0,
      }}
    >
      {toasts.map((toast) => (
        <View key={toast.id} pointerEvents="box-none">
          <ToastView toast={toast} onDismiss={dismiss} />
        </View>
      ))}
    </View>
  );
}
