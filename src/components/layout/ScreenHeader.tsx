import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../ui/AppText';
import { AppIcon } from '../ui/AppIcon';
import { useTheme } from '../../theme/themeContext';

interface ScreenHeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  backIcon?: 'chevronLeft' | 'close';
  right?: React.ReactNode;
  left?: React.ReactNode;
  progress?: number;
  progressColor?: string;
  children?: React.ReactNode;
  showBorder?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  onBack,
  backIcon = 'chevronLeft',
  right,
  left,
  progress,
  progressColor,
  children,
  showBorder = true,
  style,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const clampedProgress =
    progress === undefined ? undefined : Math.min(1, Math.max(0, progress));
  const progressAnim = useRef(new Animated.Value(clampedProgress ?? 0)).current;

  useEffect(() => {
    if (clampedProgress === undefined) return;
    Animated.spring(progressAnim, {
      toValue: clampedProgress,
      friction: 8,
      tension: 50,
      useNativeDriver: false,
    }).start();
  }, [clampedProgress]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          paddingTop: insets.top + 8,
          borderBottomColor: showBorder ? colors.border : 'transparent',
        },
        style,
      ]}
    >
      <View style={styles.row}>
        {onBack && (
          <TouchableOpacity
            style={[
              styles.backButton,
              { backgroundColor: colors.background, borderColor: colors.border },
            ]}
            onPress={onBack}
            activeOpacity={0.72}
            accessibilityRole="button"
            accessibilityLabel={backIcon === 'close' ? 'Close' : 'Go back'}
          >
            <AppIcon name={backIcon} size={20} color={colors.text} />
          </TouchableOpacity>
        )}

        {left ? (
          <View style={styles.leftSlot}>{left}</View>
        ) : (
          <View style={styles.titleBlock}>
            {!!title && (
              <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                {title}
              </Text>
            )}
            {!!subtitle && (
              <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        )}

        {right && <View style={styles.rightSlot}>{right}</View>}
      </View>

      {clampedProgress !== undefined && (
        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: progressColor || colors.primary,
              },
            ]}
          />
        </View>
      )}

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  row: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftSlot: {
    flex: 1,
  },
  titleBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.25,
  },
  subtitle: {
    fontSize: 12.5,
    fontWeight: '600',
    marginTop: 2,
  },
  rightSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 11,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});
