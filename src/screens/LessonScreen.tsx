import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import { Text } from '../components/ui/AppText';
import { AppModal } from '../components/AppModal';
import { AppIcon } from '../components/ui/AppIcon';
import { InteractiveOptionCard } from '../components/ui/InteractiveOptionCard';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { HeartsBadge } from '../components/HeartsBadge';
import { GorillaMascot } from '../components/GorillaMascot';
import { HeartsSheet } from '../components/HeartsSheet';
import { AnimatedButton, GlowButton } from '../components/AnimatedButton';
import { XPPopup } from '../components/XPPopup';
import { getLessonById, getUnitForLesson, getTotalLessons } from '../data/lessons';
import {
  buildLessonSession,
  extractLessonLearningItems,
  DynamicQuestion,
  LearningStudyItem,
  LessonStage,
} from '../data/questionBank';
import {
  useAppStore,
  getLevel,
  getXPBonus,
  getStreakMultiplier,
} from '../store/useAppStore';
import { useHaptics } from '../hooks/useHaptics';
import { speakKinyarwanda } from '../hooks/useSpeech';
import { useTheme } from '../theme/themeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface LessonScreenProps {
  route: { params: { lessonId: string; masterMode?: boolean } };
  navigation: any;
}

interface IndexedWord {
  id: number;
  text: string;
}

const buildIndexedWordPool = (words?: string[]): IndexedWord[] => {
  if (!words || words.length === 0) return [];
  const indexed = words.map((text, idx) => ({ id: idx, text }));
  return [...indexed].sort(() => Math.random() - 0.5);
};

const JOURNEY_STAGES: {
  key: LessonStage;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
}[] = [
  {
    key: 'learn',
    label: 'Learn',
    shortLabel: '1. Learn',
    icon: 'bookOpen',
    description: 'Explore key words & pronunciation before practice',
  },
  {
    key: 'practice',
    label: 'Practice',
    shortLabel: '2. Practice',
    icon: 'target',
    description: 'Guided recognition with hints & audio support',
  },
  {
    key: 'reinforce',
    label: 'Reinforce',
    shortLabel: '3. Reinforce',
    icon: 'puzzle',
    description: 'Active recall — build sentences & fill blanks',
  },
  {
    key: 'assessment',
    label: 'Assessment',
    shortLabel: '4. Assess',
    icon: 'award',
    description: 'Final mastery check to complete the lesson',
  },
];

const STAGE_ORDER: Record<LessonStage, number> = {
  learn: 0,
  practice: 1,
  reinforce: 2,
  assessment: 3,
};

