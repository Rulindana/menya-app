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

const ONBOARDING = {
  background: '#F5F8FA',
  surface: '#FFFFFF',
  ink: '#14212B',
  muted: '#5C6B76',
  border: '#D5E1E7',
  primary: '#0B6E84',
  primaryDark: '#085468',
  primarySoft: '#E4F2F6',
  white: '#FFFFFF',
};

const LANGUAGES = [
  { id: 'en', code: 'EN', name: 'English', native: 'English', tint: '#D9EEF3' },
  { id: 'fr', code: 'FR', name: 'French', native: 'Français', tint: '#F1ECFA' },
  { id: 'rw', code: 'RW', name: 'Kinyarwanda', native: 'Ikinyarwanda', tint: '#E6F6EE' },
  { id: 'sw', code: 'SW', name: 'Swahili', native: 'Kiswahili', tint: '#FBF1E3' },
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <View style={styles.progressWrap}>
        <View style={[styles.progressSegment, styles.progressComplete]} />
        <View style={[styles.progressSegment, styles.progressComplete]} />
        <View style={[styles.progressSegment, styles.progressInactive]} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>PERSONALIZE YOUR LEARNING</Text>
        <Text style={styles.title}>What is your native language?</Text>
        <Text style={styles.subtitle}>
          We'll use this to make Menya feel right for you. You can change it later.
        </Text>

        <Text style={styles.sectionTitle}>What you'll get</Text>
        <View style={styles.benefits}>
          {WHAT_YOU_GET.map((item) => (
            <View key={item.title} style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <AppIcon name={item.icon} size={19} color={ONBOARDING.primary} />
              </View>
              <View style={styles.benefitCopy}>
                <Text style={styles.benefitTitle}>{item.title}</Text>
                <Text style={styles.benefitBody}>{item.body}</Text>
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
                  isSelected && styles.languageRowSelected,
                ]}
                onPress={() => setSelected(language.id)}
                activeOpacity={0.75}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected, checked: isSelected }}
              >
                <View style={[styles.languageBadge, { backgroundColor: language.tint }]}>
                  <Text style={styles.languageCode}>{language.code}</Text>
                </View>
                <View style={styles.languageCopy}>
                  <Text style={styles.languageName}>{language.name}</Text>
                  <Text style={styles.languageNative}>{language.native}</Text>
                </View>
                <AppIcon
                  name={isSelected ? 'checkCircle' : 'circle'}
                  size={22}
                  color={isSelected ? ONBOARDING.primary : ONBOARDING.border}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.comingSoon}>More languages are coming soon.</Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => onComplete(null)}
          activeOpacity={0.75}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.continueButton, !selected && styles.continueDisabled]}
          onPress={() => onComplete(selected)}
          disabled={!selected}
          activeOpacity={0.85}
        >
          <Text style={styles.continueText}>Continue</Text>
          <AppIcon name="arrowRight" size={19} color={ONBOARDING.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ONBOARDING.background,
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
  progressComplete: {
    backgroundColor: ONBOARDING.primary,
  },
  progressInactive: {
    backgroundColor: '#DCE5EA',
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
    color: ONBOARDING.primary,
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    lineHeight: 37,
    fontWeight: '800',
    color: ONBOARDING.ink,
    letterSpacing: -0.6,
    maxWidth: 340,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: ONBOARDING.muted,
    marginTop: 10,
    maxWidth: 340,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: ONBOARDING.ink,
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
    backgroundColor: ONBOARDING.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitCopy: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: ONBOARDING.ink,
  },
  benefitBody: {
    fontSize: 12,
    lineHeight: 17,
    color: ONBOARDING.muted,
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
    backgroundColor: ONBOARDING.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: ONBOARDING.border,
  },
  languageRowSelected: {
    borderColor: ONBOARDING.primary,
    backgroundColor: ONBOARDING.primarySoft,
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
    color: ONBOARDING.ink,
  },
  languageCopy: {
    flex: 1,
  },
  languageName: {
    fontSize: 15,
    fontWeight: '700',
    color: ONBOARDING.ink,
  },
  languageNative: {
    fontSize: 12,
    color: ONBOARDING.muted,
    marginTop: 2,
  },
  comingSoon: {
    fontSize: 11.5,
    color: ONBOARDING.muted,
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
    borderTopColor: '#E2EAEE',
    backgroundColor: ONBOARDING.background,
  },
  skipButton: {
    height: 54,
    paddingHorizontal: 26,
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: ONBOARDING.border,
    backgroundColor: ONBOARDING.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 15,
    fontWeight: '700',
    color: ONBOARDING.ink,
  },
  continueButton: {
    flex: 1,
    height: 54,
    borderRadius: 27,
    backgroundColor: ONBOARDING.primary,
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
    color: ONBOARDING.white,
  },
});
