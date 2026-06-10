// ─────────────────────────────────────────────
// Дизайн-токены приложения.
//
// `colors` экспортируется ради обратной совместимости c существующим кодом
// (берёт значения тёмной темы). Новый код должен брать тему через хук
// `useThemeColors()` (см. `src/hooks/useThemeColors.ts`), чтобы экраны
// автоматически переключались между темами.
// ─────────────────────────────────────────────

// Акценты — не зависят от темы.
const ACCENTS = {
  blue: '#4D8BFF',
  blueDeep: '#2E5FE0',
  blueLight: '#7BB0FF',
  purple: '#A38BFF',
  cyan: '#5BD0E8',
  pink: '#FF8FA3',
  amber: '#FFC773',
  green: '#9DE8B0',
} as const;

export type ThemeColors = {
  // backgrounds
  bgTop: string;
  bgBottom: string;
  // text
  text: string;
  textDim: string;
  textMuted: string;
  textFaint: string;
  textGhost: string; // плейсхолдеры
  textOnAccent: string;
  // surfaces / borders
  glassBorder: string;
  divider: string;
  surface: string;
  surfaceLite: string;
  surfaceStrong: string;
  surfaceHover: string;
  chipActive: string;
  // sheets / overlays
  sheetGradTop: string;
  sheetGradBottom: string;
  tabBarBg: string;
  backdrop: string;
  // ScreenBG SVG stops (top/bottom тёмная или светлая «дымка»)
  bgStopTop: string;
  bgStopBottom: string;
  // accents
  blue: string;
  blueDeep: string;
  blueLight: string;
  purple: string;
  cyan: string;
  pink: string;
  amber: string;
  green: string;
  // soft tinted backgrounds + readable foregrounds for badges/pills
  amberSoft: string;
  amberStrong: string;
  greenSoft: string;
  greenStrong: string;
  pinkSoft: string;
  pinkStrong: string;
  blueSoft: string;
};

export const DARK_COLORS: ThemeColors = {
  bgTop: '#060818',
  bgBottom: '#04060f',
  text: '#ffffff',
  textDim: 'rgba(255,255,255,0.55)',
  textMuted: 'rgba(255,255,255,0.5)',
  textFaint: 'rgba(255,255,255,0.4)',
  textGhost: 'rgba(255,255,255,0.3)',
  textOnAccent: '#ffffff',

  glassBorder: 'rgba(255,255,255,0.10)',
  divider: 'rgba(255,255,255,0.12)',
  surface: 'rgba(255,255,255,0.04)',
  surfaceLite: 'rgba(255,255,255,0.05)',
  surfaceStrong: 'rgba(255,255,255,0.06)',
  surfaceHover: 'rgba(255,255,255,0.08)',
  chipActive: 'rgba(255,255,255,0.22)',

  sheetGradTop: '#0c1228',
  sheetGradBottom: '#060a1a',
  tabBarBg: 'rgba(14,18,34,0.85)',
  backdrop: 'rgba(0,0,0,0.55)',

  bgStopTop: '#060818',
  bgStopBottom: '#04060f',

  ...ACCENTS,
  amberSoft: 'rgba(255,199,115,0.18)',
  amberStrong: '#FFC773',
  greenSoft: 'rgba(157,232,176,0.16)',
  greenStrong: '#9DE8B0',
  pinkSoft: 'rgba(255,143,163,0.16)',
  pinkStrong: '#FF8FA3',
  blueSoft: 'rgba(123,176,255,0.16)',
};

export const LIGHT_COLORS: ThemeColors = {
  bgTop: '#F5F7FB',
  bgBottom: '#FFFFFF',
  text: '#0d1024',
  textDim: 'rgba(13,16,36,0.65)',
  textMuted: 'rgba(13,16,36,0.55)',
  textFaint: 'rgba(13,16,36,0.42)',
  textGhost: 'rgba(13,16,36,0.32)',
  textOnAccent: '#ffffff',

  glassBorder: 'rgba(13,16,36,0.10)',
  divider: 'rgba(13,16,36,0.12)',
  surface: 'rgba(13,16,36,0.03)',
  surfaceLite: 'rgba(13,16,36,0.04)',
  surfaceStrong: 'rgba(13,16,36,0.06)',
  surfaceHover: 'rgba(13,16,36,0.08)',
  chipActive: 'rgba(13,16,36,0.18)',

  sheetGradTop: '#FFFFFF',
  sheetGradBottom: '#F2F4F9',
  tabBarBg: 'rgba(245,247,251,0.92)',
  backdrop: 'rgba(13,16,36,0.30)',

  bgStopTop: '#FFFFFF',
  bgStopBottom: '#EEF1F8',

  ...ACCENTS,
  amberSoft: 'rgba(180,83,9,0.10)',
  amberStrong: '#B45309',
  greenSoft: 'rgba(22,101,52,0.10)',
  greenStrong: '#166534',
  pinkSoft: 'rgba(190,18,60,0.10)',
  pinkStrong: '#BE123C',
  blueSoft: 'rgba(37,99,235,0.10)',
};

