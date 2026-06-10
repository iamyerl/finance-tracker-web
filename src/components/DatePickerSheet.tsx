import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Sheet } from './Sheet';
import { InlineSheet } from './InlineSheet';
import { useThemeColors } from '../store/ThemeContext';
import { MONTHS_RU } from '../theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  value?: Date | null;          // текущее значение
  onSelect: (date: Date) => void;
  title?: string;
  // 'modal' — для топ-левел экранов; 'inline' — для использования внутри другого Sheet
  // через overlay-prop (потому что на iOS Modal-в-Modal не показывается).
  mode?: 'modal' | 'inline';
};

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function sameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildMonthGrid(year: number, month: number): (Date | null)[] {
  const firstOfMonth = new Date(year, month, 1);
  // Понедельник как первый день недели; в JS воскресенье = 0
  const dow = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < dow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function DatePickerSheet({
  visible,
  onClose,
  value,
  onSelect,
  title = 'Выберите дату',
  mode = 'modal',
}: Props) {
  const colors = useThemeColors();
  const today = useMemo(() => new Date(), []);
  const initial = value ?? today;

  const [year, setYear] = useState(initial.getFullYear());
  const [month, setMonth] = useState(initial.getMonth());

  // Перенастройка при каждом открытии — показываем месяц, в котором текущее значение.
  useEffect(() => {
    if (visible) {
      const v = value ?? today;
      setYear(v.getFullYear());
      setMonth(v.getMonth());
    }
  }, [visible, value, today]);

  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const prev = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };
  const next = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

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

      {/* Header: month / year switcher */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <Pressable
          onPress={prev}
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
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
          {MONTHS_RU[month]} {year}
        </Text>
        <Pressable
          onPress={next}
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

      {/* Weekday header */}
      <View style={{ flexDirection: 'row', marginBottom: 6 }}>
        {WEEKDAYS.map((w) => (
          <View key={w} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 11, color: colors.textDim, fontWeight: '600' }}>{w}</Text>
          </View>
        ))}
      </View>

      {/* Day grid */}
      <View>
        {Array.from({ length: grid.length / 7 }).map((_, rowIdx) => (
          <View key={rowIdx} style={{ flexDirection: 'row', marginTop: 4 }}>
            {grid.slice(rowIdx * 7, rowIdx * 7 + 7).map((cell, colIdx) => {
              if (!cell) {
                return <View key={colIdx} style={{ flex: 1, height: 38 }} />;
              }
              const isToday = sameDay(cell, today);
              const isSelected = sameDay(cell, value ?? null);
              const day = cell.getDate();
              return (
                <Pressable
                  key={colIdx}
                  onPress={() => {
                    onSelect(cell);
                    onClose();
                  }}
                  style={{
                    flex: 1,
                    height: 38,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected
                        ? colors.blue
                        : isToday
                        ? colors.surfaceStrong
                        : 'transparent',
                      borderWidth: isToday && !isSelected ? 1 : 0,
                      borderColor: colors.blueLight,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: isSelected ? '700' : '500',
                        color: isSelected ? colors.textOnAccent : colors.text,
                      }}
                    >
                      {day}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      {/* Quick: сегодня */}
      <Pressable
        onPress={() => {
          onSelect(new Date());
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
        <Text style={{ color: colors.blueLight, fontSize: 14, fontWeight: '600' }}>Сегодня</Text>
      </Pressable>
    </View>
  );

  if (mode === 'inline') {
    return (
      <InlineSheet visible={visible} onClose={onClose} height="72%">
        {content}
      </InlineSheet>
    );
  }

  return (
    <Sheet visible={visible} onClose={onClose} height="72%">
      {content}
    </Sheet>
  );
}
