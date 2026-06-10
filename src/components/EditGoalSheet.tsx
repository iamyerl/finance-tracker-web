import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sheet } from './Sheet';
import { EnvelopeIcon, CheckIcon, TrashIcon } from './Icons';
import { COLOR_OPTIONS, ICON_OPTIONS, tg } from '../theme';
import type { ThemeColors } from '../theme';
import { useThemeColors } from '../store/ThemeContext';
import { useBudget, Goal } from '../store/BudgetContext';

type Props = {
  visible: boolean;
  onClose: () => void;
  goalId?: string | null; // null/undefined → создание; иначе редактирование
};

const onlyDigits = (s: string) => s.replace(/[^\d]/g, '');

export function EditGoalSheet({ visible, onClose, goalId }: Props) {
  const colors = useThemeColors();
  const label1Style = mkLabel1Style(colors);
  const inputWrap = mkInputWrap(colors);
  const { goals, addGoal, updateGoal, removeGoal } = useBudget();
  const editing = goalId ? goals.find((g) => g.id === goalId) ?? null : null;

  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [saved, setSaved] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [icon, setIcon] = useState(ICON_OPTIONS[0].name);

  useEffect(() => {
    if (!visible) return;
    if (editing) {
      setName(editing.name);
      setTarget(String(editing.target));
      setSaved(String(editing.saved));
      setColor(editing.color);
      setIcon(editing.icon);
    } else {
      setName('');
      setTarget('');
      setSaved('');
      setColor(COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)]);
      setIcon(ICON_OPTIONS[0].name);
    }
  }, [visible, editing]);

  const targetN = Number(target || 0);
  const savedN = Number(saved || 0);
  const canSave = name.trim().length > 0 && targetN > 0;

  const onSave = () => {
    if (!canSave) return;
    const data: Omit<Goal, 'id'> = {
      name: name.trim(),
      target: targetN,
      saved: savedN,
      color,
      icon,
    };
    if (editing) {
      updateGoal(editing.id, data);
    } else {
      addGoal(data);
    }
    onClose();
  };

  const onDelete = () => {
    if (!editing) return;
    Alert.alert(
      'Удалить цель?',
      `«${editing.name}» будет удалена без возможности восстановления.`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            removeGoal(editing.id);
            onClose();
          },
        },
      ]
    );
  };

  const remaining = targetN - savedN;
  const pct = targetN > 0 ? Math.min(100, Math.round((savedN / targetN) * 100)) : 0;

  return (
    <Sheet visible={visible} onClose={onClose} height="92%">
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text, letterSpacing: -0.4 }}>
          {editing ? 'Редактировать цель' : 'Новая цель'}
        </Text>

        {/* Превью */}
        <View
          style={{
            marginTop: 18,
            padding: 16,
            borderRadius: 18,
            backgroundColor: colors.surface,
            borderWidth: 0.5,
            borderColor: colors.surfaceHover,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: 13,
                backgroundColor: color + '26',
                borderWidth: 0.5,
                borderColor: color + '55',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <EnvelopeIcon icon={icon} color={color} size={24} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }} numberOfLines={1}>
                {name.trim() || 'Название цели'}
              </Text>
              {targetN > 0 && (
                <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                  {tg(savedN)} из {tg(targetN)} · {pct}%
                </Text>
              )}
            </View>
          </View>
          {targetN > 0 && (
            <View
              style={{
                marginTop: 12,
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
                  backgroundColor: color,
                }}
              />
            </View>
          )}
        </View>

        {/* Название */}
        <Text style={[label1Style, { marginTop: 22 }]}>Название</Text>
        <View style={inputWrap}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Например: Отпуск, Свадьба, MacBook"
            placeholderTextColor={colors.textGhost}
            autoFocus={!editing}
            style={{ flex: 1, color: colors.text, fontSize: 16, padding: 0 }}
          />
        </View>

        {/* Целевая сумма */}
        <Text style={[label1Style, { marginTop: 18 }]}>Целевая сумма</Text>
        <View style={inputWrap}>
          <TextInput
            value={target}
            onChangeText={(t) => setTarget(onlyDigits(t))}
            placeholder="1 500 000"
            placeholderTextColor={colors.textGhost}
            keyboardType="number-pad"
            style={{ flex: 1, color: colors.text, fontSize: 22, fontWeight: '700', letterSpacing: -0.3, padding: 0 }}
          />
          <Text style={{ color: colors.textDim, fontSize: 18, fontWeight: '600', marginLeft: 6 }}>₸</Text>
        </View>

        {/* Уже накоплено */}
        <Text style={[label1Style, { marginTop: 18 }]}>Уже накоплено</Text>
        <View style={inputWrap}>
          <TextInput
            value={saved}
            onChangeText={(t) => setSaved(onlyDigits(t))}
            placeholder="0"
            placeholderTextColor={colors.textGhost}
            keyboardType="number-pad"
            style={{ flex: 1, color: colors.text, fontSize: 18, fontWeight: '600', letterSpacing: -0.2, padding: 0 }}
          />
          <Text style={{ color: colors.textDim, fontSize: 16, fontWeight: '600', marginLeft: 6 }}>₸</Text>
        </View>
        {targetN > 0 && remaining > 0 && (
          <Text style={{ marginTop: 6, fontSize: 12, color: colors.textDim }}>
            До цели осталось накопить <Text style={{ color: colors.text, fontWeight: '600' }}>{tg(remaining)}</Text>
          </Text>
        )}

        {/* Цвет */}
        <Text style={[label1Style, { marginTop: 22 }]}>Цвет</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 }}>
          {COLOR_OPTIONS.map((c) => {
            const active = color === c;
            return (
              <Pressable
                key={c}
                onPress={() => setColor(c)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: c,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: active ? 2 : 0,
                  borderColor: '#fff',
                }}
              >
                {active && <CheckIcon color="#fff" size={16} />}
              </Pressable>
            );
          })}
        </View>

        {/* Иконка */}
        <Text style={[label1Style, { marginTop: 22 }]}>Иконка</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
          {ICON_OPTIONS.map((opt) => {
            const active = icon === opt.name;
            return (
              <Pressable
                key={opt.name}
                onPress={() => setIcon(opt.name)}
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 14,
                  backgroundColor: active ? color + '33' : colors.surfaceLite,
                  borderWidth: 0.5,
                  borderColor: active ? color : colors.glassBorder,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <EnvelopeIcon
                  icon={opt.name}
                  color={active ? color : colors.textDim}
                  size={24}
                />
              </Pressable>
            );
          })}
        </View>

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
              {editing ? 'Сохранить' : 'Создать цель'}
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
            <Text style={{ color: colors.pink, fontSize: 15, fontWeight: '600' }}>Удалить цель</Text>
          </Pressable>
        )}

        <Pressable
          onPress={onClose}
          style={{ marginTop: 10, alignItems: 'center', paddingVertical: 12 }}
        >
          <Text style={{ color: colors.textDim, fontSize: 14, fontWeight: '500' }}>Отмена</Text>
        </Pressable>
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
