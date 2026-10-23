import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Text } from './ui/AppText';
import { useHaptics } from '../hooks/useHaptics';
import { AppIcon } from './ui/AppIcon';

interface XPPopupProps {
  amount: number;
  visible: boolean;
  onComplete?: () => void;
  type?: 'correct' | 'lesson' | 'streak' | 'bonus';
}

export const XPPopup: React.FC<XPPopupProps> = ({
  amount,
  visible,
  onComplete,
  type = 'correct',
}) => {
  const haptics = useHaptics();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && amount > 0) {
      // Haptic feedback based on type
      switch (type) {
        case 'correct':
          haptics.success();
          break;
        case 'lesson':
          haptics.celebration();
          break;
        case 'streak':
          haptics.streak();
          break;
        case 'bonus':
          haptics.levelUp();
          break;
      }

      // Reset and animate in
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      translateYAnim.setValue(30);
      glowAnim.setValue(0);

      Animated.sequence([
        // Pop in with bounce
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            tension: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        // Glow pulse
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();

      // Auto-hide after delay
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim, {
            toValue: -20,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          glowAnim.setValue(0);
          onComplete?.();
        });
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [visible, amount]);

  if (!visible || amount === 0) return null;

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

  const getConfig = () => {
    switch (type) {
      case 'lesson':
        return {
          bgColor: '#D9A441',
          textColor: '#14212B',
          label: 'LESSON COMPLETE!',
          icon: 'award',
        };
      case 'streak':
        return {
          bgColor: '#C9891C',
          textColor: '#FFFFFF',
          label: 'STREAK BONUS!',
          icon: 'flame',
        };
      case 'bonus':
        return {
          bgColor: '#7C5CBF',
          textColor: '#FFFFFF',
          label: 'LEVEL UP BONUS!',
          icon: 'trendingUp',
        };
      default:
        return {
          bgColor: '#2F9E6E',
          textColor: '#FFFFFF',
          label: 'CORRECT!',
          icon: 'check',
        };
    }
  };

  const config = getConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: translateYAnim },
          ],
        },
      ]}
    >
      {/* Glow effect */}
      <Animated.View
        style={[
          styles.glow,
          {
            backgroundColor: config.bgColor,
            opacity: glowOpacity,
          },
        ]}
      />
      
      {/* Main popup */}
      <View style={[styles.popup, { backgroundColor: config.bgColor }]}>
        <AppIcon name={config.icon} size={24} color={config.textColor} />
        <View style={styles.textContainer}>
          <Text style={[styles.label, { color: config.textColor }]}>
            {config.label}
          </Text>
          <Text style={[styles.amount, { color: config.textColor }]}>
            +{amount} XP
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

// ── Floating XP Particle ──────────────────────────────────────────

interface XPParticleProps {
  amount: number;
  x: number;
  y: number;
  onComplete?: () => void;
}

export const XPParticle: React.FC<XPParticleProps> = ({
  amount,
  x,
  y,
  onComplete,
}) => {
  const haptics = useHaptics();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    haptics.lightTap();

    // Reset
    scaleAnim.setValue(0);
    opacityAnim.setValue(0);
    translateYAnim.setValue(0);

    // Animate up and fade
    Animated.parallel([
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 400,
          useNativeDriver: true,
        }),
        Animated.delay(300),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(translateYAnim, {
        toValue: -60,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.delay(500),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onComplete?.();
    });
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: x,
          top: y,
          opacity: opacityAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: translateYAnim },
          ],
        },
      ]}
    >
      <Text style={styles.particleText}>+{amount}</Text>
      <Text style={styles.particleXP}>XP</Text>
    </Animated.View>
  );
};

// ── Loading Spinner with XP ────────────────────────────────────────

interface XPLoadingProps {
  visible: boolean;
  message?: string;
}

export const XPLoading: React.FC<XPLoadingProps> = ({
  visible,
  message = 'Calculating XP...',
}) => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(spinAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible]);

  if (!visible) return null;

  const rotation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.loadingContainer}>
      <Animated.View
        style={[
          styles.loadingSpinner,
          {
            transform: [
              { rotate: rotation },
              { scale: pulseAnim },
            ],
          },
        ]}
      >
        <AppIcon name="star" size={26} color="#D9A441" />
      </Animated.View>
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50%',
    alignSelf: 'center',
    zIndex: 1000,
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -70,
    left: -60,
  },
  popup: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    fontSize: 28,
  },
  textContainer: {
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  amount: {
    fontSize: 24,
    fontWeight: '900',
  },
  particle: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 1000,
  },
  particleText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#D9A441',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  particleXP: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D9A441',
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingSpinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(22, 131, 75, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  loadingEmoji: {
    fontSize: 30,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
