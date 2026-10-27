import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../components/ui/AppText';
import { AppIcon } from '../components/ui/AppIcon';
import { InteractiveOptionCard } from '../components/ui/InteractiveOptionCard';
import { useTheme } from '../theme/themeContext';
import { useAppStore } from '../store/useAppStore';
import { speakKinyarwanda } from '../hooks/useSpeech';
import { useHaptics } from '../hooks/useHaptics';
import { Footer } from '../components/Footer';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { stories, Story } from '../data/stories';
import { culturalTips } from '../data/culturalTips';
import AsyncStorage from '@react-native-async-storage/async-storage';

type StoryView = 'list' | 'reading' | 'quiz' | 'result';

const COMPLETED_KEY = 'menya_completed_stories';

export const StoriesScreen: React.FC<{ navigation: any }> = () => {
  const { colors } = useTheme();
  const { addXP } = useAppStore();
  const haptics = useHaptics();
  const [view, setView] = useState<StoryView>('list');
  const [selected, setSelected] = useState<Story | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [tipIndex, setTipIndex] = useState(0);
  const quizTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(COMPLETED_KEY).then((v) => {
      if (v) setCompleted(JSON.parse(v));
    });
    return () => {
      if (quizTimerRef.current) clearTimeout(quizTimerRef.current);
    };
  }, []);

  const openStory = (story: Story) => {
    haptics.lightTap();
    setSelected(story);
    setShowTranslation(false);
    setView('reading');
  };

  const startQuiz = () => {
    haptics.lightTap();
    setQuizIdx(0);
    setAnswers({});
    setScore(0);
    setView('quiz');
  };

  const handleAnswer = (answer: string) => {
    if (!selected) return;
    const q = selected.questions[quizIdx];
    const correct = answer === q.answer;
    if (correct) {
      haptics.success();
    } else {
      haptics.mistake();
    }
    const newAnswers = { ...answers, [q.id]: answer };
    setAnswers(newAnswers);
    const newScore = score + (correct ? 1 : 0);
    setScore(newScore);
    if (quizTimerRef.current) clearTimeout(quizTimerRef.current);
    quizTimerRef.current = setTimeout(() => {
      if (quizIdx + 1 >= selected.questions.length) {
        haptics.celebration();
        const earned = Math.floor((newScore / selected.questions.length) * selected.xpReward);
        addXP(earned);
        if (!completed.includes(selected.id)) {
          const next = [...completed, selected.id];
          setCompleted(next);
          AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(next));
        }
        setView('result');
      } else {
        setQuizIdx((i) => i + 1);
      }
    }, 650);
  };

  const activeTip = culturalTips[tipIndex % culturalTips.length];

  // ── List ──
  if (view === 'list') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader
          title="Inkuru"
          subtitle="Kinyarwanda reading stories & culture"
          right={
            <View style={[styles.countPill, { backgroundColor: colors.primaryLight }]}>
              <AppIcon name="bookOpen" size={13} color={colors.primary} />
              <Text style={[styles.countPillText, { color: colors.primary }]}>
                {completed.length}/{stories.length}
              </Text>
            </View>
          }
        />
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={[styles.sectionNote, { color: colors.textSecondary }]}>
            Read · Listen · Understand ({stories.length} authentic stories)
          </Text>

          {/* Cultural Insight Spotlight */}
          {activeTip && (
            <TouchableOpacity
              style={[
                styles.cultureSpotlight,
                { backgroundColor: colors.card, borderColor: colors.primary + '44' },
              ]}
              onPress={() => {
                haptics.selection();
                setTipIndex((prev) => (prev + 1) % culturalTips.length);
              }}
              activeOpacity={0.85}
            >
              <View style={styles.cultureHeaderRow}>
                <View style={[styles.cultureIconWrap, { backgroundColor: colors.primary + '18' }]}>
                  <AppIcon name={activeTip.icon} size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cultureEyebrow, { color: colors.primary }]}>
                    UMUCO W&apos;U RWANDA · CULTURAL INSIGHT ({(tipIndex % culturalTips.length) + 1}/{culturalTips.length})
                  </Text>
                  <Text style={[styles.cultureTitle, { color: colors.text }]}>
                    {activeTip.titleKiny} — {activeTip.title}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.cultureSpeakBtn, { backgroundColor: colors.primary + '16' }]}
                  onPress={() => {
                    haptics.lightTap();
                    speakKinyarwanda(activeTip.keyPhraseKiny);
                  }}
                >
                  <AppIcon name="volumeHigh" size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.cultureBody, { color: colors.textSecondary }]}>
                {activeTip.summary}
              </Text>
              <View style={[styles.culturePhraseRow, { backgroundColor: colors.background }]}>
                <Text style={[styles.culturePhraseKiny, { color: colors.primary }]}>
                  &ldquo;{activeTip.keyPhraseKiny}&rdquo;
                </Text>
                <Text style={[styles.culturePhraseEng, { color: colors.textMuted }]}>
                  {activeTip.keyPhraseEng} · Tap card for next tip
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {stories.map((story) => {
            const done = completed.includes(story.id);
            return (
              <TouchableOpacity
                key={story.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.card,
                    borderColor: done ? story.levelColor : colors.border,
                  },
                ]}
                onPress={() => openStory(story)}
                activeOpacity={0.8}
              >
                <View style={[styles.cardIcon, { backgroundColor: story.levelColor + '18' }]}>
                  <AppIcon name={story.icon} size={24} color={story.levelColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{story.title}</Text>
                  <Text style={[styles.cardTitleKiny, { color: colors.textSecondary }]}>
                    {story.titleKiny}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <View
                      style={[
                        styles.levelBadge,
                        { backgroundColor: story.levelColor + '22', borderColor: story.levelColor },
                      ]}
                    >
                      <Text style={[styles.levelText, { color: story.levelColor }]}>
                        {story.level}
                      </Text>
                    </View>
                    <Text style={[styles.xpText, { color: '#C9891C' }]}>+{story.xpReward} XP</Text>
                    {done && <AppIcon name="checkCircle" size={15} color={colors.success} />}
                  </View>
                </View>
                <AppIcon name="arrowRight" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            );
          })}
          <Footer />
          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    );
  }

  // ── Reading ──
  if (view === 'reading' && selected) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader
          onBack={() => setView('list')}
          title={selected.title}
          subtitle={selected.titleKiny}
          right={
            <View style={[styles.levelPill, { backgroundColor: selected.levelColor + '18' }]}>
              <Text style={[styles.levelPillText, { color: selected.levelColor }]}>
                {selected.level}
              </Text>
            </View>
          }
        />
        <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
          <View style={[styles.textBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.storyHeaderActions}>
              <Text style={[styles.storyKinyLabel, { color: colors.primary }]}>
                IKINYARWANDA
              </Text>
              <TouchableOpacity
                style={[styles.listenStoryBtn, { backgroundColor: colors.primary + '16' }]}
                onPress={() => {
                  haptics.lightTap();
                  speakKinyarwanda(selected.titleKiny);
                }}
                activeOpacity={0.75}
              >
                <AppIcon name="volumeHigh" size={14} color={colors.primary} />
                <Text style={[styles.listenStoryText, { color: colors.primary }]}>
                  Umva Umutwe
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.storyText, { color: colors.text }]}>{selected.text}</Text>
          </View>
          <TouchableOpacity
            style={[styles.transBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              haptics.lightTap();
              setShowTranslation((v) => !v);
            }}
          >
            <Text style={[styles.transBtnText, { color: colors.primary }]}>
              {showTranslation ? 'Hide English Translation' : 'Show English Translation'}
            </Text>
          </TouchableOpacity>
          {showTranslation && (
            <View
              style={[
                styles.textBox,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.primary + '44',
                  borderWidth: 1.5,
                  marginBottom: 14,
                },
              ]}
            >
              <Text style={[styles.storyText, { color: colors.textSecondary, fontStyle: 'italic' }]}>
                {selected.translation}
              </Text>
            </View>
          )}
          <View style={styles.vocabTitleRow}>
            <AppIcon name="bookOpen" size={16} color={colors.primary} />
            <Text style={[styles.vocabTitle, { color: colors.text }]}>
              Key Vocabulary (Tap to Listen)
            </Text>
          </View>
          <View style={[styles.vocabBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {selected.vocabulary.map((v) => (
              <TouchableOpacity
                key={v.kiny}
                style={[styles.vocabRow, { borderBottomColor: colors.border }]}
                onPress={() => {
                  haptics.lightTap();
                  speakKinyarwanda(v.kiny);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.vocabLeft}>
                  <AppIcon name="volumeHigh" size={14} color={colors.primary} />
                  <Text style={[styles.vocabKiny, { color: colors.primary }]}>{v.kiny}</Text>
                </View>
                <Text style={[styles.vocabEng, { color: colors.textSecondary }]}>{v.eng}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.quizBtn, { backgroundColor: colors.primary }]}
            onPress={startQuiz}
            activeOpacity={0.85}
          >
            <AppIcon name="pencil" size={16} color="#FFFFFF" />
            <Text style={styles.quizBtnText}>
              Start Comprehension Quiz (+{selected.xpReward} XP)
            </Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    );
  }

  // ── Quiz ──
  if (view === 'quiz' && selected) {
    const q = selected.questions[quizIdx];
    const answered = answers[q.id];
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader
          onBack={() => setView('reading')}
          title="Comprehension Quiz"
          subtitle={`Question ${quizIdx + 1} of ${selected.questions.length}`}
          progress={(quizIdx + (answered ? 1 : 0)) / selected.questions.length}
        />
        <ScrollView contentContainerStyle={styles.quizBody} showsVerticalScrollIndicator={false}>
          <View style={[styles.quizIconWrap, { backgroundColor: selected.levelColor + '18' }]}>
            <AppIcon name={selected.icon} size={34} color={selected.levelColor} />
          </View>
          <Text style={[styles.quizQ, { color: colors.text }]}>{q.question}</Text>
          <View style={{ gap: 12, width: '100%' }}>
            {q.options.map((opt, idx) => (
              <InteractiveOptionCard
                key={opt}
                label={opt}
                index={idx}
                isSelected={answered === opt}
                isRight={opt === q.answer}
                showResult={!!answered}
                accentColor={selected.levelColor}
                colors={colors}
                onPress={() => !answered && handleAnswer(opt)}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── Result ──
  if (view === 'result' && selected) {
    const pct = Math.round((score / selected.questions.length) * 100);
    const earned = Math.floor((score / selected.questions.length) * selected.xpReward);
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader
          onBack={() => setView('list')}
          title="Quiz complete"
          subtitle={selected.titleKiny}
        />
        <View style={styles.resultBox}>
          <View style={[styles.resultIcon, { backgroundColor: colors.primaryLight }]}>
            <AppIcon
              name={
                pct === 100 ? 'trophy' : pct >= 75 ? 'star' : pct >= 50 ? 'thumbsUp' : 'bookOpen'
              }
              size={36}
              color={colors.primary}
            />
          </View>
          <Text style={[styles.resultTitle, { color: colors.text }]}>
            {pct === 100
              ? 'Perfect!'
              : pct >= 75
                ? 'Great job!'
                : pct >= 50
                  ? 'Good effort!'
                  : 'Keep reading!'}
          </Text>
          <Text style={[styles.resultScore, { color: colors.textSecondary }]}>
            {score}/{selected.questions.length} correct · {pct}%
          </Text>
          <Text style={[styles.resultXP, { color: colors.success }]}>+{earned} XP earned!</Text>
          <TouchableOpacity
            style={[styles.quizBtn, { backgroundColor: colors.primary, marginTop: 24, width: '100%' }]}
            onPress={() => setView('list')}
          >
            <AppIcon name="arrowLeft" size={16} color="#FFFFFF" />
            <Text style={styles.quizBtnText}>Back to Stories</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quizBtn, { backgroundColor: colors.secondary, marginTop: 12, width: '100%' }]}
            onPress={() => openStory(selected)}
          >
            <AppIcon name="bookOpen" size={16} color="#14212B" />
            <Text style={[styles.quizBtnText, { color: '#14212B' }]}>Read Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countPillText: { fontSize: 12.5, fontWeight: '800' },
  levelPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  levelPillText: { fontSize: 11.5, fontWeight: '800' },
  sectionNote: { fontSize: 13.5, textAlign: 'center', marginVertical: 12, fontStyle: 'italic' },
  cultureSpotlight: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  cultureHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  cultureIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cultureEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  cultureTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 1,
  },
  cultureSpeakBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cultureBody: {
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: 10,
  },
  culturePhraseRow: {
    padding: 10,
    borderRadius: 10,
  },
  culturePhraseKiny: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  culturePhraseEng: {
    fontSize: 12,
    marginTop: 2,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 12,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  cardTitleKiny: { fontSize: 12.5, marginTop: 2 },
  levelBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  levelText: { fontSize: 10.5, fontWeight: '700' },
  xpText: { fontSize: 12.5, fontWeight: '700' },
  textBox: { borderRadius: 14, borderWidth: 1, padding: 18, marginBottom: 14 },
  storyHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  storyKinyLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1,
  },
  listenStoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  listenStoryText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  storyText: { fontSize: 16, lineHeight: 27 },
  transBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 10,
    padding: 13,
    marginBottom: 12,
  },
  transBtnText: { fontSize: 14, fontWeight: '700' },
  vocabTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  vocabTitle: { fontSize: 16.5, fontWeight: '800' },
  vocabBox: { borderRadius: 12, borderWidth: 1, overflow: 'hidden', marginBottom: 20 },
  vocabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
  },
  vocabLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vocabKiny: { fontSize: 15, fontWeight: '700' },
  vocabEng: { fontSize: 14 },
  quizBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 7,
    marginBottom: 8,
  },
  quizBtnText: { color: '#fff', fontSize: 15.5, fontWeight: '800' },
  quizBody: { flexGrow: 1, padding: 20, paddingTop: 26, alignItems: 'center' },
  quizQ: {
    fontSize: 21,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 29,
  },
  resultBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  resultIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  resultTitle: { fontSize: 28, fontWeight: '800', marginTop: 12 },
  resultScore: { fontSize: 15.5, marginTop: 8 },
  resultXP: { fontSize: 20, fontWeight: '800', marginTop: 8 },
});
