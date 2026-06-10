// ─────────────────────────────────────────────
// Анимированный тоггл — используется в preferences профиля.
// Простая обёртка: цвет + перемещение шарика.
// ─────────────────────────────────────────────

import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { useThemeColors } from '../store/ThemeContext';

type Props = {
  value: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
};

export function Switch({ value, onChange, disabled }: Props) {
  const colors = useThemeColors();
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [value, anim]);

  const trackBg = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surfaceHover, colors.blue],
  });
  const knobX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: !!disabled }}
      hitSlop={8}
      onPress={() => !disabled && onChange(!value)}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <Animated.View
        style={{
          width: 44,
          height: 26,
          borderRadius: 13,
          padding: 2,
          backgroundColor: trackBg,
          justifyContent: 'center',
        }}
      >
        <Animated.View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: '#fff',
            position: 'absolute',
            top: 2,
            left: knobX,
            shadowColor: '#000',
            shadowOpacity: 0.18,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 1 },
            elevation: 2,
          }}
        />
      </Animated.View>
    </Pressable>
  );
}

// Сегментированный контроль для multi-state preference (например, theme mode).
export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (next: T) => void;
  options: { id: T; label: string; icon?: React.ReactNode }[];
}) {
  const colors = useThemeColors();
  return (
    <View
      style={{
        flexDirection: 'row',
        padding: 3,
        borderRadius: 12,
        backgroundColor: colors.surfaceLite,
        borderWidth: 0.5,
        borderColor: colors.glassBorder,
      }}
    >
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <Pressable
            key={opt.id}
            onPress={() => onChange(opt.id)}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 8,
              paddingHorizontal: 8,
              borderRadius: 9,
              backgroundColor: active ? colors.surfaceStrong : 'transparent',
              gap: 6,
            }}
          >
            {opt.icon}
            <Animated.Text
              style={{
                fontSize: 13,
                fontWeight: '600' as const,
                color: active ? colors.text : colors.textDim,
              }}
            >
              {opt.label}
            </Animated.Text>
          </Pressable>
        );
      })}
    </View>
  );
}
