import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Check if haptics are available
const isHapticsAvailable = Platform.OS === 'ios' || Platform.OS === 'android';

export const useHaptics = () => {
  // Light tap - for button presses
  const lightTap = async () => {
    if (!isHapticsAvailable) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // Haptics not available
    }
  };

  // Medium tap - for selections
  const mediumTap = async () => {
    if (!isHapticsAvailable) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      // Haptics not available
    }
  };

  // Heavy tap - for important actions
  const heavyTap = async () => {
    if (!isHapticsAvailable) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (e) {
      // Haptics not available
    }
  };

  // Success notification - for correct answers
  const success = async () => {
    if (!isHapticsAvailable) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      // Haptics not available
    }
  };

  // Warning notification - for wrong answers
  const warning = async () => {
    if (!isHapticsAvailable) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (e) {
      // Haptics not available
    }
  };

  // Error notification - for mistakes
  const error = async () => {
    if (!isHapticsAvailable) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (e) {
      // Haptics not available
    }
  };

  // Selection changed - for toggles
  const selection = async () => {
    if (!isHapticsAvailable) return;
    try {
      await Haptics.selectionAsync();
    } catch (e) {
      // Haptics not available
    }
  };

  // Double tap - for special actions
  const doubleTap = async () => {
    if (!isHapticsAvailable) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, 100);
    } catch (e) {
      // Haptics not available
    }
  };

  // Triple tap - for celebrations
  const tripleTap = async () => {
    if (!isHapticsAvailable) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 100);
      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 200);
    } catch (e) {
      // Haptics not available
    }
  };

  // Rising pattern - for level up
  const levelUp = async () => {
    if (!isHapticsAvailable) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, 100);
      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 200);
    } catch (e) {
      // Haptics not available
    }
  };

  // Celebration pattern - for achievements
  const celebration = async () => {
    if (!isHapticsAvailable) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 80);
      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, 160);
      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 240);
    } catch (e) {
      // Haptics not available
    }
  };

  // Streak pattern - for streaks
  const streak = async () => {
    if (!isHapticsAvailable) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, 150);
      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 300);
    } catch (e) {
      // Haptics not available
    }
  };

  // Error pattern - for mistakes
  const mistake = async () => {
    if (!isHapticsAvailable) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 150);
    } catch (e) {
      // Haptics not available
    }
  };

  return {
    lightTap,
    mediumTap,
    heavyTap,
    success,
    warning,
    error,
    selection,
    doubleTap,
    tripleTap,
    levelUp,
    celebration,
    streak,
    mistake,
  };
};
