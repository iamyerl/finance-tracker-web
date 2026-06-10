/* ──────────────────────────────────────────────────────────────
 * Веб-шим react-native на чистом React (без зависимостей).
 * Реализует ровно то подмножество API, которое использует приложение:
 * View, Text, Pressable, ScrollView, TextInput, Modal, StyleSheet,
 * Animated (Value/timing/spring/parallel/interpolate), Easing,
 * PanResponder, Keyboard, Platform, Alert, Share, useColorScheme.
 * ────────────────────────────────────────────────────────────── */
import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

// ─── Типы стилей (намеренно либеральные: код приложения пишет RN-нотацию) ───
export type RNRawStyle = { [key: string]: any };
export type ViewStyle = RNRawStyle;
export type TextStyle = RNRawStyle;
export type ImageStyle = RNRawStyle;
export type StyleProp<T> = T | ReadonlyArray<StyleProp<T>> | null | undefined | false;

// ─── Конвертация RN-стилей в CSS ───

const UNITLESS = new Set([
  'flex',
  'flexGrow',
  'flexShrink',
  'opacity',
  'zIndex',
  'fontWeight',
  'aspectRatio',
  'elevation',
  'shadowOpacity',
]);

const EXPAND: Record<string, [string, string]> = {
  paddingHorizontal: ['paddingLeft', 'paddingRight'],
  paddingVertical: ['paddingTop', 'paddingBottom'],
  marginHorizontal: ['marginLeft', 'marginRight'],
  marginVertical: ['marginTop', 'marginBottom'],
};

function flattenStyle(style: any, out: RNRawStyle = {}): RNRawStyle {
  if (!style) return out;
  if (Array.isArray(style)) {
    for (const s of style) flattenStyle(s, out);
    return out;
  }
  Object.assign(out, style);
  return out;
}

function parseColor(c: string): [number, number, number, number] | null {
  if (typeof c !== 'string') return null;
  const s = c.trim();
  if (s.startsWith('#')) {
    const hex = s.slice(1);
    if (hex.length === 3)
      return [
        parseInt(hex[0] + hex[0], 16),
        parseInt(hex[1] + hex[1], 16),
        parseInt(hex[2] + hex[2], 16),
        1,
      ];
    if (hex.length === 6 || hex.length === 8)
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
        hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
      ];
    return null;
  }
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const parts = m[1].split(',').map((p) => parseFloat(p));
    return [parts[0], parts[1], parts[2], parts.length > 3 ? parts[3] : 1];
  }
  return null;
}

function rgba(c: string, extraAlpha = 1): string {
  const p = parseColor(c);
  if (!p) return c;
  return `rgba(${p[0]},${p[1]},${p[2]},${(p[3] * extraAlpha).toFixed(3)})`;
}

function px(v: any, key?: string): any {
  if (typeof v === 'number' && (!key || !UNITLESS.has(key))) return `${v}px`;
  return v;
}

function transformToCss(arr: any[]): string {
  return arr
    .map((t) => {
      const k = Object.keys(t)[0];
      const v = t[k];
      const node = v instanceof AnimatedNode ? v.__getValue() : v;
      if (typeof node === 'number') {
        if (k.startsWith('scale')) return `${k}(${node})`;
        if (k.startsWith('rotate') || k.includes('skew')) return `${k}(${node}deg)`;
        return `${k}(${node}px)`;
      }
      return `${k}(${node})`;
    })
    .join(' ');
}

