import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from './ui/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from './ui/AppIcon';
import { useTheme } from '../theme/themeContext';
import {
  formatHeartCountdown,
  MAX_HEARTS,
  useAppStore,
} from '../store/useAppStore';

interface HeartsSheetProps {
  visible: boolean;
  onClose: () => void;
  onPractice: () => void;
  title?: string;
}

export const HeartsSheet: React.FC<HeartsSheetProps> = ({
  visible,
  onClose,
  onPractice,
  title,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const hearts = useAppStore((s) => s.progress.hearts);
  const nextHeartAt = useAppStore((s) => s.progress.nextHeartAt);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!visible) return;
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [visible, nextHeartAt]);

  const isFull = hearts >= MAX_HEARTS;
  const remaining = nextHeartAt ? Math.max(0, nextHeartAt - now) : 0;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              paddingBottom: Math.max(insets.bottom, 20),
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <View style={styles.headerRow}>
            <View style={[styles.heartBubble, { backgroundColor: colors.heartRed + '18' }]}>
              <AppIcon name="heart" size={30} color={colors.heartRed} />
            </View>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: colors.text }]}>
                {title || (hearts === 0 ? 'You ran out of hearts' : 'Hearts')}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {hearts === 0
                  ? 'You need a heart to finish a lesson.'
                  : 'Each mistake costs 1 heart.'}
              </Text>
            </View>
            <View style={[styles.countPill, { backgroundColor: colors.card }]}>
              <Text style={[styles.countText, { color: colors.heartRed }]}>
                {hearts}/{MAX_HEARTS}
              </Text>
            </View>
          </View>

          <View style={styles.heartsRow}>
            {Array.from({ length: MAX_HEARTS }).map((_, index) => (
              <AppIcon
                key={index}
                name="heart"
                size={30}
                color={index < hearts ? colors.heartRed : colors.border}
              />
            ))}
          </View>

          <View style={[styles.timerCard, { backgroundColor: colors.card }]}>
            <AppIcon
              name="clock"
              size={18}
              color={isFull ? colors.success : colors.textSecondary}
            />
            <Text style={[styles.timerText, { color: colors.text }]}>
              {isFull
                ? 'Hearts are full'
                : `Next heart in ${formatHeartCountdown(remaining)}`}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.practiceButton, { backgroundColor: colors.primary }]}
            onPress={onPractice}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Practice to earn a heart"
          >
            <View style={styles.practiceIcon}>
              <AppIcon name="heartAdd" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.practiceCopy}>
              <Text style={styles.practiceTitle}>
                {isFull ? 'Practice anyway' : 'Practice to earn a heart'}
              </Text>
              <Text style={styles.practiceSubtitle}>
                {isFull
                  ? 'Hearts are full — practice still earns XP'
                  : '5 questions · no hearts lost'}
              </Text>
            </View>
            <AppIcon name="arrowRight1" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.notNow}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <Text style={[styles.notNowText, { color: colors.textSecondary }]}>
              Not now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heartBubble: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    fontSize: 19,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },
  countPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  countText: {
    fontSize: 13,
    fontWeight: '900',
  },
  heartsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 18,
  },
  timerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '800',
  },
  practiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 14,
  },
  practiceIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  practiceCopy: {
    flex: 1,
  },
  practiceTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  practiceSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  notNow: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  notNowText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
