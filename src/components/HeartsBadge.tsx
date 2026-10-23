import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from './ui/AppText';
import { AppIcon } from './ui/AppIcon';
import { MAX_HEARTS, useAppStore } from '../store/useAppStore';

interface HeartsBadgeProps {
  onPress: () => void;
}

export const HeartsBadge: React.FC<HeartsBadgeProps> = ({ onPress }) => {
  const hearts = useAppStore((s) => s.progress.hearts);
  const nextHeartAt = useAppStore((s) => s.progress.nextHeartAt);
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
      style={styles.badge}
      accessibilityRole="button"
      accessibilityLabel={`Hearts, ${hearts} of ${MAX_HEARTS}`}
    >
      <View style={styles.iconWrap}>
        <AppIcon
          name="heart"
          size={16}
          color={hearts > 0 ? '#D64545' : 'rgba(255,255,255,0.55)'}
        />
      </View>
      <Text style={styles.count}>{hearts}</Text>
      {timerLabel && <Text style={styles.timer}>{timerLabel}</Text>}
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
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  iconWrap: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  timer: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.72)',
  },
});
