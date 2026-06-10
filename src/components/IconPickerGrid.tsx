// ─────────────────────────────────────────────
// Универсальная сетка для выбора иконки (Ionicons).
// Используется в EditProfileSheet и (потенциально)
// в EditEnvelopeSheet/EditGoalSheet.
// ─────────────────────────────────────────────

import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../store/ThemeContext';

type Props = {
  icons: readonly string[];
  selectedIcon: string;
  bgColor: string;
  onChange: (icon: string) => void;
  size?: number;
};

export function IconPickerGrid({
  icons,
  selectedIcon,
  bgColor,
  onChange,
  size = 44,
}: Props) {
  const colors = useThemeColors();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingVertical: 4 }}
      style={{ marginHorizontal: -16 }}
    >
      {icons.map((name) => {
        const active = name === selectedIcon;
        return (
          <Pressable
            key={name}
            onPress={() => onChange(name)}
            accessibilityRole="button"
            accessibilityLabel={`Выбрать иконку ${name}`}
            accessibilityState={{ selected: active }}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: active ? bgColor : colors.surfaceLite,
              borderWidth: active ? 0 : 0.5,
              borderColor: colors.glassBorder,
            }}
          >
            <Ionicons
              name={name as React.ComponentProps<typeof Ionicons>['name']}
              size={20}
              color={active ? '#fff' : colors.textDim}
            />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function ColorPickerRow({
  colors: palette,
  selected,
  onChange,
  size = 32,
}: {
  colors: readonly string[];
  selected: string;
  onChange: (next: string) => void;
  size?: number;
}) {
  const themed = useThemeColors();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingVertical: 4 }}
      style={{ marginHorizontal: -16 }}
    >
      {palette.map((c) => {
        const active = c === selected;
        return (
          <Pressable
            key={c}
            onPress={() => onChange(c)}
            accessibilityRole="button"
            accessibilityLabel={`Выбрать цвет ${c}`}
            accessibilityState={{ selected: active }}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: c,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: active ? 2 : 0,
              borderColor: themed.text,
            }}
          >
            {active && (
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#fff',
                }}
              />
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
