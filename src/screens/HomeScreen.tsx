import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  LayoutAnimation,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppIcon } from '../components/ui/AppIcon';
import { Radius } from '../theme/colors';
import { XPBar } from '../components/XPBar';
import { RwandaSun } from '../components/RwandaSun';
import { getWordOfTheDay } from '../data/wordOfTheDay';
import { getAvatarEmoji } from '../components/AvatarPicker';
import { Footer } from '../components/Footer';
import { useAppStore, getXPBonus, getStreakMultiplier } from '../store/useAppStore';
import { useTheme } from '../theme/themeContext';
import { units } from '../data/lessons';

const getUnitIcon = (unitId: string) => {
  const icons: Record<string, any> = {
    unit1: 'message',
    unit2: 'calculator',
    unit3: 'colorfilter',
    unit4: 'people',
    unit5: 'coffee',
    unit6: 'pet',
    unit7: 'body',
    unit8: 'clock',
    unit9: 'activity',
    unit10: 'location',
    unit11: 'cloud',
    unit12: 'teacher',
    unit13: 'messages',
    unit14: 'home',
  };
  return icons[unitId] || 'book';
};

const getStreakGradient = (streak: number): [string, string, string] => {
  if (streak >= 30) return ['#1a472a', '#20603D', '#2D8653'];
  if (streak >= 14) return ['#0d3320', '#1a5c3a', '#2D8653'];
  if (streak >= 7) return ['#004d40', '#00695c', '#00897b'];
  if (streak >= 3) return ['#1b5e20', '#2e7d32', '#388e3c'];
  return ['#0d3320', '#20603D', '#2D8653'];
};

