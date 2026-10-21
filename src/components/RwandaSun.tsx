import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '../theme/colors';

interface RwandaSunProps {
  size?: number;
  animated?: boolean;
  opacity?: number;
}

export const RwandaSun: React.FC<RwandaSunProps> = ({
  size = 80,
  animated = false,
  opacity = 1,
}) => {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 20000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [animated]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rays = Array.from({ length: 24 }, (_, i) => i);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          opacity,
          transform: animated ? [{ rotate: spin }] : [],
        },
      ]}
    >
      {/* Rays */}
      {rays.map((i) => (
        <View
          key={i}
          style={[
            styles.ray,
            {
              height: size * 0.45,
              width: size * 0.03,
              top: size * 0.05,
              left: size / 2 - (size * 0.03) / 2,
              transformOrigin: `50% ${size * 0.45}px`,
              transform: [
                { translateY: -(size * 0.45) / 2 },
                { rotate: `${i * 15}deg` },
                { translateY: (size * 0.45) / 2 },
              ],
            },
          ]}
        />
      ))}
      {/* Center circle */}
      <View
        style={[
          styles.circle,
          {
            width: size * 0.35,
            height: size * 0.35,
            borderRadius: size * 0.175,
            top: size / 2 - (size * 0.35) / 2,
            left: size / 2 - (size * 0.35) / 2,
          },
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  ray: {
    position: 'absolute',
    backgroundColor: Colors.yellow,
    borderRadius: 2,
  },
  circle: {
    position: 'absolute',
    backgroundColor: Colors.yellow,
  },
});
