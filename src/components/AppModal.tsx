import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from './ui/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { AppIcon } from './ui/AppIcon';
import { useTheme } from '../theme/themeContext';

interface AppModalProps {
  visible: boolean;
  title: string;
  message: string;
  cancelText?: string;
  confirmText?: string;
  cancelColor?: string;
  confirmColor?: string;
  showCancel?: boolean;
  showConfirm?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
  type?: 'info' | 'success' | 'warning' | 'error';
  icon?: string;
}

const TYPE_ICONS: Record<string, string> = {
  info: 'info',
  success: 'checkCircle',
  warning: 'warning',
  error: 'closeCircle',
};

export const AppModal: React.FC<AppModalProps> = ({
  visible,
  title,
  message,
  cancelText = 'Cancel',
  confirmText = 'OK',
  cancelColor,
  confirmColor,
  showCancel = true,
  showConfirm = true,
  onCancel,
  onConfirm,
  type = 'info',
  icon,
}) => {
  const translateY = useRef(new Animated.Value(420)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  useEffect(() => {
    if (visible) {
      translateY.setValue(420);
      backdropOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 9,
          tension: 55,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, backdropOpacity]);

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCancel?.();
  };

  const handleConfirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onConfirm?.();
  };

  if (!visible) return null;

  const accent = {
    info: colors.info,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
  }[type] || colors.info;
  const displayIcon = icon || TYPE_ICONS[type] || 'info';

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={showCancel ? handleCancel : handleConfirm}
    >
      <View style={styles.root}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: colors.overlay, opacity: backdropOpacity },
          ]}
        />
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={showCancel ? handleCancel : handleConfirm}
        />

        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              paddingBottom: Math.max(insets.bottom, 18),
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <View style={[styles.iconCircle, { backgroundColor: accent + '16' }]}>
            <AppIcon name={displayIcon} size={25} color={accent} />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

          <ScrollView
            style={styles.messageScroll}
            contentContainerStyle={styles.messageContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
          </ScrollView>

          <View style={styles.actions}>
            {showConfirm && (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: confirmColor || colors.primary }]}
                onPress={handleConfirm}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmText}>{confirmText}</Text>
              </TouchableOpacity>
            )}
            {showCancel && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { backgroundColor: colors.card }]}
                onPress={handleCancel}
                activeOpacity={0.8}
              >
                <Text style={[styles.cancelText, { color: cancelColor || colors.textSecondary }]}>
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    shadowColor: '#14212B',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 18,
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 18,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  messageScroll: {
    maxHeight: 260,
  },
  messageContent: {
    paddingBottom: 18,
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  actions: {
    gap: 9,
  },
  button: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
