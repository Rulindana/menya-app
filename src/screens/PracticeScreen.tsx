import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from '../components/ui/AppText';
import { AppIcon } from '../components/ui/AppIcon';
import { InteractiveOptionCard } from '../components/ui/InteractiveOptionCard';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { GorillaMascot } from '../components/GorillaMascot';
import { GlowButton } from '../components/AnimatedButton';
import { useHaptics } from '../hooks/useHaptics';
import { speakKinyarwanda } from '../hooks/useSpeech';
import { useTheme } from '../theme/themeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
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

  const handleSelectOption = (option: string) => {
    if (showResult) return;
    haptics.selection();
    setSelected(option);
  };

  const handleCheckAnswer = () => {
    if (showResult || !selected) return;
    const exercise = questions[idx];
    const correct = selected.trim().toLowerCase() === exercise.answer.trim().toLowerCase();

    setShowResult(true);
    setIsCorrect(correct);
    if (correct) {
      setCorrectCount((count) => count + 1);
      haptics.success();
      if (exercise.audioWord) speakKinyarwanda(exercise.audioWord);
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
      <View style={[styles.completeContainer, { backgroundColor: colors.background }]}>
        <ScreenHeader
          onBack={goHome}
          backIcon="close"
          title="Practice complete"
          subtitle={`${questions.length} questions reviewed`}
          right={
            <View style={[styles.completeXpPill, { backgroundColor: colors.secondary + '18' }]}>
              <AppIcon name="star" size={13} color={colors.secondary} />
              <Text style={[styles.completeXpPillText, { color: colors.secondary }]}>
                +{PRACTICE_XP} XP
              </Text>
            </View>
          }
        />
        <ScrollView contentContainerStyle={styles.completeBody} showsVerticalScrollIndicator={false}>
          <GorillaMascot size={120} mood="celebrate" />
          <Text style={[styles.completeTitle, { color: colors.text }]}>Practice complete!</Text>
          <Text style={[styles.completeSubtitle, { color: colors.textSecondary }]}>
            {earnedHeart ? 'You earned a heart!' : 'Your hearts were already full'}
          </Text>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <AppIcon name="heart" size={22} color={colors.heartRed} />
              <Text style={[styles.statValue, { color: colors.text }]}>{hearts}/{MAX_HEARTS}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Hearts</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <AppIcon name="star" size={22} color={colors.xpOrange} />
              <Text style={[styles.statValue, { color: colors.text }]}>+{PRACTICE_XP} XP</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Earned</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <AppIcon name="target" size={22} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>{accuracy}%</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Accuracy</Text>
            </View>
          </View>

          <GlowButton
            style={[styles.homeBtn, { backgroundColor: colors.primary }]}
            glowColor={colors.primaryDark}
            onPress={goHome}
          >
            <Text style={styles.homeBtnText}>Back to Home</Text>
            <AppIcon name="arrowRight1" size={20} color="#FFFFFF" />
          </GlowButton>
        </ScrollView>
      </View>
    );
  }

  const exercise = questions[idx];
  const options = exercise.options || exercise.blanks || [];
  const isMultipleChoice = exercise.type === 'multiple_choice';
  const progress = (idx + (showResult ? 1 : 0)) / questions.length;
  const promptPreview =
    !isMultipleChoice && selected
      ? exercise.question.replace('_____', `[ ${selected} ]`)
      : exercise.question;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        onBack={goHome}
        backIcon="close"
        title="Practice"
        subtitle={`Question ${idx + 1} of ${questions.length} · No hearts lost`}
        progress={progress}
        right={
          <View style={[styles.earnPill, { backgroundColor: colors.heartRed + '14' }]}>
            <AppIcon name="heartAdd" size={15} color={colors.heartRed} />
            <Text style={[styles.earnText, { color: colors.heartRed }]}>Earn a heart</Text>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.questionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.exerciseTypeRow}>
            <AppIcon name="flash" size={14} color={colors.primary} />
            <Text style={[styles.exerciseType, { color: colors.primary }]}>
              {isMultipleChoice ? 'Multiple Choice' : 'Fill in the Blank'}
            </Text>
          </View>

          {exercise.audioWord && (
            <TouchableOpacity
              style={[
                styles.audioPill,
                { backgroundColor: colors.primary + '15', borderColor: colors.primary + '45' },
              ]}
              onPress={() => {
                haptics.lightTap();
                if (exercise.audioWord) speakKinyarwanda(exercise.audioWord);
              }}
              activeOpacity={0.75}
            >
              <View style={[styles.audioIconCircle, { backgroundColor: colors.primary }]}>
                <AppIcon name="volumeHigh" size={14} color="#FFFFFF" />
              </View>
              <Text style={[styles.audioPillText, { color: colors.primary }]}>
                {exercise.audioWord}
              </Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.question, { color: colors.text }]}>{promptPreview}</Text>
          {exercise.hint && (
            <View style={[styles.hintRow, { backgroundColor: colors.background }]}>
              <AppIcon name="info" size={13} color={colors.textSecondary} />
              <Text style={[styles.hint, { color: colors.textSecondary }]}>{exercise.hint}</Text>
            </View>
          )}

          <View style={styles.optionsGrid}>
            {options.map((option, optionIdx) => (
              <InteractiveOptionCard
                key={option}
                label={option}
                index={optionIdx}
                isSelected={selected === option}
                isRight={option === exercise.answer}
                showResult={showResult}
                accentColor={colors.primary}
                colors={colors}
                onPress={() => {
                  handleSelectOption(option);
                  if (!isMultipleChoice) speakKinyarwanda(option);
                }}
              />
            ))}
          </View>
        </View>

        {showResult && (
          <View
            style={[
              styles.resultBanner,
              {
                backgroundColor: isCorrect ? colors.success + '18' : colors.error + '18',
                borderColor: isCorrect ? colors.success + '55' : colors.error + '55',
              },
            ]}
          >
            <AppIcon
              name={isCorrect ? 'checkCircle' : 'closeCircle'}
              size={28}
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

      {(selected !== null || showResult) && (
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          {!showResult ? (
            <GlowButton
              style={[styles.continueBtn, { backgroundColor: colors.primary }]}
              glowColor={colors.primary}
              onPress={handleCheckAnswer}
            >
              <AppIcon name="checkCircle" size={20} color="#FFFFFF" />
              <Text style={styles.continueText}>Suzuma / Check Answer</Text>
            </GlowButton>
          ) : (
            <GlowButton
              style={[
                styles.continueBtn,
                { backgroundColor: isCorrect ? colors.success : colors.primary },
              ]}
              glowColor={isCorrect ? colors.success : colors.primary}
              onPress={handleContinue}
            >
              <Text style={styles.continueText}>
                {idx + 1 >= questions.length ? 'Finish practice' : 'Komeza / Continue'}
              </Text>
              <AppIcon name="arrowRight1" size={20} color="#FFFFFF" />
            </GlowButton>
          )}
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
  earnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  earnText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  content: {
    padding: 18,
    paddingTop: 20,
    paddingBottom: 36,
  },
  questionCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 20,
  },
  exerciseTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  exerciseType: {
    fontSize: 12.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  audioPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  audioIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioPillText: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  question: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 30,
  },
  hint: {
    fontSize: 13.5,
    lineHeight: 19,
    flex: 1,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  optionsGrid: {
    marginTop: 18,
    gap: 12,
  },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 15,
  },
  resultCopy: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: '900',
  },
  resultAnswer: {
    fontSize: 14,
    marginTop: 3,
    fontWeight: '600',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 16,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '900',
  },
  completeContainer: {
    flex: 1,
  },
  completeBody: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    paddingBottom: 40,
  },
  completeXpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 16,
  },
  completeXpPillText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  completeTitle: {
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 12,
  },
  completeSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
    marginBottom: 26,
    width: '100%',
    maxWidth: 440,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '900',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  homeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 28,
    minWidth: 220,
  },
  homeBtnText: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '900',
  },
});
