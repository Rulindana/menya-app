import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppIcon } from './ui/AppIcon';
import { MenyaMascot } from './MenyaMascot';

interface GorillaProps {
  size?: number;
  mood?: 'happy' | 'celebrate' | 'sad' | 'thinking';
}

const moodConfig: Record<string, { icon: string; color: string; tint: string }> = {
  celebrate: { icon: 'partyPopper', color: '#C9891C', tint: '#FBF3E3' },
  sad: { icon: 'frown', color: '#D64545', tint: '#FCEAEA' },
  thinking: { icon: 'help', color: '#0B6E84', tint: '#D9EEF3' },
};

export const GorillaMascot: React.FC<GorillaProps> = ({ size = 100, mood = 'happy' }) => {
  const badge = moodConfig[mood];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <MenyaMascot size={size} />
      {badge && (
        <View
          style={[
            styles.moodBadge,
            {
              backgroundColor: badge.tint,
              borderColor: badge.color,
              width: size * 0.3,
              height: size * 0.3,
              borderRadius: size * 0.15,
              right: -size * 0.02,
              bottom: -size * 0.02,
            },
          ]}
        >
          <AppIcon name={badge.icon} size={size * 0.17} color={badge.color} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  moodBadge: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
});
