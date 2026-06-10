import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScreenBG } from '../components/ScreenBG';
import { Glass } from '../components/Glass';
import { VaultMark } from '../components/VaultMark';
import { EnvelopeIcon, PlusIcon, ArrowRight } from '../components/Icons';
import { SetupBudgetSheet } from '../components/SetupBudgetSheet';
import { AddExpenseSheet } from '../components/AddExpenseSheet';
import { MonthPickerSheet } from '../components/MonthPickerSheet';
import { EnvelopeDetailsSheet } from '../components/EnvelopeDetailsSheet';
import { monthLabel, tg } from '../theme';
import type { ThemeColors } from '../theme';
import { useBudget } from '../store/BudgetContext';
import { useThemeColors } from '../store/ThemeContext';

export function BudgetScreen() {
  const colors = useThemeColors();
  const iconBtn = mkIconBtn(colors);
  const navigation = useNavigation();
  const {
    hydrated,
    envelopes,
    budget,
    selectedMonth,
    shiftMonth,
    setSelectedMonth,
    spentByEnvelope,
    expensesThisMonth,
  } = useBudget();
  const [setupOpen, setSetupOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addInitialEnvelopeId, setAddInitialEnvelopeId] = useState<string | null>(null);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [detailsEnvelopeId, setDetailsEnvelopeId] = useState<string | null>(null);

  // Открыть AddExpenseSheet с пред-выбранным конвертом из попапа деталей.
  // На iOS Modal-в-Modal не показывается, поэтому сначала закрываем детали,
  // потом с небольшой задержкой открываем расходы — даём шиту анимироваться.
  const openAddFromDetails = (envId: string) => {
    setDetailsEnvelopeId(null);
    setAddInitialEnvelopeId(envId);
    setTimeout(() => setAddOpen(true), 280);
  };

  const openAddFresh = () => {
    setAddInitialEnvelopeId(null);
    setAddOpen(true);
  };

  if (!hydrated) {
    return <View style={{ flex: 1, backgroundColor: colors.bgBottom }} />;
  }

  const hasBudget = !!budget && budget.income > 0;

  // Конверты для отображения: с планом или с расходом в этом месяце
  const visibleEnvelopes = envelopes
    .map((e) => ({
      ...e,
      planned: budget?.plans?.[e.id] ?? 0,
      spent: spentByEnvelope[e.id] ?? 0,
    }))
    .filter((e) => e.planned > 0 || e.spent > 0);

  const totalPlanned = visibleEnvelopes.reduce((s, e) => s + e.planned, 0);
  const income = budget?.income ?? 0;
  const free = income - totalPlanned;
  const totalSpent = expensesThisMonth.reduce((s, e) => s + e.amount, 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgBottom }}>
      <ScreenBG variant="home" />
      <ScrollView contentContainerStyle={{ paddingTop: 60, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 13, color: colors.textDim, fontWeight: '500' }}>Доброе утро</Text>
            <View style={{ marginTop: 2 }}>
              <VaultMark size={20} />
            </View>
          </View>
          {/* Шестерёнка → открывает экран Настроек (Profile). */}
          <Pressable
            onPress={() => navigation.navigate('Profile' as never)}
            accessibilityRole="button"
            accessibilityLabel="Открыть настройки"
            hitSlop={8}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.surfaceStrong,
              borderWidth: 0.5,
              borderColor: colors.divider,
            }}
          >
            <Ionicons name="settings-outline" size={20} color={colors.text} />
          </Pressable>
        </View>

        {/* Month switcher — то же, что в Аналитике */}
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
            onPress={() => shiftMonth(-1)}
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
            onPress={() => shiftMonth(1)}
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

        {!hasBudget ? (
          <View style={{ paddingHorizontal: 20, marginBottom: 18 }}>
            <Glass padding={24} radius={32}>
              <Text style={{ fontSize: 12, color: colors.textDim, fontWeight: '500', letterSpacing: 0.4, textTransform: 'uppercase' }}>
                Бюджет на этот месяц ещё не задан
              </Text>
              <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text, letterSpacing: -0.4, marginTop: 6, lineHeight: 28 }}>
                Установите доход и распределите его по конвертам
              </Text>
              <Text style={{ fontSize: 14, color: colors.textDim, marginTop: 8, lineHeight: 20 }}>
                Например, доход 650 000 ₸ → продукты 70 000 ₸, ипотека 200 000 ₸ и т.д.
              </Text>
              <Pressable onPress={() => setSetupOpen(true)} style={{ marginTop: 18 }}>
                <LinearGradient
                  colors={['#4D8BFF', '#2E5FE0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={{
                    height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
                    shadowColor: '#3C6EFF', shadowOpacity: 0.45, shadowRadius: 18, shadowOffset: { width: 0, height: 6 }, elevation: 6,
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600', letterSpacing: -0.2 }}>
                    Установить бюджет
                  </Text>
                </LinearGradient>
              </Pressable>
            </Glass>
          </View>
        ) : (
          <>
            {/* Hero */}
            <View style={{ paddingHorizontal: 20, marginBottom: 18 }}>
              <Glass padding={24} radius={32}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, color: colors.textDim, fontWeight: '500', letterSpacing: 0.4, textTransform: 'uppercase' }}>
                      Доход за месяц
                    </Text>
                    <Text style={{ fontSize: 44, fontWeight: '700', letterSpacing: -1.6, color: colors.text, marginTop: 4 }}>
                      {tg(income)}
                    </Text>
                  </View>
                  <Pressable onPress={() => setSetupOpen(true)} hitSlop={10} style={{ paddingTop: 6 }}>
                    <Text style={{ color: colors.blueLight, fontSize: 13, fontWeight: '600' }}>Изменить</Text>
                  </Pressable>
                </View>

                {visibleEnvelopes.length > 0 && (
                  <View
                    style={{
                      marginTop: 18,
                      height: 10,
                      borderRadius: 6,
                      backgroundColor: colors.surfaceHover,
                      overflow: 'hidden',
                      flexDirection: 'row',
                    }}
                  >
                    {visibleEnvelopes
                      .filter((e) => e.planned > 0)
                      .map((e, i, arr) => (
                        <View
                          key={e.id}
                          style={{
                            flex: e.planned,
                            backgroundColor: e.color,
                            borderRightWidth: i < arr.length - 1 ? 1 : 0,
                            borderRightColor: 'rgba(0,0,0,0.25)',
                          }}
                        />
                      ))}
                    {free > 0 && <View style={{ flex: free }} />}
                  </View>
                )}

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
                  <View>
                    <Text style={{ fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                      Распределено
                    </Text>
                    <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text, marginTop: 2 }}>{tg(totalPlanned)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                      Свободно
                    </Text>
                    <Text style={{ fontSize: 17, fontWeight: '600', marginTop: 2, color: free >= 0 ? colors.green : colors.pink }}>
                      {tg(free)}
                    </Text>
                  </View>
                </View>

                {totalSpent > 0 && (
                  <Text style={{ marginTop: 12, fontSize: 12, color: colors.textDim }}>
                    Потрачено в этом месяце: {tg(totalSpent)}
                  </Text>
                )}
              </Glass>
            </View>

            {/* Quick actions */}
            <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 22 }}>
              <Pressable style={{ flex: 1 }} onPress={openAddFresh}>
                <LinearGradient
                  colors={['#4D8BFF', '#2E5FE0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={{
                    height: 46,
                    borderRadius: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    shadowColor: '#3C6EFF',
                    shadowOpacity: 0.4,
                    shadowRadius: 18,
                    shadowOffset: { width: 0, height: 6 },
                    elevation: 6,
                  }}
                >
                  <PlusIcon size={14} color="#fff" strokeWidth={3} />
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', letterSpacing: -0.2 }}>Добавить расход</Text>
                </LinearGradient>
              </Pressable>
              <Pressable style={iconBtn} onPress={() => setSetupOpen(true)}>
                <ArrowRight color="rgba(255,255,255,0.7)" size={16} />
              </Pressable>
            </View>

            {/* Envelopes */}
            <View
              style={{
                paddingHorizontal: 20,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, letterSpacing: -0.3 }}>Конверты</Text>
              <Pressable onPress={() => setSetupOpen(true)}>
                <Text style={{ fontSize: 13, color: colors.blueLight, fontWeight: '500' }}>Изменить</Text>
              </Pressable>
            </View>

            <View style={{ paddingHorizontal: 20, gap: 10 }}>
              {visibleEnvelopes.length === 0 ? (
                <Glass padding={18} radius={20}>
                  <Text style={{ color: colors.textDim, fontSize: 14, lineHeight: 20 }}>
                    Вы ещё не распределили доход. Нажмите «Изменить», чтобы задать суммы по конвертам.
                  </Text>
                </Glass>
              ) : (
                visibleEnvelopes.map((e) => {
                  const remaining = e.planned - e.spent;
                  const pct = e.planned > 0 ? Math.min(100, Math.round((e.spent / e.planned) * 100)) : 100;
                  const over = e.spent > e.planned;
                  return (
                    <Pressable
                      key={e.id}
                      onPress={() => setDetailsEnvelopeId(e.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Открыть конверт ${e.label}`}
                    >
                    <Glass padding={14} radius={20}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 11,
                            backgroundColor: e.color + '26',
                            borderWidth: 0.5,
                            borderColor: e.color + '55',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <EnvelopeIcon icon={e.icon} color={e.color} size={20} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>{e.label}</Text>
                              <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>
                                {tg(e.spent)} из {tg(e.planned)}
                              </Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                              <Text style={{ fontSize: 11, color: colors.textMuted }}>
                                {over ? 'Перерасход' : 'Осталось'}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 14,
                                  fontWeight: '700',
                                  marginTop: 1,
                                  color: over ? colors.pink : colors.green,
                                }}
                              >
                                {tg(over ? -remaining : remaining)}
                              </Text>
                            </View>
                          </View>
                          <View
                            style={{
                              marginTop: 8,
                              height: 5,
                              borderRadius: 3,
                              backgroundColor: colors.surfaceHover,
                              overflow: 'hidden',
                            }}
                          >
                            <View
                              style={{
                                width: `${pct}%`,
                                height: '100%',
                                backgroundColor: over ? colors.pink : e.color,
                                shadowColor: over ? colors.pink : e.color,
                                shadowOpacity: 0.7,
                                shadowRadius: 6,
                                shadowOffset: { width: 0, height: 0 },
                              }}
                            />
                          </View>
                        </View>
                      </View>
                    </Glass>
                    </Pressable>
                  );
                })
              )}
            </View>

            {/* Recent expenses */}
            {expensesThisMonth.length > 0 && (
              <View style={{ paddingHorizontal: 20, marginTop: 22 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, letterSpacing: -0.3, marginBottom: 12 }}>
                  Последние расходы
                </Text>
                <Glass padding={0} radius={22}>
                  {expensesThisMonth.slice(0, 6).map((exp, i, arr) => {
                    const env = envelopes.find((e) => e.id === exp.envelopeId);
                    return (
                      <View
                        key={exp.id}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingVertical: 14,
                          paddingHorizontal: 18,
                          borderBottomWidth: i < arr.length - 1 ? 0.5 : 0,
                          borderBottomColor: colors.surfaceStrong,
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                          <View
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 10,
                              backgroundColor: (env?.color ?? '#fff') + '22',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {env ? <EnvelopeIcon icon={env.icon} color={env.color} size={16} /> : null}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text }} numberOfLines={1}>
                              {exp.note?.trim() || env?.label || 'Расход'}
                            </Text>
                            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>
                              {env?.label ?? 'Без конверта'} · {new Date(exp.date).toLocaleDateString('ru-RU')}
                            </Text>
                          </View>
                        </View>
                        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>−{tg(exp.amount)}</Text>
                      </View>
                    );
                  })}
                </Glass>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <SetupBudgetSheet visible={setupOpen} onClose={() => setSetupOpen(false)} />
      <AddExpenseSheet
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        defaultEnvelopeId={addInitialEnvelopeId}
      />
      <MonthPickerSheet
        visible={monthPickerOpen}
        onClose={() => setMonthPickerOpen(false)}
        value={selectedMonth}
        onSelect={setSelectedMonth}
        title="Выберите месяц бюджета"
      />
      <EnvelopeDetailsSheet
        visible={!!detailsEnvelopeId}
        onClose={() => setDetailsEnvelopeId(null)}
        envelopeId={detailsEnvelopeId}
        onAddExpense={openAddFromDetails}
      />
    </View>
  );
}

const mkIconBtn = (colors: ThemeColors) =>
  ({
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: colors.divider,
    backgroundColor: colors.surfaceStrong,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  });
