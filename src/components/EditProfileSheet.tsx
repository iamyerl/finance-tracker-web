// ─────────────────────────────────────────────
// Модалка кастомизации профиля.
// Поля: имя, email, иконка аватара (Ionicons), цвет аватара.
// Слайдается как InlineSheet (поддерживает клавиатуру).
// ─────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { InlineSheet } from './InlineSheet';
import { CheckIcon } from './Icons';
import { IconPickerGrid, ColorPickerRow } from './IconPickerGrid';
import { COLOR_OPTIONS, ICON_OPTIONS } from '../theme';
import type { ThemeColors } from '../theme';
import { useThemeColors } from '../store/ThemeContext';
import { useProfile } from '../store/ProfileContext';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function EditProfileSheet({ visible, onClose }: Props) {
  const colors = useThemeColors();
  const { profile, setProfile } = useProfile();

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [icon, setIcon] = useState(profile.avatarIcon);
  const [color, setColor] = useState(profile.avatarColor);

  useEffect(() => {
    if (visible) {
      setName(profile.name);
      setEmail(profile.email);
      setIcon(profile.avatarIcon);
      setColor(profile.avatarColor);
    }
  }, [visible, profile]);

  const canSave = name.trim().length > 0;

  const onSave = () => {
    if (!canSave) return;
    setProfile({
      name: name.trim(),
      email: email.trim(),
      avatarIcon: icon,
      avatarColor: color,
    });
    onClose();
  };

  const labelStyle = mkLabel(colors);
  const inputStyle = mkInput(colors);

  return (
    <InlineSheet visible={visible} onClose={onClose} height="92%">
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text, letterSpacing: -0.4 }}>
          Изменить профиль
        </Text>
        <Text style={{ fontSize: 13, color: colors.textDim, marginTop: 4 }}>
          Обновите имя, email и оформление аватара
        </Text>

        {/* Превью аватара */}
        <View style={{ alignItems: 'center', marginTop: 18 }}>
          <View
            style={{
              width: 84,
              height: 84,
              borderRadius: 42,
              backgroundColor: color,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: color,
              shadowOpacity: 0.3,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 6 },
              elevation: 6,
            }}
          >
            <Ionicons
              name={icon as React.ComponentProps<typeof Ionicons>['name']}
              size={36}
              color="#fff"
            />
          </View>
          <Text style={{ marginTop: 10, fontSize: 13, color: colors.textDim }}>
            {name.trim() || 'Без имени'}
          </Text>
        </View>

        {/* Имя */}
        <Text style={[labelStyle, { marginTop: 22 }]}>Имя</Text>
        <View style={inputStyle}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Иван Иванов"
            placeholderTextColor={colors.textGhost}
            style={{ flex: 1, color: colors.text, fontSize: 16, fontWeight: '600', padding: 0 }}
          />
        </View>

        {/* Email */}
        <Text style={[labelStyle, { marginTop: 18 }]}>Email</Text>
        <View style={inputStyle}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.textGhost}
            keyboardType="email-address"
            autoCapitalize="none"
            style={{ flex: 1, color: colors.text, fontSize: 16, fontWeight: '500', padding: 0 }}
          />
        </View>

        {/* Иконка */}
        <Text style={[labelStyle, { marginTop: 22 }]}>Иконка</Text>
        <View style={{ marginTop: 10 }}>
          <IconPickerGrid
            icons={ICON_OPTIONS.map((o) => o.name)}
            selectedIcon={icon}
            bgColor={color}
            onChange={setIcon}
          />
        </View>

        {/* Цвет */}
        <Text style={[labelStyle, { marginTop: 18 }]}>Цвет</Text>
        <View style={{ marginTop: 10 }}>
          <ColorPickerRow
            colors={COLOR_OPTIONS}
            selected={color}
            onChange={setColor}
          />
        </View>

        {/* Save / Cancel */}
        <Pressable onPress={onSave} disabled={!canSave} style={{ marginTop: 22, opacity: canSave ? 1 : 0.5 }}>
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
            }}
          >
            <CheckIcon color="#fff" size={16} />
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff', letterSpacing: -0.2 }}>
              Сохранить
            </Text>
          </LinearGradient>
        </Pressable>
        <Pressable onPress={onClose} style={{ marginTop: 8, alignItems: 'center', paddingVertical: 12 }}>
          <Text style={{ color: colors.textDim, fontSize: 14, fontWeight: '500' }}>Отмена</Text>
        </Pressable>
      </View>
    </InlineSheet>
  );
}

const mkLabel = (colors: ThemeColors) =>
  ({
    fontSize: 11,
    color: colors.textDim,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.4,
  });

const mkInput = (colors: ThemeColors) =>
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
