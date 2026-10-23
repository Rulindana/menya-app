import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from '../components/ui/AppText';
import { AppIcon } from '../components/ui/AppIcon';
import { useTheme } from '../theme/themeContext';
import { useAppStore } from '../store/useAppStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DAILY_KEY = 'menya_daily_challenge';
const DAILY_XP = 30;

const QUESTION_POOL = [
  { q: 'What does "Muraho" mean?', opts: ['Goodbye', 'Hello', 'Thank you', 'Sorry'], a: 'Hello' },
  { q: 'What is "Murakoze"?', opts: ['Please', 'Sorry', 'Thank you', 'Hello'], a: 'Thank you' },
  { q: 'How do you say "Good morning"?', opts: ['Mwiriwe', 'Mwaramutse', 'Muraho', 'Bite'], a: 'Mwaramutse' },
  { q: 'What does "Yego" mean?', opts: ['No', 'Maybe', 'Yes', 'Please'], a: 'Yes' },
  { q: 'What is "Oya"?', opts: ['Yes', 'No', 'Hello', 'Thank you'], a: 'No' },
  { q: 'What does "Amahoro" mean?', opts: ['War', 'Peace', 'Love', 'Hope'], a: 'Peace' },
  { q: 'What is "Ingagi"?', opts: ['Lion', 'Elephant', 'Gorilla', 'Leopard'], a: 'Gorilla' },
  { q: 'How do you say "I want to eat"?', opts: ['Ndashaka kurya', 'Ndashaka kunywa', 'Ndashaka kugenda', 'Ndashaka gusinzira'], a: 'Ndashaka kurya' },
  { q: 'What does "Imisozi" mean?', opts: ['Rivers', 'Hills', 'Roads', 'Trees'], a: 'Hills' },
  { q: 'What is "Kwiga"?', opts: ['To sleep', 'To eat', 'To learn', 'To run'], a: 'To learn' },
  { q: 'What does "Umuryango" mean?', opts: ['School', 'Family', 'Market', 'Church'], a: 'Family' },
  { q: 'What is "Amazi"?', opts: ['Milk', 'Juice', 'Water', 'Tea'], a: 'Water' },
  { q: 'What does "Kugenda" mean?', opts: ['To come', 'To go', 'To stay', 'To eat'], a: 'To go' },
  { q: 'What is "Umwana"?', opts: ['Mother', 'Father', 'Child', 'Teacher'], a: 'Child' },
  { q: 'What does "Izuba" mean?', opts: ['Moon', 'Star', 'Sun', 'Cloud'], a: 'Sun' },
  { q: 'What is "Ishuri"?', opts: ['Market', 'Hospital', 'School', 'Church'], a: 'School' },
  { q: 'How do you say "I love Rwanda"?', opts: ['Ndakunda u Rwanda', 'Ndi mu Rwanda', 'Mva mu Rwanda', 'Ndashaka Rwanda'], a: 'Ndakunda u Rwanda' },
  { q: 'What does "Meze neza" mean?', opts: ['Good morning', 'I am fine', 'Goodbye', 'Thank you'], a: 'I am fine' },
  { q: 'What is "Inka"?', opts: ['Goat', 'Cow', 'Sheep', 'Pig'], a: 'Cow' },
  { q: 'What does "Uyu munsi" mean?', opts: ['Tomorrow', 'Yesterday', 'Today', 'Tonight'], a: 'Today' },
  { q: 'What is "Ubumwe"?', opts: ['Peace', 'Love', 'Unity', 'Hope'], a: 'Unity' },
  { q: 'What does "Mwiriwe" mean?', opts: ['Good morning', 'Good evening', 'Goodnight', 'Hello'], a: 'Good evening' },
  { q: 'What is "Inzara"?', opts: ['Thirst', 'Hunger', 'Tiredness', 'Pain'], a: 'Hunger' },
  { q: 'How do you say "Where do you live?"', opts: ['Ntuye hehe?', 'Uzava hehe?', 'Ugana hehe?', 'Utuye hehe?'], a: 'Utuye hehe?' },
  { q: 'What does "Mbabarira" mean?', opts: ['Thank you', 'Hello', 'Sorry / Forgive me', 'Goodbye'], a: 'Sorry / Forgive me' },
  { q: 'What is "Igihe"?', opts: ['Place', 'Thing', 'Time', 'Person'], a: 'Time' },
  { q: 'What does "Kubona" mean?', opts: ['To hear', 'To see', 'To smell', 'To taste'], a: 'To see' },
  { q: 'What is "Umujyi"?', opts: ['Village', 'City', 'Farm', 'Forest'], a: 'City' },
  { q: 'What does "Ejo" mean?', opts: ['Yesterday', 'Today', 'Tomorrow', 'Now'], a: 'Tomorrow' },
  { q: 'What is "Icyatsi"?', opts: ['Red', 'Blue', 'Green', 'Yellow'], a: 'Green' },
];

const getDailyQuestions = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const questions = [];
  for (let i = 0; i < 5; i++) {
    questions.push(QUESTION_POOL[(dayOfYear * 5 + i) % QUESTION_POOL.length]);
  }
  return questions;
};

const getTodayKey = () => new Date().toDateString();

