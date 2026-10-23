import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from '../components/ui/AppText';
import { LinearGradient } from 'expo-linear-gradient';
import { AppIcon } from '../components/ui/AppIcon';
import { GorillaMascot } from '../components/GorillaMascot';
import { GlowButton } from '../components/AnimatedButton';
import { useHaptics } from '../hooks/useHaptics';
import { useTheme } from '../theme/themeContext';
import { generateLessonQuestions, DynamicQuestion } from '../data/questionBank';
import { MAX_HEARTS, useAppStore } from '../store/useAppStore';

const PRACTICE_QUESTION_COUNT = 5;
const PRACTICE_XP = 5;

const buildPracticeQuestions = (): DynamicQuestion[] =>
  generateLessonQuestions('mixed', 12)
    .filter((q) => q.type === 'multiple_choice' || q.type === 'fill_blank')
    .slice(0, PRACTICE_QUESTION_COUNT);

interface PracticeScreenProps {
  navigation: any;
}

export const PracticeScreen: React.FC<PracticeScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const haptics = useHaptics();
  const { earnHeart, addXP } = useAppStore();
  const hearts = useAppStore((s) => s.progress.hearts);

  const [questions] = useState(buildPracticeQuestions);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [heartsBefore, setHeartsBefore] = useState(hearts);

  const goHome = () => {
    if (typeof navigation.popToTop === 'function') navigation.popToTop();
    else navigation.goBack();
  };

  const handleAnswer = (option: string) => {
    if (showResult) return;
    const exercise = questions[idx];
    const correct = option.trim().toLowerCase() === exercise.answer.trim().toLowerCase();

    haptics.lightTap();
    setSelected(option);
    setShowResult(true);
    setIsCorrect(correct);
    if (correct) {
      setCorrectCount((count) => count + 1);
      haptics.success();
    } else {
      haptics.warning();
    }
  };

  const finishPractice = () => {
    const before = useAppStore.getState().progress.hearts;
    setHeartsBefore(before);
    earnHeart();
    addXP(PRACTICE_XP);
    setFinished(true);
    haptics.celebration();
  };

  const handleContinue = () => {
    haptics.lightTap();
    if (idx + 1 >= questions.length) {
      finishPractice();
      return;
    }
    setIdx((current) => current + 1);
    setSelected(null);
    setShowResult(false);
    setIsCorrect(false);
  };

  if (questions.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Practice is unavailable right now.</Text>
        <TouchableOpacity onPress={goHome} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary, fontWeight: '800' }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (finished) {
    const earnedHeart = heartsBefore < MAX_HEARTS;
    const accuracy = Math.round((correctCount / questions.length) * 100);

    return (
      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.completeContainer}>
        <GorillaMascot size={120} mood="celebrate" />
        <Text style={styles.completeTitle}>Practice complete!</Text>
        <Text style={styles.completeSubtitle}>
          {earnedHeart ? 'You earned a heart!' : 'Your hearts were already full'}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <AppIcon name="heart" size={22} color="#D64545" />
            <Text style={styles.statValue}>{hearts}/{MAX_HEARTS}</Text>
            <Text style={styles.statLabel}>Hearts</Text>
          </View>
          <View style={styles.statCard}>
            <AppIcon name="star1" size={22} color="#D9A441" />
            <Text style={styles.statValue}>+{PRACTICE_XP} XP</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
          <View style={styles.statCard}>
            <AppIcon name="target" size={22} color="#FFFFFF" />
            <Text style={styles.statValue}>{accuracy}%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
        </View>

        <GlowButton style={styles.homeBtn} glowColor={colors.primaryDark} onPress={goHome}>
          <Text style={styles.homeBtnText}>Back to Home</Text>
          <AppIcon name="arrowRight1" size={20} color="#FFFFFF" />
        </GlowButton>
      </LinearGradient>
    );
  }

  const exercise = questions[idx];
  const options = exercise.options || exercise.blanks || [];
  const isMultipleChoice = exercise.type === 'multiple_choice';
  const progress = ((idx + 1) / questions.length) * 100;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={goHome}
          style={styles.closeBtn}
          accessibilityRole="button"
          accessibilityLabel="Close practice"
        >
          <AppIcon name="close" size={22} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.primary }]} />
        </View>

        <View style={[styles.earnPill, { backgroundColor: colors.heartRed + '18' }]}>
          <AppIcon name="heartAdd" size={15} color={colors.heartRed} />
          <Text style={[styles.earnText, { color: colors.heartRed }]}>Earn a heart</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.counter, { color: colors.textMuted }]}>
          {idx + 1} / {questions.length} · No hearts lost
        </Text>

        <View style={[styles.questionCard, { backgroundColor: colors.card }]}>
          <View style={styles.exerciseTypeRow}>
            <AppIcon name="flash" size={14} color={colors.primary} />
            <Text style={[styles.exerciseType, { color: colors.primary }]}>
              {isMultipleChoice ? 'Multiple Choice' : 'Fill in the Blank'}
            </Text>
          </View>

          <Text style={[styles.question, { color: colors.text }]}>{exercise.question}</Text>
          {exercise.hint && (
            <View style={styles.hintRow}>
              <AppIcon name="info" size={13} color={colors.textSecondary} />
              <Text style={[styles.hint, { color: colors.textSecondary }]}>{exercise.hint}</Text>
            </View>
          )}

          <View style={styles.optionsGrid}>
            {options.map((option) => {
              const chosen = selected === option;
              const right = option === exercise.answer;
              let backgroundColor = colors.surface;
              let borderColor = colors.border;
              let textColor = colors.text;

              if (showResult && right) {
                backgroundColor = colors.success + '20';
                borderColor = colors.success;
                textColor = colors.success;
              } else if (showResult && chosen && !right) {
                backgroundColor = colors.error + '20';
                borderColor = colors.error;
                textColor = colors.error;
              } else if (!showResult && chosen) {
                backgroundColor = colors.primary + '18';
                borderColor = colors.primary;
                textColor = colors.primary;
              }

              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.optionBtn, { backgroundColor, borderColor }]}
                  onPress={() => handleAnswer(option)}
                  disabled={showResult}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                >
                  {showResult && right && (
                    <AppIcon name="checkCircle" size={16} color={colors.success} />
                  )}
                  {showResult && chosen && !right && (
                    <AppIcon name="closeCircle" size={16} color={colors.error} />
                  )}
                  <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {showResult && (
          <View
            style={[
              styles.resultBanner,
              { backgroundColor: isCorrect ? colors.success + '18' : colors.error + '18' },
            ]}
          >
            <AppIcon
              name={isCorrect ? 'checkCircle' : 'closeCircle'}
              size={26}
              color={isCorrect ? colors.success : colors.error}
            />
            <View style={styles.resultCopy}>
              <Text style={[styles.resultTitle, { color: isCorrect ? colors.success : colors.error }]}>
                {isCorrect ? 'Nibyo! Correct!' : 'Sibyo! Not quite'}
              </Text>
              {!isCorrect && (
                <Text style={[styles.resultAnswer, { color: colors.textSecondary }]}>
                  Answer: {exercise.answer}
                </Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {showResult && (
        <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <GlowButton
            style={styles.continueBtn}
            glowColor={colors.primary}
            onPress={handleContinue}
          >
            <Text style={styles.continueText}>
              {idx + 1 >= questions.length ? 'Finish practice' : 'Continue'}
            </Text>
            <AppIcon name="arrowRight1" size={20} color="#FFFFFF" />
          </GlowButton>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBg: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  earnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 14,
  },
  earnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  counter: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
  },
  questionCard: {
    borderRadius: 20,
    padding: 18,
  },
  exerciseTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  exerciseType: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  question: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 27,
  },
  hint: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    marginTop: 8,
  },
  optionsGrid: {
    marginTop: 18,
    gap: 10,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
    borderRadius: 16,
    padding: 14,
  },
  resultCopy: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  resultAnswer: {
    fontSize: 12,
    marginTop: 3,
    fontWeight: '600',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0B6E84',
    borderRadius: 16,
    paddingVertical: 16,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 12,
  },
  completeSubtitle: {
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.86)',
    marginTop: 6,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
    marginBottom: 26,
  },
  statCard: {
    minWidth: 92,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 6,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  homeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 28,
    minWidth: 220,
  },
  homeBtnText: {
    color: '#0B6E84',
    fontSize: 16,
    fontWeight: '900',
  },
});
