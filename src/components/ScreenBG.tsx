import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect, LinearGradient } from 'react-native-svg';
import { useResolvedTheme, useThemeColors } from '../store/ThemeContext';

export type BGVariant = 'home' | 'analytics' | 'savings' | 'mortgage' | 'profile';

const VARIANTS: Record<
  BGVariant,
  { cx: string; cy: string; rx: string; ry: string; opacity: number }
> = {
  home:      { cx: '70%', cy: '0%',   rx: '120%', ry: '70%', opacity: 0.55 },
  analytics: { cx: '20%', cy: '100%', rx: '100%', ry: '60%', opacity: 0.35 },
  savings:   { cx: '80%', cy: '100%', rx: '110%', ry: '60%', opacity: 0.40 },
  mortgage:  { cx: '50%', cy: '-10%', rx: '130%', ry: '55%', opacity: 0.42 },
  profile:   { cx: '30%', cy: '0%',   rx: '110%', ry: '60%', opacity: 0.45 },
};

export function ScreenBG({ variant = 'home' }: { variant?: BGVariant }) {
  const v = VARIANTS[variant];
  const colors = useThemeColors();
  const resolved = useResolvedTheme();

  // На светлой теме «дымка» бледнее, на тёмной — насыщенный синий glow.
  const glowOpacityScale = resolved === 'light' ? 0.45 : 1;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.bgStopTop} />
            <Stop offset="100%" stopColor={colors.bgStopBottom} />
          </LinearGradient>
          <RadialGradient id="glow" cx={v.cx} cy={v.cy} rx={v.rx} ry={v.ry} fx={v.cx} fy={v.cy}>
            <Stop offset="0%" stopColor="rgb(80,130,255)" stopOpacity={v.opacity * glowOpacityScale} />
            <Stop offset="35%" stopColor="rgb(40,70,160)" stopOpacity={v.opacity * 0.45 * glowOpacityScale} />
            <Stop offset="65%" stopColor="rgb(8,12,28)" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#bg)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#glow)" />
      </Svg>
    </View>
  );
}
