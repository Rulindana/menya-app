import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from '../components/ui/AppText';
import { AppIcon } from '../components/ui/AppIcon';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { AppModal } from '../components/AppModal';
import { XPBar } from '../components/XPBar';
import { getWordOfTheDay } from '../data/wordOfTheDay';
import { AvatarBadge } from '../components/AvatarPicker';
import { Footer } from '../components/Footer';
import { HeartsBadge } from '../components/HeartsBadge';
import { HeartsSheet } from '../components/HeartsSheet';
import { SectionBanner, UnitJourney } from '../components/journey/JourneyPath';
import { useAppStore, getXPBonus, getStreakMultiplier } from '../store/useAppStore';
import { speakKinyarwanda } from '../hooks/useSpeech';
import { useHaptics } from '../hooks/useHaptics';
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
  const { user, progress } = useAppStore();
  const { colors, isDark, setThemeMode } = useTheme();
  const haptics = useHaptics();
  const [wordOfDay] = useState(() => getWordOfTheDay());
  const [showHearts, setShowHearts] = useState(false);
  const [sectionInfo, setSectionInfo] = useState<JourneySection | null>(null);
  const [lockedMessage, setLockedMessage] = useState('');
  const [dailyDone, setDailyDone] = useState(false);

  // Check whether today's Daily Challenge is completed whenever HomeScreen is focused
  useEffect(() => {
    const checkDailyStatus = async () => {
      try {
        const stored = await AsyncStorage.getItem('menya_daily_challenge');
        if (stored) {
          const parsed = JSON.parse(stored);
          setDailyDone(parsed.date === new Date().toDateString() && parsed.completed === true);
        } else {
          setDailyDone(false);
        }
      } catch {
        setDailyDone(false);
      }
    };
    checkDailyStatus();
    const unsub = navigation.addListener?.('focus', checkDailyStatus);
    return unsub;
  }, [navigation]);

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
    haptics.lightTap();
    setThemeMode(isDark ? 'light' : 'dark');
  };

  const handleStartLesson = (lesson: Lesson) => {
    if (progress.hearts <= 0) {
      setShowHearts(true);
      return;
    }
    navigation.navigate('Lesson', { lessonId: lesson.id });
  };

  const handleSpeakWordOfDay = () => {
    haptics.lightTap();
    speakKinyarwanda(wordOfDay.kiny);
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
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScreenHeader
        left={
          <TouchableOpacity
            style={styles.identity}
            onPress={() => navigation.navigate('ProfileTab')}
            activeOpacity={0.78}
          >
            <AvatarBadge id={user.avatar} photoUri={user.photoUri} size={40} />
            <View style={styles.identityCopy}>
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>Muraho!</Text>
              <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                {user.displayName || 'Umunyeshuri'}
              </Text>
            </View>
          </TouchableOpacity>
        }
        right={
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={toggleTheme}
              activeOpacity={0.72}
            >
              <AppIcon
                name={isDark ? 'sun' : 'moon'}
                size={18}
                color={isDark ? colors.secondary : colors.textSecondary}
              />
            </TouchableOpacity>
            <View style={[styles.streakPill, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <AppIcon name="flame" size={14} color={colors.secondary} />
              <Text style={[styles.streakValue, { color: colors.text }]}>{progress.streak}</Text>
            </View>
          </View>
        }
      >
        <View style={styles.headerProgressRow}>
          <View style={styles.xpFlex}>
            <XPBar xp={progress.xp} level={progress.level} />
          </View>
          <HeartsBadge onPress={() => setShowHearts(true)} />
        </View>
      </ScreenHeader>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {(xpBonus > 0 || streakMultiplier > 1) && (
          <View style={[styles.bonusBanner, { backgroundColor: colors.card, borderLeftColor: colors.primary }]}>
            <AppIcon name="trendingUp" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.bonusTitle, { color: colors.text }]}>Active XP Boosts</Text>
              <Text style={[styles.bonusSubtitle, { color: colors.textSecondary }]}>
                {xpBonus > 0 ? `+${xpBonus} XP tier bonus` : 'Streak multiplier active'}
                {streakMultiplier > 1 ? ` · ${streakMultiplier}x streak multiplier` : ''}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.dailyChallengeCard,
            {
              backgroundColor: colors.card,
              borderColor: dailyDone ? colors.success + '55' : colors.border,
            },
          ]}
          onPress={() => navigation.navigate('DailyChallenge')}
          activeOpacity={0.85}
        >
          <View
            style={[
              styles.quickIcon,
              {
                backgroundColor: dailyDone
                  ? colors.success + '1F'
                  : colors.secondary + '1F',
              },
            ]}
          >
            <AppIcon
              name={dailyDone ? 'checkCircle' : 'flash'}
              size={19}
              color={dailyDone ? colors.success : colors.secondary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.dailyTitleRow}>
              <Text style={[styles.quickTitle, { color: colors.text }]}>Daily Challenge</Text>
              {dailyDone && (
                <View style={[styles.dailyDoneBadge, { backgroundColor: colors.success + '18' }]}>
                  <Text style={[styles.dailyDoneText, { color: colors.success }]}>Done today</Text>
                </View>
              )}
            </View>
            <Text style={[styles.quickSub, { color: colors.textSecondary }]}>
              {dailyDone
                ? 'Completed for today · Come back tomorrow!'
                : '5 questions · +30 XP · Resets at midnight'}
            </Text>
          </View>
          <AppIcon name="arrowRight" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={[styles.wordCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.quickIcon, { backgroundColor: colors.primaryLight }]}
            onPress={handleSpeakWordOfDay}
            activeOpacity={0.75}
          >
            <AppIcon name="volumeHigh" size={19} color={colors.primary} />
          </TouchableOpacity>
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
              /{wordOfDay.pronunciation}/ · {wordOfDay.example} ({wordOfDay.exampleTranslation})
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
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  identityCopy: { flex: 1 },
  greeting: { fontSize: 11.5, fontWeight: '500' },
  userName: { fontSize: 17, fontWeight: '700', letterSpacing: -0.2 },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 18,
  },
  streakValue: { fontSize: 13, fontWeight: '700' },
  headerProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  xpFlex: { flex: 1 },
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
  dailyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dailyDoneBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  dailyDoneText: {
    fontSize: 10,
    fontWeight: '800',
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
