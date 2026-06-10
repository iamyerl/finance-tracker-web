import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export function VaultMark({ size = 18, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Svg width={size + 4} height={size + 4} viewBox="0 0 24 24">
        <Path d="M4 5.5 L12 19 L20 5.5" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Path d="M8.5 5.5 L12 11 L15.5 5.5" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.55} />
      </Svg>
      <Text style={{ fontWeight: '600', fontSize: size, color, letterSpacing: -0.3 }}>Vault</Text>
    </View>
  );
}
