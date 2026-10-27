import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from './ui/AppText';
import { AppIcon } from './ui/AppIcon';
import { MAX_HEARTS, useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/themeContext';

interface HeartsBadgeProps {
  onPress: () => void;
}

export const HeartsBadge: React.FC<HeartsBadgeProps> = ({ onPress }) => {
  const hearts = useAppStore((s) => s.progress.hearts);
  const nextHeartAt = useAppStore((s) => s.progress.nextHeartAt);
  const { colors } = useTheme();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!nextHeartAt) return;
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, [nextHeartAt]);

  const remaining = nextHeartAt ? Math.max(0, nextHeartAt - now) : 0;
  const timerLabel = nextHeartAt
    ? remaining >= 60000
      ? `${Math.ceil(remaining / 60000)}m`
      : '<1m'
    : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.badge,
        { backgroundColor: colors.background, borderColor: colors.border },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Hearts, ${hearts} of ${MAX_HEARTS}`}
    >
      <View style={styles.iconWrap}>
        <AppIcon
          name="heart"
          size={16}
          color={hearts > 0 ? colors.heartRed : colors.textMuted}
        />
      </View>
      <Text style={[styles.count, { color: colors.text }]}>{hearts}</Text>
      {timerLabel && <Text style={[styles.timer, { color: colors.textMuted }]}>{timerLabel}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  iconWrap: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    fontSize: 13,
    fontWeight: '700',
  },
  timer: {
    fontSize: 10,
    fontWeight: '600',
  },
});