export function rnToCss(style: any): React.CSSProperties {
  const flat = flattenStyle(style);
  const css: RNRawStyle = {};
  let shadowColor = '#000';
  let shadowOpacity: number | null = null;
  let shadowRadius = 0;
  let shadowOffset = { width: 0, height: 0 };
  let hasShadow = false;

  for (const key of Object.keys(flat)) {
    let v = flat[key];
    if (v == null) continue;
    if (v instanceof AnimatedNode) v = v.__getValue();

    switch (key) {
      case 'shadowColor':
        shadowColor = v;
        hasShadow = true;
        continue;
      case 'shadowOpacity':
        shadowOpacity = v;
        hasShadow = true;
        continue;
      case 'shadowRadius':
        shadowRadius = v;
        hasShadow = true;
        continue;
      case 'shadowOffset':
        shadowOffset = v;
        hasShadow = true;
        continue;
      case 'elevation':
        continue; // тень даёт boxShadow из shadow*-свойств
      case 'transform':
        if (Array.isArray(v)) css.transform = transformToCss(v);
        else css.transform = v;
        continue;
      case 'textAlignVertical':
      case 'includeFontPadding':
        continue;
      default:
        break;
    }

    const expand = EXPAND[key];
    if (expand) {
      // конкретное свойство (paddingLeft и т.п.) всегда приоритетнее
      if (!(expand[0] in flat)) css[expand[0]] = px(v);
      if (!(expand[1] in flat)) css[expand[1]] = px(v);
      continue;
    }

    css[key] = px(v, key);
  }

  if (hasShadow && shadowOpacity !== 0) {
    const blur = px(shadowRadius) ?? 0;
    css.boxShadow = `${px(shadowOffset?.width ?? 0)} ${px(shadowOffset?.height ?? 0)} ${blur} ${rgba(
      shadowColor,
      shadowOpacity ?? 1
    )}`;
  }

  return css as React.CSSProperties;
}

// ─── StyleSheet ───

export const StyleSheet = {
  create<T extends Record<string, RNRawStyle>>(styles: T): T {
    return styles;
  },
  flatten: flattenStyle,
  hairlineWidth: 0.5,
  absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 } as RNRawStyle,
  absoluteFillObject: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  } as RNRawStyle,
};

// ─── Базовые CSS-дефолты, повторяющие layout-модель RN ───

const viewBase: React.CSSProperties = {
  alignItems: 'stretch',
  borderWidth: 0,
  borderStyle: 'solid',
  borderColor: 'black',
  boxSizing: 'border-box',
  display: 'flex',
  flexBasis: 'auto',
  flexDirection: 'column',
  flexShrink: 0,
  listStyle: 'none',
  margin: 0,
  minHeight: 0,
  minWidth: 0,
  padding: 0,
  position: 'relative',
  textDecoration: 'none',
};

const textBase: React.CSSProperties = {
  borderWidth: 0,
  borderStyle: 'solid',
  boxSizing: 'border-box',
  color: 'inherit',
  display: 'block',
  fontFamily: 'inherit',
  fontSize: 14,
  margin: 0,
  padding: 0,
  whiteSpace: 'pre-wrap',
  overflowWrap: 'break-word',
};

function pointerEventsStyle(pe?: string): React.CSSProperties {
  if (pe === 'none') return { pointerEvents: 'none' };
  return {};
}

function accessibilityProps(props: any): Record<string, any> {
  const out: Record<string, any> = {};
  const roleMap: Record<string, string> = {
    button: 'button',
    switch: 'switch',
    alert: 'alert',
    header: 'heading',
    link: 'link',
    image: 'img',
    text: 'paragraph',
  };
  if (props.accessibilityRole) out.role = roleMap[props.accessibilityRole] ?? props.accessibilityRole;
  if (props.accessibilityLabel) out['aria-label'] = props.accessibilityLabel;
  if (props.accessibilityLiveRegion) out['aria-live'] = props.accessibilityLiveRegion;
  const st = props.accessibilityState;
  if (st) {
    if (st.checked !== undefined) out['aria-checked'] = st.checked;
    if (st.disabled !== undefined) out['aria-disabled'] = st.disabled;
    if (st.selected !== undefined) out['aria-selected'] = st.selected;
  }
  if (props.testID) out['data-testid'] = props.testID;
  return out;
}

// ─── View ───

export type ViewProps = {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
  [key: string]: any;
};

export function View(props: ViewProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { style, children, pointerEvents, onPointerDown, ref, ...rest } = props;
  const css: React.CSSProperties = {
    ...viewBase,
    ...rnToCss(style),
    ...pointerEventsStyle(pointerEvents),
    // элемент с pan-обработчиком не должен скроллить страницу при драге
    ...(onPointerDown ? { touchAction: 'none' } : null),
  };
  return (
    <div
      ref={ref}
      style={css}
      onPointerDown={onPointerDown}
      className={pointerEvents === 'box-none' ? 'rn-pointer-box-none' : undefined}
      {...accessibilityProps(rest)}
    >
      {children}
    </div>
  );
}

