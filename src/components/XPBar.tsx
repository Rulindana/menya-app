import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from './ui/AppText';
import { Colors, Radius } from '../theme/colors';
import { LEVEL_XP_THRESHOLDS, getLevelProgress } from '../store/useAppStore';

interface XPBarProps {
  xp: number;
  level: number;
  compact?: boolean;
}

const MAX_LEVEL = LEVEL_XP_THRESHOLDS.length; // 11 entries = level 1..10+

export const XPBar: React.FC<XPBarProps> = ({ xp, level, compact = false }) => {
  const animWidth = useRef(new Animated.Value(0)).current;

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
      <View style={styles.compactContainer}>
        <Text style={styles.compactXP}>⭐ {xp} XP</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.levelText}>Level {level}</Text>
        <Text style={styles.xpText}>
          {isMaxLevel ? `${xp} XP • MAX` : `${current} / ${needed} XP`}
        </Text>
      </View>
      <View style={styles.barBg}>
        <Animated.View
          style={[
            styles.barFill,
            {
              width: animWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: isMaxLevel ? Colors.yellow : Colors.yellow,
            },
          ]}
        />
      </View>
      {!isMaxLevel && (
        <Text style={styles.nextLevelText}>
          {needed - current} XP to Level {level + 1}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  levelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  xpText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.xpOrange,
  },
  barBg: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.yellow,
    borderRadius: Radius.full,
  },
  nextLevelText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    textAlign: 'right',
  },
  compactContainer: {
    backgroundColor: Colors.yellowLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  compactXP: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
  },
});
