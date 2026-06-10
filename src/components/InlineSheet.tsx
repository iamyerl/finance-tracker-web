import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
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
};

const SWIPE_DISMISS = 80;

/**
 * Шит без Modal — рендерится как абсолютный оверлей.
 * Используется для вложенных шитов (внутри другого Modal),
 * потому что на iOS RN Modal не умеет показывать вложенный Modal.
 */
export function InlineSheet({ visible, onClose, children, height = '85%' }: Props) {
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

  if (!visible) return null;

  const xColor = resolved === 'light' ? colors.text : '#fff';

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
    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.backdrop }]}>
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
                <Path d="M5 5 L19 19 M19 5 L5 19" stroke={xColor} strokeWidth={2.4} strokeLinecap="round" />
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
    </View>
  );
}
