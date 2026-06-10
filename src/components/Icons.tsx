import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

// ─────────────────────────────────────────────
// Иконка конверта (Ionicons-обёртка с фоллбэком)
// ─────────────────────────────────────────────
export function EnvelopeIcon({
  icon,
  color,
  size = 20,
}: {
  icon: string;
  color: string;
  size?: number;
}) {
  return <Ionicons name={icon as any} size={size} color={color} />;
}

// ─────────────────────────────────────────────
// Иконки целей в накоплениях
// ─────────────────────────────────────────────
export type GoalIconName = 'umbrella' | 'plane' | 'laptop' | 'ring';

export const GoalIcon: Record<GoalIconName, (c: string) => React.ReactElement> = {
  umbrella: (c) => (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path d="M2 12 a10 10 0 0120 0 H2z" fill={c} />
      <Path d="M12 12 V20 a2 2 0 003 1" stroke={c} strokeWidth={2} fill="none" strokeLinecap="round" />
    </Svg>
  ),
  plane: (c) => (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path d="M2 16 L22 9 L20 11 L13 13 L9 19 L7 18 L8 14 L4 13 L2 16z" fill={c} />
    </Svg>
  ),
  laptop: (c) => (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Rect x={4} y={5} width={16} height={11} rx={1.5} stroke={c} strokeWidth={2} fill="none" />
      <Path d="M2 19 H22" stroke={c} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  ),
  ring: (c) => (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path d="M8 4 L12 8 L16 4 H8z" fill={c} />
      <Circle cx={12} cy={15} r={6} stroke={c} strokeWidth={2} fill="none" />
    </Svg>
  ),
};

// ─────────────────────────────────────────────
// Утилитарные иконки
// ─────────────────────────────────────────────
export const PlusIcon = ({ size = 16, color = '#fff', strokeWidth = 2.5 }: { size?: number; color?: string; strokeWidth?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 5v14 M5 12h14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const ChevronLeft = ({ color = 'rgba(255,255,255,0.4)' }: { color?: string }) => (
  <Svg width={8} height={14} viewBox="0 0 8 14"><Path d="M7 1 L7 1 L1 7 L7 13" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" /></Svg>
);
export const ChevronRight = ({ color = 'rgba(255,255,255,0.4)' }: { color?: string }) => (
  <Svg width={8} height={14} viewBox="0 0 8 14"><Path d="M1 1 L7 7 L1 13" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" /></Svg>
);

export const TriangleUp = ({ color = '#FF8FA3', size = 10 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 12 12"><Path d="M6 2 L10 8 L2 8z" fill={color} /></Svg>
);
export const TriangleDown = ({ color = '#9DE8B0', size = 10 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 12 12"><Path d="M6 10 L2 4 L10 4z" fill={color} /></Svg>
);

export const ArrowRight = ({ color = 'rgba(255,255,255,0.6)', size = 14 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M5 12 H19 M13 6 L19 12 L13 18" stroke={color} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const StarIcon = ({ color = '#7BB0FF', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 2 L14 9 L21 10 L16 14 L18 21 L12 17 L6 21 L8 14 L3 10 L10 9z" fill={color} />
  </Svg>
);

export const PencilIcon = ({ color = 'rgba(255,255,255,0.6)', size = 14 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M3 21 L8 19 L20 7 L17 4 L5 16 L3 21z"
      stroke={color}
      strokeWidth={2}
      fill="none"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </Svg>
);

export const TrashIcon = ({ color = '#FF8FA3', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M4 7 H20 M9 7 V4 H15 V7 M6 7 L7 20 a1 1 0 001 1 H16 a1 1 0 001 -1 L18 7"
      stroke={color}
      strokeWidth={2}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CheckIcon = ({ color = '#fff', size = 14 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M5 12 L10 17 L19 7" stroke={color} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─────────────────────────────────────────────
// Иконки для экрана Профиля и preferences
// ─────────────────────────────────────────────
export const PersonIcon = ({ color = '#fff', size = 22 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={2} fill="none" />
    <Path d="M4 21 c0-4 3.6-7 8-7 s8 3 8 7" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />
  </Svg>
);

export const MoonIcon = ({ color = '#fff', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M20 14 a8 8 0 11-10-10 a6.5 6.5 0 0010 10z"
      fill={color}
    />
  </Svg>
);

export const SunIcon = ({ color = '#FFC773', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={4} fill={color} />
    <Path
      d="M12 2 V5 M12 19 V22 M2 12 H5 M19 12 H22 M4.6 4.6 L6.7 6.7 M17.3 17.3 L19.4 19.4 M19.4 4.6 L17.3 6.7 M6.7 17.3 L4.6 19.4"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

export const DownloadIcon = ({ color = '#fff', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 4 V16 M6 11 L12 17 L18 11 M4 20 H20"
      stroke={color}
      strokeWidth={2}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const UploadIcon = ({ color = '#fff', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 20 V8 M6 13 L12 7 L18 13 M4 4 H20"
      stroke={color}
      strokeWidth={2}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const BellIcon = ({ color = '#fff', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M6 16 V11 a6 6 0 0112 0 V16 L20 18 H4 L6 16z"
      stroke={color}
      strokeWidth={2}
      fill="none"
      strokeLinejoin="round"
    />
    <Path d="M10 21 a2 2 0 004 0" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />
  </Svg>
);

export const InfoIcon = ({ color = '#fff', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} fill="none" />
    <Path d="M12 11 V17 M12 7.2 V8" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
  </Svg>
);

export const RefreshIcon = ({ color = '#fff', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M3 12 a9 9 0 0115-6.7 L21 8 M21 4 V8 H17 M21 12 a9 9 0 01-15 6.7 L3 16 M3 20 V16 H7"
      stroke={color}
      strokeWidth={2}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ChevronRightThin = ({ color = 'rgba(255,255,255,0.4)', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M9 6 L15 12 L9 18" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

