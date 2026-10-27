import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from './ui/AppText';
import { Radius } from '../theme/colors';
import { useTheme } from '../theme/themeContext';
import { LEVEL_XP_THRESHOLDS, getLevelProgress } from '../store/useAppStore';

interface XPBarProps {
  xp: number;
  level: number;
  compact?: boolean;
}

const MAX_LEVEL = LEVEL_XP_THRESHOLDS.length;

export const XPBar: React.FC<XPBarProps> = ({ xp, level, compact = false }) => {
  const animWidth = useRef(new Animated.Value(0)).current;
  const { colors } = useTheme();
  const { current, needed, percent } = getLevelProgress(xp);
  const isMaxLevel = level >= MAX_LEVEL;

  useEffect(() => {
    Animated.spring(animWidth, {
      toValue: isMaxLevel ? 1 : percent,
      useNativeDriver: false,
      friction: 6,
      tension: 40,
    }).start();
  }, [percent, isMaxLevel]);

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.compactXP, { color: colors.text }]}>{xp} XP</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.levelText, { color: colors.text }]}>Level {level}</Text>
        <Text style={[styles.xpText, { color: colors.xpOrange }]}>
          {isMaxLevel ? `${xp} XP · MAX` : `${current} / ${needed} XP`}
        </Text>
      </View>
      <View style={[styles.barBg, { backgroundColor: colors.border }]}>
        <Animated.View
          style={[
            styles.barFill,
            {
              width: animWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: isMaxLevel ? colors.secondary : colors.primary,
            },
          ]}
        />
      </View>
      {!isMaxLevel && (
        <Text style={[styles.nextLevelText, { color: colors.textMuted }]}>
          {needed - current} XP to Level {level + 1}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 2,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  levelText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  xpText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  barBg: {
    height: 9,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  nextLevelText: {
    fontSize: 10.5,
    marginTop: 4,
    textAlign: 'right',
  },
  compactContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  compactXP: {
    fontSize: 12.5,
    fontWeight: '700',
  },
});
