import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Text } from '../components/ui/AppText';
import { AppIcon } from '../components/ui/AppIcon';
import { AppModal } from '../components/AppModal';
import { XPBar } from '../components/XPBar';
import { RwandaSun } from '../components/RwandaSun';
import { getWordOfTheDay } from '../data/wordOfTheDay';
import { AvatarBadge } from '../components/AvatarPicker';
import { Footer } from '../components/Footer';
import { HeartsBadge } from '../components/HeartsBadge';
import { HeartsSheet } from '../components/HeartsSheet';
import { SectionBanner, UnitJourney } from '../components/journey/JourneyPath';
import { useAppStore, getXPBonus, getStreakMultiplier } from '../store/useAppStore';
import { useTheme } from '../theme/themeContext';
import { getTotalLessons, Lesson, units } from '../data/lessons';
import {
  getSectionUnits,
  getUnitNumber,
  isUnitComplete,
  JourneySection,
  journeySections,
} from '../data/journey';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, progress, loadFromStorage } = useAppStore();
  const { colors, isDark, setThemeMode } = useTheme();
  const [wordOfDay] = useState(() => getWordOfTheDay());
  const [showHearts, setShowHearts] = useState(false);
  const [sectionInfo, setSectionInfo] = useState<JourneySection | null>(null);
  const [lockedMessage, setLockedMessage] = useState('');

  useEffect(() => {
    loadFromStorage();
  }, []);

  const completedIds = progress.completedLessons;
  const perfectIds = progress.perfectLessons ?? [];
  const totalLessons = getTotalLessons();
  const allUnitsComplete = units.every((unit) => isUnitComplete(unit, completedIds));

  const isUnitUnlocked = (unitIndex: number) =>
    unitIndex === 0 ||
    units.slice(0, unitIndex).every((unit) => isUnitComplete(unit, completedIds));

  const xpBonus = getXPBonus(progress.xp);
  const streakMultiplier = getStreakMultiplier(progress.streak);

  const toggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  const handleStartLesson = (lesson: Lesson) => {
    if (progress.hearts <= 0) {
      setShowHearts(true);
      return;
    }
    navigation.navigate('Lesson', { lessonId: lesson.id });
  };

  const guideMessage = sectionInfo
    ? getSectionUnits(sectionInfo)
        .map((unit) => {
          const lessonCount = unit.lessons.length;
          const xp = unit.lessons.reduce((sum, lesson) => sum + lesson.xpReward, 0);
          return `Unit ${getUnitNumber(unit.id)} · ${unit.title}\n${lessonCount} lessons · ${xp} XP`;
        })
        .join('\n\n')
    : '';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />

      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.sunDecor}>
          <RwandaSun size={70} animated opacity={0.15} />
        </View>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <AvatarBadge id={user.avatar} size={38} />
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.greeting}>Muraho!</Text>
              <Text style={styles.userName}>{user.displayName || 'Umunyeshuri'}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme} activeOpacity={0.7}>
              {isDark ? (
                <AppIcon name="sun" size={18} color="#D9A441" />
              ) : (
                <AppIcon name="moon" size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>
            <View style={styles.statBadge}>
              <AppIcon name="flame" size={15} color="#D9A441" />
              <Text style={styles.statValue}>{progress.streak}</Text>
            </View>
          </View>
        </View>
        <View style={styles.xpBarWrapper}>
          <View style={styles.xpBarFlex}>
            <XPBar xp={progress.xp} level={progress.level} />
          </View>
          <HeartsBadge onPress={() => setShowHearts(true)} />
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {xpBonus > 0 && (
          <View style={[styles.bonusBanner, { backgroundColor: colors.card, borderLeftColor: colors.primary }]}>
            <AppIcon name="trendingUp" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.bonusTitle, { color: colors.text }]}>XP Bonus Active</Text>
              <Text style={[styles.bonusSubtitle, { color: colors.textSecondary }]}>
                +{xpBonus} XP per lesson
                {streakMultiplier > 1 && ` · ${streakMultiplier}x streak bonus`}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.dailyChallengeCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate('DailyChallenge')}
          activeOpacity={0.85}
        >
          <View style={[styles.quickIcon, { backgroundColor: colors.secondary + '1F' }]}>
            <AppIcon name="flash" size={19} color={colors.secondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.quickTitle, { color: colors.text }]}>Daily Challenge</Text>
            <Text style={[styles.quickSub, { color: colors.textSecondary }]}>
              5 questions · +30 XP · Resets at midnight
            </Text>
          </View>
          <AppIcon name="arrowRight" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={[styles.wordCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.quickIcon, { backgroundColor: colors.primaryLight }]}>
            <AppIcon name="sparkles" size={19} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.wordTopRow}>
              <Text style={[styles.wordOverline, { color: colors.textMuted }]}>WORD OF THE DAY</Text>
              <View style={[styles.wordCategory, { backgroundColor: colors.primary + '16' }]}>
                <Text style={[styles.wordCategoryText, { color: colors.primary }]}>{wordOfDay.category}</Text>
              </View>
            </View>
            <Text style={[styles.wordTitle, { color: colors.text }]}>
              {wordOfDay.kiny}{' '}
              <Text style={[styles.wordTranslation, { color: colors.primary }]}>· {wordOfDay.english}</Text>
            </Text>
            <Text style={[styles.wordMeta, { color: colors.textSecondary }]}>
              /{wordOfDay.pronunciation}/ · {wordOfDay.exampleTranslation}
            </Text>
          </View>
        </View>

        <View style={styles.journeyHeading}>
          <View>
            <Text style={[styles.journeyTitle, { color: colors.text }]}>Your learning journey</Text>
            <Text style={[styles.journeySub, { color: colors.textSecondary }]}>
              {completedIds.length} of {totalLessons} lessons complete
            </Text>
          </View>
          <Text style={[styles.journeyPercent, { color: colors.primary }]}>
            {Math.round((completedIds.length / totalLessons) * 100)}%
          </Text>
        </View>
        <View style={[styles.totalProgressTrack, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.totalProgressFill,
              {
                width: `${(completedIds.length / totalLessons) * 100}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>

        {journeySections.map((section, sectionIndex) => {
          const sectionUnits = getSectionUnits(section);
          const completedUnits = sectionUnits.filter((unit) =>
            isUnitComplete(unit, completedIds),
          ).length;

          return (
            <React.Fragment key={section.id}>
              <SectionBanner
                section={section}
                index={sectionIndex}
                completedUnits={completedUnits}
                totalUnits={sectionUnits.length}
                onGuidebook={() => setSectionInfo(section)}
              />
              {sectionUnits.map((unit) => {
                const unitIndex = units.findIndex((candidate) => candidate.id === unit.id);
                return (
                  <UnitJourney
                    key={unit.id}
                    unit={unit}
                    unitNumber={getUnitNumber(unit.id)}
                    unlocked={isUnitUnlocked(unitIndex)}
                    completedIds={completedIds}
                    perfectIds={perfectIds}
                    onStartLesson={handleStartLesson}
                    onLockedLesson={setLockedMessage}
                  />
                );
              })}
            </React.Fragment>
          );
        })}

        <View
          style={[
            styles.certificateCard,
            {
              backgroundColor: colors.card,
              borderColor: allUnitsComplete ? colors.secondary : colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.certificateIcon,
              { backgroundColor: allUnitsComplete ? colors.secondary + '1F' : colors.background },
            ]}
          >
            <AppIcon
              name={allUnitsComplete ? 'award' : 'lock'}
              size={28}
              color={allUnitsComplete ? colors.secondary : colors.textMuted}
            />
          </View>
          <View style={styles.certificateCopy}>
            <Text style={[styles.certificateTitle, { color: colors.text }]}>
              Menya Certificate
            </Text>
            <Text style={[styles.certificateSub, { color: colors.textSecondary }]}>
              {allUnitsComplete
                ? 'Your Kinyarwanda journey is complete. View and share your certificate.'
                : `Finish all lessons to unlock your certificate (${completedIds.length}/${totalLessons}).`}
            </Text>
          </View>
          {allUnitsComplete && (
            <TouchableOpacity
              style={[styles.certificateButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Certificate')}
              activeOpacity={0.85}
            >
              <Text style={styles.certificateButtonText}>View</Text>
              <AppIcon name="arrowRight" size={15} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        <Footer />
        <View style={{ height: 28 }} />
      </ScrollView>

      <HeartsSheet
        visible={showHearts}
        onClose={() => setShowHearts(false)}
        onPractice={() => {
          setShowHearts(false);
          navigation.navigate('Practice');
        }}
      />

      <AppModal
        visible={!!sectionInfo}
        title={sectionInfo?.title || ''}
        message={`${sectionInfo?.subtitle || ''}\n\n${guideMessage}`}
        type="info"
        icon="bookOpen"
        confirmText="Close"
        showCancel={false}
        onConfirm={() => setSectionInfo(null)}
      />

      <AppModal
        visible={!!lockedMessage}
        title="Lesson locked"
        message={lockedMessage}
        type="warning"
        icon="lock"
        confirmText="Got it"
        showCancel={false}
        onConfirm={() => setLockedMessage('')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  sunDecor: { position: 'absolute', top: 10, right: 10 },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerRight: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  greeting: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  userName: { fontSize: 17, fontWeight: '800', color: '#FFFFFF' },
  themeToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
  },
  statValue: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
  xpBarWrapper: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 2 },
  xpBarFlex: { flex: 1 },
  scroll: { flex: 1 },
  bonusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    gap: 10,
    borderLeftWidth: 4,
  },
  bonusTitle: { fontSize: 14, fontWeight: '700' },
  bonusSubtitle: { fontSize: 12, marginTop: 2 },
  dailyChallengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTitle: { fontSize: 15, fontWeight: '700' },
  quickSub: { fontSize: 12, marginTop: 2 },
  wordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  wordTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wordOverline: { fontSize: 9.5, fontWeight: '800', letterSpacing: 1 },
  wordCategory: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  wordCategoryText: { fontSize: 9, fontWeight: '700' },
  wordTitle: { fontSize: 18, fontWeight: '700', marginTop: 2 },
  wordTranslation: { fontSize: 15, fontWeight: '500' },
  wordMeta: { fontSize: 11, marginTop: 2 },
  journeyHeading: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginHorizontal: 18,
    marginTop: 26,
  },
  journeyTitle: { fontSize: 19, fontWeight: '700', letterSpacing: -0.2 },
  journeySub: { fontSize: 12, marginTop: 2 },
  journeyPercent: { fontSize: 18, fontWeight: '700' },
  totalProgressTrack: {
    height: 7,
    marginHorizontal: 18,
    marginTop: 10,
    borderRadius: 4,
    overflow: 'hidden',
  },
  totalProgressFill: { height: '100%', borderRadius: 4 },
  certificateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 30,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  certificateIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  certificateCopy: { flex: 1 },
  certificateTitle: { fontSize: 16, fontWeight: '700' },
  certificateSub: { fontSize: 11.5, lineHeight: 17, marginTop: 3 },
  certificateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
  },
  certificateButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
});
