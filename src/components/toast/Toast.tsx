import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../store/ThemeContext';
import type { Toast, ToastVariant } from './types';

// Срок жизни тоста, после которого он сам уезжает.
export const TOAST_DURATION_MS = 2600;

const VARIANT_ICON: Record<ToastVariant, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  error: 'alert-circle',
  info: 'information-circle',
};

type Props = {
  toast: Toast;
  onDismiss: (id: string) => void;
};

// Единичный тост: slide-in сверху + fade-out, тап = досрочное закрытие.
export function ToastView({ toast, onDismiss }: Props) {
  const colors = useThemeColors();
  const translate = useRef(new Animated.Value(-20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translate, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => onDismiss(toast.id), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [opacity, translate, toast.id, onDismiss]);

  const accent =
    toast.variant === 'success'
      ? colors.greenStrong
      : toast.variant === 'error'
        ? colors.pinkStrong
        : colors.blueLight;

  const tintBg =
    toast.variant === 'success'
      ? colors.greenSoft
      : toast.variant === 'error'
        ? colors.pinkSoft
        : colors.blueSoft;

  return (
    <Animated.View
      style={{
        transform: [{ translateY: translate }],
        opacity,
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 16,
        backgroundColor: colors.surfaceStrong,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
      }}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: tintBg,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 10,
        }}
      >
        <Ionicons name={VARIANT_ICON[toast.variant]} size={18} color={accent} />
      </View>
      <Text
        style={{ flex: 1, color: colors.text, fontSize: 14, fontWeight: '600', letterSpacing: -0.1 }}
        numberOfLines={2}
      >
        {toast.message}
      </Text>
      <Pressable
        onPress={() => onDismiss(toast.id)}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Закрыть уведомление"
        style={{ marginLeft: 8, padding: 4 }}
      >
        <Ionicons name="close" size={16} color={colors.textDim} />
      </Pressable>
    </Animated.View>
  );
}
