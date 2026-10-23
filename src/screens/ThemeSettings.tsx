import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Text } from '../components/ui/AppText';
import { AppIcon } from '../components/ui/AppIcon';
import { useTheme, ThemeMode } from '../theme/themeContext';
import { Radius, Shadow } from '../theme/colors';
import { AnimatedButton } from '../components/AnimatedButton';

export const ThemeSettings: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark, themeMode, setThemeMode } = useTheme();

  const themeOptions: { mode: ThemeMode; icon: React.ReactNode; title: string; description: string }[] = [
    {
      mode: 'auto',
      icon: <AppIcon name="monitor" size={24} color={colors.primary} />,
      title: 'Auto / Nyabugenzubone',
      description: 'Follow system theme',
    },
    {
      mode: 'light',
      icon: <AppIcon name="sun" size={24} color={colors.primary} />,
      title: 'Light / Urumuri',
      description: 'Bright theme',
    },
    {
      mode: 'dark',
      icon: <AppIcon name="moon" size={24} color={colors.primary} />,
      title: 'Dark / Umwijima',
      description: 'Dark theme for night',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerTitleRow}>
          <AppIcon name="palette" size={20} color="#FFFFFF" />
          <Text style={styles.headerTitle}>Theme</Text>
        </View>
        <Text style={styles.headerSubtitle}>Choose how Menya looks</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Theme Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Hitamo Ibara / Choose Theme
          </Text>

          {themeOptions.map((option) => (
            <AnimatedButton
              key={option.mode}
              style={[
                styles.themeCard,
                { backgroundColor: colors.card },
                themeMode === option.mode && { 
                  borderColor: colors.primary,
                  borderWidth: 2,
                },
              ]}
              onPress={() => setThemeMode(option.mode)}
            >
              <View style={[styles.themeIcon, { backgroundColor: colors.primaryLight }]}>
                {option.icon}
              </View>
              <View style={styles.themeInfo}>
                <Text style={[styles.themeTitle, { color: colors.text }]}>
                  {option.title}
                </Text>
                <Text style={[styles.themeDesc, { color: colors.textSecondary }]}>
                  {option.description}
                </Text>
              </View>
              {themeMode === option.mode && (
                <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                  <AppIcon name="check" size={16} color="#FFFFFF" />
                </View>
              )}
            </AnimatedButton>
          ))}
        </View>

        {/* Preview */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Agacamake / Preview
          </Text>
          
          <View style={[styles.previewCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.previewTitle, { color: colors.text }]}>
              Muraho!
            </Text>
            <Text style={[styles.previewText, { color: colors.textSecondary }]}>
              This is how your app will look with the selected theme.
            </Text>
            
            <View style={styles.previewRow}>
              <View style={[styles.previewBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.previewBtnText}>Primary</Text>
              </View>
              <View style={[styles.previewBtn, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.previewBtnText, { color: colors.text }]}>Secondary</Text>
              </View>
            </View>

            <View style={styles.previewStats}>
              <View style={[styles.previewStat, { backgroundColor: colors.background }]}>
                <View style={styles.previewStatRow}>
                  <AppIcon name="flame" size={14} color={colors.primary} />
                  <Text style={[styles.previewStatValue, { color: colors.primary }]}>5</Text>
                </View>
                <Text style={[styles.previewStatLabel, { color: colors.textMuted }]}>Streak</Text>
              </View>
              <View style={[styles.previewStat, { backgroundColor: colors.background }]}>
                <View style={styles.previewStatRow}>
                  <AppIcon name="star" size={14} color={colors.xpOrange} />
                  <Text style={[styles.previewStatValue, { color: colors.xpOrange }]}>150</Text>
                </View>
                <Text style={[styles.previewStatLabel, { color: colors.textMuted }]}>XP</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Back button */}
        <AnimatedButton 
          style={[styles.backBtn, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}
          onPress={() => navigation.goBack()}
        >
          <AppIcon name="arrowLeft" size={18} color={colors.text} />
          <Text style={[styles.backBtnText, { color: colors.text }]}>Back</Text>
        </AnimatedButton>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  scroll: { flex: 1 },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadow.card,
  },
  themeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  themeInfo: { flex: 1 },
  themeTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  themeDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCard: {
    padding: 20,
    borderRadius: 16,
    ...Shadow.card,
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    marginBottom: 16,
  },
  previewRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  previewBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  previewBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  previewStats: {
    flexDirection: 'row',
    gap: 12,
  },
  previewStat: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  previewStatValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  previewStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  previewStatLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  backBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
