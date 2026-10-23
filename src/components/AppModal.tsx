import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  StatusBar,
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
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
      bgOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(bgOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(bgOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

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
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <StatusBar barStyle="light-content" />
      <Animated.View style={[styles.overlay, { opacity: bgOpacity, backgroundColor: colors.overlay }]}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.surface,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
              paddingBottom: Math.max(insets.bottom, 24),
            },
          ]}
        >
          <View style={[styles.iconContainer, { backgroundColor: accent + '16', borderColor: accent + '55' }]}>
            <AppIcon name={displayIcon} size={26} color={accent} />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

          <View style={styles.buttonRow}>
            {showCancel && (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.card }]}
                onPress={handleCancel}
                activeOpacity={0.7}
              >
                <Text style={[styles.buttonText, { color: cancelColor || colors.textSecondary }]}>
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}
            {showConfirm && (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: confirmColor || colors.primary }]}
                onPress={handleConfirm}
                activeOpacity={0.7}
              >
                <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>{confirmText}</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  modalContainer: {
    borderRadius: 22,
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 22,
    width: '100%',
    maxWidth: 360,
    shadowColor: '#14212B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 16,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14.5,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 22,
    paddingHorizontal: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