export const DailyChallengeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const { addXP } = useAppStore();
  const [phase, setPhase] = useState<'locked' | 'playing' | 'done'>('locked');
  const [questions] = useState(() => getDailyQuestions());
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState(0);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [prevScore, setPrevScore] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(DAILY_KEY).then((value) => {
      if (value) {
        const data = JSON.parse(value);
        if (data.date === getTodayKey()) {
          setAlreadyDone(true);
          setPrevScore(data.score);
          setPhase('done');
        } else {
          setPhase('playing');
        }
      } else {
        setPhase('playing');
      }
    });
  }, []);

  const handleAnswer = (option: string) => {
    const question = questions[idx];
    const correct = option === question.a;
    const newAnswers = { ...answers, [idx]: option };
    setAnswers(newAnswers);
    const newScore = score + (correct ? 1 : 0);
    setScore(newScore);

    setTimeout(() => {
      if (idx + 1 >= questions.length) {
        const earned = Math.floor((newScore / questions.length) * DAILY_XP);
        addXP(earned);
        AsyncStorage.setItem(DAILY_KEY, JSON.stringify({ date: getTodayKey(), score: newScore }));
        setPrevScore(newScore);
        setPhase('done');
      } else {
        setIdx((current) => current + 1);
      }
    }, 600);
  };

  const msUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight.getTime() - now.getTime();
    return `${Math.floor(diff / 3600000)}h ${Math.floor((diff % 3600000) / 60000)}m`;
  };

  if (phase === 'locked') {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <AppIcon name="clock" size={34} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Loading challenge…</Text>
      </View>
    );
  }

  if (phase === 'done') {
    const percentage = Math.round((prevScore / questions.length) * 100);
    const earned = alreadyDone
      ? Math.floor((prevScore / questions.length) * DAILY_XP)
      : Math.floor((score / questions.length) * DAILY_XP);
    const resultIcon = percentage === 100 ? 'trophy' : percentage >= 80 ? 'star' : 'target';

    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <AppIcon name="arrowLeft" size={20} color={colors.text} />
        </TouchableOpacity>

        <View style={[styles.resultIcon, { backgroundColor: colors.primaryLight }]}>
          <AppIcon name={resultIcon} size={34} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>
          {alreadyDone ? "Today's challenge is done" : 'Challenge complete'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {prevScore}/{questions.length} correct · {percentage}%
        </Text>
        {!alreadyDone && (
          <Text style={[styles.xpText, { color: colors.success }]}>+{earned} XP earned</Text>
        )}

        <View style={[styles.resetBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <AppIcon name="clock" size={15} color={colors.textMuted} />
          <Text style={[styles.resetText, { color: colors.textSecondary }]}>
            Next challenge in {msUntilMidnight()}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.homeBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <AppIcon name="home" size={17} color="#FFFFFF" />
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const question = questions[idx];
  const answered = answers[idx];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
          <AppIcon name="arrowLeft" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <View style={styles.headerTitleRow}>
            <AppIcon name="flash" size={15} color={colors.secondary} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>Daily Challenge</Text>
          </View>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            Question {idx + 1} of {questions.length}
          </Text>
        </View>
        <View style={[styles.xpBadge, { backgroundColor: colors.secondary + '1F' }]}>
          <Text style={[styles.xpBadgeText, { color: colors.secondary }]}>+{DAILY_XP} XP</Text>
        </View>
      </View>

      <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            { width: `${(idx / questions.length) * 100}%`, backgroundColor: colors.primary },
          ]}
        />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={[styles.question, { color: colors.text }]}>{question.q}</Text>
        <View style={styles.options}>
          {question.opts.map((option) => {
            const selected = answered === option;
            const right = option === question.a;
            let backgroundColor = colors.card;
            let borderColor = colors.border;
            let textColor = colors.text;

            if (answered) {
              if (right) {
                backgroundColor = colors.success + '18';
                borderColor = colors.success;
                textColor = colors.success;
              } else if (selected) {
                backgroundColor = colors.error + '18';
                borderColor = colors.error;
                textColor = colors.error;
              }
            }

            return (
              <TouchableOpacity
                key={option}
                style={[styles.optionBtn, { backgroundColor, borderColor }]}
                onPress={() => !answered && handleAnswer(option)}
                disabled={!!answered}
                activeOpacity={0.8}
              >
                <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
                {answered && right && <AppIcon name="checkCircle" size={18} color={colors.success} />}
                {answered && selected && !right && <AppIcon name="closeCircle" size={18} color={colors.error} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  backBtn: { position: 'absolute', top: 54, left: 16, padding: 8, zIndex: 10 },
  resultIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerBack: { padding: 8 },
  headerCopy: { flex: 1, alignItems: 'center' },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  headerTitle: { fontSize: 16, fontWeight: '800' },
  headerSub: { fontSize: 12, marginTop: 2 },
  xpBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  xpBadgeText: { fontWeight: '800', fontSize: 12 },
  progressBg: { height: 6, marginHorizontal: 16, borderRadius: 3, marginTop: 12 },
  progressFill: { height: 6, borderRadius: 3 },
  body: { padding: 24, alignItems: 'center', paddingTop: 30 },
  question: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 26, lineHeight: 28, width: '100%' },
  options: { gap: 12, width: '100%' },
  optionBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
  },
  optionText: { fontSize: 15, fontWeight: '600', flex: 1 },
  title: { fontSize: 24, fontWeight: '800', marginTop: 16, textAlign: 'center' },
  subtitle: { fontSize: 15, marginTop: 8 },
  xpText: { fontSize: 18, fontWeight: '800', marginTop: 8 },
  resetBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  resetText: { fontSize: 13 },
  homeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 24,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  homeBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});
