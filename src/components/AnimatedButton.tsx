import React, { useRef, useCallback } from 'react';
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Pressable,
  View,
} from 'react-native';
import { useHaptics } from '../hooks/useHaptics';

// ── AnimatedButton (Primary) ──────────────────────────────────────
// Professional spring-based press animation with shadow & scale
interface AnimatedButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  activeScale?: number;
  pressInScale?: number;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onPress,
  style,
  disabled = false,
  activeScale = 1,
  pressInScale = 0.95,
}) => {
  const scaleAnim = useRef(new Animated.Value(activeScale)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: pressInScale,
        friction: 5,
        tension: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.85,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [pressInScale]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: activeScale,
        friction: 3,
        tension: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeScale]);

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
        disabled && { opacity: 0.5 },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
        style={style}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── RippleButton (Material Design ripple effect) ──────────────────
interface RippleButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  rippleColor?: string;
  disabled?: boolean;
}

export const RippleButton: React.FC<RippleButtonProps> = ({
  children,
  onPress,
  style,
  rippleColor = 'rgba(255,255,255,0.3)',
  disabled = false,
}) => {
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    // Reset ripple
    rippleAnim.setValue(0);
    rippleOpacity.setValue(0.6);

    // Animate ripple expansion
    Animated.parallel([
      Animated.timing(rippleAnim, {
        toValue: 3,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(rippleOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        friction: 5,
        tension: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 3],
    outputRange: [0, 1],
  });

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }], overflow: 'hidden' },
        disabled && { opacity: 0.5 },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
        style={style}
      >
        <View style={styles.rippleContainer}>
          {children}
          <Animated.View
            style={[
              styles.ripple,
              {
                backgroundColor: rippleColor,
                opacity: rippleOpacity,
                transform: [{ scale: rippleScale }],
              },
            ]}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── GlowButton (Elegant glow pulse effect) ───────────────────────
interface GlowButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  glowColor?: string;
  disabled?: boolean;
}

export const GlowButton: React.FC<GlowButtonProps> = ({
  children,
  onPress,
  style,
  glowColor = '#0B6E84',
  disabled = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.93,
      friction: 4,
      tension: 300,
      useNativeDriver: true,
    }).start();

    // Start glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 400,
      useNativeDriver: true,
    }).start();
    glowAnim.setValue(0);
  }, []);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: glowOpacity,
          shadowRadius: 16,
          elevation: 8,
        },
        disabled && { opacity: 0.5 },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
        style={style}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── PulseButton (Continuous subtle pulse for CTAs) ────────────────
interface PulseButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export const PulseButton: React.FC<PulseButtonProps> = ({
  children,
  onPress,
  style,
  disabled = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Idle pulse animation
  React.useEffect(() => {
    if (!disabled) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.03,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => { pulseAnim.setValue(1); };
    }
  }, [disabled]);

  const handlePressIn = useCallback(() => {
    pulseAnim.setValue(1);
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      friction: 4,
      tension: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }, { scale: pulseAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
        style={style}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── BounceButton (Playful bounce with feedback) ───────────────────
interface BounceButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  glowColor?: string;
}

export const BounceButton: React.FC<BounceButtonProps> = ({
  children,
  onPress,
  style,
  disabled = false,
  glowColor = '#0B6E84',
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = useCallback(() => {
    // Bounce down then up
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.88,
        friction: 4,
        tension: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.06,
        friction: 3,
        tension: 400,
        useNativeDriver: true,
      }),
    ]).start();

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
    ).start();
  }, []);

  const handlePressOut = useCallback(() => {
    glowAnim.setValue(0);
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        friction: 3,
        tension: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: glowOpacity,
          shadowRadius: 12,
          elevation: 8,
        },
        disabled && { opacity: 0.5 },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
        style={style}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── SlideButton (Slide-in animation on mount) ─────────────────────
interface SlideButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  direction?: 'left' | 'right' | 'bottom';
  delay?: number;
  disabled?: boolean;
}

export const SlideButton: React.FC<SlideButtonProps> = ({
  children,
  onPress,
  style,
  direction = 'bottom',
  delay = 0,
  disabled = false,
}) => {
  const translateAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(translateAnim, {
        toValue: 0,
        friction: 5,
        tension: 40,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 5,
      tension: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const translateTransform =
    direction === 'left'
      ? { translateX: translateAnim }
      : direction === 'right'
      ? { translateX: Animated.multiply(translateAnim, -1) }
      : { translateY: translateAnim };

  return (
    <Animated.View
      style={[
        {
          transform: [translateTransform, { scale: scaleAnim }],
          opacity: opacityAnim,
        },
        disabled && { opacity: 0.5 },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
        style={style}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── PressableFeedback (Modern Pressable-based) ────────────────────
interface PressableFeedbackProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  pressedStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export const PressableFeedback: React.FC<PressableFeedbackProps> = ({
  children,
  onPress,
  style,
  pressedStyle,
  disabled = false,
}) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        style,
        pressed && { transform: [{ scale: 0.96 }], opacity: 0.85 },
        pressedStyle,
        disabled && { opacity: 0.5 },
      ]}
    >
      {children}
    </Pressable>
  );
};

// ── IconButton (Icon-only with rotation) ──────────────────────────
interface IconButtonProps {
  icon: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  rotateOnPress?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  style,
  rotateOnPress = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.82,
      friction: 4,
      tension: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 400,
      useNativeDriver: true,
    }).start();

    if (rotateOnPress) {
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [rotateOnPress]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }, { rotate: rotation }] },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {icon}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  rippleContainer: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ripple: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});