// Animated Lesson Node
const LessonNode: React.FC<{
  lesson: any;
  completed: boolean;
  unlocked: boolean;
  isCurrent: boolean;
  isLast: boolean;
  unitColor: string;
  colors: any;
  onPress: () => void;
}> = ({ lesson, completed, unlocked, isCurrent, isLast, unitColor, colors, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    if (!unlocked || completed) return;
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.08,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

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
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
    glowAnim.setValue(0);
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  return (
    <View style={styles.lessonNode}>
      {/* Connecting line */}
      {!isLast && (
        <View style={[
          styles.connectorLine,
          { backgroundColor: completed ? unitColor : colors.border }
        ]} />
      )}
      
      {/* Entire row is tappable */}
      <TouchableOpacity
        style={styles.nodeContainer}
        onPress={isCurrent ? onPress : undefined}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!isCurrent}
        activeOpacity={isCurrent ? 0.7 : 1}
      >
        {/* Circle icon */}
        <Animated.View
          style={[
            { transform: [{ scale: scaleAnim }] },
            {
              shadowColor: unitColor,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: unlocked ? glowOpacity : 0,
              shadowRadius: 12,
              elevation: unlocked ? 8 : 0,
            },
          ]}
        >
          <View
            style={[
              styles.nodeCircle,
              { 
                backgroundColor: completed ? unitColor : 
                               isCurrent ? colors.card : colors.border,
                borderColor: completed ? unitColor : 
                           isCurrent ? unitColor : colors.border,
              },
              !isCurrent && styles.nodeLocked,
            ]}
          >
            {completed ? (
              <AppIcon name="checkCircle" size={24} color="#FFFFFF" />
            ) : unlocked ? (
              <AppIcon name="book1" size={20} color={unitColor} />
            ) : (
              <AppIcon name="lock" size={18} color={colors.textMuted} />
            )}
          </View>
        </Animated.View>

        {/* Lesson info */}
        <View style={styles.lessonInfo}>
          <Text style={[
            styles.lessonTitle,
            { color: unlocked ? colors.text : colors.textMuted },
            completed && { color: unitColor }
          ]}>
            {lesson.title}
          </Text>
          <Text style={[styles.lessonTitleKiny, { color: colors.textSecondary }]}>
            {lesson.titleKiny}
          </Text>
          <View style={styles.lessonXP}>
            <AppIcon name="star1" size={11} color="#FF6B35" />
            <Text style={[styles.lessonXPText, { color: colors.xpOrange }]}>
              {lesson.xpReward} XP
            </Text>
          </View>
        </View>

        {/* Arrow for unlocked lessons */}
        {isCurrent && (
          <AppIcon name="arrowRight" size={18} color={colors.textMuted} />
        )}
      </TouchableOpacity>
    </View>
  );
};

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, progress, loadFromStorage } = useAppStore();
  const { colors, isDark, setThemeMode } = useTheme();
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});
  const [wordOfDay] = useState(() => getWordOfTheDay());

  useEffect(() => {
    loadFromStorage();
    setExpandedUnits({ unit1: true });
  }, []);

  const isLessonCompleted = (lessonId: string) =>
    progress.completedLessons.includes(lessonId);

  const isLessonUnlocked = (unitIdx: number, lessonIdx: number) => {
    if (unitIdx === 0 && lessonIdx === 0) return true;
    if (lessonIdx > 0) {
      const prevLesson = units[unitIdx].lessons[lessonIdx - 1];
      return isLessonCompleted(prevLesson.id);
    }
    const prevUnit = units[unitIdx - 1];
    return prevUnit.lessons.every((l) => isLessonCompleted(l.id));
  };

  const gradientColors = getStreakGradient(progress.streak);
  const xpBonus = getXPBonus(progress.xp);
  const streakMultiplier = getStreakMultiplier(progress.streak);

  const toggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  const toggleUnit = (unitId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedUnits(prev => ({
      ...prev,
      [unitId]: !prev[unitId],
    }));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0d3320" />

      {/* Header */}
      <LinearGradient colors={gradientColors} style={styles.header}>
        <View style={styles.sunDecor}>
          <RwandaSun size={70} animated opacity={0.15} />
        </View>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarEmoji}>{getAvatarEmoji(user.avatar)}</Text>
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.greeting}>Muraho!</Text>
              <Text style={styles.userName}>{user.displayName || 'Umunyeshuri'}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme} activeOpacity={0.7}>
              {isDark ? <AppIcon name="sun" size={18} color="#FFD700" /> : <AppIcon name="moon" size={18} color="#FFFFFF" />}
            </TouchableOpacity>
            <View style={styles.statBadge}>
              <AppIcon name="flame" size={15} color="#FFD700" />
              <Text style={styles.statValue}>{progress.streak}</Text>
            </View>
            <View style={[styles.statBadge, { backgroundColor: 'rgba(255,82,82,0.3)' }]}>
              <AppIcon name="star1" size={14} color="#FFD700" />
              <Text style={styles.statValue}>{progress.xp}</Text>
            </View>
          </View>
        </View>
        <View style={styles.xpBarWrapper}>
          <XPBar xp={progress.xp} level={progress.level} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* XP Bonus Banner */}
        {xpBonus > 0 && (
          <View style={[styles.bonusBanner, { backgroundColor: colors.card, borderLeftColor: colors.primary }]}>
            <AppIcon name="trendingUp" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.bonusTitle, { color: colors.text }]}>XP Bonus Active!</Text>
              <Text style={[styles.bonusSubtitle, { color: colors.textSecondary }]}>
                +{xpBonus} XP per lesson
                {streakMultiplier > 1 && ` • ${streakMultiplier}x streak bonus`}
              </Text>
            </View>
          </View>
        )}

        {/* Daily Challenge Banner */}
        <TouchableOpacity
          style={styles.dailyChallengeCard}
          onPress={() => navigation.navigate('DailyChallenge')}
          activeOpacity={0.85}
        >
          <Text style={{ fontSize: 28 }}>⚡</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.dailyChallengeTitle}>Daily Challenge</Text>
            <Text style={styles.dailyChallengeSub}>5 questions · +30 XP · Resets at midnight</Text>
          </View>
          <AppIcon name="arrowRight" size={18} color="#FFD700" />
        </TouchableOpacity>

        {/* Word of the Day */}
        <View style={[styles.wordOfDayCard, { backgroundColor: colors.card, borderColor: colors.primary }]}>
          <View style={styles.wordOfDayHeader}>
            <Text style={styles.wordOfDayIcon}>✨</Text>
            <Text style={[styles.wordOfDayLabel, { color: colors.primary }]}>Word of the Day</Text>
            <View style={[styles.wordCategoryBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.wordCategoryText, { color: colors.primary }]}>{wordOfDay.category}</Text>
            </View>
          </View>
          <Text style={[styles.wordKiny, { color: colors.text }]}>{wordOfDay.kiny}</Text>
          <Text style={[styles.wordPronunciation, { color: colors.textMuted }]}>/{wordOfDay.pronunciation}/</Text>
          <Text style={[styles.wordEnglish, { color: colors.primary }]}>{wordOfDay.english}</Text>
          <View style={[styles.wordExampleBox, { backgroundColor: colors.background }]}>
            <Text style={[styles.wordExample, { color: colors.text }]}>📝 {wordOfDay.example}</Text>
            <Text style={[styles.wordExampleTrans, { color: colors.textSecondary }]}>{wordOfDay.exampleTranslation}</Text>
          </View>
        </View>

        {/* Units with vertical path */}
        {units.map((unit, unitIdx) => {
          const isExpanded = expandedUnits[unit.id] || false;
          const unitCompleted = unit.lessons.filter(l => isLessonCompleted(l.id)).length;
          const unitTotal = unit.lessons.length;

          return (
            <View key={unit.id} style={styles.unitContainer}>
              {/* Unit Header - Animated */}
              <TouchableOpacity
                style={[styles.unitHeader, { backgroundColor: colors.card }]}
                onPress={() => toggleUnit(unit.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.unitIconContainer, { backgroundColor: unit.color }]}>
                  <AppIcon name={getUnitIcon(unit.id)} size={20} color="#FFFFFF" />
                </View>
                <View style={styles.unitInfo}>
                  <Text style={[styles.unitNumber, { color: colors.text }]}>
                    {unitIdx + 1}. {unit.title}
                  </Text>
                  <Text style={[styles.unitTitleKiny, { color: colors.textSecondary }]}>
                    {unit.titleKiny}
                  </Text>
                </View>
                <View style={styles.unitRight}>
                  <Text style={[styles.unitProgressText, { color: colors.textSecondary }]}>
                    {unitCompleted}/{unitTotal}
                  </Text>
                  <Animated.View style={{
                    transform: [{ rotate: isExpanded ? '180deg' : '0deg' }]
                  }}>
                    <AppIcon name="arrowDown" size={20} color={colors.textMuted} />
                  </Animated.View>
                </View>
              </TouchableOpacity>

              {/* Lessons - Vertical Path Style */}
              {isExpanded && (
                <View style={styles.lessonsPath}>
                  {unit.lessons.map((lesson, lessonIdx) => {
                    const completed = isLessonCompleted(lesson.id);
                    const unlocked = isLessonUnlocked(unitIdx, lessonIdx);
                    const isLast = lessonIdx === unit.lessons.length - 1;
                    // Only the next unlocked, non-completed lesson is clickable
                    const isCurrent = unlocked && !completed;

                    return (
                      <LessonNode
                        key={lesson.id}
                        lesson={lesson}
                        completed={completed}
                        unlocked={unlocked}
                        isCurrent={isCurrent}
                        isLast={isLast}
                        unitColor={unit.color}
                        colors={colors}
                        onPress={() => {
                          if (isCurrent) {
                            navigation.navigate('Lesson', { lessonId: lesson.id });
                          }
                        }}
                      />
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        <Footer />
        <View style={{ height: 20 }} />
      </ScrollView>
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
  avatarEmoji: { fontSize: 30 },
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
  xpBarWrapper: { paddingHorizontal: 2 },
  scroll: { flex: 1 },
  bonusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginBottom: 0,
    padding: 12,
    borderRadius: Radius.md,
    gap: 10,
    borderLeftWidth: 4,
  },
  bonusTitle: { fontSize: 14, fontWeight: '800' },
  bonusSubtitle: { fontSize: 12, marginTop: 2 },
  unitContainer: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  unitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    gap: 12,
  },
  unitIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitInfo: { flex: 1 },
  unitNumber: { fontSize: 14, fontWeight: '700' },
  unitTitleKiny: { fontSize: 11, marginTop: 2 },
  unitRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unitProgressText: { fontSize: 12, fontWeight: '600' },
  lessonsPath: {
    paddingLeft: 20,
    paddingTop: 8,
  },
  lessonNode: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  connectorLine: {
    position: 'absolute',
    left: 24,
    top: 44,
    bottom: 0,
    width: 3,
    borderRadius: 2,
  },
  nodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
    paddingBottom: 16,
  },
  nodeCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeLocked: {
    opacity: 0.5,
  },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 14, fontWeight: '700' },
  lessonTitleKiny: { fontSize: 11, marginTop: 2 },
  lessonXP: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  lessonXPText: { fontSize: 12, fontWeight: '700' },
  wordOfDayCard: { marginHorizontal: 16, marginTop: 14, marginBottom: 4, padding: 16, borderRadius: 16, borderWidth: 2, borderLeftWidth: 5 },
  dailyChallengeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 16, marginTop: 14,
    padding: 14, borderRadius: 14,
    backgroundColor: '#FFD70022', borderWidth: 1.5, borderColor: '#FFD700',
  },
  dailyChallengeTitle: { fontSize: 15, fontWeight: '900', color: '#FFD700' },
  dailyChallengeSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  wordOfDayHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  wordOfDayIcon: { fontSize: 18 },
  wordOfDayLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, flex: 1 },
  wordCategoryBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  wordCategoryText: { fontSize: 10, fontWeight: '700' },
  wordKiny: { fontSize: 26, fontWeight: '900', marginBottom: 2 },
  wordPronunciation: { fontSize: 13, fontStyle: 'italic', marginBottom: 4 },
  wordEnglish: { fontSize: 17, fontWeight: '800', marginBottom: 10 },
  wordExampleBox: { borderRadius: 10, padding: 12, gap: 4 },
  wordExample: { fontSize: 13, fontWeight: '600' },
  wordExampleTrans: { fontSize: 12, fontStyle: 'italic' },
});
