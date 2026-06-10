import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { ScreenBG } from '../components/ScreenBG';
import { Glass } from '../components/Glass';
import { EnvelopeIcon } from '../components/Icons';
import { MonthPickerSheet } from '../components/MonthPickerSheet';
import { useBudget } from '../store/BudgetContext';
import { useThemeColors } from '../store/ThemeContext';
import {
  MONTHS_RU_SHORT,
  monthKey as makeMonthKey,
  monthLabel,
  shiftMonthKey,
  tg,
  tgK,
} from '../theme';

const R = 15.915; // длина окружности ≈ 100 при r = 15.915 → удобно для процентов

type SegmentRow = {
  id: string;
  label: string;
  color: string;
  icon: string;
  spent: number;
  pct: number;
};

export function AnalyticsScreen() {
  const colors = useThemeColors();
  const {
    hydrated,
    envelopes,
    selectedMonth,
    setSelectedMonth,
    allExpenses,
    budgets,
    expensesThisMonth,
    spentByEnvelope,
    budget,
  } = useBudget();

  const [monthPickerOpen, setMonthPickerOpen] = useState(false);

  if (!hydrated) {
    return <View style={{ flex: 1, backgroundColor: colors.bgBottom }} />;
  }

  // ── текущий месяц ─────────────────────────────
  const totalSpent = expensesThisMonth.reduce((s, e) => s + e.amount, 0);
  const income = budget?.income ?? 0;
  const remaining = income - totalSpent;

  // сегменты для donut: только то, на что были расходы
  const segments: SegmentRow[] = envelopes
    .map((e) => ({
      id: e.id,
      label: e.label,
      color: e.color,
      icon: e.icon,
      spent: spentByEnvelope[e.id] ?? 0,
      pct: 0,
    }))
    .filter((s) => s.spent > 0);
  if (totalSpent > 0) {
    segments.forEach((s) => {
      s.pct = (s.spent / totalSpent) * 100;
    });
  }
  segments.sort((a, b) => b.spent - a.spent);

  // 6-месячный тренд: 6 точек до и включая selectedMonth
  const trend = useMemo(() => {
    const arr: { key: string; label: string; income: number; spent: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const key = shiftMonthKey(selectedMonth, -i);
      const [y, m] = key.split('-').map(Number);
      const b = budgets[key];
      const inc = b?.income ?? 0;
      const exp = allExpenses
        .filter((e) => makeMonthKey(new Date(e.date)) === key)
        .reduce((s, e) => s + e.amount, 0);
      arr.push({ key, label: MONTHS_RU_SHORT[m - 1], income: inc, spent: exp });
    }
    return arr;
  }, [selectedMonth, budgets, allExpenses]);

  const maxTrendValue = Math.max(
    1,
    ...trend.map((t) => Math.max(t.income, t.spent))
  );

  const noData = totalSpent === 0 && income === 0;

  // строим segments прогрессивно для strokeDashoffset
  let acc = 0;
  const renderedSegments = segments.map((s) => {
    const start = acc;
    acc += s.pct;
    return { ...s, start };
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgBottom }}>
      <ScreenBG variant="analytics" />
      <ScrollView contentContainerStyle={{ paddingTop: 60, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 20,
            marginBottom: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View>
            <Text style={{ fontSize: 13, color: colors.textDim, fontWeight: '500' }}>Сводка</Text>
            <Text
              style={{
                fontSize: 28,
                fontWeight: '700',
                color: colors.text,
                letterSpacing: -0.6,
                marginTop: 2,
              }}
            >
              Аналитика
            </Text>
          </View>
        </View>

        {/* Month switcher with calendar */}
        <View
          style={{
            paddingHorizontal: 20,
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <Pressable
            onPress={() => setSelectedMonth(shiftMonthKey(selectedMonth, -1))}
            hitSlop={12}
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
          <Pressable
            onPress={() => setMonthPickerOpen(true)}
            hitSlop={8}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 14,
              backgroundColor: colors.surfaceLite,
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, letterSpacing: -0.2 }}>
              {monthLabel(selectedMonth)}
            </Text>
            <Ionicons name="chevron-down" size={14} color={colors.textDim} />
          </Pressable>
          <Pressable
            onPress={() => setSelectedMonth(shiftMonthKey(selectedMonth, 1))}
            hitSlop={12}
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

        {noData ? (
          <View style={{ paddingHorizontal: 20 }}>
            <Glass padding={20} radius={24}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                Нет данных за {monthLabel(selectedMonth)}
              </Text>
              <Text style={{ fontSize: 13, color: colors.textDim, marginTop: 6, lineHeight: 19 }}>
                Установите доход и добавляйте расходы в Бюджете — здесь появятся графики и сводки.
              </Text>
            </Glass>
          </View>
        ) : (
          <>
            {/* Donut + breakdown */}
            <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
              <Glass padding={22} radius={28}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
                  <View style={{ width: 130, height: 130 }}>
                    <Svg
                      width={130}
                      height={130}
                      viewBox="0 0 42 42"
                      style={{ transform: [{ rotate: '-90deg' }] }}
                    >
                      <Circle
                        cx={21}
                        cy={21}
                        r={R}
                        fill="none"
                        stroke={colors.surfaceHover}
                        strokeWidth={4.5}
                      />
                      {renderedSegments.map((s) => (
                        <Circle
                          key={s.id}
                          cx={21}
                          cy={21}
                          r={R}
                          fill="none"
                          stroke={s.color}
                          strokeWidth={4.5}
                          strokeDasharray={`${s.pct} ${100 - s.pct}`}
                          strokeDashoffset={-s.start}
                        />
                      ))}
                    </Svg>
                    <View
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '500' }}>
                        ПОТРАЧЕНО
                      </Text>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: '700',
                          color: colors.text,
                          letterSpacing: -0.5,
                        }}
                        numberOfLines={1}
                      >
                        {tgK(totalSpent)}
                      </Text>
                      {income > 0 && (
                        <Text style={{ fontSize: 10, color: colors.textFaint }}>из {tgK(income)}</Text>
                      )}
                    </View>
                  </View>

                  <View style={{ flex: 1, gap: 9 }}>
                    {segments.length === 0 ? (
                      <Text style={{ fontSize: 13, color: colors.textDim }}>Нет расходов</Text>
                    ) : (
                      segments.slice(0, 4).map((s) => (
                        <View
                          key={s.id}
                          style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                        >
                          <View
                            style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: s.color }}
                          />
                          <Text
                            style={{ flex: 1, fontSize: 12, color: colors.text }}
                            numberOfLines={1}
                          >
                            {s.label}
                          </Text>
                          <Text
                            style={{ fontSize: 12, fontWeight: '600', color: colors.text }}
                          >
                            {Math.round(s.pct)}%
                          </Text>
                        </View>
                      ))
                    )}
                  </View>
                </View>
              </Glass>
            </View>

            {/* Stat tiles */}
            <View style={{ paddingHorizontal: 20, marginBottom: 14, flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Glass padding={14} radius={20}>
                  <Text
                    style={{
                      fontSize: 11,
                      color: colors.textMuted,
                      textTransform: 'uppercase',
                      letterSpacing: 0.3,
                    }}
                  >
                    Доход
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '700',
                      color: colors.text,
                      marginTop: 4,
                    }}
                    numberOfLines={1}
                  >
                    {tgK(income)}
                  </Text>
                </Glass>
              </View>
              <View style={{ flex: 1 }}>
                <Glass padding={14} radius={20}>
                  <Text
                    style={{
                      fontSize: 11,
                      color: colors.textMuted,
                      textTransform: 'uppercase',
                      letterSpacing: 0.3,
                    }}
                  >
                    Потрачено
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '700',
                      color: colors.text,
                      marginTop: 4,
                    }}
                    numberOfLines={1}
                  >
                    {tgK(totalSpent)}
                  </Text>
                </Glass>
              </View>
              <View style={{ flex: 1 }}>
                <Glass padding={14} radius={20}>
                  <Text
                    style={{
                      fontSize: 11,
                      color: colors.textMuted,
                      textTransform: 'uppercase',
                      letterSpacing: 0.3,
                    }}
                  >
                    Остаток
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '700',
                      color: remaining < 0 ? colors.pink : colors.green,
                      marginTop: 4,
                    }}
                    numberOfLines={1}
                  >
                    {tgK(remaining)}
                  </Text>
                </Glass>
              </View>
            </View>

            {/* Top categories with bars */}
            {segments.length > 0 && (
              <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
                <Glass padding={18} radius={24}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
                    По конвертам
                  </Text>
                  <View style={{ gap: 12 }}>
                    {segments.map((s) => (
                      <View key={s.id}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 10,
                            marginBottom: 6,
                          }}
                        >
                          <View
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 9,
                              backgroundColor: s.color + '26',
                              borderWidth: 0.5,
                              borderColor: s.color + '55',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <EnvelopeIcon icon={s.icon} color={s.color} size={16} />
                          </View>
                          <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: colors.text }} numberOfLines={1}>
                            {s.label}
                          </Text>
                          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                            {tg(s.spent)}
                          </Text>
                        </View>
                        <View
                          style={{
                            height: 5,
                            borderRadius: 3,
                            backgroundColor: colors.surfaceHover,
                            overflow: 'hidden',
                          }}
                        >
                          <View
                            style={{
                              width: `${Math.max(2, s.pct)}%`,
                              height: '100%',
                              backgroundColor: s.color,
                            }}
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                </Glass>
              </View>
            )}

            {/* 6-month trend */}
            <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
              <Glass padding={18} radius={24}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                    6 месяцев
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: colors.blue }} />
                      <Text style={{ fontSize: 11, color: colors.textDim }}>Доход</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: colors.purple }} />
                      <Text style={{ fontSize: 11, color: colors.textDim }}>Расход</Text>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    height: 100,
                    gap: 8,
                  }}
                >
                  {trend.map((t, i) => {
                    const isCurrent = t.key === selectedMonth;
                    const inch = (t.income / maxTrendValue) * 80;
                    const sph = (t.spent / maxTrendValue) * 80;
                    return (
                      <View key={t.key} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                        <View
                          style={{
                            width: '100%',
                            flexDirection: 'row',
                            gap: 3,
                            alignItems: 'flex-end',
                            height: 80,
                          }}
                        >
                          <View
                            style={{
                              flex: 1,
                              height: inch,
                              borderRadius: 3,
                              backgroundColor: colors.blue,
                              opacity: isCurrent ? 1 : 0.7,
                            }}
                          />
                          <View
                            style={{
                              flex: 1,
                              height: sph,
                              borderRadius: 3,
                              backgroundColor: colors.purple,
                              opacity: isCurrent ? 1 : 0.7,
                            }}
                          />
                        </View>
                        <Text
                          style={{
                            fontSize: 10,
                            color: isCurrent ? colors.text : colors.textFaint,
                            fontWeight: isCurrent ? '600' : '400',
                          }}
                        >
                          {t.label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </Glass>
            </View>
          </>
        )}
      </ScrollView>

      <MonthPickerSheet
        visible={monthPickerOpen}
        onClose={() => setMonthPickerOpen(false)}
        value={selectedMonth}
        onSelect={setSelectedMonth}
        title="Выберите месяц"
      />
    </View>
  );
}