export const LessonScreen: React.FC<LessonScreenProps> = ({ route, navigation }) => {
  const { lessonId } = route.params;
  const lesson = getLessonById(lessonId);
  const unit = getUnitForLesson(lessonId);
  const { completeLesson, loseHeart, progress } = useAppStore();
  const haptics = useHaptics();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // Pre-assessment learning step state
  const [inLearningStep, setInLearningStep] = useState(true);
  const [exploredIds, setExploredIds] = useState<string[]>([]);
  const [activeLearnId, setActiveLearnId] = useState<string | null>(null);

  // Question session state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showXPPopup, setShowXPPopup] = useState(false);
  const [xpEarned, setXPEarned] = useState(0);
  const [levelUpTo, setLevelUpTo] = useState<number | null>(null);
  const [perfectBonus, setPerfectBonus] = useState<number>(0);

  // Mistake recovery queue state
  const [mistakeQueue, setMistakeQueue] = useState<DynamicQuestion[]>([]);
  const [inRecoveryRound, setInRecoveryRound] = useState(false);
  const [recoveryIdx, setRecoveryIdx] = useState(0);

  // word_match state
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
  const [selectedKiny, setSelectedKiny] = useState<string | null>(null);
  const [wrongMatchPair, setWrongMatchPair] = useState<{ kiny: string; eng: string } | null>(null);

  // sentence_build state (index-based so duplicate words never collide)
  const [wordPool, setWordPool] = useState<IndexedWord[]>([]);
  const [builtWordIds, setBuiltWordIds] = useState<number[]>([]);

  // Animations
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const cardEntrance = useRef(new Animated.Value(1)).current;
  const feedbackSlide = useRef(new Animated.Value(0)).current;

  const [showQuitModal, setShowQuitModal] = useState(false);
  const [showOutOfHearts, setShowOutOfHearts] = useState(false);

  useEffect(() => {
    if (progress.hearts <= 0) setShowOutOfHearts(true);
  }, []);

  // Extract Stage 1 Guided Learning items
  const [learningItems] = useState<LearningStudyItem[]>(() => {
    if (!lesson) return [];
    return extractLessonLearningItems(lesson, unit?.id);
  });

  // Build hybrid curriculum session (Stages 2–4: Practice -> Reinforce -> Assessment)
  const [sessionExercises] = useState<DynamicQuestion[]>(() => {
    if (!lesson) return [];
    const isReplay = progress.completedLessons.includes(lessonId);
    return buildLessonSession(lesson, unit?.id, isReplay);
  });

  const activeExercise: DynamicQuestion | undefined = inRecoveryRound
    ? mistakeQueue[recoveryIdx]
    : sessionExercises[currentIdx];

  // Animate question card entrance whenever step or question changes
  useEffect(() => {
    cardEntrance.setValue(0);
    Animated.spring(cardEntrance, {
      toValue: 1,
      friction: 7,
      tension: 55,
      useNativeDriver: true,
    }).start();
  }, [inLearningStep, currentIdx, inRecoveryRound, recoveryIdx]);

  // Animate feedback banner when showResult changes
  useEffect(() => {
    if (showResult) {
      feedbackSlide.setValue(0);
      Animated.spring(feedbackSlide, {
        toValue: 1,
        friction: 7,
        tension: 65,
        useNativeDriver: true,
      }).start();
    } else {
      feedbackSlide.setValue(0);
    }
  }, [showResult]);

  // Initialize sentence word pool whenever exercise changes
  useEffect(() => {
    if (activeExercise?.type === 'sentence_build' && activeExercise.words) {
      setWordPool(buildIndexedWordPool(activeExercise.words));
      setBuiltWordIds([]);
    } else {
      setWordPool([]);
      setBuiltWordIds([]);
    }
  }, [activeExercise]);

  if (!lesson || sessionExercises.length === 0 || !activeExercise) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <AppIcon name="book" size={48} color={colors.textMuted} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Lesson not found</Text>
        <TouchableOpacity
          style={[styles.backHomeBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backHomeBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalExercises = sessionExercises.length;
  const exercise = activeExercise;
  const currentStage: LessonStage = inLearningStep
    ? 'learn'
    : inRecoveryRound
      ? 'assessment'
      : exercise.stage || 'practice';
  const currentStageMeta =
    JOURNEY_STAGES.find((s) => s.key === currentStage) || JOURNEY_STAGES[1];

  // Overall journey progress (includes the Learning Step as step 1 of totalExercises + 1)
  const totalSteps = totalExercises + 1 + (inRecoveryRound ? mistakeQueue.length : 0);
  const completedSteps = inLearningStep
    ? exploredIds.length / Math.max(1, learningItems.length)
    : inRecoveryRound
      ? 1 + totalExercises + recoveryIdx + (showResult ? 1 : 0)
      : 1 + currentIdx + (showResult ? 1 : 0);
  const overallProgress = Math.min(1, completedSteps / totalSteps);

  const shakeWrong = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  };

  const bounceCorrect = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 1.04, duration: 110, useNativeDriver: true }),
      Animated.timing(bounceAnim, { toValue: 1, duration: 110, useNativeDriver: true }),
    ]).start();
  };

  const handleSpeak = (word?: string) => {
    const target = word || exercise.audioWord;
    if (!target) return;
    haptics.lightTap();
    speakKinyarwanda(target);
  };

  const handleExploreLearnCard = (item: LearningStudyItem) => {
    haptics.selection();
    setActiveLearnId(item.id);
    speakKinyarwanda(item.kiny);
    if (!exploredIds.includes(item.id)) {
      setExploredIds((prev) => [...prev, item.id]);
    }
  };

  const handleStartPracticeFromLearn = () => {
    haptics.success();
    setInLearningStep(false);
  };

  const checkAnswer = (answer: string) => {
    const correct = answer.trim().toLowerCase() === exercise.answer.trim().toLowerCase();
    setIsCorrect(correct);
    setShowResult(true);
    if (correct) {
      haptics.success();
      if (!inRecoveryRound) {
        setCorrectCount((c) => c + 1);
      }
      bounceCorrect();
      if (exercise.audioWord) {
        speakKinyarwanda(exercise.audioWord);
      }
    } else {
      haptics.mistake();
      shakeWrong();
      if (!inRecoveryRound) {
        loseHeart();
        setMistakeQueue((prev) =>
          prev.some((q) => q.id === exercise.id) ? prev : [...prev, exercise]
        );
      }
    }
  };

  // Interactive selection: selecting an option highlights it & plays audio;
  // user then taps "Check Answer" in the bottom bar to confirm!
  const handleSelectOption = (option: string) => {
    if (showResult) return;
    haptics.selection();
    setSelected(option);
  };

  const handleConfirmSelectedOption = () => {
    if (showResult || !selected) return;
    checkAnswer(selected);
  };

  const handleWordMatchSelect = (kiny: string, eng: string) => {
    if (showResult) return;
    const pairs = exercise.pairs || [];
    const correctPair = pairs.find((p) => p.kiny === kiny);
    if (correctPair && correctPair.eng === eng) {
      const newMatched = { ...matchedPairs, [kiny]: eng };
      setMatchedPairs(newMatched);
      setSelectedKiny(null);
      setWrongMatchPair(null);
      haptics.success();
      speakKinyarwanda(kiny);
      if (pairs.length > 0 && Object.keys(newMatched).length === pairs.length) {
        setIsCorrect(true);
        setShowResult(true);
        if (!inRecoveryRound) {
          setCorrectCount((c) => c + 1);
        }
        bounceCorrect();
      }
    } else {
      haptics.mistake();
      shakeWrong();
      setWrongMatchPair({ kiny, eng });
      setTimeout(() => {
        setWrongMatchPair(null);
        setSelectedKiny(null);
      }, 450);
    }
  };

  const handleSentenceWordTap = (wordId: number, fromBuilt: boolean) => {
    if (showResult) return;
    haptics.selection();
    const tappedWord = wordPool.find((w) => w.id === wordId);
    if (!fromBuilt && tappedWord) {
      speakKinyarwanda(tappedWord.text);
    }
    if (fromBuilt) {
      setBuiltWordIds((prev) => prev.filter((id) => id !== wordId));
    } else {
      setBuiltWordIds((prev) => (prev.includes(wordId) ? prev : [...prev, wordId]));
    }
  };

  const handleClearSentence = () => {
    if (showResult) return;
    haptics.lightTap();
    setBuiltWordIds([]);
  };

  const handleSentenceCheck = () => {
    if (showResult || builtWordIds.length === 0) return;
    const sentence = builtWordIds
      .map((id) => wordPool.find((w) => w.id === id)?.text || '')
      .filter(Boolean)
      .join(' ');
    checkAnswer(sentence);
  };

  const resetQuestionState = () => {
    setSelected(null);
    setShowResult(false);
    setIsCorrect(false);
    setMatchedPairs({});
    setSelectedKiny(null);
    setWrongMatchPair(null);
  };

  const finalizeLesson = () => {
    haptics.celebration();
    const stateBefore = useAppStore.getState();
    const alreadyCompleted = stateBefore.progress.completedLessons.includes(lessonId);
    const accuracy = correctCount / totalExercises;
    const isPerfect = correctCount === totalExercises;
    const streakMult = getStreakMultiplier(stateBefore.progress.streak);
    const rawEarnedXP = Math.max(1, Math.round(lesson.xpReward * accuracy * streakMult));
    const effectiveBaseXP = alreadyCompleted ? Math.floor(rawEarnedXP / 2) : rawEarnedXP;
    const perfBonus =
      isPerfect && !alreadyCompleted && !stateBefore.progress.perfectLessons.includes(lessonId)
        ? 4
        : 0;
    const tierBonus = getXPBonus(stateBefore.progress.xp);
    const totalDisplayedXP = effectiveBaseXP + perfBonus + tierBonus;

    setXPEarned(totalDisplayedXP);
    setPerfectBonus(perfBonus);

    const levelBefore = getLevel(stateBefore.progress.xp);
    completeLesson(lessonId, rawEarnedXP, isPerfect);
    const levelAfter = useAppStore.getState().progress.level;
    if (levelAfter > levelBefore) setLevelUpTo(levelAfter);

    setShowXPPopup(true);
    setFinished(true);
  };

  const handleNext = () => {
    haptics.lightTap();
    if (finished) return;
    if (useAppStore.getState().progress.hearts <= 0) {
      setShowOutOfHearts(true);
      return;
    }

    if (inRecoveryRound) {
      if (recoveryIdx + 1 >= mistakeQueue.length) {
        finalizeLesson();
      } else {
        setRecoveryIdx((i) => i + 1);
        resetQuestionState();
      }
      return;
    }

    if (currentIdx + 1 >= totalExercises) {
      if (mistakeQueue.length > 0) {
        setInRecoveryRound(true);
        setRecoveryIdx(0);
        resetQuestionState();
      } else {
        finalizeLesson();
      }
    } else {
      setCurrentIdx((i) => i + 1);
      resetQuestionState();
    }
  };

  if (finished) {
    const accuracy = Math.round((correctCount / totalExercises) * 100);
    const latestCompletedCount = useAppStore.getState().progress.completedLessons.length;
    return (
      <LessonComplete
        lesson={lesson}
        correctCount={correctCount}
        totalExercises={totalExercises}
        accuracy={accuracy}
        navigation={navigation}
        xpEarned={xpEarned}
        perfectBonus={perfectBonus}
        recoveredCount={mistakeQueue.length}
        allLessonsComplete={latestCompletedCount >= getTotalLessons()}
        colors={colors}
      />
    );
  }

  const unitColor = unit?.color || '#0B6E84';
  const canCheckOption =
    !inLearningStep &&
    !showResult &&
    (exercise.type === 'multiple_choice' || exercise.type === 'fill_blank') &&
    selected !== null;
  const canCheckSentence =
    !inLearningStep &&
    !showResult &&
    exercise.type === 'sentence_build' &&
    builtWordIds.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* XP Popup */}
      <XPPopup
        amount={xpEarned}
        visible={showXPPopup}
        type={isCorrect ? 'correct' : 'lesson'}
        onComplete={() => setShowXPPopup(false)}
      />

      {/* Header */}
      <ScreenHeader
        onBack={() => {
          haptics.lightTap();
          setShowQuitModal(true);
        }}
        backIcon="close"
        title={lesson.title}
        subtitle={
          inLearningStep
            ? `${unit?.title ?? 'Lesson'} · Step 1 of 4: Guided Learning`
            : inRecoveryRound
              ? `Mistake Recovery · Review ${recoveryIdx + 1} of ${mistakeQueue.length}`
              : `${currentStageMeta.shortLabel} · Question ${currentIdx + 1} of ${totalExercises}`
        }
        right={<HeartsBadge onPress={() => setShowOutOfHearts(true)} />}
        progress={overallProgress}
        progressColor={unitColor}
      >
        {/* Duolingo-Style 4-Stage Learning Journey Stepper */}
        <LessonJourneyStepper
          currentStage={currentStage}
          unitColor={unitColor}
          colors={colors}
        />
      </ScreenHeader>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {inLearningStep ? (
          <Animated.View
            style={{
              opacity: cardEntrance,
              transform: [
                {
                  translateY: cardEntrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  }),
                },
              ],
            }}
          >
            <LearningStepView
              lessonTitle={lesson.title}
              lessonTitleKiny={lesson.titleKiny}
              items={learningItems}
              exploredIds={exploredIds}
              activeLearnId={activeLearnId}
              unitColor={unitColor}
              colors={colors}
              onExplore={handleExploreLearnCard}
            />
          </Animated.View>
        ) : (
          <>
            {/* Stage Context Banner */}
            <View
              style={[
                styles.stageBanner,
                {
                  backgroundColor: inRecoveryRound
                    ? colors.primary + '16'
                    : currentStage === 'assessment'
                      ? colors.secondary + '1A'
                      : unitColor + '12',
                  borderColor: inRecoveryRound
                    ? colors.primary + '55'
                    : currentStage === 'assessment'
                      ? colors.secondary + '55'
                      : unitColor + '35',
                },
              ]}
            >
              <View
                style={[
                  styles.stageBannerIcon,
                  {
                    backgroundColor: inRecoveryRound
                      ? colors.primary + '24'
                      : currentStage === 'assessment'
                        ? colors.secondary + '28'
                        : unitColor + '22',
                  },
                ]}
              >
                <AppIcon
                  name={inRecoveryRound ? 'refresh' : currentStageMeta.icon}
                  size={16}
                  color={
                    inRecoveryRound
                      ? colors.primary
                      : currentStage === 'assessment'
                        ? colors.secondary
                        : unitColor
                  }
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.stageBannerTitle,
                    {
                      color: inRecoveryRound
                        ? colors.primary
                        : currentStage === 'assessment'
                          ? colors.secondary
                          : unitColor,
                    },
                  ]}
                >
                  {inRecoveryRound
                    ? 'Mistake Recovery · Master What You Missed'
                    : exercise.stageLabel || currentStageMeta.shortLabel}
                </Text>
                <Text style={[styles.stageBannerDesc, { color: colors.textSecondary }]}>
                  {inRecoveryRound
                    ? 'No hearts lost in recovery — reinforce this phrase before finishing'
                    : currentStageMeta.description}
                </Text>
              </View>
              <View style={[styles.stepCounterPill, { backgroundColor: colors.card }]}>
                <Text style={[styles.stepCounterText, { color: colors.text }]}>
                  {inRecoveryRound
                    ? `${recoveryIdx + 1}/${mistakeQueue.length}`
                    : `${currentIdx + 1}/${totalExercises}`}
                </Text>
              </View>
            </View>

            {/* Question Card */}
            <Animated.View
              style={[
                styles.questionCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: showResult
                    ? isCorrect
                      ? colors.success
                      : colors.error
                    : colors.border,
                  opacity: cardEntrance,
                  transform: [
                    { translateX: shakeAnim },
                    { scale: bounceAnim },
                    {
                      translateY: cardEntrance.interpolate({
                        inputRange: [0, 1],
                        outputRange: [14, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              {/* Audio Pronunciation Bar when audioWord is available */}
              {exercise.audioWord && (
                <TouchableOpacity
                  style={[
                    styles.audioPill,
                    {
                      backgroundColor: unitColor + '15',
                      borderColor: unitColor + '45',
                    },
                  ]}
                  onPress={() => handleSpeak(exercise.audioWord)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.audioIconCircle, { backgroundColor: unitColor }]}>
                    <AppIcon name="volumeHigh" size={15} color="#FFFFFF" />
                  </View>
                  <View>
                    <Text style={[styles.audioPillOverline, { color: colors.textSecondary }]}>
                      TAP TO LISTEN
                    </Text>
                    <Text style={[styles.audioPillText, { color: unitColor }]}>
                      {exercise.audioWord}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {exercise.type === 'word_match' ? (
                <WordMatchExercise
                  key={exercise.id}
                  exercise={exercise}
                  matchedPairs={matchedPairs}
                  selectedKiny={selectedKiny}
                  wrongMatchPair={wrongMatchPair}
                  showResult={showResult}
                  colors={colors}
                  onSelectKiny={(kiny) => {
                    haptics.selection();
                    speakKinyarwanda(kiny);
                    setSelectedKiny(selectedKiny === kiny ? null : kiny);
                  }}
                  onSelectEng={(eng) => {
                    if (selectedKiny) handleWordMatchSelect(selectedKiny, eng);
                  }}
                />
              ) : exercise.type === 'fill_blank' ? (
                <FillBlankExercise
                  exercise={exercise}
                  selected={selected}
                  showResult={showResult}
                  isCorrect={isCorrect}
                  unitColor={unitColor}
                  onSelect={(word) => {
                    handleSelectOption(word);
                    speakKinyarwanda(word);
                  }}
                  colors={colors}
                />
              ) : exercise.type === 'sentence_build' ? (
                <SentenceBuildExercise
                  exercise={exercise}
                  wordPool={wordPool}
                  builtWordIds={builtWordIds}
                  showResult={showResult}
                  isCorrect={isCorrect}
                  colors={colors}
                  onTapWord={handleSentenceWordTap}
                  onClear={handleClearSentence}
                />
              ) : (
                <MultipleChoiceExercise
                  exercise={exercise}
                  selected={selected}
                  showResult={showResult}
                  isCorrect={isCorrect}
                  unitColor={unitColor}
                  onSelect={handleSelectOption}
                  colors={colors}
                />
              )}
            </Animated.View>

            {/* Animated Result Feedback Banner */}
            {showResult && (
              <Animated.View
                style={[
                  styles.resultBanner,
                  {
                    backgroundColor: isCorrect
                      ? colors.success + '18'
                      : colors.error + '18',
                    borderColor: isCorrect
                      ? colors.success + '55'
                      : colors.error + '55',
                    opacity: feedbackSlide,
                    transform: [
                      {
                        translateY: feedbackSlide.interpolate({
                          inputRange: [0, 1],
                          outputRange: [16, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View
                  style={[
                    styles.resultIconWrap,
                    {
                      backgroundColor: isCorrect
                        ? colors.success + '24'
                        : colors.error + '24',
                    },
                  ]}
                >
                  <AppIcon
                    name={isCorrect ? 'checkCircle' : 'closeCircle'}
                    size={30}
                    color={isCorrect ? colors.success : colors.error}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.resultTitle,
                      { color: isCorrect ? colors.success : colors.error },
                    ]}
                  >
                    {isCorrect ? 'Nibyo! Spot on!' : 'Sibyo — Keep going!'}
                  </Text>
                  {!isCorrect && (
                    <>
                      <Text style={[styles.correctAnswer, { color: colors.text }]}>
                        Correct answer:{' '}
                        <Text style={{ fontWeight: '800' }}>{exercise.answer}</Text>
                      </Text>
                      <Text style={[styles.heartPenalty, { color: colors.error }]}>
                        {inRecoveryRound
                          ? 'Reviewing missed phrase · No heart penalty'
                          : '−1 heart · Added to end-of-lesson recovery review'}
                      </Text>
                    </>
                  )}
                  {isCorrect && exercise.hint && (
                    <Text style={[styles.correctAnswer, { color: colors.textSecondary }]}>
                      {exercise.hint}
                    </Text>
                  )}
                </View>
                {exercise.audioWord && (
                  <TouchableOpacity
                    style={[
                      styles.feedbackAudioBtn,
                      {
                        backgroundColor: isCorrect
                          ? colors.success + '22'
                          : colors.error + '22',
                      },
                    ]}
                    onPress={() => handleSpeak(exercise.audioWord)}
                    activeOpacity={0.75}
                  >
                    <AppIcon
                      name="volumeHigh"
                      size={18}
                      color={isCorrect ? colors.success : colors.error}
                    />
                  </TouchableOpacity>
                )}
              </Animated.View>
            )}
          </>
        )}
      </ScrollView>

      {/* Bottom Action Bar (Learn CTA / Check Answer CTA / Continue CTA) */}
      {(inLearningStep || canCheckOption || canCheckSentence || showResult) && (
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
          {inLearningStep ? (
            <GlowButton
              style={[styles.continueBtn, { backgroundColor: unitColor }]}
              glowColor={unitColor}
              onPress={handleStartPracticeFromLearn}
            >
              <Text style={styles.continueBtnText}>
                Tangira Kwitoza / Start Guided Practice
              </Text>
              <AppIcon name="arrowRight1" size={20} color="#FFFFFF" />
            </GlowButton>
          ) : !showResult ? (
            <GlowButton
              style={[styles.continueBtn, { backgroundColor: unitColor }]}
              glowColor={unitColor}
              onPress={
                exercise.type === 'sentence_build'
                  ? handleSentenceCheck
                  : handleConfirmSelectedOption
              }
            >
              <AppIcon name="checkCircle" size={20} color="#FFFFFF" />
              <Text style={styles.continueBtnText}>Suzuma / Check Answer</Text>
            </GlowButton>
          ) : (
            <GlowButton
              style={[
                styles.continueBtn,
                { backgroundColor: isCorrect ? colors.success : colors.error },
              ]}
              glowColor={isCorrect ? colors.success : colors.error}
              onPress={handleNext}
            >
              <Text style={styles.continueBtnText}>
                {inRecoveryRound
                  ? recoveryIdx + 1 >= mistakeQueue.length
                    ? 'Rangiza Isomo / Complete Lesson'
                    : 'Next Recovery Review'
                  : currentIdx + 1 >= totalExercises
                    ? mistakeQueue.length > 0
                      ? `Review ${mistakeQueue.length} Missed ${mistakeQueue.length === 1 ? 'Question' : 'Questions'}`
                      : 'Rangiza Isomo / Complete Lesson'
                    : currentIdx + 1 < totalExercises &&
                        sessionExercises[currentIdx + 1]?.stage !== exercise.stage
                      ? `Continue to ${
                          JOURNEY_STAGES.find(
                            (s) => s.key === sessionExercises[currentIdx + 1]?.stage
                          )?.label || 'Next Step'
                        }`
                      : 'Komeza / Continue'}
              </Text>
              <AppIcon name="arrowRight1" size={20} color="#FFFFFF" />
            </GlowButton>
          )}
        </View>
      )}

      {/* Quit confirmation */}
      <AppModal
        visible={showQuitModal}
        title="Siga isomo?"
        message="Urashaka guhagarika iri somo? Progress in this session won't be saved."
        type="warning"
        icon="pencil"
        cancelText="Komeza / Stay"
        confirmText="Siga / Quit"
        confirmColor={colors.error}
        onCancel={() => setShowQuitModal(false)}
        onConfirm={() => {
          setShowQuitModal(false);
          navigation.goBack();
        }}
      />

      {/* Level-up celebration modal */}
      <AppModal
        visible={levelUpTo !== null}
        title={`Level ${levelUpTo}!`}
        message={`Wasuniwe! Ugeze kuri Level ${levelUpTo}!\nUkomeze kwiga Ikinyarwanda!`}
        type="success"
        icon="star"
        confirmText="Yego! Let's go!"
        showCancel={false}
        onCancel={() => setLevelUpTo(null)}
        onConfirm={() => setLevelUpTo(null)}
      />

      <HeartsSheet
        visible={showOutOfHearts}
        title="You ran out of hearts"
        onClose={() => {
          setShowOutOfHearts(false);
          if (useAppStore.getState().progress.hearts <= 0) navigation.goBack();
        }}
        onPractice={() => {
          setShowOutOfHearts(false);
          navigation.navigate('Practice');
        }}
      />
    </View>
  );
};

// ── 4-Stage Learning Journey Stepper ─────────────────────────────
const LessonJourneyStepper: React.FC<{
  currentStage: LessonStage;
  unitColor: string;
  colors: any;
}> = ({ currentStage, unitColor, colors }) => {
  const activeOrder = STAGE_ORDER[currentStage];

  return (
    <View style={styles.stepperRow}>
      {JOURNEY_STAGES.map((stage, idx) => {
        const order = STAGE_ORDER[stage.key];
        const isDone = order < activeOrder;
        const isCurrent = order === activeOrder;
        const accent =
          stage.key === 'assessment' && isCurrent ? colors.secondary : unitColor;

        return (
          <React.Fragment key={stage.key}>
            <View
              style={[
                styles.stepperPill,
                {
                  backgroundColor: isCurrent
                    ? accent + '20'
                    : isDone
                      ? colors.success + '18'
                      : colors.background,
                  borderColor: isCurrent
                    ? accent
                    : isDone
                      ? colors.success + '66'
                      : colors.border,
                },
              ]}
            >
              <AppIcon
                name={isDone ? 'checkCircle' : stage.icon}
                size={13}
                color={
                  isCurrent
                    ? accent
                    : isDone
                      ? colors.success
                      : colors.textMuted
                }
              />
              <Text
                style={[
                  styles.stepperLabel,
                  {
                    color: isCurrent
                      ? accent
                      : isDone
                        ? colors.success
                        : colors.textMuted,
                  },
                ]}
                numberOfLines={1}
              >
                {stage.label}
              </Text>
            </View>
            {idx < JOURNEY_STAGES.length - 1 && (
              <View
                style={[
                  styles.stepperConnector,
                  {
                    backgroundColor: isDone ? colors.success : colors.border,
                  },
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

// ── Stage 1: Guided Pre-Assessment Learning View ─────────────────
const LearningStepView: React.FC<{
  lessonTitle: string;
  lessonTitleKiny: string;
  items: LearningStudyItem[];
  exploredIds: string[];
  activeLearnId: string | null;
  unitColor: string;
  colors: any;
  onExplore: (item: LearningStudyItem) => void;
}> = ({
  lessonTitle,
  lessonTitleKiny,
  items,
  exploredIds,
  activeLearnId,
  unitColor,
  colors,
  onExplore,
}) => {
  return (
    <View>
      <View
        style={[
          styles.learnIntroCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.learnHeaderRow}>
          <View style={[styles.learnBadgeIcon, { backgroundColor: unitColor + '18' }]}>
            <AppIcon name="bookOpen" size={22} color={unitColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.learnEyebrow, { color: unitColor }]}>
              STEP 1 OF 4 · GUIDED LEARNING
            </Text>
            <Text style={[styles.learnHeading, { color: colors.text }]}>
              {lessonTitle} ({lessonTitleKiny})
            </Text>
          </View>
        </View>
        <Text style={[styles.learnSubtext, { color: colors.textSecondary }]}>
          Tap each Kinyarwanda phrase below to hear its pronunciation and unlock usage tips before your practice and assessment.
        </Text>
        <View style={styles.learnMilestoneRow}>
          <View style={[styles.learnMilestonePill, { backgroundColor: unitColor + '15' }]}>
            <AppIcon name="volumeHigh" size={14} color={unitColor} />
            <Text style={[styles.learnMilestoneText, { color: unitColor }]}>
              {exploredIds.length} of {items.length} phrases explored
            </Text>
          </View>
          {exploredIds.length >= items.length && items.length > 0 && (
            <View style={[styles.learnReadyBadge, { backgroundColor: colors.success + '1C' }]}>
              <AppIcon name="checkCircle" size={14} color={colors.success} />
              <Text style={[styles.learnReadyText, { color: colors.success }]}>
                Ready to practice!
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.learnCardsList}>
        {items.map((item, idx) => {
          const isExplored = exploredIds.includes(item.id);
          const isActive = activeLearnId === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.learnVocabCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isActive
                    ? unitColor
                    : isExplored
                      ? colors.success + '77'
                      : colors.border,
                  borderBottomColor: isActive
                    ? unitColor
                    : isExplored
                      ? colors.success
                      : colors.border,
                },
              ]}
              onPress={() => onExplore(item)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.learnSpeakerCircle,
                  {
                    backgroundColor: isActive
                      ? unitColor
                      : isExplored
                        ? colors.success + '20'
                        : unitColor + '16',
                  },
                ]}
              >
                <AppIcon
                  name="volumeHigh"
                  size={20}
                  color={
                    isActive ? '#FFFFFF' : isExplored ? colors.success : unitColor
                  }
                />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.learnWordTopRow}>
                  <Text style={[styles.learnWordIndex, { color: colors.textMuted }]}>
                    PHRASE {idx + 1}
                  </Text>
                  {isExplored && (
                    <View style={styles.heardTag}>
                      <AppIcon name="checkCircle" size={13} color={colors.success} />
                      <Text style={[styles.heardTagText, { color: colors.success }]}>
                        Practiced
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.learnKinyText, { color: colors.text }]}>
                  {item.kiny}
                </Text>
                <Text style={[styles.learnEngText, { color: unitColor }]}>
                  {item.eng}
                </Text>
                {(item.pronunciation || item.tip) && (
                  <View
                    style={[
                      styles.learnTipBox,
                      { backgroundColor: colors.background, borderColor: colors.border },
                    ]}
                  >
                    <AppIcon name="info" size={13} color={colors.textSecondary} />
                    <Text style={[styles.learnTipText, { color: colors.textSecondary }]}>
                      {item.pronunciation || item.tip}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// ── Multiple Choice ───────────────────────────────────────────────
const MultipleChoiceExercise: React.FC<{
  exercise: DynamicQuestion;
  selected: string | null;
  showResult: boolean;
  isCorrect: boolean;
  unitColor: string;
  onSelect: (opt: string) => void;
  colors: any;
}> = ({ exercise, selected, showResult, onSelect, unitColor, colors }) => (
  <View>
    <View style={styles.exerciseTypeRow}>
      <AppIcon name="target" size={15} color={colors.primary} />
      <Text style={[styles.exerciseType, { color: colors.primary }]}>
        Select the Correct Meaning
      </Text>
    </View>
    <Text style={[styles.question, { color: colors.text }]}>{exercise.question}</Text>
    {exercise.hint && (
      <View style={[styles.hintRow, { backgroundColor: colors.background }]}>
        <AppIcon name="info" size={14} color={colors.textSecondary} />
        <Text style={[styles.hint, { color: colors.textSecondary }]}>{exercise.hint}</Text>
      </View>
    )}
    <View style={styles.optionsGrid}>
      {(exercise.options || []).map((opt, idx) => (
        <InteractiveOptionCard
          key={opt}
          label={opt}
          index={idx}
          isSelected={selected === opt}
          isRight={opt === exercise.answer}
          showResult={showResult}
          accentColor={unitColor}
          colors={colors}
          onPress={() => onSelect(opt)}
        />
      ))}
    </View>
  </View>
);

// ── Fill in the Blank (with Live Blank Preview) ──────────────────
const FillBlankExercise: React.FC<{
  exercise: DynamicQuestion;
  selected: string | null;
  showResult: boolean;
  isCorrect: boolean;
  unitColor: string;
  onSelect: (word: string) => void;
  colors: any;
}> = ({ exercise, selected, showResult, unitColor, onSelect, colors }) => {
  // Replace _____ with the selected word for an interactive preview
  const promptPreview = selected
    ? exercise.question.replace('_____', `[ ${selected} ]`)
    : exercise.question;

  return (
    <View>
      <View style={styles.exerciseTypeRow}>
        <AppIcon name="pencil" size={15} color="#C9891C" />
        <Text style={[styles.exerciseType, { color: '#C9891C' }]}>Fill in the Blank</Text>
      </View>
      <Text style={[styles.question, { color: colors.text }]}>{promptPreview}</Text>
      {exercise.hint && (
        <View style={[styles.hintRow, { backgroundColor: colors.background }]}>
          <AppIcon name="info" size={14} color={colors.textSecondary} />
          <Text style={[styles.hint, { color: colors.textSecondary }]}>{exercise.hint}</Text>
        </View>
      )}
      <View style={styles.optionsGrid}>
        {(exercise.blanks || []).map((word, idx) => (
          <InteractiveOptionCard
            key={word}
            label={word}
            index={idx}
            isSelected={selected === word}
            isRight={word === exercise.answer}
            showResult={showResult}
            accentColor={unitColor}
            colors={colors}
            onPress={() => onSelect(word)}
          />
        ))}
      </View>
    </View>
  );
};

// ── Word Match ────────────────────────────────────────────────────
const WordMatchExercise: React.FC<{
  exercise: DynamicQuestion;
  matchedPairs: Record<string, string>;
  selectedKiny: string | null;
  wrongMatchPair: { kiny: string; eng: string } | null;
  showResult: boolean;
  colors: any;
  onSelectKiny: (kiny: string) => void;
  onSelectEng: (eng: string) => void;
}> = ({
  exercise,
  matchedPairs,
  selectedKiny,
  wrongMatchPair,
  showResult,
  colors,
  onSelectKiny,
  onSelectEng,
}) => {
  const pairs = exercise.pairs || [];
  const [shuffledEng] = React.useState(() => [...pairs].sort(() => Math.random() - 0.5));
  const matchedCount = Object.keys(matchedPairs).length;

  return (
    <View>
      <View style={styles.exerciseHeaderBetween}>
        <View style={styles.exerciseTypeRow}>
          <AppIcon name="link" size={15} color="#2B6CB0" />
          <Text style={[styles.exerciseType, { color: '#2B6CB0' }]}>Word Match</Text>
        </View>
        <View style={[styles.matchCountBadge, { backgroundColor: '#2B6CB018' }]}>
          <Text style={[styles.matchCountText, { color: '#2B6CB0' }]}>
            {matchedCount}/{pairs.length} matched
          </Text>
        </View>
      </View>
      <Text style={[styles.question, { color: colors.text }]}>{exercise.question}</Text>
      <Text style={[styles.matchInstruction, { color: colors.textSecondary }]}>
        Tap a Kinyarwanda word on the left to hear it, then tap its English meaning on the right.
      </Text>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
        {/* Kinyarwanda column */}
        <View style={{ flex: 1, gap: 10 }}>
          {pairs.map((p) => {
            const isMatched = !!matchedPairs[p.kiny];
            const isSelected = selectedKiny === p.kiny;
            const isWrong = wrongMatchPair?.kiny === p.kiny;
            return (
              <TouchableOpacity
                key={p.kiny}
                style={[
                  styles.matchChip,
                  {
                    backgroundColor: isMatched
                      ? colors.success + '20'
                      : isWrong
                        ? colors.error + '20'
                        : isSelected
                          ? '#2B6CB022'
                          : colors.card,
                    borderColor: isMatched
                      ? colors.success
                      : isWrong
                        ? colors.error
                        : isSelected
                          ? '#2B6CB0'
                          : colors.border,
                  },
                ]}
                onPress={() => !isMatched && !showResult && onSelectKiny(p.kiny)}
                disabled={isMatched || showResult}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.matchChipText,
                    {
                      color: isMatched
                        ? colors.success
                        : isWrong
                          ? colors.error
                          : isSelected
                            ? '#2B6CB0'
                            : colors.text,
                    },
                  ]}
                >
                  {p.kiny}
                </Text>
                {isMatched && (
                  <AppIcon name="checkCircle" size={15} color={colors.success} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        {/* English column — shuffled */}
        <View style={{ flex: 1, gap: 10 }}>
          {shuffledEng.map((p) => {
            const isMatched = Object.values(matchedPairs).includes(p.eng);
            const isWrong = wrongMatchPair?.eng === p.eng;
            return (
              <TouchableOpacity
                key={p.eng}
                style={[
                  styles.matchChip,
                  {
                    backgroundColor: isMatched
                      ? colors.success + '20'
                      : isWrong
                        ? colors.error + '20'
                        : colors.card,
                    borderColor: isMatched
                      ? colors.success
                      : isWrong
                        ? colors.error
                        : selectedKiny
                          ? '#2B6CB066'
                          : colors.border,
                  },
                ]}
                onPress={() => !isMatched && !showResult && selectedKiny && onSelectEng(p.eng)}
                disabled={isMatched || showResult || !selectedKiny}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.matchChipText,
                    {
                      color: isMatched
                        ? colors.success
                        : isWrong
                          ? colors.error
                          : colors.text,
                    },
                  ]}
                >
                  {p.eng}
                </Text>
                {isMatched && (
                  <AppIcon name="checkCircle" size={15} color={colors.success} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      {selectedKiny && !showResult && (
        <View style={[styles.activeSelectionBanner, { backgroundColor: '#2B6CB015' }]}>
          <AppIcon name="volumeHigh" size={15} color="#2B6CB0" />
          <Text style={styles.activeSelectionText}>
            Selected &ldquo;{selectedKiny}&rdquo; — now tap its English match!
          </Text>
        </View>
      )}
    </View>
  );
};

// ── Sentence Build (Index-safe for duplicate words) ───────────────
const SentenceBuildExercise: React.FC<{
  exercise: DynamicQuestion;
  wordPool: IndexedWord[];
  builtWordIds: number[];
  showResult: boolean;
  isCorrect: boolean;
  colors: any;
  onTapWord: (wordId: number, fromBuilt: boolean) => void;
  onClear: () => void;
}> = ({
  exercise,
  wordPool,
  builtWordIds,
  showResult,
  isCorrect,
  colors,
  onTapWord,
  onClear,
}) => {
  const builtWords = builtWordIds
    .map((id) => wordPool.find((w) => w.id === id))
    .filter((w): w is IndexedWord => Boolean(w));
  const remainingWords = wordPool.filter((w) => !builtWordIds.includes(w.id));

  return (
    <View>
      <View style={styles.exerciseHeaderBetween}>
        <View style={styles.exerciseTypeRow}>
          <AppIcon name="puzzle" size={15} color={colors.primary} />
          <Text style={[styles.exerciseType, { color: colors.primary }]}>
            Build the Sentence
          </Text>
        </View>
        {!showResult && builtWords.length > 0 && (
          <TouchableOpacity
            style={[styles.clearSentenceBtn, { backgroundColor: colors.background }]}
            onPress={onClear}
            activeOpacity={0.75}
          >
            <AppIcon name="refresh" size={13} color={colors.textSecondary} />
            <Text style={[styles.clearSentenceText, { color: colors.textSecondary }]}>
              Reset
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={[styles.question, { color: colors.text }]}>{exercise.question}</Text>
      {exercise.hint && (
        <View style={[styles.hintRow, { backgroundColor: colors.background }]}>
          <AppIcon name="info" size={14} color={colors.textSecondary} />
          <Text style={[styles.hint, { color: colors.textSecondary }]}>{exercise.hint}</Text>
        </View>
      )}
      {/* Built sentence area */}
      <View
        style={[
          styles.sentenceArea,
          {
            backgroundColor: colors.card,
            borderColor: showResult
              ? isCorrect
                ? colors.success
                : colors.error
              : builtWords.length > 0
                ? '#7C5CBF'
                : colors.border,
          },
        ]}
      >
        {builtWords.length === 0 ? (
          <Text style={{ color: colors.textMuted, fontSize: 14, fontStyle: 'italic' }}>
            Tap words below in order to build the Kinyarwanda sentence...
          </Text>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {builtWords.map((word) => (
              <TouchableOpacity
                key={word.id}
                style={[
                  styles.wordChip,
                  {
                    backgroundColor: showResult
                      ? isCorrect
                        ? colors.success + '30'
                        : colors.error + '30'
                      : '#7C5CBF18',
                    borderColor: showResult
                      ? isCorrect
                        ? colors.success
                        : colors.error
                      : '#7C5CBF',
                  },
                ]}
                onPress={() => !showResult && onTapWord(word.id, true)}
                disabled={showResult}
              >
                <Text
                  style={{
                    color: showResult
                      ? isCorrect
                        ? colors.success
                        : colors.error
                      : '#7C5CBF',
                    fontWeight: '700',
                    fontSize: 15,
                  }}
                >
                  {word.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      {/* Word bank */}
      <Text style={[styles.wordBankLabel, { color: colors.textMuted }]}>
        WORD BANK ({remainingWords.length} remaining)
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
        {remainingWords.map((word) => (
          <TouchableOpacity
            key={word.id}
            style={[
              styles.wordChip,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => !showResult && onTapWord(word.id, false)}
            disabled={showResult}
          >
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>
              {word.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// ── Lesson Complete ───────────────────────────────────────────────
const LessonComplete: React.FC<{
  lesson: any;
  correctCount: number;
  totalExercises: number;
  accuracy: number;
  xpEarned: number;
  perfectBonus: number;
  recoveredCount: number;
  allLessonsComplete: boolean;
  navigation: any;
  colors: any;
}> = ({
  lesson,
  correctCount,
  totalExercises,
  accuracy,
  xpEarned,
  perfectBonus,
  recoveredCount,
  allLessonsComplete,
  navigation,
  colors,
}) => {
  const haptics = useHaptics();
  const isPerfect = correctCount === totalExercises;

  React.useEffect(() => {
    haptics.celebration();
  }, []);

  return (
    <View style={[styles.completeContainer, { backgroundColor: colors.background }]}>
      <ScreenHeader
        onBack={() => navigation.popToTop()}
        backIcon="close"
        title="Lesson complete"
        subtitle={lesson.title}
        right={
          <View style={[styles.completeXpPill, { backgroundColor: colors.secondary + '18' }]}>
            <AppIcon name="star" size={14} color={colors.secondary} />
            <Text style={[styles.completeXpPillText, { color: colors.secondary }]}>
              +{xpEarned} XP
            </Text>
          </View>
        }
      />
      <ScrollView contentContainerStyle={styles.completeBody} showsVerticalScrollIndicator={false}>
        <GorillaMascot size={120} mood="celebrate" />
        <Text style={[styles.completeTitle, { color: colors.text }]}>
          {isPerfect ? 'PERFECT!' : 'Warangije!'}
        </Text>
        {isPerfect && perfectBonus > 0 && (
          <View style={[styles.perfectBanner, { backgroundColor: colors.secondary + '18' }]}>
            <AppIcon name="target" size={16} color={colors.secondary} />
            <Text style={[styles.perfectBannerText, { color: colors.secondary }]}>
              Perfect Score! +{perfectBonus} Bonus XP!
            </Text>
          </View>
        )}
        {recoveredCount > 0 && (
          <View style={[styles.perfectBanner, { backgroundColor: colors.primary + '16' }]}>
            <AppIcon name="checkCircle" size={16} color={colors.primary} />
            <Text style={[styles.perfectBannerText, { color: colors.primary }]}>
              Reviewed & mastered {recoveredCount} missed {recoveredCount === 1 ? 'phrase' : 'phrases'}!
            </Text>
          </View>
        )}
        <Text style={[styles.completeSubtitle, { color: colors.textSecondary }]}>
          {lesson.title} · All 4 journey stages completed
        </Text>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <AppIcon name="star" size={24} color={colors.xpOrange} />
            <Text style={[styles.statCardValue, { color: colors.text }]}>+{xpEarned} XP</Text>
            <Text style={[styles.statCardLabel, { color: colors.textMuted }]}>Earned</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <AppIcon name="target" size={24} color={colors.primary} />
            <Text style={[styles.statCardValue, { color: colors.text }]}>{accuracy}%</Text>
            <Text style={[styles.statCardLabel, { color: colors.textMuted }]}>Accuracy</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <AppIcon name="checkCircle" size={24} color={colors.success} />
            <Text style={[styles.statCardValue, { color: colors.text }]}>
              {correctCount}/{totalExercises}
            </Text>
            <Text style={[styles.statCardLabel, { color: colors.textMuted }]}>Correct</Text>
          </View>
        </View>

        {allLessonsComplete && (
          <AnimatedButton
            style={[styles.completeAction, { backgroundColor: colors.secondary }]}
            onPress={() => {
              haptics.lightTap();
              navigation.navigate('Certificate');
            }}
          >
            <AppIcon name="trophy" size={20} color="#14212B" />
            <Text style={[styles.completeActionText, { color: '#14212B' }]}>
              Get Certificate
            </Text>
          </AnimatedButton>
        )}

        {accuracy < 70 && (
          <AnimatedButton
            style={[
              styles.completeAction,
              { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
            ]}
            onPress={() => {
              haptics.lightTap();
              navigation.replace('Lesson', { lessonId: lesson.id });
            }}
          >
            <AppIcon name="refresh" size={20} color={colors.text} />
            <Text style={[styles.completeActionText, { color: colors.text }]}>
              Ongera Ugerageze / Retry
            </Text>
          </AnimatedButton>
        )}

        <AnimatedButton
          style={[styles.completeAction, { backgroundColor: colors.primary }]}
          onPress={() => {
            haptics.lightTap();
            navigation.popToTop();
          }}
        >
          <Text style={styles.completeActionText}>Subira Ahabanza / Go Home</Text>
        </AnimatedButton>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  emptyTitle: { fontSize: 19, fontWeight: '800', marginTop: 4 },
  backHomeBtn: {
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 14,
    marginTop: 8,
  },
  backHomeBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  content: { padding: 18, paddingTop: 18, paddingBottom: 132 },

  // 4-Stage Stepper
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 4,
  },
  stepperPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  stepperLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  stepperConnector: {
    width: 8,
    height: 2,
    borderRadius: 1,
  },

  // Stage 1: Guided Learning View
  learnIntroCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  learnHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  learnBadgeIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  learnEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  learnHeading: {
    fontSize: 19,
    fontWeight: '800',
    marginTop: 2,
  },
  learnSubtext: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
  },
  learnMilestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  learnMilestonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  learnMilestoneText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  learnReadyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
  },
  learnReadyText: {
    fontSize: 12,
    fontWeight: '800',
  },
  learnCardsList: {
    gap: 12,
  },
  learnVocabCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1.5,
    borderBottomWidth: 4,
  },
  learnSpeakerCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  learnWordTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  learnWordIndex: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  heardTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heardTagText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  learnKinyText: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 27,
  },
  learnEngText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  learnTipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  learnTipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },

  // Stage Context Banner
  stageBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  stageBannerIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  stageBannerDesc: {
    fontSize: 12,
    marginTop: 1,
  },
  stepCounterPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  stepCounterText: {
    fontSize: 12,
    fontWeight: '800',
  },

  // Question Card
  questionCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 22,
  },
  audioPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  audioIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioPillOverline: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  audioPillText: {
    fontSize: 15,
    fontWeight: '800',
  },
  exerciseHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  exerciseTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  exerciseType: {
    fontSize: 12.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  question: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
    lineHeight: 31,
  },
  matchInstruction: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  matchCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchCountText: {
    fontSize: 12,
    fontWeight: '800',
  },
  activeSelectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 12,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  activeSelectionText: {
    color: '#2B6CB0',
    fontSize: 13,
    fontWeight: '700',
  },
  hint: {
    fontSize: 13.5,
    fontStyle: 'italic',
    lineHeight: 19,
    flex: 1,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 2,
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
  },
  perfectBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: 8,
  },
  perfectBannerText: {
    fontWeight: '800',
    fontSize: 13.5,
  },
  optionsGrid: { marginTop: 12, gap: 12 },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 12,
  },
  resultIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTitle: { fontSize: 18, fontWeight: '800' },
  correctAnswer: { fontSize: 14.5, marginTop: 4 },
  heartPenalty: { fontSize: 12.5, fontWeight: '700', marginTop: 4 },
  feedbackAudioBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
  },
  continueBtnText: { color: '#FFFFFF', fontSize: 16.5, fontWeight: '800' },
  completeContainer: { flex: 1 },
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  completeXpPillText: { fontSize: 13, fontWeight: '800' },
  completeTitle: {
    fontSize: 34,
    fontWeight: '900',
    marginTop: 12,
    letterSpacing: -0.5,
  },
  completeSubtitle: {
    fontSize: 16,
    marginBottom: 26,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
    width: '100%',
    maxWidth: 440,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 5,
  },
  statCardValue: { fontSize: 18, fontWeight: '900' },
  statCardLabel: { fontSize: 12 },
  completeAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 28,
    gap: 8,
    marginBottom: 10,
    width: '100%',
    maxWidth: 380,
  },
  completeActionText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  // Word match
  matchChip: {
    flexDirection: 'row',
    gap: 6,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchChipText: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
  // Sentence build
  clearSentenceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  clearSentenceText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sentenceArea: {
    minHeight: 72,
    borderWidth: 2,
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
    justifyContent: 'center',
  },
  wordBankLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 14,
  },
  wordChip: {
    borderWidth: 2,
    borderBottomWidth: 4,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
});