// ─── Text ───

const TextAncestor = createContext(false);

export type TextProps = {
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
  numberOfLines?: number;
  [key: string]: any;
};

export function Text(props: TextProps & { ref?: React.Ref<HTMLElement> }) {
  const { style, children, numberOfLines, onPress, ref, ...rest } = props;
  const nested = useContext(TextAncestor);
  let css: React.CSSProperties = {
    ...textBase,
    ...(nested ? { display: 'inline', fontSize: 'inherit', fontWeight: 'inherit' } : null),
    ...rnToCss(style),
  };
  if (numberOfLines === 1) {
    css = {
      ...css,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      wordWrap: 'normal',
    };
  } else if (numberOfLines && numberOfLines > 1) {
    css = {
      ...css,
      display: '-webkit-box',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: numberOfLines,
      overflow: 'hidden',
    };
  }
  const Tag: any = nested ? 'span' : 'div';
  return (
    <TextAncestor.Provider value={true}>
      <Tag ref={ref} style={css} onClick={onPress} {...accessibilityProps(rest)}>
        {children}
      </Tag>
    </TextAncestor.Provider>
  );
}

// ─── Pressable ───

export type PressableStateCallbackType = { pressed: boolean };
export type PressableProps = {
  style?:
    | StyleProp<ViewStyle>
    | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);
  children?: React.ReactNode | ((state: PressableStateCallbackType) => React.ReactNode);
  onPress?: (e: any) => void;
  onPressIn?: (e: any) => void;
  onPressOut?: (e: any) => void;
  onLongPress?: (e: any) => void;
  disabled?: boolean;
  hitSlop?: any;
  android_ripple?: any;
  [key: string]: any;
};

export function Pressable(props: PressableProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    ref,
    style,
    children,
    onPress,
    onPressIn,
    onPressOut,
    onLongPress,
    disabled,
    hitSlop,
    android_ripple,
    pointerEvents,
    ...rest
  } = props;
  const [pressed, setPressed] = useState(false);
  const state = { pressed };
  const resolvedStyle = typeof style === 'function' ? style(state) : style;
  const css: React.CSSProperties = {
    ...viewBase,
    cursor: disabled ? 'default' : 'pointer',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'manipulation',
    WebkitTapHighlightColor: 'transparent',
    ...rnToCss(resolvedStyle),
    ...pointerEventsStyle(pointerEvents),
  };
  const a11y = accessibilityProps(rest);
  return (
    <div
      ref={ref}
      role={a11y.role ?? 'button'}
      tabIndex={disabled ? -1 : 0}
      style={css}
      onClick={disabled ? undefined : onPress}
      onPointerDown={(e) => {
        setPressed(true);
        if (!disabled) onPressIn?.(e);
      }}
      onPointerUp={(e) => {
        setPressed(false);
        if (!disabled) onPressOut?.(e);
      }}
      onPointerLeave={() => setPressed(false)}
      onKeyDown={
        disabled
          ? undefined
          : (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onPress?.(e);
              }
            }
      }
      {...a11y}
      aria-disabled={disabled || a11y['aria-disabled']}
    >
      {typeof children === 'function' ? children(state) : children}
    </div>
  );
}

// ─── ScrollView ───

export type ScrollViewProps = {
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  horizontal?: boolean;
  children?: React.ReactNode;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  keyboardShouldPersistTaps?: string;
  [key: string]: any;
};

export function ScrollView(props: ScrollViewProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    ref,
    style,
    contentContainerStyle,
    horizontal,
    children,
    showsVerticalScrollIndicator,
    showsHorizontalScrollIndicator,
    keyboardShouldPersistTaps,
    ...rest
  } = props;
  const hideScrollbar =
    (horizontal ? showsHorizontalScrollIndicator : showsVerticalScrollIndicator) === false;
  const outer: React.CSSProperties = {
    ...viewBase,
    flexGrow: 1,
    flexShrink: 1,
    WebkitOverflowScrolling: 'touch',
    ...(horizontal
      ? { overflowX: 'auto', overflowY: 'hidden', flexDirection: 'row' }
      : { overflowX: 'hidden', overflowY: 'auto' }),
    ...rnToCss(style),
  };
  const inner: React.CSSProperties = {
    ...viewBase,
    ...(horizontal ? { flexDirection: 'row' } : null),
    ...rnToCss(contentContainerStyle),
  };
  return (
    <div
      ref={ref}
      style={outer}
      className={hideScrollbar ? 'rn-noscrollbar' : undefined}
      {...accessibilityProps(rest)}
    >
      <div style={inner}>{children}</div>
    </div>
  );
}

