import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useResolvedTheme, useThemeColors } from '../store/ThemeContext';

type TabId = 'Budget' | 'Analytics' | 'Savings' | 'Mortgage' | 'Profile';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const LABELS: Record<TabId, string> = {
  Budget: 'Бюджет',
  Analytics: 'Аналитика',
  Savings: 'Накопления',
  Mortgage: 'Ипотека',
  Profile: 'Профиль',
};

// ─────────────────────────────────────────────
// Иконки таб-бара: filled при активном, outlined при неактивном
// (промышленный паттерн iOS / Material — даёт ощутимый visual cue
// при переключении и читаемее, чем самописные SVG из прошлой версии).
// ─────────────────────────────────────────────
const ICONS_FILLED: Record<TabId, IoniconName> = {
  Budget: 'wallet',
  Analytics: 'pie-chart',
  Savings: 'trophy',
  Mortgage: 'business',
  Profile: 'person-circle',
};

const ICONS_OUTLINE: Record<TabId, IoniconName> = {
  Budget: 'wallet-outline',
  Analytics: 'pie-chart-outline',
  Savings: 'trophy-outline',
  Mortgage: 'business-outline',
  Profile: 'person-circle-outline',
};

export function VaultTabBar({ state, navigation }: BottomTabBarProps) {
  const colors = useThemeColors();
  const resolved = useResolvedTheme();
  const inactiveTint = colors.textDim;
  const activeTint = colors.textOnAccent;

  return (
    <View
      style={{
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 24,
        borderRadius: 32,
        paddingVertical: 10,
        paddingHorizontal: 6,
        backgroundColor: colors.tabBarBg,
        borderWidth: 0.5,
        borderColor: colors.glassBorder,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: resolved === 'light' ? 0.12 : 0.4,
        shadowRadius: 30,
        shadowOffset: { width: 0, height: 12 },
        elevation: 12,
      }}
    >
      {state.routes.map((route, idx) => {
        // Profile открывается через шестерёнку в шапке Бюджета — таб скрываем.
        if (route.name === 'Profile') return null;
        const isActive = state.index === idx;
        const name = route.name as TabId;
        const iconName = isActive ? ICONS_FILLED[name] : ICONS_OUTLINE[name];
        const tint = isActive ? activeTint : inactiveTint;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isActive && !event.defaultPrevented) navigation.navigate(route.name as never);
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={LABELS[name]}
            accessibilityState={{ selected: isActive }}
            style={{ flex: 1, alignItems: 'center' }}
            android_ripple={{ color: colors.surfaceHover, borderless: true }}
          >
            {isActive ? (
              <LinearGradient
                colors={[colors.blue, colors.blueDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{
                  alignItems: 'center',
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 22,
                  shadowColor: '#3C6EFF',
                  shadowOpacity: 0.45,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: 6 },
                  elevation: 6,
                }}
              >
                <Ionicons name={iconName} size={22} color={tint} />
                <Text style={{ fontSize: 10, fontWeight: '600', color: tint, marginTop: 3, letterSpacing: -0.1 }}>
                  {LABELS[name]}
                </Text>
              </LinearGradient>
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 6, paddingHorizontal: 10 }}>
                <Ionicons name={iconName} size={22} color={tint} />
                <Text style={{ fontSize: 10, fontWeight: '600', color: tint, marginTop: 3, letterSpacing: -0.1 }}>
                  {LABELS[name]}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
