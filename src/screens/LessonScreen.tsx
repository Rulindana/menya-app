import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import { Text } from '../components/ui/AppText';
import { TextInput } from '../components/ui/AppTextInput';
import { AppModal } from '../components/AppModal';
import { LinearGradient } from 'expo-linear-gradient';
import { AppIcon } from '../components/ui/AppIcon';
import { GorillaMascot } from '../components/GorillaMascot';
import { HeartsSheet } from '../components/HeartsSheet';
import { AnimatedButton, GlowButton, PulseButton } from '../components/AnimatedButton';
import { XPPopup } from '../components/XPPopup';
import { getLessonById, getUnitForLesson, getTotalLessons } from '../data/lessons';
import { generateLessonQuestions, DynamicQuestion } from '../data/questionBank';
import { useAppStore, getLevel } from '../store/useAppStore';
import { useHaptics } from '../hooks/useHaptics';
import { useTheme } from '../theme/themeContext';

interface LessonScreenProps {
  route: { params: { lessonId: string; masterMode?: boolean } };
  navigation: any;
}

export const LessonScreen: React.FC<LessonScreenProps> = ({ route, navigation }) => {
  const { lessonId, masterMode = false } = route.params;
  const lesson = getLessonById(lessonId);
  const unit = getUnitForLesson(lessonId);
  const { completeLesson, loseHeart, progress } = useAppStore();
  const haptics = useHaptics();
  const { colors } = useTheme();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [translateInput, setTranslateInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showXPPopup, setShowXPPopup] = useState(false);
  const [xpEarned, setXPEarned] = useState(0);
  const [levelUpTo, setLevelUpTo] = useState<number | null>(null);
  const [perfectBonus, setPerfectBonus] = useState<number>(0);
  // word_match state
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
  const [selectedKiny, setSelectedKiny] = useState<string | null>(null);
  // sentence_build state
  const [builtSentence, setBuiltSentence] = useState<string[]>([]);
  const [remainingWords, setRemainingWords] = useState<string[]>([]);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  const [showQuitModal, setShowQuitModal] = useState(false);
  const [showOutOfHearts, setShowOutOfHearts] = useState(false);

  React.useEffect(() => {
    if (progress.hearts <= 0) setShowOutOfHearts(true);
  }, []);

  // Generate dynamic questions once per lesson mount — never the same twice, no duplicates
  const [dynamicExercises] = useState(() => {
    const category = unit?.id?.replace('unit', '') || 'mixed';
    const categoryMap: Record<string, string> = {
      '1': 'greetings', '2': 'numbers', '3': 'colors', '4': 'family',
      '5': 'food', '6': 'animals', '7': 'body', '8': 'time',
      '9': 'verbs', '10': 'places', '11': 'weather', '12': 'culture',
      '13': 'greetings', '14': 'home',
    };
    const cat = categoryMap[category] || 'mixed';
    return generateLessonQuestions(cat, lesson ? lesson.exercises.length : 6);
  });

  if (!lesson) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Lesson not found</Text>
      </View>
    );
  }

  const totalExercises = dynamicExercises.length;
  const exercise = dynamicExercises[currentIdx];

  // exercise.type used directly below for rendering

  const animateProgress = (to: number) => {
    Animated.spring(progressAnim, {
      toValue: to,
      useNativeDriver: false,
      friction: 6,
    }).start();
  };

  const shakeWrong = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const bounceCorrect = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 1.08, duration: 100, useNativeDriver: true }),
      Animated.timing(bounceAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  // Initialize sentence words for the first exercise if needed
  React.useEffect(() => {
    const ex = dynamicExercises[0];
    if (ex?.type === 'sentence_build' && ex.words) {
      setRemainingWords([...ex.words].sort(() => Math.random() - 0.5));
    }
  }, [lessonId]);

  const checkAnswer = (answer: string) => {
    const correct = answer.trim().toLowerCase() === exercise.answer.trim().toLowerCase();
    setIsCorrect(correct);
    setShowResult(true);
    animateProgress((currentIdx + 1) / totalExercises);
    if (correct) {
      haptics.success();
      setCorrectCount((c) => c + 1);
      bounceCorrect();
    } else {
      haptics.mistake();
      shakeWrong();
      loseHeart();
    }
  };

  const handleMultipleChoice = (option: string) => {
    if (showResult) return;
    haptics.lightTap();
    setSelected(option);
    checkAnswer(option);
  };

  const handleFillBlank = (word: string) => {
    if (showResult) return;
    haptics.lightTap();
    setSelected(word);
    checkAnswer(word);
  };

  const handleWordMatchSelect = (kiny: string, eng: string) => {
    if (showResult) return;
    const correctPair = exercise.pairs?.find(p => p.kiny === kiny);
    if (correctPair && correctPair.eng === eng) {
      const newMatched = { ...matchedPairs, [kiny]: eng };
      setMatchedPairs(newMatched);
      setSelectedKiny(null);
      haptics.success();
      if (exercise.pairs && Object.keys(newMatched).length === exercise.pairs.length) {
        setIsCorrect(true);
        setShowResult(true);
        setCorrectCount(c => c + 1);
        bounceCorrect();
        animateProgress((currentIdx + 1) / totalExercises);
      }
    } else {
      haptics.mistake();
      shakeWrong();
      setSelectedKiny(null);
    }
  };

  const handleSentenceWordTap = (word: string, fromBuilt: boolean) => {
    if (showResult) return;
    haptics.lightTap();
    if (fromBuilt) {
      const idx = builtSentence.indexOf(word);
      setBuiltSentence(prev => [...prev.slice(0, idx), ...prev.slice(idx + 1)]);
      setRemainingWords(prev => [...prev, word]);
    } else {
      const idx = remainingWords.indexOf(word);
      setRemainingWords(prev => [...prev.slice(0, idx), ...prev.slice(idx + 1)]);
      setBuiltSentence(prev => [...prev, word]);
    }
  };

  const handleSentenceCheck = () => {
    if (showResult || builtSentence.length === 0) return;
    checkAnswer(builtSentence.join(' '));
  };

  const handleNext = () => {
    haptics.lightTap();
    if (finished) return;
    if (useAppStore.getState().progress.hearts <= 0) {
      setShowOutOfHearts(true);
      return;
    }
    if (currentIdx + 1 >= totalExercises) {
      haptics.celebration();
      const accuracy = correctCount / totalExercises;
      const isPerfect = correctCount === totalExercises;
      const earnedXP = Math.floor(lesson.xpReward * accuracy);
      const bonus = isPerfect ? 4 : 0;
      setXPEarned(earnedXP + bonus);
      setPerfectBonus(bonus);
      const levelBefore = getLevel(progress.xp);
      const levelAfter = getLevel(progress.xp + earnedXP + bonus);
      if (levelAfter > levelBefore) setLevelUpTo(levelAfter);
      setShowXPPopup(true);
      completeLesson(lessonId, earnedXP, isPerfect);
      setFinished(true);
    } else {
      const nextEx = dynamicExercises[currentIdx + 1];
      setCurrentIdx((i) => i + 1);
      setSelected(null);
      setTranslateInput('');
      setShowResult(false);
      setIsCorrect(false);
      setMatchedPairs({});
      setSelectedKiny(null);
      setBuiltSentence([]);
      if (nextEx?.type === 'sentence_build' && nextEx.words) {
        setRemainingWords([...nextEx.words].sort(() => Math.random() - 0.5));
      } else {
        setRemainingWords([]);
      }
    }
  };

  if (finished) {
    const accuracy = Math.round((correctCount / totalExercises) * 100);
    return (
      <LessonComplete
        lesson={lesson}
        correctCount={correctCount}
        totalExercises={totalExercises}
        accuracy={accuracy}
        navigation={navigation}
        xpEarned={xpEarned}
        perfectBonus={perfectBonus}
        allLessonsComplete={progress.completedLessons.length + 1 >= getTotalLessons()}
        colors={colors}
      />
    );
  }

  const unitColor = unit?.color || '#0B6E84';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* XP Popup */}
      <XPPopup
        amount={xpEarned}
        visible={showXPPopup}
        type={isCorrect ? 'correct' : 'lesson'}
        onComplete={() => setShowXPPopup(false)}
      />

      {/* Top bar */}
      <View style={[styles.topBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <AnimatedButton
          onPress={() => {
            haptics.lightTap();
            setShowQuitModal(true);
          }}
          style={styles.closeBtn}
        >
          <AppIcon name="close" size={22} color={colors.textMuted} />
        </AnimatedButton>

        <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                backgroundColor: unitColor,
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        <View style={[styles.heartDisplay, { backgroundColor: colors.error + '20' }]}>
          <AppIcon name="heart" size={14} color={colors.error} />
          <Text style={[styles.heartText, { color: colors.error }]}>{progress.hearts}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.counter, { color: colors.textMuted }]}>
          {currentIdx + 1} / {totalExercises}
        </Text>

        {/* Question card */}
        <Animated.View
          style={[
            styles.questionCard,
            { backgroundColor: colors.card, transform: [{ translateX: shakeAnim }, { scale: bounceAnim }] },
          ]}
        >
          {exercise.type === 'word_match' ? (
            <WordMatchExercise
              key={exercise.id}
              exercise={exercise}
              matchedPairs={matchedPairs}
              selectedKiny={selectedKiny}
              showResult={showResult}
              colors={colors}
              onSelectKiny={(kiny) => setSelectedKiny(selectedKiny === kiny ? null : kiny)}
              onSelectEng={(eng) => { if (selectedKiny) handleWordMatchSelect(selectedKiny, eng); }}
            />
          ) : exercise.type === 'fill_blank' ? (
            <FillBlankExercise
              exercise={exercise}
              selected={selected}
              showResult={showResult}
              isCorrect={isCorrect}
              unitColor={unitColor}
              onSelect={handleFillBlank}
              colors={colors}
            />
          ) : exercise.type === 'sentence_build' ? (
            <SentenceBuildExercise
              exercise={exercise}
              builtSentence={builtSentence}
              remainingWords={remainingWords}
              showResult={showResult}
              isCorrect={isCorrect}
              colors={colors}
              onTapWord={handleSentenceWordTap}
              onCheck={handleSentenceCheck}
            />
          ) : (
            <MultipleChoiceExercise
              exercise={exercise}
              selected={selected}
              showResult={showResult}
              isCorrect={isCorrect}
              unitColor={unitColor}
              onSelect={handleMultipleChoice}
              colors={colors}
            />
          )}
        </Animated.View>

        {/* Result feedback */}
        {showResult && (
          <View
            style={[
              styles.resultBanner,
              { backgroundColor: isCorrect ? colors.success + '20' : colors.error + '20' },
            ]}
          >
              {isCorrect ? (
                <AppIcon name="checkCircle" size={32} color={colors.success} />
              ) : (
                <AppIcon name="closeCircle" size={32} color={colors.error} />
              )}
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.resultTitle,
                  { color: isCorrect ? colors.success : colors.error },
                ]}
              >
                {isCorrect ? 'Nibyo! Correct!' : 'Sibyo! Wrong!'}
              </Text>
              {!isCorrect && (
                <>
                  <Text style={[styles.correctAnswer, { color: colors.textSecondary }]}>
                    Answer: {exercise.answer}
                  </Text>
                  <Text style={[styles.heartPenalty, { color: colors.error }]}>
                    −1 heart · Each mistake costs 1 heart
                  </Text>
                </>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Continue button */}
      {showResult && (
        <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <GlowButton
            style={[
              styles.continueBtn,
              { backgroundColor: isCorrect ? colors.success : colors.error },
            ]}
            glowColor={isCorrect ? colors.success : colors.error}
            onPress={handleNext}
          >
            <Text style={styles.continueBtnText}>
              {currentIdx + 1 >= totalExercises
                ? 'Rangiza / Finish'
                : 'Komeza / Continue'}
            </Text>
            <AppIcon name="arrowRight1" size={20} color="#FFFFFF" />
          </GlowButton>
        </View>
      )}

      {/* Quit confirmation */}
      <AppModal
        visible={showQuitModal}
        title="Siga isomo?"
        message="Urashaka guhagarika? Urakoze kwiga!"
        type="warning"
        icon="pencil"
        cancelText="Komeza"
        confirmText="Siga"
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
      <AppIcon name="target" size={14} color={colors.primary} />
      <Text style={[styles.exerciseType, { color: colors.primary }]}>Multiple Choice</Text>
    </View>
    <Text style={[styles.question, { color: colors.text }]}>{exercise.question}</Text>
    {exercise.hint && (
      <View style={styles.hintRow}>
        <AppIcon name="info" size={13} color={colors.textSecondary} />
        <Text style={[styles.hint, { color: colors.textSecondary }]}>{exercise.hint}</Text>
      </View>
    )}
    <View style={styles.optionsGrid}>
      {(exercise.options || []).map((opt) => {
        const isSelected = selected === opt;
        const isRight = opt === exercise.answer;
        let bgColor = colors.card;
        let borderColor = colors.border;
        let textColor = colors.text;

        if (showResult && isRight) {
          bgColor = colors.success + '20';
          borderColor = colors.success;
          textColor = colors.success;
        } else if (showResult && isSelected && !isRight) {
          bgColor = colors.error + '20';
          borderColor = colors.error;
          textColor = colors.error;
        } else if (!showResult && isSelected) {
          bgColor = unitColor + '18';
          borderColor = unitColor;
          textColor = unitColor;
        }

        return (
          <TouchableOpacity
            key={opt}
            style={[styles.optionBtn, { backgroundColor: bgColor, borderColor }]}
            onPress={() => onSelect(opt)}
            disabled={showResult}
            activeOpacity={0.75}
          >
              {showResult && isRight && (
                <View style={{ marginRight: 6 }}><AppIcon name="checkCircle" size={16} color={colors.success} /></View>
              )}
              {showResult && isSelected && !isRight && (
                <View style={{ marginRight: 6 }}><AppIcon name="closeCircle" size={16} color={colors.error} /></View>
              )}
            <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

// ── Fill in the Blank ─────────────────────────────────────────────
const FillBlankExercise: React.FC<{
  exercise: DynamicQuestion;
  selected: string | null;
  showResult: boolean;
  isCorrect: boolean;
  unitColor: string;
  onSelect: (word: string) => void;
  colors: any;
}> = ({ exercise, selected, showResult, isCorrect, unitColor, onSelect, colors }) => (
  <View>
    <View style={styles.exerciseTypeRow}>
      <AppIcon name="pencil" size={14} color="#C9891C" />
      <Text style={[styles.exerciseType, { color: '#C9891C' }]}>Fill in the Blank</Text>
    </View>
    <Text style={[styles.question, { color: colors.text }]}>{exercise.question}</Text>
    {exercise.hint && (
      <View style={styles.hintRow}>
        <AppIcon name="info" size={13} color={colors.textSecondary} />
        <Text style={[styles.hint, { color: colors.textSecondary }]}>{exercise.hint}</Text>
      </View>
    )}
    <View style={styles.optionsGrid}>
      {(exercise.blanks || []).map((word) => {
        const isSelected = selected === word;
        const isRight = word === exercise.answer;
        let bgColor = colors.card;
        let borderColor = colors.border;
        let textColor = colors.text;
        if (showResult && isRight) { bgColor = colors.success + '20'; borderColor = colors.success; textColor = colors.success; }
        else if (showResult && isSelected && !isRight) { bgColor = colors.error + '20'; borderColor = colors.error; textColor = colors.error; }
        else if (!showResult && isSelected) { bgColor = unitColor + '18'; borderColor = unitColor; textColor = unitColor; }
        return (
          <TouchableOpacity
            key={word}
            style={[styles.optionBtn, { backgroundColor: bgColor, borderColor }]}
            onPress={() => onSelect(word)}
            disabled={showResult}
            activeOpacity={0.75}
          >
            {showResult && isRight && <AppIcon name="checkCircle" size={16} color={colors.success} style={{ marginRight: 6 }} />}
            {showResult && isSelected && !isRight && <AppIcon name="closeCircle" size={16} color={colors.error} style={{ marginRight: 6 }} />}
            <Text style={[styles.optionText, { color: textColor }]}>{word}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

// ── Word Match ────────────────────────────────────────────────────
// Large pool of Kinyarwanda-English pairs to pick from randomly
const WORD_MATCH_POOL: { kiny: string; eng: string }[] = [
  { kiny: 'Muraho', eng: 'Hello' },
  { kiny: 'Murabeho', eng: 'Goodbye' },
  { kiny: 'Murakoze', eng: 'Thank you' },
  { kiny: 'Yego', eng: 'Yes' },
  { kiny: 'Oya', eng: 'No' },
  { kiny: 'Amahoro', eng: 'Peace' },
  { kiny: 'Ubumwe', eng: 'Unity' },
  { kiny: 'Ingagi', eng: 'Gorilla' },
  { kiny: 'Imisozi', eng: 'Hills' },
  { kiny: 'Kwiga', eng: 'To learn' },
  { kiny: 'Kurya', eng: 'To eat' },
  { kiny: 'Kunywa', eng: 'To drink' },
  { kiny: 'Amazi', eng: 'Water' },
  { kiny: 'Amata', eng: 'Milk' },
  { kiny: 'Igitoki', eng: 'Banana' },
  { kiny: 'Inka', eng: 'Cow' },
  { kiny: 'Ishuri', eng: 'School' },
  { kiny: 'Isoko', eng: 'Market' },
  { kiny: 'Umwana', eng: 'Child' },
  { kiny: 'Umuryango', eng: 'Family' },
  { kiny: 'Izuba', eng: 'Sun' },
  { kiny: 'Imvura', eng: 'Rain' },
  { kiny: 'Kugenda', eng: 'To go' },
  { kiny: 'Kubona', eng: 'To see' },
  { kiny: 'Kuvuga', eng: 'To speak' },
  { kiny: 'Meze neza', eng: 'I am fine' },
  { kiny: 'Mwaramutse', eng: 'Good morning' },
  { kiny: 'Mwiriwe', eng: 'Good evening' },
  { kiny: 'Ibishyimbo', eng: 'Beans' },
  { kiny: 'Umujyi', eng: 'City' },
];

const getRandomPairs = (count = 4) => {
  const shuffled = [...WORD_MATCH_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const WordMatchExercise: React.FC<{
  exercise: DynamicQuestion;
  matchedPairs: Record<string, string>;
  selectedKiny: string | null;
  showResult: boolean;
  colors: any;
  onSelectKiny: (kiny: string) => void;
  onSelectEng: (eng: string) => void;
}> = ({ exercise, matchedPairs, selectedKiny, showResult, colors, onSelectKiny, onSelectEng }) => {
  // Use dynamic random pairs each time this component mounts (each exercise attempt)
  const [pairs] = React.useState(() =>
    exercise.pairs && exercise.pairs.length > 0 ? exercise.pairs : getRandomPairs(4)
  );
  const [shuffledEng] = React.useState(() => [...pairs].sort(() => Math.random() - 0.5));
  return (
    <View>
      <View style={styles.exerciseTypeRow}>
        <AppIcon name="link" size={14} color="#2B6CB0" />
        <Text style={[styles.exerciseType, { color: '#2B6CB0' }]}>Word Match</Text>
      </View>
      <Text style={[styles.question, { color: colors.text }]}>{exercise.question}</Text>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
        {/* Kinyarwanda column */}
        <View style={{ flex: 1, gap: 8 }}>
          {pairs.map(p => {
            const isMatched = !!matchedPairs[p.kiny];
            const isSelected = selectedKiny === p.kiny;
            return (
              <TouchableOpacity
                key={p.kiny}
                style={[styles.matchChip, {
                  backgroundColor: isMatched ? colors.success + '20' : isSelected ? '#2B6CB022' : colors.card,
                  borderColor: isMatched ? colors.success : isSelected ? '#2B6CB0' : colors.border,
                }]}
                onPress={() => !isMatched && !showResult && onSelectKiny(p.kiny)}
                disabled={isMatched || showResult}
                activeOpacity={0.75}
              >
                <Text style={[styles.matchChipText, { color: isMatched ? colors.success : isSelected ? '#2B6CB0' : colors.text }]}>{p.kiny}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {/* English column — always shuffled */}
        <View style={{ flex: 1, gap: 8 }}>
          {shuffledEng.map(p => {
            const isMatched = Object.values(matchedPairs).includes(p.eng);
            return (
              <TouchableOpacity
                key={p.eng}
                style={[styles.matchChip, {
                  backgroundColor: isMatched ? colors.success + '20' : colors.card,
                  borderColor: isMatched ? colors.success : colors.border,
                }]}
                onPress={() => !isMatched && !showResult && selectedKiny && onSelectEng(p.eng)}
                disabled={isMatched || showResult || !selectedKiny}
                activeOpacity={0.75}
              >
                <Text style={[styles.matchChipText, { color: isMatched ? colors.success : colors.text }]}>{p.eng}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      {selectedKiny && !showResult && (
        <Text style={{ color: '#2B6CB0', fontSize: 12, marginTop: 8, textAlign: 'center' }}>
          Now tap the English meaning for "{selectedKiny}"
        </Text>
      )}
    </View>
  );
};

// ── Sentence Build ────────────────────────────────────────────────
const SentenceBuildExercise: React.FC<{
  exercise: DynamicQuestion;
  builtSentence: string[];
  remainingWords: string[];
  showResult: boolean;
  isCorrect: boolean;
  colors: any;
  onTapWord: (word: string, fromBuilt: boolean) => void;
  onCheck: () => void;
}> = ({ exercise, builtSentence, remainingWords, showResult, isCorrect, colors, onTapWord, onCheck }) => (
  <View>
    <View style={styles.exerciseTypeRow}>
      <AppIcon name="puzzle" size={14} color={colors.primary} />
      <Text style={[styles.exerciseType, { color: colors.primary }]}>Build the Sentence</Text>
    </View>
    <Text style={[styles.question, { color: colors.text }]}>{exercise.question}</Text>
    {/* Built sentence area */}
    <View style={[styles.sentenceArea, { borderColor: showResult ? (isCorrect ? colors.success : colors.error) : colors.border }]}>
      {builtSentence.length === 0 ? (
        <Text style={{ color: colors.textMuted, fontSize: 13, fontStyle: 'italic' }}>Tap words below to build the sentence...</Text>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {builtSentence.map((word, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.wordChip, {
                backgroundColor: showResult ? (isCorrect ? colors.success + '30' : colors.error + '30') : '#7C5CBF' + '18',
                borderColor: showResult ? (isCorrect ? colors.success : colors.error) : '#7C5CBF',
              }]}
              onPress={() => !showResult && onTapWord(word, true)}
              disabled={showResult}
            >
              <Text style={{ color: showResult ? (isCorrect ? colors.success : colors.error) : '#7C5CBF', fontWeight: '700', fontSize: 14 }}>{word}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
    {/* Word bank */}
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
      {remainingWords.map((word, i) => (
        <TouchableOpacity
          key={i}
          style={[styles.wordChip, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => !showResult && onTapWord(word, false)}
          disabled={showResult}
        >
          <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>{word}</Text>
        </TouchableOpacity>
      ))}
    </View>
    {/* Check button */}
    {!showResult && builtSentence.length > 0 && (
      <TouchableOpacity
        style={[styles.checkBtn, { backgroundColor: '#7C5CBF' }]}
        onPress={onCheck}
        activeOpacity={0.8}
      >
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Check Answer</Text>
        <AppIcon name="check" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    )}
  </View>
);

// ── Lesson Complete ───────────────────────────────────────────────
const LessonComplete: React.FC<{
  lesson: any;
  correctCount: number;
  totalExercises: number;
  accuracy: number;
  xpEarned: number;
  perfectBonus: number;
  allLessonsComplete: boolean;
  navigation: any;
  colors: any;
}> = ({ lesson, correctCount, totalExercises, accuracy, xpEarned, perfectBonus, allLessonsComplete, navigation, colors }) => {
  const haptics = useHaptics();
  const isPerfect = correctCount === totalExercises;

  React.useEffect(() => {
    haptics.celebration();
  }, []);

  return (
    <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.completeContainer}>
      <GorillaMascot size={120} mood="celebrate" />
      <Text style={styles.completeTitle}>{isPerfect ? 'PERFECT!' : 'Warangije!'}</Text>
      {isPerfect && (
        <View style={styles.perfectBanner}>
          <AppIcon name="target" size={16} color="#14212B" />
          <Text style={styles.perfectBannerText}>
            Perfect Score! +{perfectBonus} Bonus XP!
          </Text>
        </View>
      )}
      <Text style={styles.completeSubtitle}>{lesson.title}</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <AppIcon name="star1" size={24} color="#D9A441" />
          <Text style={styles.statCardValue}>{xpEarned} XP</Text>
          <Text style={styles.statCardLabel}>Earned</Text>
        </View>
        <View style={styles.statCard}>
          <AppIcon name="target" size={24} color="#FFFFFF" />
          <Text style={styles.statCardValue}>{accuracy}%</Text>
          <Text style={styles.statCardLabel}>Accuracy</Text>
        </View>
        <View style={styles.statCard}>
          <AppIcon name="checkCircle" size={24} color="#FFFFFF" />
          <Text style={styles.statCardValue}>{correctCount}/{totalExercises}</Text>
          <Text style={styles.statCardLabel}>Correct</Text>
        </View>
      </View>

      {allLessonsComplete && (
        <PulseButton
          style={[styles.homeBtn, { backgroundColor: '#D9A441', marginBottom: 12 }]}
          onPress={() => {
            haptics.lightTap();
            navigation.navigate('Certificate');
          }}
        >
          <AppIcon name="trophy" size={20} color="#14212B" />
          <Text style={[styles.homeBtnText, { color: '#14212B' }]}>
            Get Certificate
          </Text>
        </PulseButton>
      )}

      {/* Retry button — only shown when accuracy < 50% */}
      {accuracy < 50 && (
        <AnimatedButton
          style={[styles.homeBtn, { backgroundColor: '#C9891C', marginBottom: 12 }]}
          onPress={() => {
            haptics.lightTap();
            // Navigate back to the same lesson fresh
            navigation.replace('Lesson', { lessonId: lesson.id });
          }}
        >
          <AppIcon name="refresh" size={20} color="#FFFFFF" />
          <Text style={styles.homeBtnText}>Ongera Ugerageze / Retry</Text>
        </AnimatedButton>
      )}

      <AnimatedButton
        style={styles.homeBtn}
        onPress={() => {
          haptics.lightTap();
          navigation.popToTop();
        }}
      >
        <Text style={styles.homeBtnText}>Subira Ahabanza / Go Home</Text>
      </AnimatedButton>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 10,
    borderBottomWidth: 1,
  },
  closeBtn: { padding: 4 },
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
  heartDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  heartText: { fontSize: 14, fontWeight: '700' },
  content: { padding: 20, paddingBottom: 120 },
  counter: {
    textAlign: 'center',
    fontSize: 13,
    marginBottom: 16,
    fontWeight: '600',
  },
  questionCard: {
    borderRadius: 16,
    padding: 20,
  },
  exerciseTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  exerciseType: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  question: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    lineHeight: 28,
  },
  hint: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
    flex: 1,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    marginTop: 8,
    marginBottom: 16,
  },
  perfectBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FBF3E3',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: 8,
  },
  perfectBannerText: {
    color: '#14212B',
    fontWeight: '800',
    fontSize: 13,
  },
  optionsGrid: { marginTop: 12, gap: 10 },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  resultTitle: { fontSize: 18, fontWeight: '800' },
  correctAnswer: { fontSize: 14, marginTop: 4 },
  heartPenalty: { fontSize: 12, fontWeight: '700', marginTop: 4 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 34,
    borderTopWidth: 1,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  continueBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  completeTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 16,
  },
  completeSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 30,
    textAlign: 'center',
  },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 40 },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 90,
    gap: 4,
  },
  statCardValue: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  statCardLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  homeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D9A441',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 30,
    gap: 8,
    marginBottom: 8,
  },
  homeBtnText: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  // Word match
  matchChip: {
    borderWidth: 2, borderRadius: 10, padding: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  matchChipText: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  // Sentence build
  sentenceArea: {
    minHeight: 60, borderWidth: 2, borderRadius: 12,
    padding: 12, marginTop: 12,
  },
  wordChip: {
    borderWidth: 2, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  checkBtn: {
    marginTop: 14, borderRadius: 12, padding: 14, alignItems: 'center',
  },
});
