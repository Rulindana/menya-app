import React, { useRef } from 'react';
import {
  Animated,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Text } from './AppText';
import { AppIcon } from './AppIcon';
import { useTheme } from '../../theme/themeContext';
import { Typography } from '../../theme/typography';

export interface InteractiveOptionCardProps {
  label: string;
  index: number;
  isSelected?: boolean;
  isRight?: boolean;
  showResult?: boolean;
  disabled?: boolean;
  unitColor?: string;
  colors?: any;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
}

export const InteractiveOptionCard: React.FC<InteractiveOptionCardProps> = ({
  label,
  index,
  isSelected = false,
  isRight = false,
  showResult = false,
  disabled = false,
  unitColor,
  colors: propColors,
  onPress,
  style,
  testID,
  accessibilityLabel,
}) => {
  const { colors: contextColors } = useTheme();
  const colors = propColors || contextColors;
  const accentColor = unitColor || colors.primary;

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || showResult) return;
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 28,
      bounciness: 8,
    }).start();
  };

  let bgColor = colors.card || colors.surface;
  let borderColor = colors.border;
  let textColor = colors.text;
  let badgeBg = colors.background;
  let badgeBorderColor = colors.border;
  let badgeTextColor = colors.textSecondary;
  let statusIcon: 'checkCircle' | 'closeCircle' | null = null;
  let statusIconColor = colors.primary;

  if (showResult && isRight) {
    bgColor = colors.success + '1E';
    borderColor = colors.success;
    textColor = colors.success;
    badgeBg = colors.success;
    badgeBorderColor = colors.success;
    badgeTextColor = '#FFFFFF';
    statusIcon = 'checkCircle';
    statusIconColor = colors.success;
  } else if (showResult && isSelected && !isRight) {
    bgColor = colors.error + '1E';
    borderColor = colors.error;
    textColor = colors.error;
    badgeBg = colors.error;
    badgeBorderColor = colors.error;
    badgeTextColor = '#FFFFFF';
    statusIcon = 'closeCircle';
    statusIconColor = colors.error;
  } else if (showResult && !isSelected && !isRight) {
    bgColor = colors.card || colors.surface;
    borderColor = colors.border;
    textColor = colors.textMuted;
    badgeBg = colors.background;
    badgeBorderColor = colors.border;
    badgeTextColor = colors.textMuted;
  } else if (!showResult && isSelected) {
    bgColor = accentColor + '18';
    borderColor = accentColor;
    textColor = accentColor;
    badgeBg = accentColor;
    badgeBorderColor = accentColor;
    badgeTextColor = '#FFFFFF';
    statusIcon = 'checkCircle';
    statusIconColor = accentColor;
  }

  const isInteractive = !disabled && !showResult;
  const letter = String.fromCharCode(65 + index);

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || `Option ${letter}: ${label}`}
        accessibilityState={{ selected: isSelected, disabled: !isInteractive }}
        style={[
          styles.container,
          {
            backgroundColor: bgColor,
            borderColor,
          },
          disabled && !showResult && styles.disabled,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!isInteractive}
        activeOpacity={0.88}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      >
        <View
          style={[
            styles.letterBadge,
            {
              backgroundColor: badgeBg,
              borderColor: badgeBorderColor,
            },
          ]}
        >
          <Text style={[styles.letterText, { color: badgeTextColor }]}>
            {letter}
          </Text>
        </View>

        <Text style={[styles.label, { color: textColor }]}>{label}</Text>

        {statusIcon && (
          <View style={styles.iconWrap}>
            <AppIcon name={statusIcon} size={20} color={statusIconColor} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderBottomWidth: 4,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  letterBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: {
    fontSize: Typography.size.sm,
    fontWeight: '800',
    textAlign: 'center',
    includeFontPadding: false,
  },
  label: {
    flex: 1,
    fontSize: Typography.size.md,
    lineHeight: 22,
    fontWeight: '700',
  },
  iconWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
});
