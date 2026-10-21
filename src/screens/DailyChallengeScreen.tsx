import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppIcon } from '../components/ui/AppIcon';
import { useTheme } from '../theme/themeContext';
import { useAppStore } from '../store/useAppStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DAILY_KEY = 'menya_daily_challenge';
const DAILY_XP = 30;

// 5 questions per day, cycling through a pool based on day-of-year
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
    AsyncStorage.getItem(DAILY_KEY).then(val => {
      if (val) {
        const data = JSON.parse(val);
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

  const handleAnswer = (opt: string) => {
    const q = questions[idx];
    const correct = opt === q.a;
    const newAnswers = { ...answers, [idx]: opt };
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
        setIdx(i => i + 1);
      }
    }, 600);
  };

  const msUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight.getTime() - now.getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  // Loading
  if (phase === 'locked') {
    return (
      <LinearGradient colors={['#0a1628', '#1a2a4a', '#0d3320']} style={styles.center}>
        <Text style={{ fontSize: 40 }}>⏳</Text>
        <Text style={styles.title}>Loading...</Text>
      </LinearGradient>
    );
  }

  // Already done today
  if (phase === 'done') {
    const pct = Math.round((prevScore / questions.length) * 100);
    const earned = alreadyDone ? Math.floor((prevScore / questions.length) * DAILY_XP) : Math.floor((score / questions.length) * DAILY_XP);
    return (
      <LinearGradient colors={['#0a1628', '#1a2a4a', '#0d3320']} style={styles.center}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <AppIcon name="arrowLeft" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={{ fontSize: 60 }}>{pct === 100 ? '🏆' : pct >= 80 ? '⭐' : '🎯'}</Text>
        <Text style={styles.title}>{alreadyDone ? "Today's Challenge Done!" : 'Challenge Complete!'}</Text>
        <Text style={styles.subtitle}>{prevScore}/{questions.length} correct · {pct}%</Text>
        {!alreadyDone && <Text style={styles.xpText}>+{earned} XP earned! 🎉</Text>}
        <View style={styles.resetBox}>
          <AppIcon name="clock" size={16} color="rgba(255,255,255,0.5)" />
          <Text style={styles.resetText}>Next challenge in {msUntilMidnight()}</Text>
        </View>
        <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.homeBtnText}>← Back to Home</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  // Playing
  const q = questions[idx];
  const answered = answers[idx];

  return (
    <LinearGradient colors={['#0a1628', '#1a2a4a', '#0d3320']} style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
          <AppIcon name="arrowLeft" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>⚡ Daily Challenge</Text>
          <Text style={styles.headerSub}>Question {idx + 1} of {questions.length}</Text>
        </View>
        <View style={styles.xpBadge}>
          <Text style={styles.xpBadgeText}>+{DAILY_XP} XP</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${((idx) / questions.length) * 100}%` as any }]} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.question}>{q.q}</Text>
        <View style={{ gap: 12, width: '100%' }}>
          {q.opts.map(opt => {
            const isSelected = answered === opt;
            const isRight = opt === q.a;
            let bg = 'rgba(255,255,255,0.08)';
            let border = 'rgba(255,255,255,0.18)';
            if (answered) {
              if (isRight) { bg = '#20603D44'; border = '#20603D'; }
              else if (isSelected) { bg = '#E74C3C22'; border = '#E74C3C'; }
            }
            return (
              <TouchableOpacity
                key={opt}
                style={[styles.optBtn, { backgroundColor: bg, borderColor: border }]}
                onPress={() => !answered && handleAnswer(opt)}
                disabled={!!answered}
                activeOpacity={0.8}
              >
                <Text style={[styles.optText, answered && isRight && { color: '#4CAF50', fontWeight: '900' }, answered && isSelected && !isRight && { color: '#E74C3C' }]}>
                  {opt}
                </Text>
                {answered && isRight && <Text style={{ fontSize: 18 }}>✅</Text>}
                {answered && isSelected && !isRight && <Text style={{ fontSize: 18 }}>❌</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 54, paddingHorizontal: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#FFD700' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  xpBadge: { backgroundColor: '#FFD70033', borderWidth: 1, borderColor: '#FFD700', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  xpBadgeText: { color: '#FFD700', fontWeight: '800', fontSize: 12 },
  progressBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 16, borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: '#FFD700', borderRadius: 3 },
  body: { padding: 24, alignItems: 'center', paddingTop: 32 },
  question: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', marginBottom: 28, lineHeight: 28, width: '100%' },
  optBtn: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, borderRadius: 12, padding: 16 },
  optText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', flex: 1 },
  title: { fontSize: 26, fontWeight: '900', color: '#FFD700', marginTop: 16, textAlign: 'center' },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.75)', marginTop: 8 },
  xpText: { fontSize: 22, fontWeight: '900', color: '#4CAF50', marginTop: 8 },
  resetBox: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 20, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  resetText: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  homeBtn: { marginTop: 24, backgroundColor: '#20603D', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32 },
  homeBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  backBtn: { position: 'absolute', top: 54, left: 16, padding: 8, zIndex: 10 },
});
