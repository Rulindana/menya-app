import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from '../components/ui/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppIcon } from '../components/ui/AppIcon';
import { useTheme } from '../theme/themeContext';

const LANGUAGES = [
  { id: 'en', code: 'EN', name: 'English', native: 'English', tint: '#D9EEF3', color: '#0B6E84' },
  { id: 'fr', code: 'FR', name: 'French', native: 'Français', tint: '#F1ECFA', color: '#7C5CBF' },
  { id: 'rw', code: 'RW', name: 'Kinyarwanda', native: 'Ikinyarwanda', tint: '#E6F6EE', color: '#2F9E6E' },
  { id: 'sw', code: 'SW', name: 'Swahili', native: 'Kiswahili', tint: '#FBF1E3', color: '#C9891C' },
];

const WHAT_YOU_GET = [
  {
    icon: 'bookOpen',
    title: 'Short, focused lessons',
    body: 'Learn Kinyarwanda in bite-sized sessions.',
  },
  {
    icon: 'flame',
    title: 'Streaks that stick',
    body: 'Build a daily habit with gentle reminders.',
  },
  {
    icon: 'award',
    title: 'A certificate to share',
    body: 'Finish the course and earn your PDF certificate.',
  },
];

interface OnboardingScreenProps {
  onComplete: (nativeLanguage: string | null) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [selected, setSelected] = useState('en');
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.progressWrap}>
        <View style={[styles.progressSegment, { backgroundColor: colors.primary }]} />
        <View style={[styles.progressSegment, { backgroundColor: colors.primary }]} />
        <View style={[styles.progressSegment, { backgroundColor: colors.border }]} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.eyebrow, { color: colors.primary }]}>PERSONALIZE YOUR LEARNING</Text>
        <Text style={[styles.title, { color: colors.text }]}>What is your native language?</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          We'll use this to make Menya feel right for you. You can change it later.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>What you'll get</Text>
        <View style={styles.benefits}>
          {WHAT_YOU_GET.map((item) => (
            <View key={item.title} style={styles.benefitRow}>
              <View style={[styles.benefitIcon, { backgroundColor: colors.primaryLight }]}>
                <AppIcon name={item.icon} size={19} color={colors.primary} />
              </View>
              <View style={styles.benefitCopy}>
                <Text style={[styles.benefitTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.benefitBody, { color: colors.textSecondary }]}>{item.body}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.languageList}>
          {LANGUAGES.map((language) => {
            const isSelected = selected === language.id;
            return (
              <TouchableOpacity
                key={language.id}
                style={[
                  styles.languageRow,
                  {
                    backgroundColor: isSelected ? colors.primaryLight : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelected(language.id)}
                activeOpacity={0.75}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected, checked: isSelected }}
              >
                <View style={[styles.languageBadge, { backgroundColor: language.tint }]}>
                  <Text style={[styles.languageCode, { color: language.color }]}>{language.code}</Text>
                </View>
                <View style={styles.languageCopy}>
                  <Text style={[styles.languageName, { color: colors.text }]}>{language.name}</Text>
                  <Text style={[styles.languageNative, { color: colors.textSecondary }]}>
                    {language.native}
                  </Text>
                </View>
                <AppIcon
                  name={isSelected ? 'checkCircle' : 'circle'}
                  size={22}
                  color={isSelected ? colors.primary : colors.border}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.comingSoon, { color: colors.textMuted }]}>
          More languages are coming soon.
        </Text>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: colors.background, borderTopColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.skipButton,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={() => onComplete(null)}
          activeOpacity={0.75}
        >
          <Text style={[styles.skipText, { color: colors.text }]}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: colors.primary },
            !selected && styles.continueDisabled,
          ]}
          onPress={() => onComplete(selected)}
          disabled={!selected}
          activeOpacity={0.85}
        >
          <Text style={styles.continueText}>Continue</Text>
          <AppIcon name="arrowRight" size={19} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  progressWrap: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 6,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 20,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    lineHeight: 37,
    fontWeight: '800',
    letterSpacing: -0.6,
    maxWidth: 340,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    maxWidth: 340,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 28,
    marginBottom: 12,
  },
  benefits: {
    gap: 12,
    marginBottom: 26,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitCopy: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  benefitBody: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  languageList: {
    gap: 10,
  },
  languageRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  languageBadge: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageCode: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  languageCopy: {
    flex: 1,
  },
  languageName: {
    fontSize: 15,
    fontWeight: '700',
  },
  languageNative: {
    fontSize: 12,
    marginTop: 2,
  },
  comingSoon: {
    fontSize: 11.5,
    textAlign: 'center',
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
  },
  skipButton: {
    height: 54,
    paddingHorizontal: 26,
    borderRadius: 27,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 15,
    fontWeight: '700',
  },
  continueButton: {
    flex: 1,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  continueDisabled: {
    opacity: 0.5,
  },
  continueText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
