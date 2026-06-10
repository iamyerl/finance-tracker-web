import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { InlineSheet } from './InlineSheet';
import { EnvelopeIcon, CheckIcon } from './Icons';
import { tg } from '../theme';
import { useThemeColors } from '../store/ThemeContext';
import { useBudget } from '../store/BudgetContext';

type Props = {
  visible: boolean;
  onClose: () => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function EnvelopePickerSheet({ visible, onClose, selectedId, onSelect }: Props) {
  const colors = useThemeColors();
  const { envelopes, budget, spentByEnvelope } = useBudget();

  return (
    <InlineSheet visible={visible} onClose={onClose} height="85%">
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text, letterSpacing: -0.4 }}>
          Выберите конверт
        </Text>
        <Text style={{ fontSize: 13, color: colors.textDim, marginTop: 4 }}>
          Всего конвертов: {envelopes.length}
        </Text>

        <View style={{ gap: 8, marginTop: 16 }}>
          {envelopes.map((e) => {
            const planned = budget?.plans?.[e.id] ?? 0;
            const spent = spentByEnvelope[e.id] ?? 0;
            const remaining = planned - spent;
            const active = selectedId === e.id;
            return (
              <Pressable
                key={e.id}
                onPress={() => {
                  onSelect(e.id);
                  onClose();
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 14,
                  borderRadius: 16,
                  backgroundColor: active ? e.color + '22' : colors.surface,
                  borderWidth: 0.5,
                  borderColor: active ? e.color : colors.surfaceHover,
                }}
              >
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    backgroundColor: e.color + '26',
                    borderWidth: 0.5,
                    borderColor: e.color + '55',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <EnvelopeIcon icon={e.icon} color={e.color} size={22} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }} numberOfLines={1}>
                    {e.label}
                  </Text>
                  {planned > 0 ? (
                    <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                      Осталось <Text style={{ color: remaining < 0 ? colors.pink : colors.green, fontWeight: '600' }}>{tg(remaining)}</Text> из {tg(planned)}
                    </Text>
                  ) : (
                    <Text style={{ fontSize: 12, color: colors.textFaint, marginTop: 2 }}>
                      План не задан
                    </Text>
                  )}
                </View>
                {active && (
                  <View
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      backgroundColor: e.color,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckIcon color="#fff" size={14} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </InlineSheet>
  );
}
