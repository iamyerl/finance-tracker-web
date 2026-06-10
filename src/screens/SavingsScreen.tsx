import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBG } from '../components/ScreenBG';
import { Glass } from '../components/Glass';
import { EnvelopeIcon, PlusIcon, PencilIcon } from '../components/Icons';
import { EditGoalSheet } from '../components/EditGoalSheet';
import { tg, tgK } from '../theme';
import { useThemeColors } from '../store/ThemeContext';
import { useBudget } from '../store/BudgetContext';

export function SavingsScreen() {
  const colors = useThemeColors();
  const { hydrated, goals } = useBudget();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const open = (id: string | null) => {
    setEditingId(id);
    setEditorOpen(true);
  };

  if (!hydrated) {
    return <View style={{ flex: 1, backgroundColor: colors.bgBottom }} />;
  }

  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const overallPct = totalTarget > 0 ? Math.min(100, (totalSaved / totalTarget) * 100) : 0;

  const hasGoals = goals.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgBottom }}>
      <ScreenBG variant="savings" />
      <ScrollView
        contentContainerStyle={{ paddingTop: 60, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 20, marginBottom: 18 }}>
          <Text style={{ fontSize: 13, color: colors.textDim, fontWeight: '500' }}>Копилка</Text>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text, letterSpacing: -0.6, marginTop: 2 }}>
            Накопления
          </Text>
        </View>

        {/* Total saved hero */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <Glass
            padding={24}
            radius={32}
            gradient={['rgba(77,139,255,0.18)', 'rgba(163,139,255,0.10)']}
            borderColor="rgba(123,176,255,0.25)"
          >
            <Text
              style={{
                fontSize: 12,
                color: colors.textDim,
                fontWeight: '500',
                letterSpacing: 0.4,
                textTransform: 'uppercase',
              }}
            >
              Всего накоплено
            </Text>
            <Text style={{ fontSize: 44, fontWeight: '700', color: colors.text, letterSpacing: -1.4, marginTop: 4 }}>
              {tg(totalSaved)}
            </Text>

            {totalTarget > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 }}>
                <View
                  style={{
                    flex: 1,
                    height: 6,
                    borderRadius: 4,
                    backgroundColor: colors.surfaceHover,
                    overflow: 'hidden',
                  }}
                >
                  <LinearGradient
                    colors={['#4D8BFF', '#A38BFF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ width: `${overallPct}%`, height: '100%' }}
                  />
                </View>
                <Text style={{ fontSize: 12, color: colors.textDim }}>
                  {Math.round(overallPct)}% из {tgK(totalTarget)}
                </Text>
              </View>
            )}
          </Glass>
        </View>

        {hasGoals ? (
          <>
            {/* Goals header */}
            <View
              style={{
                paddingHorizontal: 20,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, letterSpacing: -0.3 }}>
                Цели
              </Text>
              <Text style={{ fontSize: 13, color: colors.textMuted }}>
                {goals.length} {goals.length === 1 ? 'цель' : goals.length < 5 ? 'цели' : 'целей'}
              </Text>
            </View>

            {/* Goals list */}
            <View style={{ paddingHorizontal: 20, gap: 12 }}>
              {goals.map((g) => {
                const pct = g.target > 0 ? Math.min(100, (g.saved / g.target) * 100) : 0;
                const remaining = g.target - g.saved;
                const reached = g.saved >= g.target;
                return (
                  <Pressable key={g.id} onPress={() => open(g.id)}>
                    <Glass padding={16} radius={22}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <View
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: 12,
                            backgroundColor: g.color + '26',
                            borderWidth: 0.5,
                            borderColor: g.color + '55',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <EnvelopeIcon icon={g.icon} color={g.color} size={22} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }} numberOfLines={1}>
                            {g.name}
                          </Text>
                          <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                            {reached
                              ? 'Цель достигнута 🎉'
                              : `Осталось накопить ${tg(remaining)}`}
                          </Text>
                        </View>
                        <View
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
                        </View>
                      </View>
                      <View
                        style={{
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
                            backgroundColor: g.color,
                            shadowColor: g.color,
                            shadowOpacity: 0.5,
                            shadowRadius: 6,
                            shadowOffset: { width: 0, height: 0 },
                          }}
                        />
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                        <Text style={{ fontSize: 11, color: colors.textMuted }}>
                          {Math.round(pct)}% выполнено
                        </Text>
                        <Text style={{ fontSize: 11, color: colors.text, fontWeight: '600' }}>
                          {tg(g.saved)} <Text style={{ color: colors.textMuted, fontWeight: '400' }}>из {tg(g.target)}</Text>
                        </Text>
                      </View>
                    </Glass>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : (
          // Empty state
          <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
            <Glass padding={22} radius={22}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                У вас пока нет целей
              </Text>
              <Text style={{ fontSize: 13, color: colors.textDim, marginTop: 6, lineHeight: 19 }}>
                Создайте первую цель — на чёрный день, отпуск, технику, свадьбу. Накопления удобно
                разделять по конкретным целям.
              </Text>
            </Glass>
          </View>
        )}

        {/* Add goal button */}
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <Pressable onPress={() => open(null)}>
            <LinearGradient
              colors={['#4D8BFF', '#2E5FE0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{
                height: 52,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                shadowColor: '#3C6EFF',
                shadowOpacity: 0.45,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 8 },
                elevation: 8,
              }}
            >
              <PlusIcon size={16} color="#fff" strokeWidth={3} />
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', letterSpacing: -0.2 }}>
                {hasGoals ? 'Добавить цель' : 'Создать первую цель'}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>

      <EditGoalSheet
        visible={editorOpen}
        onClose={() => setEditorOpen(false)}
        goalId={editingId}
      />
    </View>
  );
}
