import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { InlineSheet } from './InlineSheet';
import { EnvelopeIcon, CheckIcon, TrashIcon } from './Icons';
import { COLOR_OPTIONS, ICON_OPTIONS, Envelope } from '../theme';
import type { ThemeColors } from '../theme';
import { useThemeColors } from '../store/ThemeContext';
import { useBudget } from '../store/BudgetContext';

type Props = {
  visible: boolean;
  onClose: () => void;
  envelopeId?: string | null; // null/undefined → создание; иначе редактирование
};

export function EditEnvelopeSheet({ visible, onClose, envelopeId }: Props) {
  const colors = useThemeColors();
  const label1Style = mkLabel1Style(colors);
  const inputWrap = mkInputWrap(colors);
  const { envelopes, addEnvelope, updateEnvelope, removeEnvelope } = useBudget();
  const editing = envelopeId ? envelopes.find((e) => e.id === envelopeId) ?? null : null;

  const [label, setLabel] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [icon, setIcon] = useState(ICON_OPTIONS[0].name);

  useEffect(() => {
    if (!visible) return;
    if (editing) {
      setLabel(editing.label);
      setColor(editing.color);
      setIcon(editing.icon);
    } else {
      setLabel('');
      setColor(COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)]);
      setIcon(ICON_OPTIONS[0].name);
    }
  }, [visible, editing]);

  const canSave = label.trim().length > 0;

  const onSave = () => {
    if (!canSave) return;
    const data: Omit<Envelope, 'id'> = {
      label: label.trim(),
      color,
      icon,
    };
    if (editing) {
      updateEnvelope(editing.id, data);
    } else {
      addEnvelope(data);
    }
    onClose();
  };

  const onDelete = () => {
    if (!editing) return;
    Alert.alert(
      'Удалить конверт?',
      `«${editing.label}» и все расходы по нему будут удалены без возможности восстановления.`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            removeEnvelope(editing.id);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <InlineSheet visible={visible} onClose={onClose} height="85%">
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text, letterSpacing: -0.4 }}>
          {editing ? 'Редактировать конверт' : 'Новый конверт'}
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
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
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
          <Text
            style={{ flex: 1, fontSize: 17, fontWeight: '600', color: colors.text }}
            numberOfLines={1}
          >
            {label.trim() || 'Название'}
          </Text>
        </View>

        {/* Название */}
        <Text style={[label1Style, { marginTop: 22 }]}>Название</Text>
        <View style={inputWrap}>
          <TextInput
            value={label}
            onChangeText={setLabel}
            placeholder="Например: Wi-Fi, Кредит, Спортзал"
            placeholderTextColor={colors.textGhost}
            autoFocus={!editing}
            style={{ flex: 1, color: colors.text, fontSize: 16, padding: 0 }}
          />
        </View>

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
              {editing ? 'Сохранить' : 'Создать конверт'}
            </Text>
          </LinearGradient>
        </Pressable>

        {/* Delete (только в режиме редактирования) */}
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
              Удалить конверт
            </Text>
          </Pressable>
        )}

        <Pressable onPress={onClose} style={{ marginTop: 10, alignItems: 'center', paddingVertical: 12 }}>
          <Text style={{ color: colors.textDim, fontSize: 14, fontWeight: '500' }}>Отмена</Text>
        </Pressable>
      </View>
    </InlineSheet>
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