// Legacy alias: импорты `colors` сохраняют поведение тёмной темы.
// Новый код должен брать тему через `useThemeColors()`.
export const colors = DARK_COLORS;

export const fmt = (n: number): string => {
  const s = Math.abs(Math.round(n)).toLocaleString('en-US').replace(/,/g, ' ');
  return (n < 0 ? '-' : '') + s;
};

export const tg = (n: number): string => `${fmt(n)} ₸`;

export const fmtK = (n: number): string => {
  if (Math.abs(n) >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
};

export const tgK = (n: number): string => `${fmtK(n)} ₸`;

export const MONTHS_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];
export const MONTHS_RU_SHORT = [
  'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
  'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек',
];

export const monthKey = (d: Date = new Date()): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

export const monthLabel = (key: string): string => {
  const [y, m] = key.split('-').map(Number);
  return `${MONTHS_RU[m - 1]} ${y}`;
};

export const shiftMonthKey = (key: string, delta: number): string => {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return monthKey(d);
};

// ─────────────────────────────────────────────
// Конверт
// ─────────────────────────────────────────────
export type Envelope = {
  id: string;
  label: string;
  color: string;
  icon: string; // имя иконки из Ionicons
};

export const DEFAULT_ENVELOPES: Envelope[] = [
  { id: 'mortgage',      label: 'Ипотека',       color: ACCENTS.blue,      icon: 'home' },
  { id: 'groceries',     label: 'Продукты',      color: ACCENTS.blueLight, icon: 'cart' },
  { id: 'shopping',      label: 'Шоппинг',       color: ACCENTS.purple,    icon: 'bag-handle' },
  { id: 'transport',     label: 'Транспорт',     color: ACCENTS.cyan,      icon: 'car-sport' },
  { id: 'dining',        label: 'Кафе',          color: ACCENTS.pink,      icon: 'restaurant' },
  { id: 'utilities',     label: 'Коммуналка',    color: ACCENTS.amber,     icon: 'flash' },
  { id: 'entertainment', label: 'Развлечения',   color: ACCENTS.green,     icon: 'game-controller' },
];

export const COLOR_OPTIONS: string[] = [
  '#4D8BFF', '#7BB0FF', '#A38BFF', '#5BD0E8',
  '#FF8FA3', '#FFC773', '#9DE8B0', '#FFAA80',
  '#80E0FF', '#E080FF', '#FF7080', '#80FF80',
];

export const ICON_OPTIONS: { name: string; label: string }[] = [
  { name: 'home',             label: 'Дом' },
  { name: 'cart',             label: 'Продукты' },
  { name: 'bag-handle',       label: 'Шоппинг' },
  { name: 'car-sport',        label: 'Авто' },
  { name: 'bus',              label: 'Транспорт' },
  { name: 'restaurant',       label: 'Еда' },
  { name: 'cafe',             label: 'Кофе' },
  { name: 'flash',            label: 'Электричество' },
  { name: 'water',            label: 'Вода' },
  { name: 'wifi',             label: 'Интернет' },
  { name: 'phone-portrait',   label: 'Связь' },
  { name: 'card',             label: 'Кредит' },
  { name: 'wallet',           label: 'Кошелёк' },
  { name: 'cash',             label: 'Наличные' },
  { name: 'book',             label: 'Образование' },
  { name: 'school',           label: 'Школа' },
  { name: 'gift',             label: 'Подарки' },
  { name: 'airplane',         label: 'Путешествия' },
  { name: 'barbell',          label: 'Спорт' },
  { name: 'medkit',           label: 'Медицина' },
  { name: 'fitness',          label: 'Здоровье' },
  { name: 'paw',              label: 'Питомцы' },
  { name: 'people',           label: 'Семья' },
  { name: 'shirt',            label: 'Одежда' },
  { name: 'cut',              label: 'Услуги' },
  { name: 'construct',        label: 'Ремонт' },
  { name: 'film',             label: 'Кино' },
  { name: 'musical-notes',    label: 'Музыка' },
  { name: 'game-controller',  label: 'Игры' },
  { name: 'tv',               label: 'ТВ' },
  { name: 'briefcase',        label: 'Работа' },
  { name: 'sparkles',         label: 'Красота' },
  { name: 'person',           label: 'Человек' },
  { name: 'star',             label: 'Звезда' },
  { name: 'heart',            label: 'Сердце' },
  { name: 'trophy',           label: 'Награда' },
  { name: 'rocket',           label: 'Ракета' },
];

export const newEnvelopeId = (): string =>
  `env_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
