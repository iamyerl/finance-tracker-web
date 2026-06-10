import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sheet } from './Sheet';
import { EnvelopeIcon, PlusIcon, TrashIcon } from './Icons';
import { useThemeColors } from '../store/ThemeContext';
import { useBudget } from '../store/BudgetContext';
import { monthLabel, tg } from '../theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  envelopeId: string | null;
  // Колбэк родителю чтобы открыть AddExpenseSheet с этим конвертом
  // (Modal-в-Modal на iOS не работает — поэтому решаем через лифтинг состояния).
  onAddExpense?: (envelopeId: string) => void;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
}

export function EnvelopeDetailsSheet({ visible, onClose, envelopeId, onAddExpense }: Props) {
  const colors = useThemeColors();
  const { envelopes, budget, expensesThisMonth, spentByEnvelope, removeExpense, selectedMonth } =
    useBudget();
  const env = envelopeId ? envelopes.find((e) => e.id === envelopeId) ?? null : null;

  if (!env) {
    return <Sheet visible={visible} onClose={onClose} height="80%">{null}</Sheet>;
  }

  const planned = budget?.plans?.[env.id] ?? 0;
  const spent = spentByEnvelope[env.id] ?? 0;
  const remaining = planned - spent;
  const over = spent > planned;
  const pct = planned > 0 ? Math.min(100, Math.round((spent / planned) * 100)) : 0;

  const expenses = expensesThisMonth.filter((e) => e.envelopeId === env.id);
  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const onDeleteExpense = (id: string, title: string) => {
    Alert.alert('Удалить расход?', title, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => removeExpense(id),
      },
    ]);
  };

  return (
    <Sheet visible={visible} onClose={onClose} height="88%">
      <View style={{ paddingHorizontal: 20 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View
            style={{
              width: 54,
              height: 54,
              borderRadius: 16,
              backgroundColor: env.color + '26',
              borderWidth: 0.5,
              borderColor: env.color + '55',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <EnvelopeIcon icon={env.icon} color={env.color} size={28} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text, letterSpacing: -0.3 }}>
              {env.label}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textDim, marginTop: 2 }}>
              {monthLabel(selectedMonth)}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View
          style={{
            marginTop: 18,
            padding: 16,
            borderRadius: 18,
            backgroundColor: colors.surface,
            borderWidth: 0.5,
            borderColor: colors.glassBorder,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                План
              </Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 2 }}>
                {tg(planned)}
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                Потрачено
              </Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 2 }}>
                {tg(spent)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                {over ? 'Перерасход' : 'Осталось'}
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: over ? colors.pink : colors.green,
                  marginTop: 2,
                }}
              >
                {tg(over ? -remaining : remaining)}
              </Text>
            </View>
          </View>
          {planned > 0 && (
            <View
              style={{
                marginTop: 14,
                height: 6,
                borderRadius: 4,
                backgroundColor: colors.surfaceHover,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  backgroundColor: over ? colors.pink : env.color,
                }}
              />
            </View>
          )}
        </View>

        {/* Add expense */}
        {onAddExpense && (
          <Pressable
            onPress={() => onAddExpense(env.id)}
            style={{ marginTop: 16 }}
            accessibilityRole="button"
            accessibilityLabel={`Добавить расход в конверт ${env.label}`}
          >
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
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', letterSpacing: -0.2 }}>
                Добавить расход
              </Text>
            </LinearGradient>
          </Pressable>
        )}

        {/* Expenses list */}
        <View
          style={{
            marginTop: 22,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, letterSpacing: -0.3 }}>
            Расходы
          </Text>
          <Text style={{ fontSize: 13, color: colors.textMuted }}>
            {sortedExpenses.length}
          </Text>
        </View>

        {sortedExpenses.length === 0 ? (
          <View
            style={{
              padding: 18,
              borderRadius: 18,
              backgroundColor: colors.surface,
              borderWidth: 0.5,
              borderColor: colors.glassBorder,
            }}
          >
            <Text style={{ color: colors.textDim, fontSize: 14, lineHeight: 20 }}>
              По этому конверту в выбранном месяце расходов нет. Добавьте расход с главного экрана.
            </Text>
          </View>
        ) : (
          <View
            style={{
              borderRadius: 20,
              backgroundColor: colors.surface,
              borderWidth: 0.5,
              borderColor: colors.glassBorder,
              overflow: 'hidden',
            }}
          >
            {sortedExpenses.map((exp, i, arr) => (
              <View
                key={exp.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderBottomWidth: i < arr.length - 1 ? 0.5 : 0,
                  borderBottomColor: colors.divider,
                  gap: 10,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }} numberOfLines={1}>
                    {exp.note?.trim() || 'Без заметки'}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                    {formatDate(exp.date)}
                  </Text>
                </View>
                <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>
                  −{tg(exp.amount)}
                </Text>
                <Pressable
                  onPress={() => onDeleteExpense(exp.id, exp.note?.trim() || `Расход ${tg(exp.amount)}`)}
                  hitSlop={8}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    backgroundColor: colors.pinkSoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TrashIcon color={colors.pink} size={14} />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </View>
    </Sheet>
  );
}