// ─── TextInput ───

const KEYBOARD_TO_INPUTMODE: Record<string, React.HTMLAttributes<HTMLElement>['inputMode']> = {
  numeric: 'numeric',
  'number-pad': 'numeric',
  'decimal-pad': 'decimal',
  'email-address': 'email',
  'phone-pad': 'tel',
  url: 'url',
};

export type TextInputProps = {
  style?: StyleProp<TextStyle>;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  keyboardType?: string;
  returnKeyType?: string;
  multiline?: boolean;
  autoFocus?: boolean;
  autoCapitalize?: string;
  editable?: boolean;
  maxLength?: number;
  onSubmitEditing?: (e: any) => void;
  [key: string]: any;
};

export function TextInput(props: TextInputProps & { ref?: React.Ref<any> }) {
  const {
    ref,
    style,
    value,
    onChangeText,
    placeholder,
    placeholderTextColor,
    keyboardType,
    returnKeyType,
    multiline,
    autoFocus,
    autoCapitalize,
    editable,
    maxLength,
    onSubmitEditing,
    ...rest
  } = props;
  const css: any = {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderStyle: 'solid',
    borderRadius: 0,
    boxSizing: 'border-box',
    color: 'inherit',
    fontFamily: 'inherit',
    fontSize: 14,
    margin: 0,
    padding: 0,
    resize: 'none',
    appearance: 'none',
    WebkitAppearance: 'none',
    minWidth: 0,
    ...rnToCss(style),
  };
  if (placeholderTextColor) css['--rn-placeholder'] = placeholderTextColor;
  const common = {
    ref,
    className: 'rn-textinput',
    style: css,
    value,
    placeholder,
    autoFocus,
    maxLength,
    readOnly: editable === false,
    inputMode: keyboardType ? KEYBOARD_TO_INPUTMODE[keyboardType] : undefined,
    autoCapitalize: autoCapitalize as any,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChangeText?.(e.target.value),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (!multiline && e.key === 'Enter') onSubmitEditing?.(e);
    },
    ...accessibilityProps(rest),
  };
  // size={1} убирает врождённую ширину ~180px у <input>: в RN поле сайзится
  // флексбоксом (cross-axis stretch / явный flex в стилях приложения)
  return multiline ? <textarea {...common} rows={4} /> : <input {...common} size={1} />;
}

// ─── Modal ───

export type ModalProps = {
  visible?: boolean;
  transparent?: boolean;
  animationType?: 'none' | 'slide' | 'fade';
  onRequestClose?: () => void;
  statusBarTranslucent?: boolean;
  children?: React.ReactNode;
};

export function Modal({
  visible,
  transparent,
  animationType = 'none',
  onRequestClose,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!visible) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onRequestClose?.();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [visible, onRequestClose]);

  if (!visible) return null;
  const cls =
    animationType === 'slide'
      ? 'rn-modal-slide'
      : animationType === 'fade'
        ? 'rn-modal-fade'
        : undefined;
  return createPortal(
    <div
      className={cls}
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        backgroundColor: transparent ? 'transparent' : '#fff',
      }}
    >
      {children}
    </div>,
    document.body
  );
}

// ─── Animated ───

type AnimListener = () => void;

export abstract class AnimatedNode {
  listeners = new Set<AnimListener>();
  abstract __getValue(): number | string;
  __notify() {
    this.listeners.forEach((l) => l());
  }
  interpolate(config: InterpolateConfig): AnimatedInterpolation {
    return new AnimatedInterpolation(this, config);
  }
}

