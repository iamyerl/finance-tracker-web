import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useResolvedTheme, useThemeColors } from '../store/ThemeContext';

type Props = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  padding?: number;
  gradient?: [string, string];
  borderColor?: string;
};

export function Glass({
  children,
  style,
  radius = 28,
  padding = 20,
  gradient,
  borderColor,
}: Props) {
  const themeColors = useThemeColors();
  const resolved = useResolvedTheme();

  const defaultGradient: [string, string] =
    resolved === 'light'
      ? ['rgba(13,16,36,0.04)', 'rgba(13,16,36,0.015)']
      : ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)'];

  const colors: [string, string] = gradient ?? defaultGradient;
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[
        {
          borderRadius: radius,
          padding,
          borderWidth: 0.5,
          borderColor: borderColor ?? themeColors.glassBorder,
          shadowColor: '#000',
          shadowOpacity: resolved === 'light' ? 0.08 : 0.35,
          shadowRadius: 30,
          shadowOffset: { width: 0, height: 8 },
          elevation: 6,
        },
        style,
      ]}
    >
      <View>{children}</View>
    </LinearGradient>
  );
}
