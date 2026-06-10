import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Sheet } from './Sheet';
import { InlineSheet } from './InlineSheet';
import { useThemeColors } from '../store/ThemeContext';
import { MONTHS_RU_SHORT } from '../theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  value: string; // "YYYY-MM"
  onSelect: (value: string) => void;
  title?: string;
  mode?: 'modal' | 'inline';
};

function parseKey(key: string): { y: number; m: number } {
  const [y, m] = key.split('-').map(Number);
  return { y, m: m - 1 };
}
function toKey(y: number, m: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}`;
}

export function MonthPickerSheet({
  visible,
  onClose,
  value,
  onSelect,
  title = 'Выберите месяц',
  mode = 'modal',
}: Props) {
  const colors = useThemeColors();
  const selected = parseKey(value);
  const todayKey = (() => {
    const d = new Date();
    return toKey(d.getFullYear(), d.getMonth());
  })();

  const [year, setYear] = useState(selected.y);

  useEffect(() => {
    if (visible) setYear(parseKey(value).y);
  }, [visible, value]);

  const content = (
    <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
      <Text
        style={{
          fontSize: 22,
          fontWeight: '700',
          color: colors.text,
          letterSpacing: -0.4,
          marginBottom: 14,
        }}
      >
        {title}
      </Text>

      {/* Year switcher */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <Pressable
          onPress={() => setYear((y) => y - 1)}
          hitSlop={10}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.surfaceLite,
          }}
        >
          <Ionicons name="chevron-back" size={18} color={colors.text} />
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>{year}</Text>
        <Pressable
          onPress={() => setYear((y) => y + 1)}
          hitSlop={10}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.surfaceLite,
          }}
        >
          <Ionicons name="chevron-forward" size={18} color={colors.text} />
        </Pressable>
      </View>

      {/* 3×4 month grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {MONTHS_RU_SHORT.map((label, idx) => {
          const key = toKey(year, idx);
          const isSelected = key === value;
          const isToday = key === todayKey;
          return (
            <Pressable
              key={key}
              onPress={() => {
                onSelect(key);
                onClose();
              }}
              style={{
                width: '23.5%',
                paddingVertical: 16,
                borderRadius: 14,
                alignItems: 'center',
                backgroundColor: isSelected ? colors.blue : colors.surfaceLite,
                borderWidth: isToday && !isSelected ? 1 : 0.5,
                borderColor: isToday && !isSelected ? colors.blueLight : colors.divider,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: isSelected ? '700' : '600',
                  color: isSelected ? colors.textOnAccent : colors.text,
                }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Quick: к текущему месяцу */}
      <Pressable
        onPress={() => {
          onSelect(todayKey);
          onClose();
        }}
        style={{
          marginTop: 18,
          paddingVertical: 14,
          borderRadius: 14,
          borderWidth: 0.5,
          borderColor: colors.divider,
          backgroundColor: colors.surfaceLite,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: colors.blueLight, fontSize: 14, fontWeight: '600' }}>
          К текущему месяцу
        </Text>
      </Pressable>
    </View>
  );

  if (mode === 'inline') {
    return (
      <InlineSheet visible={visible} onClose={onClose} height="62%">
        {content}
      </InlineSheet>
    );
  }
  return (
    <Sheet visible={visible} onClose={onClose} height="62%">
      {content}
    </Sheet>
  );
}
