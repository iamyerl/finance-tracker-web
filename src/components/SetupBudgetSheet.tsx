import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sheet } from './Sheet';
import { EnvelopeIcon, PencilIcon, PlusIcon } from './Icons';
import { EditEnvelopeSheet } from './EditEnvelopeSheet';
import { monthLabel, tg } from '../theme';
import type { ThemeColors } from '../theme';
import { useThemeColors } from '../store/ThemeContext';
import { useBudget, MonthBudget } from '../store/BudgetContext';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const onlyDigits = (s: string) => s.replace(/[^\d]/g, '');

export function SetupBudgetSheet({ visible, onClose }: Props) {
  const colors = useThemeColors();
  const incomeInputWrap = mkIncomeInputWrap(colors);
  const inputLabel = mkInputLabel(colors);
  const incomeInput = mkIncomeInput(colors);
  const incomeSuffix = mkIncomeSuffix(colors);
  const { budget, selectedMonth, envelopes, setBudget } = useBudget();
  const [income, setIncome] = useState('');
  const [plans, setPlans] = useState<Record<string, string>>({});

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setIncome(budget?.income ? String(budget.income) : '');
      const initial: Record<string, string> = {};
      for (const e of envelopes) {
        const v = budget?.plans?.[e.id];
        if (v) initial[e.id] = String(v);
      }
      setPlans(initial);
    }
  }, [visible, budget, envelopes]);

  const incomeN = Number(income || 0);
  const totalPlanned = envelopes.reduce((s, e) => s + Number(plans[e.id] || 0), 0);
  const free = incomeN - totalPlanned;

  const onSave = () => {
    if (incomeN <= 0) return;
    const cleaned: Record<string, number> = {};
    for (const e of envelopes) {
      const v = Number(plans[e.id] || 0);
      if (v > 0) cleaned[e.id] = v;
    }
    const next: MonthBudget = { income: incomeN, plans: cleaned };
    setBudget(next);
    onClose();
  };

  const openEditor = (id: string | null) => {
    setEditingId(id);
    setEditorOpen(true);
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      overlay={
        <EditEnvelopeSheet
          visible={editorOpen}
          onClose={() => setEditorOpen(false)}
          envelopeId={editingId}
        />
      }
    >
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 13, color: colors.textDim, fontWeight: '500' }}>Бюджет на</Text>
          <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text, letterSpacing: -0.4, marginTop: 2 }}>
            {monthLabel(selectedMonth)}
          </Text>

          {/* Income */}
          <View style={{ marginTop: 22 }}>
            <Text style={inputLabel}>Доход за месяц</Text>
            <View style={incomeInputWrap}>
              <TextInput
                value={income}
                onChangeText={(t) => setIncome(onlyDigits(t))}
                placeholder="650 000"
                placeholderTextColor={colors.textGhost}
                keyboardType="number-pad"
                style={incomeInput}
              />
              <Text style={incomeSuffix}>₸</Text>
            </View>
          </View>

          {/* Allocation summary */}
          <View
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 16,
              backgroundColor: colors.surface,
              borderWidth: 0.5,
              borderColor: colors.surfaceHover,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <View>
              <Text style={{ fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                Распределено
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 2 }}>{tg(totalPlanned)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                Свободно
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  marginTop: 2,
                  color: free < 0 ? colors.pink : free === 0 && incomeN > 0 ? colors.green : '#fff',
                }}
              >
                {tg(free)}
              </Text>
            </View>
          </View>

          {/* Envelopes */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22 }}>
            <Text style={inputLabel}>По конвертам</Text>
            <Text style={{ fontSize: 11, color: colors.textFaint }}>нажми «карандаш», чтобы изменить</Text>
          </View>

          <View style={{ gap: 10, marginTop: 8 }}>
            {envelopes.map((e) => (
              <View
                key={e.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  padding: 12,
                  borderRadius: 16,
                  backgroundColor: colors.surface,
                  borderWidth: 0.5,
                  borderColor: colors.surfaceHover,
                }}
              >
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
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }} numberOfLines={1}>
                    {e.label}
                  </Text>
                </View>
                <Pressable
                  onPress={() => openEditor(e.id)}
                  hitSlop={8}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    backgroundColor: colors.surfaceStrong,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PencilIcon size={14} color="rgba(255,255,255,0.7)" />
                </Pressable>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    borderWidth: 0.5,
                    borderColor: colors.glassBorder,
                    borderRadius: 10,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    backgroundColor: 'rgba(0,0,0,0.25)',
                    minWidth: 120,
                    justifyContent: 'flex-end',
                  }}
                >
                  <TextInput
                    value={plans[e.id] ?? ''}
                    onChangeText={(t) => setPlans((p) => ({ ...p, [e.id]: onlyDigits(t) }))}
                    placeholder="0"
                    placeholderTextColor={colors.textGhost}
                    keyboardType="number-pad"
                    style={{
                      color: colors.text,
                      fontSize: 15,
                      fontWeight: '600',
                      textAlign: 'right',
                      minWidth: 50,
                      padding: 0,
                    }}
                  />
                  <Text style={{ color: colors.textDim, fontSize: 13, fontWeight: '500' }}>₸</Text>
                </View>
              </View>
            ))}
          </View>

          {/* + Add envelope */}
          <Pressable
            onPress={() => openEditor(null)}
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
            <Text style={{ color: colors.blueLight, fontSize: 15, fontWeight: '600' }}>Добавить конверт</Text>
          </Pressable>

          {/* Save */}
          <Pressable
            disabled={incomeN <= 0}
            onPress={onSave}
            style={{ marginTop: 22, opacity: incomeN <= 0 ? 0.5 : 1 }}
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
                Сохранить бюджет
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

const mkInputLabel = (colors: ThemeColors) =>
  ({
    fontSize: 11,
    color: colors.textDim,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.4,
  });

const mkIncomeInputWrap = (colors: ThemeColors) =>
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

const mkIncomeInput = (colors: ThemeColors) =>
  ({
    flex: 1,
    color: colors.text,
    fontSize: 26,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    padding: 0,
  });

const mkIncomeSuffix = (colors: ThemeColors) =>
  ({
    color: colors.textDim,
    fontSize: 22,
    fontWeight: '600' as const,
    marginLeft: 6,
  });
