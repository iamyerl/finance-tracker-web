import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Sheet } from './Sheet';
import { DatePickerSheet } from './DatePickerSheet';
import { CheckIcon } from './Icons';
import { tg } from '../theme';
import { useThemeColors } from '../store/ThemeContext';
import type { ThemeColors } from '../theme';
import { useBudget } from '../store/BudgetContext';
import {
  Frequency,
  FREQUENCY_OPTIONS,
  PrepaymentMode,
  formatDateRu,
  parseDateRu,
} from '../utils/mortgage';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const onlyDigits = (s: string) => s.replace(/[^\d]/g, '');

type Tab = 'one-time' | 'recurring';

export function AddPrepaymentSheet({ visible, onClose }: Props) {
  const colors = useThemeColors();
  const inputWrap = mkInputWrap(colors);
  const label1 = mkLabel1(colors);
  const suffix = mkSuffix(colors);
  const baseInput = mkBaseInput(colors);
  const { addPrepayment } = useBudget();

  const [tab, setTab] = useState<Tab>('one-time');

  // Common
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState<PrepaymentMode>('shorten');
  const [allToPrincipal, setAllToPrincipal] = useState(true);

  // One-time
  const [date, setDate] = useState(formatDateRu(new Date()));

  // Recurring
  const [frequency, setFrequency] = useState<Frequency>('month');
  const [startDate, setStartDate] = useState(formatDateRu(new Date()));
  const [endDate, setEndDate] = useState('');

  // Календарь: какой инпут редактируется
  const [pickerField, setPickerField] = useState<null | 'date' | 'startDate' | 'endDate'>(null);

  useEffect(() => {
    if (!visible) return;
    setTab('one-time');
    setAmount('');
    setMode('shorten');
    setAllToPrincipal(true);
    setDate(formatDateRu(new Date()));
    setFrequency('month');
    setStartDate(formatDateRu(new Date()));
    setEndDate('');
    setPickerField(null);
  }, [visible]);

  const amountN = Number(amount || 0);
  const dateOk = !!parseDateRu(date);
  const startOk = !!parseDateRu(startDate);
  const endOk = endDate.trim() === '' || !!parseDateRu(endDate);

  const canSave =
    amountN > 0 && (tab === 'one-time' ? dateOk : startOk && endOk);

  const onSave = () => {
    if (!canSave) return;
    if (tab === 'one-time') {
      const d = parseDateRu(date);
      if (!d) return;
      addPrepayment({
        kind: 'one-time',
        date: d.toISOString(),
        amount: amountN,
        mode,
        allToPrincipal,
      });
    } else {
      const s = parseDateRu(startDate);
      if (!s) return;
      const e = endDate.trim() ? parseDateRu(endDate) : null;
      addPrepayment({
        kind: 'recurring',
        frequency,
        startDate: s.toISOString(),
        endDate: e ? e.toISOString() : undefined,
        amount: amountN,
        mode,
        allToPrincipal,
      });
    }
    onClose();
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      height="92%"
      overlay={
        <DatePickerSheet
          mode="inline"
          visible={pickerField !== null}
          onClose={() => setPickerField(null)}
          value={
            pickerField === 'date'
              ? parseDateRu(date) ?? new Date()
              : pickerField === 'startDate'
              ? parseDateRu(startDate) ?? new Date()
              : pickerField === 'endDate'
              ? parseDateRu(endDate) ?? new Date()
              : new Date()
          }
          onSelect={(d) => {
            const s = formatDateRu(d);
            if (pickerField === 'date') setDate(s);
            else if (pickerField === 'startDate') setStartDate(s);
            else if (pickerField === 'endDate') setEndDate(s);
          }}
          title={
            pickerField === 'endDate'
              ? 'Конец периода'
              : pickerField === 'startDate'
              ? 'Начало периода'
              : 'Дата платежа'
          }
        />
      }
    >
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text, letterSpacing: -0.4 }}>
          Досрочное погашение
        </Text>

        {/* Tabs */}
        <View
          style={{
            marginTop: 18,
            flexDirection: 'row',
            padding: 4,
            borderRadius: 14,
            backgroundColor: 'rgba(0,0,0,0.25)',
            borderWidth: 0.5,
            borderColor: colors.surfaceStrong,
          }}
        >
          {(['one-time', 'recurring'] as const).map((t) => {
            const active = tab === t;
            const lbl = t === 'one-time' ? 'Разовый' : 'Регулярный';
            return (
              <Pressable key={t} style={{ flex: 1 }} onPress={() => setTab(t)}>
                {active ? (
                  <LinearGradient
                    colors={['#4D8BFF', '#2E5FE0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={{ paddingVertical: 10, borderRadius: 10, alignItems: 'center' }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>{lbl}</Text>
                  </LinearGradient>
                ) : (
                  <View style={{ paddingVertical: 10, alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textDim }}>{lbl}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Sum */}
        <Text style={[label1, { marginTop: 18 }]}>Сумма</Text>
        <View style={inputWrap}>
          <TextInput
            value={amount}
            onChangeText={(t) => setAmount(onlyDigits(t))}
            placeholder="100 000"
            placeholderTextColor={colors.textGhost}
            keyboardType="number-pad"
            style={[baseInput, bigInput]}
          />
          <Text style={suffix}>₸</Text>
        </View>

        {tab === 'one-time' ? (
          <>
            <Text style={[label1, { marginTop: 18 }]}>Дата</Text>
            <Pressable
              onPress={() => setPickerField('date')}
              style={[inputWrap, { justifyContent: 'space-between' }]}
            >
              <Text style={[baseInput, { padding: 0 }]}>{date}</Text>
              <Ionicons name="calendar-outline" size={20} color={colors.textDim} />
            </Pressable>
          </>
        ) : (
          <>
            <Text style={[label1, { marginTop: 18 }]}>Периодичность</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 8, gap: 8 }}
              style={{ marginHorizontal: -20, paddingHorizontal: 20 }}
            >
              {FREQUENCY_OPTIONS.map((f) => {
                const active = frequency === f.value;
                return (
                  <Pressable
                    key={f.value}
                    onPress={() => setFrequency(f.value)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor: active ? 'rgba(77,139,255,0.20)' : colors.surfaceLite,
                      borderWidth: 0.5,
                      borderColor: active ? colors.blueLight : colors.glassBorder,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '600',
                        color: active ? '#fff' : colors.textDim,
                      }}
                    >
                      {f.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={[label1, { marginTop: 18 }]}>Начало периода</Text>
            <Pressable
              onPress={() => setPickerField('startDate')}
              style={[inputWrap, { justifyContent: 'space-between' }]}
            >
              <Text style={[baseInput, { padding: 0 }]}>{startDate}</Text>
              <Ionicons name="calendar-outline" size={20} color={colors.textDim} />
            </Pressable>

            <Text style={[label1, { marginTop: 18 }]}>Конец периода (необязательно)</Text>
            <Pressable
              onPress={() => setPickerField('endDate')}
              style={[inputWrap, { justifyContent: 'space-between' }]}
            >
              <Text
                style={[
                  baseInput,
                  { padding: 0, color: endDate ? colors.text : colors.textGhost },
                ]}
              >
                {endDate || 'не указана'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {!!endDate && (
                  <Pressable onPress={() => setEndDate('')} hitSlop={6}>
                    <Ionicons name="close-circle" size={18} color={colors.textDim} />
                  </Pressable>
                )}
                <Ionicons name="calendar-outline" size={20} color={colors.textDim} />
              </View>
            </Pressable>
            <Text style={{ marginTop: 6, fontSize: 12, color: colors.textDim }}>
              Если не указано — будет применяться до закрытия кредита.
            </Text>
          </>
        )}

        {/* Mode */}
        <Text style={[label1, { marginTop: 18 }]}>Перерасчёт</Text>
        <View style={{ gap: 8, marginTop: 8 }}>
          {(['shorten', 'lower'] as const).map((m) => {
            const active = mode === m;
            const title = m === 'shorten' ? 'Уменьшить срок' : 'Уменьшить платёж';
            const sub =
              m === 'shorten'
                ? 'Платёж останется тот же, кредит закроется раньше'
                : 'Срок сохранится, платёж станет меньше';
            return (
              <Pressable
                key={m}
                onPress={() => setMode(m)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 14,
                  borderRadius: 16,
                  backgroundColor: active ? 'rgba(77,139,255,0.12)' : colors.surface,
                  borderWidth: 0.5,
                  borderColor: active ? colors.blueLight : colors.surfaceHover,
                }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    borderWidth: 2,
                    borderColor: active ? colors.blueLight : colors.textGhost,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {active && (
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: colors.blueLight,
                      }}
                    />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>{title}</Text>
                  <Text style={{ color: colors.textDim, fontSize: 12, marginTop: 2 }}>{sub}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* All-to-principal checkbox */}
        <Pressable
          onPress={() => setAllToPrincipal((v) => !v)}
          style={{
            marginTop: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            padding: 14,
            borderRadius: 14,
            backgroundColor: colors.surface,
            borderWidth: 0.5,
            borderColor: colors.surfaceHover,
          }}
        >
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              borderWidth: 1.5,
              borderColor: allToPrincipal ? colors.blueLight : colors.textGhost,
              backgroundColor: allToPrincipal ? colors.blueLight : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {allToPrincipal && <CheckIcon color="#fff" size={14} />}
          </View>
          <Text style={{ flex: 1, color: colors.text, fontSize: 14, fontWeight: '500' }}>
            Вся сумма идёт на погашение основного долга
          </Text>
        </Pressable>

        {/* Save */}
        <Pressable
          disabled={!canSave}
          onPress={onSave}
          style={{ marginTop: 22, opacity: canSave ? 1 : 0.5 }}
        >
          <LinearGradient
            colors={['#4D8BFF', '#2E5FE0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{
              height: 52,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#3C6EFF',
              shadowOpacity: 0.45,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 8 },
              elevation: 8,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', letterSpacing: -0.2 }}>
              Добавить платёж
            </Text>
          </LinearGradient>
        </Pressable>

        <Pressable onPress={onClose} style={{ marginTop: 10, alignItems: 'center', paddingVertical: 12 }}>
          <Text style={{ color: colors.textDim, fontSize: 14, fontWeight: '500' }}>Отмена</Text>
        </Pressable>
      </View>
    </Sheet>
  );
}

const mkLabel1 = (colors: ThemeColors) =>
  ({
    fontSize: 11,
    color: colors.textDim,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.4,
  });

const mkInputWrap = (colors: ThemeColors) =>
  ({
    marginTop: 8,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: colors.surfaceLite,
    borderWidth: 0.5,
    borderColor: colors.glassBorder,
  });

const mkBaseInput = (colors: ThemeColors) =>
  ({
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600' as const,
    padding: 0,
  });

const bigInput = {
  fontSize: 24,
  fontWeight: '700',
  letterSpacing: -0.3,
} as const;

const mkSuffix = (colors: ThemeColors) =>
  ({
    color: colors.textDim,
    fontSize: 16,
    fontWeight: '600' as const,
    marginLeft: 6,
  });
