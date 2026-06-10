import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../store/ThemeContext';

// ─────────────────────────────────────────────
// Кастомный confirm-диалог.
//
// Зачем:
//   • react-native-web превращает `Alert.alert` с двумя кнопками в
//     `window.confirm`, который автодискардится в наших web-тестах →
//     destructive-действия (Reset, Импорт-replace, Удалить ипотеку и т. п.)
//     ломались. Этот компонент не зависит от нативных алертов и работает
//     одинаково на iOS / Android / Web.
//   • Полностью темизуется через useThemeColors().
// ─────────────────────────────────────────────

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  destructive = false,
  onConfirm,
  onCancel,
}: Props) {
  const colors = useThemeColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        onPress={onCancel}
        style={{
          flex: 1,
          backgroundColor: colors.backdrop,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        {/* Внутренний блок сам не закрывается по тапу */}
        <Pressable
          onPress={(e) => e.stopPropagation?.()}
          style={{
            width: '100%',
            maxWidth: 360,
            borderRadius: 24,
            backgroundColor: colors.bgBottom,
            borderWidth: 1,
            borderColor: colors.glassBorder,
            paddingTop: 24,
            paddingHorizontal: 22,
            paddingBottom: 14,
            shadowColor: '#000',
            shadowOpacity: 0.35,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 12 },
            elevation: 18,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.text,
              letterSpacing: -0.3,
              textAlign: 'center',
            }}
          >
            {title}
          </Text>
          {!!message && (
            <Text
              style={{
                fontSize: 14,
                color: colors.textDim,
                lineHeight: 20,
                marginTop: 10,
                textAlign: 'center',
              }}
            >
              {message}
            </Text>
          )}

          <View style={{ marginTop: 22, gap: 8 }}>
            <Pressable
              onPress={onConfirm}
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              style={{ borderRadius: 14, overflow: 'hidden' }}
            >
              <LinearGradient
                colors={
                  destructive
                    ? [colors.pink, colors.pinkStrong]
                    : [colors.blue, colors.blueDeep]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingVertical: 14, alignItems: 'center' }}
              >
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: '700',
                    letterSpacing: -0.2,
                  }}
                >
                  {confirmLabel}
                </Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
              style={{
                paddingVertical: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 15, color: colors.textDim, fontWeight: '600' }}>
                {cancelLabel}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
