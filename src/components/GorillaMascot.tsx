import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface GorillaProps {
  size?: number;
  mood?: 'happy' | 'celebrate' | 'sad' | 'thinking';
}

export const GorillaMascot: React.FC<GorillaProps> = ({ size = 100, mood = 'happy' }) => {
  const scale = size / 100;

  const expressions: Record<string, string> = {
    happy: '🦍',
    celebrate: '🦍',
    sad: '🦍',
    thinking: '🦍',
  };

  const moodEmoji: Record<string, string> = {
    happy: '😊',
    celebrate: '🎉',
    sad: '😢',
    thinking: '🤔',
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Text style={[styles.gorilla, { fontSize: size * 0.7 }]}>
        {expressions[mood]}
      </Text>
      {mood !== 'happy' && (
        <View style={[styles.moodBadge, { bottom: 0, right: 0 }]}>
          <Text style={{ fontSize: size * 0.25 }}>{moodEmoji[mood]}</Text>
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
  gorilla: {
    textAlign: 'center',
  },
  moodBadge: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 2,
  },
});
