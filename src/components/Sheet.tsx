import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  View,
  Pressable,
  Platform,
  ScrollView,
  Animated,
  PanResponder,
  Keyboard,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useResolvedTheme, useThemeColors } from '../store/ThemeContext';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number | string;
  /**
   * Контент, рендерящийся внутри Modal-а поверх основного шита.
   * Используется для вложенных шитов (через InlineSheet),
   * т.к. на iOS Modal-в-Modal не показывается.
   */
  overlay?: React.ReactNode;
};

const SWIPE_DISMISS = 80;

export function Sheet({ visible, onClose, children, height = '85%', overlay }: Props) {
  const colors = useThemeColors();
  const resolved = useResolvedTheme();
  const translateY = useRef(new Animated.Value(0)).current;
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (visible) translateY.setValue(0);
  }, [visible, translateY]);

  // Слушаем клавиатуру вручную — это надёжнее, чем KeyboardAvoidingView внутри
  // Modal-а с фиксированной height: % (там RN неправильно пересчитывает размеры
  // и оставляет пустоту между шитом и клавой).
  const [kbHeight, setKbHeight] = useState(0);
  useEffect(() => {
    if (!visible) {
      setKbHeight(0);
      return;
    }
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvt, (e) => {
      setKbHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvt, () => setKbHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [visible]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
        onPanResponderMove: (_, g) => {
          if (g.dy > 0) translateY.setValue(g.dy);
        },
        onPanResponderRelease: (_, g) => {
          if (g.dy > SWIPE_DISMISS) {
            onCloseRef.current();
          } else {
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              bounciness: 4,
            }).start();
          }
        },
        onPanResponderTerminate: () => {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
        },
      }),
    [translateY]
  );

  // На светлой теме крестик «X» рисуем тёмным, на тёмной — белым.
  const xColor = resolved === 'light' ? colors.text : '#fff';

  // Высота шита: процент превращаем в `top: 100-pct%`, чтобы при появлении
  // клавиатуры менялся только нижний край (top остаётся на месте, шит
  // плавно сжимается до клавиатуры — заголовок и ручка всегда видны).
  const isPercent = typeof height === 'string' && (height as string).endsWith('%');
  const panelLayout = isPercent
    ? {
        top: `${100 - parseInt(height as string, 10)}%` as any,
        bottom: kbHeight,
      }
    : {
        height: height as number,
        bottom: kbHeight,
      };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: colors.backdrop }}>
        {/* Backdrop: тап вне шита закрывает */}
        <Pressable onPress={onClose} style={StyleSheet.absoluteFill} />

        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 0,
              right: 0,
              transform: [{ translateY }],
            },
            panelLayout,
          ]}
        >
          <LinearGradient
            colors={[colors.sheetGradTop, colors.sheetGradBottom]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{
              flex: 1,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              borderTopWidth: 0.5,
              borderColor: colors.glassBorder,
            }}
          >
            <View {...pan.panHandlers} style={{ paddingTop: 12, paddingBottom: 6, height: 40 }}>
              <View style={{ alignItems: 'center' }}>
                <View
                  style={{
                    width: 44,
                    height: 5,
                    borderRadius: 3,
                    backgroundColor: colors.chipActive,
                  }}
                />
              </View>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                style={{
                  position: 'absolute',
                  right: 14,
                  top: 6,
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.surfaceHover,
                  borderWidth: 0.5,
                  borderColor: colors.glassBorder,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Svg width={14} height={14} viewBox="0 0 24 24">
                  <Path
                    d="M5 5 L19 19 M19 5 L5 19"
                    stroke={xColor}
                    strokeWidth={2.4}
                    strokeLinecap="round"
                  />
                </Svg>
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 40 }}
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          </LinearGradient>
        </Animated.View>
        {overlay}
      </View>
    </Modal>
  );
}

export const sheetTextStyles = {
  // оставлено для обратной совместимости; компоненты должны брать стили из темы
};
