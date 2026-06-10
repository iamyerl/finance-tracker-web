/* Веб-шим expo-linear-gradient: CSS linear-gradient() на div-е с layout-моделью View. */
import React from 'react';
import { View, type StyleProp, type ViewStyle } from './react-native';

type Point = { x: number; y: number };

export type LinearGradientProps = {
  colors: readonly string[];
  start?: Point;
  end?: Point;
  locations?: readonly number[];
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  [key: string]: any;
};

export function LinearGradient(
  props: LinearGradientProps & { ref?: React.Ref<HTMLDivElement> }
) {
  const { colors, start, end, locations, style, children, ref, ...rest } = props;
    const s = start ?? { x: 0.5, y: 0 };
    const e = end ?? { x: 0.5, y: 1 };
    // CSS-угол: 0deg = вверх, по часовой; экранная ось Y направлена вниз.
    const angle = 90 + (Math.atan2(e.y - s.y, e.x - s.x) * 180) / Math.PI;
    const stops = colors
      .map((c, i) => (locations && locations[i] != null ? `${c} ${locations[i] * 100}%` : c))
      .join(', ');
    return (
      <View
        ref={ref}
        style={[style as any, { backgroundImage: `linear-gradient(${angle}deg, ${stops})` }]}
        {...rest}
      >
        {children}
      </View>
    );
}