export type InterpolateConfig = {
  inputRange: number[];
  outputRange: number[] | string[];
  extrapolate?: 'extend' | 'clamp';
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function interpolateValue(v: number, config: InterpolateConfig): number | string {
  const { inputRange, outputRange, extrapolate = 'extend' } = config;
  let i = 1;
  while (i < inputRange.length - 1 && inputRange[i] < v) i++;
  const in0 = inputRange[i - 1];
  const in1 = inputRange[i];
  let t = in1 === in0 ? 0 : (v - in0) / (in1 - in0);
  if (extrapolate === 'clamp') t = Math.max(0, Math.min(1, t));
  const out0 = outputRange[i - 1];
  const out1 = outputRange[i];
  if (typeof out0 === 'number' && typeof out1 === 'number') return lerp(out0, out1, t);
  // строковые значения: цвета
  const c0 = parseColor(out0 as string);
  const c1 = parseColor(out1 as string);
  if (c0 && c1) {
    const ct = Math.max(0, Math.min(1, t));
    return `rgba(${Math.round(lerp(c0[0], c1[0], ct))},${Math.round(
      lerp(c0[1], c1[1], ct)
    )},${Math.round(lerp(c0[2], c1[2], ct))},${lerp(c0[3], c1[3], ct).toFixed(3)})`;
  }
  return t < 0.5 ? (out0 as string) : (out1 as string);
}

export class AnimatedInterpolation extends AnimatedNode {
  constructor(
    private parent: AnimatedNode,
    private config: InterpolateConfig
  ) {
    super();
    parent.listeners.add(() => this.__notify());
  }
  __getValue(): number | string {
    return interpolateValue(this.parent.__getValue() as number, this.config);
  }
}

export class AnimatedValue extends AnimatedNode {
  _value: number;
  private _cancel: (() => void) | null = null;
  constructor(v: number) {
    super();
    this._value = v;
  }
  __getValue(): number {
    return this._value;
  }
  setValue(v: number) {
    this.stopAnimation();
    this._value = v;
    this.__notify();
  }
  /** внутренний апдейт из анимации — без остановки самой анимации */
  __setAnimating(v: number) {
    this._value = v;
    this.__notify();
  }
  __setCancel(c: (() => void) | null) {
    this._cancel = c;
  }
  stopAnimation(cb?: (v: number) => void) {
    this._cancel?.();
    this._cancel = null;
    cb?.(this._value);
  }
}

type EndCallback = (result: { finished: boolean }) => void;
export type CompositeAnimation = { start: (cb?: EndCallback) => void; stop: () => void };

function timing(
  value: AnimatedValue,
  config: {
    toValue: number;
    duration?: number;
    easing?: (t: number) => number;
    delay?: number;
    useNativeDriver?: boolean;
  }
): CompositeAnimation {
  let raf = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const stop = () => {
    if (raf) cancelAnimationFrame(raf);
    if (timer) clearTimeout(timer);
  };
  return {
    start(cb?: EndCallback) {
      const run = () => {
        const from = value.__getValue();
        const { toValue, duration = 500, easing = Easing.inOut(Easing.ease) } = config;
        const t0 = performance.now();
        value.__setCancel(stop);
        const frame = (now: number) => {
          const t = Math.min(1, duration === 0 ? 1 : (now - t0) / duration);
          value.__setAnimating(lerp(from, toValue, easing(t)));
          if (t < 1) {
            raf = requestAnimationFrame(frame);
          } else {
            value.__setCancel(null);
            cb?.({ finished: true });
          }
        };
        raf = requestAnimationFrame(frame);
      };
      if (config.delay) timer = setTimeout(run, config.delay);
      else run();
    },
    stop,
  };
}

function spring(
  value: AnimatedValue,
  config: { toValue: number; bounciness?: number; useNativeDriver?: boolean }
): CompositeAnimation {
  let raf = 0;
  const stop = () => {
    if (raf) cancelAnimationFrame(raf);
  };
  return {
    start(cb?: EndCallback) {
      const to = config.toValue;
      let x = value.__getValue();
      let v = 0;
      let last = performance.now();
      const tension = 160;
      const friction = 18;
      value.__setCancel(stop);
      const frame = (now: number) => {
        const dt = Math.min(0.064, (now - last) / 1000);
        last = now;
        const a = tension * (to - x) - friction * v;
        v += a * dt;
        x += v * dt;
        if (Math.abs(v) < 0.05 && Math.abs(to - x) < 0.05) {
          value.__setAnimating(to);
          value.__setCancel(null);
          cb?.({ finished: true });
          return;
        }
        value.__setAnimating(x);
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    },
    stop,
  };
}

function parallelAnim(anims: CompositeAnimation[]): CompositeAnimation {
  return {
    start(cb?: EndCallback) {
      let remaining = anims.length;
      if (remaining === 0) {
        cb?.({ finished: true });
        return;
      }
      anims.forEach((a) =>
        a.start(() => {
          remaining -= 1;
          if (remaining === 0) cb?.({ finished: true });
        })
      );
    },
    stop() {
      anims.forEach((a) => a.stop());
    },
  };
}

function sequenceAnim(anims: CompositeAnimation[]): CompositeAnimation {
  let stopped = false;
  return {
    start(cb?: EndCallback) {
      const next = (i: number) => {
        if (stopped || i >= anims.length) {
          cb?.({ finished: !stopped });
          return;
        }
        anims[i].start(() => next(i + 1));
      };
      next(0);
    },
    stop() {
      stopped = true;
      anims.forEach((a) => a.stop());
    },
  };
}

function resolveAnimatedStyle(style: any): any {
  if (!style) return style;
  if (Array.isArray(style)) return style.map(resolveAnimatedStyle);
  if (style instanceof AnimatedNode) return style.__getValue();
  if (typeof style === 'object') {
    const out: RNRawStyle = {};
    for (const k of Object.keys(style)) {
      const v = style[k];
      if (v instanceof AnimatedNode) out[k] = v.__getValue();
      else if (k === 'transform' && Array.isArray(v))
        out[k] = v.map((t: any) => {
          const kk = Object.keys(t)[0];
          const vv = t[kk];
          return { [kk]: vv instanceof AnimatedNode ? vv.__getValue() : vv };
        });
      else out[k] = v;
    }
    return out;
  }
  return style;
}

function collectAnimatedNodes(style: any, out: AnimatedNode[] = []): AnimatedNode[] {
  if (!style) return out;
  if (style instanceof AnimatedNode) {
    out.push(style);
    return out;
  }
  if (Array.isArray(style)) {
    style.forEach((s) => collectAnimatedNodes(s, out));
    return out;
  }
  if (typeof style === 'object') {
    Object.values(style).forEach((v) => collectAnimatedNodes(v, out));
  }
  return out;
}

function createAnimatedComponent<P extends { style?: any }>(
  Base: React.ComponentType<P>
): React.ComponentType<P> {
  return function AnimatedComponent(props: P) {
    const [, force] = useReducer((c: number) => c + 1, 0);
    useEffect(() => {
      const nodes = collectAnimatedNodes(props.style);
      const cb = () => force();
      nodes.forEach((n) => n.listeners.add(cb));
      return () => nodes.forEach((n) => n.listeners.delete(cb));
    });
    return <Base {...props} style={resolveAnimatedStyle(props.style)} />;
  };
}

export const Animated = {
  Value: AnimatedValue,
  View: createAnimatedComponent(View as any) as typeof View,
  Text: createAnimatedComponent(Text as any) as typeof Text,
  timing,
  spring,
  parallel: parallelAnim,
  sequence: sequenceAnim,
};

// ─── Easing ───

export const Easing = {
  linear: (t: number) => t,
  ease: (t: number) => t * t * (3 - 2 * t),
  quad: (t: number) => t * t,
  cubic: (t: number) => t * t * t,
  in: (f: (t: number) => number) => f,
  out:
    (f: (t: number) => number) =>
    (t: number) =>
      1 - f(1 - t),
  inOut:
    (f: (t: number) => number) =>
    (t: number) =>
      t < 0.5 ? f(t * 2) / 2 : 1 - f((1 - t) * 2) / 2,
};

// ─── PanResponder ───

export type GestureState = {
  dx: number;
  dy: number;
  moveX: number;
  moveY: number;
  x0: number;
  y0: number;
  vx: number;
  vy: number;
  numberActiveTouches: number;
};

export type PanResponderConfig = {
  onStartShouldSetPanResponder?: (e: any, g: GestureState) => boolean;
  onMoveShouldSetPanResponder?: (e: any, g: GestureState) => boolean;
  onPanResponderGrant?: (e: any, g: GestureState) => void;
  onPanResponderMove?: (e: any, g: GestureState) => void;
  onPanResponderRelease?: (e: any, g: GestureState) => void;
  onPanResponderTerminate?: (e: any, g: GestureState) => void;
};

export const PanResponder = {
  create(config: PanResponderConfig) {
    const onPointerDown = (e: React.PointerEvent) => {
      const x0 = e.clientX;
      const y0 = e.clientY;
      let lastX = x0;
      let lastY = y0;
      let lastT = performance.now();
      let vx = 0;
      let vy = 0;
      const gesture = (): GestureState => ({
        dx: lastX - x0,
        dy: lastY - y0,
        moveX: lastX,
        moveY: lastY,
        x0,
        y0,
        vx,
        vy,
        numberActiveTouches: 1,
      });
      let granted = !!config.onStartShouldSetPanResponder?.(e, gesture());
      if (granted) config.onPanResponderGrant?.(e, gesture());

      const move = (ev: PointerEvent) => {
        const now = performance.now();
        const dt = Math.max(1, now - lastT);
        vx = (ev.clientX - lastX) / dt;
        vy = (ev.clientY - lastY) / dt;
        lastX = ev.clientX;
        lastY = ev.clientY;
        lastT = now;
        if (!granted && config.onMoveShouldSetPanResponder?.(ev, gesture())) {
          granted = true;
          config.onPanResponderGrant?.(ev, gesture());
        }
        if (granted) {
          config.onPanResponderMove?.(ev, gesture());
          ev.preventDefault();
        }
      };
      const up = (ev: PointerEvent) => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', cancel);
        if (granted) config.onPanResponderRelease?.(ev, gesture());
      };
      const cancel = (ev: PointerEvent) => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', cancel);
        if (granted) config.onPanResponderTerminate?.(ev, gesture());
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', cancel);
    };
    return { panHandlers: { onPointerDown } };
  },
};

// ─── Keyboard / Platform / Alert / Share ───

export const Keyboard = {
  addListener(_event: string, _cb: (e: any) => void) {
    // в браузере экранная клавиатура не перекрывает layout так, как в нативе
    return { remove() {} };
  },
  dismiss() {
    (document.activeElement as HTMLElement | null)?.blur?.();
  },
};

export const Platform = {
  OS: 'web' as string,
  Version: undefined as unknown,
  select<T>(spec: { [platform: string]: T }): T | undefined {
    return 'web' in spec ? spec.web : spec.default;
  },
};

type AlertButton = { text?: string; style?: string; onPress?: () => void };

export const Alert = {
  alert(title: string, message?: string, buttons?: AlertButton[]) {
    const text = [title, message].filter(Boolean).join('\n\n');
    if (!buttons || buttons.length <= 1) {
      window.alert(text);
      buttons?.[0]?.onPress?.();
      return;
    }
    const confirmBtn = buttons.find((b) => b.style !== 'cancel');
    const cancelBtn = buttons.find((b) => b.style === 'cancel');
    if (window.confirm(text)) confirmBtn?.onPress?.();
    else cancelBtn?.onPress?.();
  },
};

export const Share = {
  async share(content: { message: string; title?: string }) {
    if (typeof navigator.share === 'function') {
      await navigator.share({ text: content.message, title: content.title });
      return { action: 'sharedAction' as const };
    }
    await navigator.clipboard.writeText(content.message);
    window.alert('Данные скопированы в буфер обмена');
    return { action: 'sharedAction' as const };
  },
};

// ─── useColorScheme ───

export function useColorScheme(): 'light' | 'dark' | null {
  const [scheme, setScheme] = useState<'light' | 'dark'>(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark'
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const h = (e: MediaQueryListEvent) => setScheme(e.matches ? 'light' : 'dark');
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return scheme;
}

// ─── Заглушки, которые могут понадобиться по типам ───

export const KeyboardAvoidingView = View;
export const SafeAreaView = View;
export const TouchableOpacity = Pressable;
export const ActivityIndicator = (_props: any) => null;
