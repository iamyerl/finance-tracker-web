import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Sheet } from './Sheet';
import { DatePickerSheet } from './DatePickerSheet';
import { TrashIcon } from './Icons';
import { tg } from '../theme';
import type { ThemeColors } from '../theme';
import { useThemeColors } from '../store/ThemeContext';
import { useBudget } from '../store/BudgetContext';
import {
  Mortgage,
  PaymentDay,
  PaymentType,
  PAYMENT_DAY_OPTIONS,
  formatDateRu,
  parseDateRu,
  newMortgageId,
} from '../utils/mortgage';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const onlyDigits = (s: string) => s.replace(/[^\d]/g, '');
const onlyDecimal = (s: string) =>
  s.replace(',', '.').replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');

export function EditMortgageSheet({ visible, onClose }: Props) {
  const colors = useThemeColors();
  const label1 = mkLabel1(colors);
  const inputWrap = mkInputWrap(colors);
  const suffix = mkSuffix(colors);
  const baseInput = mkBaseInput(colors);
  const { mortgage, setMortgage } = useBudget();
  const editing = mortgage; // редактируем существующую если есть

  const [name, setName] = useState('');
  const [principal, setPrincipal] = useState('');
  const [termYears, setTermYears] = useState('');
  const [termMonths, setTermMonths] = useState('');
  const [issueDate, setIssueDate] = useState(formatDateRu(new Date()));
  const [rate, setRate] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('annuity');
  const [paymentDay, setPaymentDay] = useState<PaymentDay>('issue');
  const [issueDatePickerOpen, setIssueDatePickerOpen] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (editing) {
      setName(editing.name);
      setPrincipal(String(editing.principal));
      const yrs = Math.floor(editing.termMonths / 12);
      const mos = editing.termMonths % 12;
      setTermYears(String(yrs));
      setTermMonths(mos === 0 ? '' : String(mos));
      setIssueDate(formatDateRu(editing.issueDate));
      setRate(String(editing.rate));
      setPaymentType(editing.paymentType);
      setPaymentDay(editing.paymentDay);
    } else {
      setName('');
      setPrincipal('');
      setTermYears('');
      setTermMonths('');
      setIssueDate(formatDateRu(new Date()));
      setRate('');
      setPaymentType('annuity');
      setPaymentDay('issue');
    }
  }, [visible, editing]);

  const principalN = Number(principal || 0);
  const yearsN = Number(termYears || 0);
  const monthsN = Number(termMonths || 0);
  const totalMonths = yearsN * 12 + monthsN;
  const rateN = Number(rate || 0);
  const issueDateObj = parseDateRu(issueDate);
  const dateValid = !!issueDateObj;

  const canSave =
    principalN > 0 && totalMonths > 0 && rateN >= 0 && rateN < 100 && dateValid;

  const onSave = () => {
    if (!canSave || !issueDateObj) return;
    const next: Mortgage = {
      id: editing?.id ?? newMortgageId(),
      name: name.trim() || 'Ипотека',
      principal: principalN,
      termMonths: totalMonths,
      issueDate: issueDateObj.toISOString(),
      rate: rateN,
      paymentType,
      paymentDay,
      prepayments: editing?.prepayments ?? [],
    };
    setMortgage(next);
    onClose();
  };

  const onDelete = () => {
    if (!editing) return;
    Alert.alert(
      'Удалить ипотеку?',
      'Все досрочные погашения и расчёты будут удалены.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            setMortgage(null);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      height="92%"
      overlay={
        <DatePickerSheet
          mode="inline"
          visible={issueDatePickerOpen}
          onClose={() => setIssueDatePickerOpen(false)}
          value={parseDateRu(issueDate) ?? new Date()}
          onSelect={(d) => setIssueDate(formatDateRu(d))}
          title="Дата выдачи кредита"
        />
      }
    >
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text, letterSpacing: -0.4 }}>
          {editing ? 'Изменить ипотеку' : 'Новая ипотека'}
        </Text>

        {/* Название */}
        <Text style={[label1, { marginTop: 22 }]}>Название</Text>
        <View style={inputWrap}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Например: Квартира"
            placeholderTextColor={colors.textGhost}
            style={baseInput}
          />
        </View>

        {/* Сумма кредита */}
        <Text style={[label1, { marginTop: 18 }]}>Сумма кредита</Text>
        <View style={inputWrap}>
          <TextInput
            value={principal}
            onChangeText={(t) => setPrincipal(onlyDigits(t))}
            placeholder="24 000 000"
            placeholderTextColor={colors.textGhost}
            keyboardType="number-pad"
            style={[baseInput, bigInput]}
          />
          <Text style={suffix}>₸</Text>
        </View>

        {/* Срок */}
        <Text style={[label1, { marginTop: 18 }]}>Срок кредита</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
          <View style={[inputWrap, { flex: 1, marginTop: 0 }]}>
            <TextInput
              value={termYears}
              onChangeText={(t) => setTermYears(onlyDigits(t))}
              placeholder="20"
              placeholderTextColor={colors.textGhost}
              keyboardType="number-pad"
              style={baseInput}
            />
            <Text style={suffix}>лет</Text>
          </View>
          <View style={[inputWrap, { flex: 1, marginTop: 0 }]}>
            <TextInput
              value={termMonths}
              onChangeText={(t) => setTermMonths(onlyDigits(t))}
              placeholder="0"
              placeholderTextColor={colors.textGhost}
              keyboardType="number-pad"
              style={baseInput}
            />
            <Text style={suffix}>мес.</Text>
          </View>
        </View>
        {totalMonths > 0 && (
          <Text style={{ marginTop: 6, fontSize: 12, color: colors.textDim }}>
            Всего {totalMonths} мес.
          </Text>
        )}

        {/* Дата выдачи */}
        <Text style={[label1, { marginTop: 18 }]}>Дата выдачи кредита</Text>
        <Pressable
          onPress={() => setIssueDatePickerOpen(true)}
          style={[inputWrap, { justifyContent: 'space-between' }]}
        >
          <Text style={[baseInput, { padding: 0 }]}>{issueDate}</Text>
          <Ionicons name="calendar-outline" size={20} color={colors.textDim} />
        </Pressable>

        {/* Процент */}
        <Text style={[label1, { marginTop: 18 }]}>Процентная ставка</Text>
        <View style={inputWrap}>
          <TextInput
            value={rate}
            onChangeText={(t) => setRate(onlyDecimal(t))}
            placeholder="17.5"
            placeholderTextColor={colors.textGhost}
            keyboardType="decimal-pad"
            style={baseInput}
          />
          <Text style={suffix}>% годовых</Text>
        </View>

        {/* Тип платежей */}
        <Text style={[label1, { marginTop: 18 }]}>Тип ежемесячных платежей</Text>
        <View
          style={{
            flexDirection: 'row',
            padding: 4,
            borderRadius: 14,
            backgroundColor: 'rgba(0,0,0,0.25)',
            borderWidth: 0.5,
            borderColor: colors.surfaceStrong,
            marginTop: 8,
          }}
        >
          {(['annuity', 'differentiated'] as const).map((t) => {
            const active = paymentType === t;
            const lbl = t === 'annuity' ? 'Аннуитет' : 'Дифференцированный';
            return (
              <Pressable key={t} style={{ flex: 1 }} onPress={() => setPaymentType(t)}>
                {active ? (
                  <LinearGradient
                    colors={['#4D8BFF', '#2E5FE0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={{ paddingVertical: 10, borderRadius: 10, alignItems: 'center' }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#fff' }}>{lbl}</Text>
                  </LinearGradient>
                ) : (
                  <View style={{ paddingVertical: 10, alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textDim }}>{lbl}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* День ежемесячного платежа */}
        <Text style={[label1, { marginTop: 18 }]}>Ежемесячный платёж</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8, gap: 8 }}
          style={{ marginHorizontal: -20, paddingHorizontal: 20 }}
        >
          {PAYMENT_DAY_OPTIONS.map((opt) => {
            const active =
              (paymentDay === opt.value) ||
              (typeof paymentDay === 'number' && paymentDay === opt.value);
            const key = typeof opt.value === 'number' ? `d${opt.value}` : opt.value;
            return (
              <Pressable
                key={key}
                onPress={() => setPaymentDay(opt.value)}
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
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Save / Delete */}
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
              {editing ? 'Сохранить' : 'Создать ипотеку'}
            </Text>
          </LinearGradient>
        </Pressable>

        {editing && (
          <Pressable
            onPress={onDelete}
            style={{
              marginTop: 14,
              height: 50,
              borderRadius: 14,
              borderWidth: 0.5,
              borderColor: 'rgba(255,143,163,0.3)',
              backgroundColor: 'rgba(255,143,163,0.08)',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 8,
            }}
          >
            <TrashIcon color={colors.pink} size={16} />
            <Text style={{ color: colors.pink, fontSize: 15, fontWeight: '600' }}>
              Удалить ипотеку
            </Text>
          </Pressable>
        )}

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
  fontSize: 22,
  fontWeight: '700',
  letterSpacing: -0.3,
} as const;

const mkSuffix = (colors: ThemeColors) =>
  ({
    color: colors.textDim,
    fontSize: 14,
    fontWeight: '600' as const,
    marginLeft: 6,
  });
