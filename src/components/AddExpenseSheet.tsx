import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Sheet } from './Sheet';
import { EnvelopeIcon } from './Icons';
import { EnvelopePickerSheet } from './EnvelopePickerSheet';
import { tg } from '../theme';
import { useThemeColors } from '../store/ThemeContext';
import type { ThemeColors } from '../theme';
import { useBudget } from '../store/BudgetContext';

type Props = {
  visible: boolean;
  onClose: () => void;
  // Если задано — конверт по умолчанию при открытии (например, при добавлении
  // расхода из попапа деталей конверта). Иначе берётся первый из списка.
  defaultEnvelopeId?: string | null;
};

const onlyDigits = (s: string) => s.replace(/[^\d]/g, '');

export function AddExpenseSheet({ visible, onClose, defaultEnvelopeId }: Props) {
  const colors = useThemeColors();
  const label1Style = mkLabel1Style(colors);
  const inputWrap = mkInputWrap(colors);
  const { budget, envelopes, addExpense, spentByEnvelope } = useBudget();
  const [envelopeId, setEnvelopeId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      setEnvelopeId(defaultEnvelopeId ?? envelopes[0]?.id ?? null);
      setAmount('');
      setNote('');
      setPickerOpen(false);
    }
  }, [visible, defaultEnvelopeId, envelopes]);

  const amountN = Number(amount || 0);
  const canSave = !!envelopeId && amountN > 0;

  const onSave = () => {
    if (!canSave || !envelopeId) return;
    addExpense(envelopeId, amountN, note.trim() || undefined);
    onClose();
  };

  const selected = envelopeId ? envelopes.find((e) => e.id === envelopeId) ?? null : null;
  const planned = selected ? budget?.plans?.[selected.id] ?? 0 : 0;
  const spent = selected ? spentByEnvelope[selected.id] ?? 0 : 0;
  const remaining = planned - spent;

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      height="80%"
      overlay={
        <EnvelopePickerSheet
          visible={pickerOpen}
          onClose={() => setPickerOpen(false)}
          selectedId={envelopeId}
          onSelect={setEnvelopeId}
        />
      }
    >
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text, letterSpacing: -0.4 }}>
          Добавить расход
        </Text>

        {envelopes.length === 0 ? (
          <View
            style={{
              marginTop: 24,
              padding: 18,
              borderRadius: 18,
              backgroundColor: 'rgba(255,143,163,0.10)',
              borderWidth: 0.5,
              borderColor: 'rgba(255,143,163,0.3)',
            }}
          >
            <Text style={{ color: colors.pink, fontSize: 14, fontWeight: '600' }}>
              Сначала создайте хотя бы один конверт
            </Text>
            <Text style={{ color: colors.textDim, fontSize: 13, marginTop: 6 }}>
              Откройте «Изменить» в бюджете и добавьте конверт.
            </Text>
          </View>
        ) : (
          <>
            {/* Amount */}
            <Text style={[label1Style, { marginTop: 22 }]}>Сумма</Text>
            <View style={inputWrap}>
              <TextInput
                value={amount}
                onChangeText={(t) => setAmount(onlyDigits(t))}
                placeholder="0"
                placeholderTextColor={colors.textGhost}
                keyboardType="number-pad"
                autoFocus
                style={{ flex: 1, color: colors.text, fontSize: 32, fontWeight: '700', letterSpacing: -0.6, padding: 0 }}
              />
              <Text style={{ color: colors.textDim, fontSize: 24, fontWeight: '600', marginLeft: 6 }}>₸</Text>
            </View>

            {/* Envelope picker */}
            <Text style={[label1Style, { marginTop: 18 }]}>Конверт</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 8, gap: 8 }}
              style={{ marginHorizontal: -20, paddingHorizontal: 20 }}
            >
              {envelopes.map((e) => {
                const active = envelopeId === e.id;
                return (
                  <Pressable
                    key={e.id}
                    onPress={() => setEnvelopeId(e.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 14,
                      backgroundColor: active ? e.color + '33' : colors.surfaceLite,
                      borderWidth: 0.5,
                      borderColor: active ? e.color : colors.glassBorder,
                    }}
                  >
                    <View
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 8,
                        backgroundColor: e.color + '33',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <EnvelopeIcon icon={e.icon} color={e.color} size={16} />
                    </View>
                    <Text style={{ color: active ? '#fff' : colors.textDim, fontWeight: '600', fontSize: 14 }}>
                      {e.label}
                    </Text>
                  </Pressable>
                );
              })}
              {/* "Все конверты" — открывает полный список */}
              <Pressable
                onPress={() => setPickerOpen(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 14,
                  backgroundColor: 'rgba(77,139,255,0.10)',
                  borderWidth: 0.5,
                  borderColor: 'rgba(123,176,255,0.4)',
                }}
              >
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    backgroundColor: 'rgba(77,139,255,0.25)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="grid" size={14} color={colors.blueLight} />
                </View>
                <Text style={{ color: colors.blueLight, fontWeight: '600', fontSize: 14 }}>
                  Все ({envelopes.length})
                </Text>
              </Pressable>
            </ScrollView>

            {/* Selected envelope info */}
            {selected && (
              <View
                style={{
                  marginTop: 12,
                  padding: 14,
                  borderRadius: 16,
                  backgroundColor: colors.surface,
                  borderWidth: 0.5,
                  borderColor: colors.surfaceHover,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.textDim, fontSize: 13 }}>Потрачено</Text>
                  <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>
                    {tg(spent)} <Text style={{ color: colors.textDim }}>из {tg(planned)}</Text>
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                  <Text style={{ color: colors.textDim, fontSize: 13 }}>
                    {planned > 0 ? 'Останется после' : 'Будет израсходовано'}
                  </Text>
                  <Text
                    style={{
                      color: remaining - amountN < 0 ? colors.pink : colors.green,
                      fontSize: 14,
                      fontWeight: '700',
                    }}
                  >
                    {tg(remaining - amountN)}
                  </Text>
                </View>
              </View>
            )}

            {/* Note */}
            <Text style={[label1Style, { marginTop: 18 }]}>Заметка (необязательно)</Text>
            <View style={[inputWrap, { paddingVertical: 12 }]}>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Например: Magnum"
                placeholderTextColor={colors.textGhost}
                style={{ flex: 1, color: colors.text, fontSize: 16, padding: 0 }}
              />
            </View>

            {/* Save */}
            <Pressable disabled={!canSave} onPress={onSave} style={{ marginTop: 22, opacity: canSave ? 1 : 0.5 }}>
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
                  Сохранить расход
                </Text>
              </LinearGradient>
            </Pressable>

            <Pressable onPress={onClose} style={{ marginTop: 10, alignItems: 'center', paddingVertical: 12 }}>
              <Text style={{ color: colors.textDim, fontSize: 14, fontWeight: '500' }}>Отмена</Text>
            </Pressable>
          </>
        )}
      </View>
    </Sheet>
  );
}

const mkLabel1Style = (colors: ThemeColors) =>
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
