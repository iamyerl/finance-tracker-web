import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBG } from '../components/ScreenBG';
import { Glass } from '../components/Glass';
import { TriangleDown, ArrowRight, StarIcon, PlusIcon, TrashIcon, PencilIcon } from '../components/Icons';
import { EditMortgageSheet } from '../components/EditMortgageSheet';
import { AddPrepaymentSheet } from '../components/AddPrepaymentSheet';
import { tg, tgK, MONTHS_RU_SHORT } from '../theme';
import type { ThemeColors } from '../theme';
import { useThemeColors } from '../store/ThemeContext';
import { useBudget } from '../store/BudgetContext';
import {
  calculate,
  formatDateRu,
  frequencyLabel,
  paymentDayLabel,
  Prepayment,
} from '../utils/mortgage';

function formatPayoff(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${MONTHS_RU_SHORT[d.getMonth()].toLowerCase()} ${d.getFullYear()}`;
}

function payoffMonthYear(iso: string | null): { y: number; m: number } | null {
  if (!iso) return null;
  const d = new Date(iso);
  return { y: d.getFullYear(), m: d.getMonth() };
}

function monthsToYM(m: number): string {
  if (m <= 0) return '0 мес';
  const y = Math.floor(m / 12);
  const mm = m % 12;
  if (y === 0) return `${mm} мес`;
  if (mm === 0) return `${y} ${pluralYears(y)}`;
  return `${y} ${pluralYears(y)} ${mm} мес`;
}

function pluralYears(n: number): string {
  const lastTwo = n % 100;
  const last = n % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return 'лет';
  if (last === 1) return 'год';
  if (last >= 2 && last <= 4) return 'года';
  return 'лет';
}

export function MortgageScreen() {
  const colors = useThemeColors();
  const { hydrated, mortgage, removePrepayment } = useBudget();
  const [editorOpen, setEditorOpen] = useState(false);
  const [prepayOpen, setPrepayOpen] = useState(false);

  const calc = useMemo(() => (mortgage ? calculate(mortgage) : null), [mortgage]);

  if (!hydrated) {
    return <View style={{ flex: 1, backgroundColor: colors.bgBottom }} />;
  }

  // Empty state
  if (!mortgage || !calc) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgBottom }}>
        <ScreenBG variant="mortgage" />
        <ScrollView contentContainerStyle={{ paddingTop: 60, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
          <View style={{ paddingHorizontal: 20, marginBottom: 18 }}>
            <Text style={{ fontSize: 13, color: colors.textDim, fontWeight: '500' }}>Кредит</Text>
            <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text, letterSpacing: -0.6, marginTop: 2 }}>
              Ипотека
            </Text>
          </View>

          <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
            <Glass padding={24} radius={28}>
              <Text style={{ fontSize: 12, color: colors.textDim, fontWeight: '500', letterSpacing: 0.4, textTransform: 'uppercase' }}>
                Пока нет ипотеки
              </Text>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, letterSpacing: -0.4, marginTop: 6, lineHeight: 26 }}>
                Добавьте кредит — посчитаем платежи и поможем планировать досрочные погашения
              </Text>
              <Text style={{ fontSize: 13, color: colors.textDim, marginTop: 8, lineHeight: 19 }}>
                Введите сумму, срок, ставку и тип платежей. Затем добавляйте досрочные погашения — мы покажем, насколько сократится срок и сколько процентов вы сэкономите.
              </Text>
              <Pressable onPress={() => setEditorOpen(true)} style={{ marginTop: 18 }}>
                <LinearGradient
                  colors={['#4D8BFF', '#2E5FE0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={{
                    height: 52,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    gap: 8,
                    shadowColor: '#3C6EFF',
                    shadowOpacity: 0.45,
                    shadowRadius: 18,
                    shadowOffset: { width: 0, height: 6 },
                    elevation: 6,
                  }}
                >
                  <PlusIcon size={16} color="#fff" strokeWidth={3} />
                  <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600', letterSpacing: -0.2 }}>
                    Добавить ипотеку
                  </Text>
                </LinearGradient>
              </Pressable>
            </Glass>
          </View>
        </ScrollView>

        <EditMortgageSheet visible={editorOpen} onClose={() => setEditorOpen(false)} />
      </View>
    );
  }

  // Has mortgage
  const paidPct =
    mortgage.principal > 0 ? Math.min(100, (calc.paidPrincipal / mortgage.principal) * 100) : 0;

  const sortedPrepayments = [...mortgage.prepayments].sort((a, b) => {
    const da = a.kind === 'one-time' ? a.date : a.startDate;
    const db = b.kind === 'one-time' ? b.date : b.startDate;
    return new Date(db).getTime() - new Date(da).getTime();
  });

  const onRemovePrepayment = (pp: Prepayment) => {
    Alert.alert('Удалить досрочное погашение?', '', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => removePrepayment(pp.id),
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgBottom }}>
      <ScreenBG variant="mortgage" />
      <ScrollView contentContainerStyle={{ paddingTop: 60, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 20,
            marginBottom: 18,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, color: colors.textDim, fontWeight: '500' }}>Кредит</Text>
            <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text, letterSpacing: -0.6, marginTop: 2 }}>
              {mortgage.name}
            </Text>
          </View>
          <Pressable
            onPress={() => setEditorOpen(true)}
            hitSlop={10}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 12,
              borderWidth: 0.5,
              borderColor: colors.divider,
              backgroundColor: colors.surfaceStrong,
            }}
          >
            <PencilIcon size={12} color={colors.blueLight} />
            <Text style={{ color: colors.blueLight, fontSize: 13, fontWeight: '600' }}>Изменить</Text>
          </Pressable>
        </View>

        {/* Hero */}
        <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
          <Glass padding={24} radius={32}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: colors.textDim, fontWeight: '500', letterSpacing: 0.4, textTransform: 'uppercase' }}>
                  Остаток долга
                </Text>
                <Text style={{ fontSize: 32, fontWeight: '700', color: colors.text, letterSpacing: -1.2, marginTop: 4 }}>
                  {tg(calc.currentBalance)}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                  из {tg(mortgage.principal)}
                </Text>
              </View>
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 12,
                  backgroundColor: 'rgba(77,139,255,0.18)',
                  borderWidth: 0.5,
                  borderColor: 'rgba(123,176,255,0.3)',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.blueLight }}>
                  {mortgage.rate}% годовых
                </Text>
              </View>
            </View>

            {/* Progress */}
            <View style={{ marginTop: 18 }}>
              <View style={{ height: 8, borderRadius: 5, backgroundColor: colors.surfaceHover, overflow: 'hidden' }}>
                <LinearGradient
                  colors={['#4D8BFF', '#7BB0FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ width: `${paidPct}%`, height: '100%' }}
                />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <Text style={{ fontSize: 11, color: colors.textMuted }}>
                  выплачено {Math.round(paidPct)}%
                </Text>
                <Text style={{ fontSize: 11, color: colors.textMuted }}>
                  {tgK(calc.paidPrincipal)} из {tgK(mortgage.principal)}
                </Text>
              </View>
            </View>

            {/* Stats */}
            <View style={{ flexDirection: 'row', marginTop: 20, gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.3 }}>Платёж</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 2 }} numberOfLines={1}>
                  {tgK(calc.currentPayment)}
                </Text>
              </View>
              <View style={{ width: 0.5, backgroundColor: colors.glassBorder }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.3 }}>Осталось</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 2 }} numberOfLines={1}>
                  {monthsToYM(calc.remainingMonths)}
                </Text>
              </View>
              <View style={{ width: 0.5, backgroundColor: colors.glassBorder }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.3 }}>Закрытие</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 2 }} numberOfLines={1}>
                  {formatPayoff(calc.payoffDate)}
                </Text>
              </View>
            </View>
          </Glass>
        </View>

        {/* Калькулятор итогов */}
        <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
          <Glass padding={20} radius={26}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 14 }}>
              Расчёт по кредиту
            </Text>
            <Row label="Первоначальный платёж" value={tg(calc.initialPayment)} />
            <Row
              label="Тип платежей"
              value={mortgage.paymentType === 'annuity' ? 'Аннуитет' : 'Дифференцированный'}
            />
            <Row label="Платёж" value={paymentDayLabel(mortgage.paymentDay)} />
            <Row label="Дата выдачи" value={formatDateRu(mortgage.issueDate)} />
            <Row label="Полная стоимость" value={tg(calc.totalPaid)} />
            <Row label="Сумма процентов" value={tg(calc.totalInterest)} accent={colors.pink} />
            {calc.totalPrepaid > 0 && (
              <Row label="Досрочно внесено" value={tg(calc.totalPrepaid)} accent={colors.blueLight} />
            )}
          </Glass>
        </View>

        {/* Эффект досрочек */}
        {calc.totalPrepaid > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
            <Glass
              padding={20}
              radius={26}
              gradient={['rgba(157,232,176,0.14)', 'rgba(77,139,255,0.06)']}
              borderColor="rgba(157,232,176,0.25)"
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <StarIcon color={colors.green} />
                <Text style={{ fontSize: 12, color: colors.green, fontWeight: '600', letterSpacing: 0.3, textTransform: 'uppercase' }}>
                  Эффект досрочек
                </Text>
              </View>
              <Row label="Срок сокращён на" value={monthsToYM(Math.max(0, calc.monthsSaved))} accent={colors.green} />
              <Row label="Экономия процентов" value={tg(Math.max(0, calc.interestSavings))} accent={colors.green} />
            </Glass>
          </View>
        )}

        {/* Досрочные погашения */}
        <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, letterSpacing: -0.3 }}>
              Досрочные погашения
            </Text>
            {sortedPrepayments.length > 0 && (
              <Text style={{ fontSize: 13, color: colors.textMuted }}>
                {sortedPrepayments.length}
              </Text>
            )}
          </View>

          {sortedPrepayments.length === 0 ? (
            <Glass padding={18} radius={20}>
              <Text style={{ color: colors.textDim, fontSize: 14, lineHeight: 20 }}>
                Здесь будут разовые и регулярные погашения. Добавьте первое — посмотрите, сколько сэкономите.
              </Text>
            </Glass>
          ) : (
            <View style={{ gap: 10 }}>
              {sortedPrepayments.map((pp) => (
                <Glass key={pp.id} padding={14} radius={18}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 11,
                        backgroundColor: pp.kind === 'one-time' ? 'rgba(123,176,255,0.18)' : 'rgba(157,232,176,0.18)',
                        borderWidth: 0.5,
                        borderColor: pp.kind === 'one-time' ? 'rgba(123,176,255,0.4)' : 'rgba(157,232,176,0.4)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ArrowRight color={pp.kind === 'one-time' ? colors.blueLight : colors.green} size={16} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>
                        {pp.kind === 'one-time' ? 'Разовый' : 'Регулярный'} · {tg(pp.amount)}
                      </Text>
                      <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                        {pp.kind === 'one-time'
                          ? formatDateRu(pp.date)
                          : `${frequencyLabel(pp.frequency)} · с ${formatDateRu(pp.startDate)}${pp.endDate ? ` по ${formatDateRu(pp.endDate)}` : ''}`}
                      </Text>
                      <Text style={{ color: colors.textFaint, fontSize: 11, marginTop: 2 }}>
                        {pp.mode === 'shorten' ? 'Уменьшить срок' : 'Уменьшить платёж'}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => onRemovePrepayment(pp)}
                      hitSlop={8}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        backgroundColor: 'rgba(255,143,163,0.10)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <TrashIcon color={colors.pink} size={14} />
                    </Pressable>
                  </View>
                </Glass>
              ))}
            </View>
          )}

          <Pressable
            onPress={() => setPrepayOpen(true)}
            style={{
              marginTop: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              paddingVertical: 14,
              borderRadius: 16,
              borderWidth: 0.5,
              borderColor: 'rgba(123,176,255,0.4)',
              backgroundColor: 'rgba(77,139,255,0.10)',
            }}
          >
            <PlusIcon size={16} color={colors.blueLight} strokeWidth={2.5} />
            <Text style={{ color: colors.blueLight, fontSize: 15, fontWeight: '600' }}>
              Добавить досрочное погашение
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <EditMortgageSheet visible={editorOpen} onClose={() => setEditorOpen(false)} />
      <AddPrepaymentSheet visible={prepayOpen} onClose={() => setPrepayOpen(false)} />
    </View>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: string }) {
  const colors = useThemeColors();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 }}>
      <Text style={{ fontSize: 13, color: colors.textDim }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '700', color: accent ?? colors.text }}>{value}</Text>
    </View>
  );
}
