import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppIcon } from '../components/ui/AppIcon';
import { useTheme } from '../theme/themeContext';
import { useAppStore } from '../store/useAppStore';
import { Footer } from '../components/Footer';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StoryQuestion {
  id: string;
  question: string;
  options: string[];
  answer: string;
}

interface Story {
  id: string;
  title: string;
  titleKiny: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  levelColor: string;
  emoji: string;
  text: string;
  translation: string;
  vocabulary: { kiny: string; eng: string }[];
  questions: StoryQuestion[];
  xpReward: number;
}

const stories: Story[] = [
  {
    id: 's1',
    title: 'A Morning in Kigali',
    titleKiny: 'Mu Gitondo i Kigali',
    level: 'Beginner',
    levelColor: '#20603D',
    emoji: '🌅',
    text: `Uwimana azuka vuba mu gitondo. Asiga akanya asukura amenyo, hanyuma agenda gukaraba. Nyuma yo kurya ifunguro rya mu gitondo — umugati n'amata — agenda ku kazi.\n\nI Kigali imihanda igwana abantu bose baziye gukora. Uwimana areba izuba rirashe hejuru y'imisozi. "Mwaramutse, Kigali!" avuga mu mutima we.\n\nUwimana afite akazi ko kwigisha mu ishuri rya Remera. Abana bamushimira kuko abigisha neza. Ijoro riri iminsi yose, Uwimana asubira iwe nishimye.`,
    translation: `Uwimana wakes up early in the morning. He takes a moment to brush his teeth, then goes to wash. After eating breakfast — bread and milk — he goes to work.\n\nIn Kigali the roads are full of everyone coming to work. Uwimana sees the sun rising above the hills. "Good morning, Kigali!" he says in his heart.\n\nUwimana has a job teaching at a school in Remera. The children appreciate him because he teaches well. Every evening, Uwimana returns home happy.`,
    vocabulary: [
      { kiny: 'Azuka', eng: 'He/she wakes up' },
      { kiny: 'Mu gitondo', eng: 'In the morning' },
      { kiny: 'Ifunguro', eng: 'Meal / Food' },
      { kiny: 'Imihanda', eng: 'Roads / Streets' },
      { kiny: 'Imisozi', eng: 'Hills' },
      { kiny: 'Kwigisha', eng: 'To teach' },
    ],
    questions: [
      { id: 'q1', question: 'What did Uwimana eat for breakfast?', options: ['Rice and beans', 'Bread and milk', 'Bananas and juice', 'Porridge'], answer: 'Bread and milk' },
      { id: 'q2', question: "What is Uwimana's job?", options: ['Doctor', 'Farmer', 'Teacher', 'Driver'], answer: 'Teacher' },
      { id: 'q3', question: 'Where does Uwimana teach?', options: ['Nyamirambo', 'Remera', 'Kacyiru', 'Kimironko'], answer: 'Remera' },
      { id: 'q4', question: 'What does "Imisozi" mean?', options: ['Rivers', 'Hills', 'Roads', 'Trees'], answer: 'Hills' },
    ],
    xpReward: 20,
  },
  {
    id: 's2',
    title: 'The Market Day',
    titleKiny: 'Ku Isoko',
    level: 'Beginner',
    levelColor: '#20603D',
    emoji: '🛒',
    text: `Amina na nyirasenge bajya ku isoko buri wa gatanu. Isoko iri hafi y'inzu yabo. Bajya kugura imboga n'imbuto — ibishyimbo, igitoki, indimu, n'imbogo.\n\nUmucuruzi abaza: "Mushaka iki?"\nAmina aramusubiza: "Dushaka ibishyimbo na igitoki, murakoze."\nUmucuruzi arasubiza: "Ni amafaranga magana abiri."\n\nBamaze kugura, Amina na nyirasenge baramarana. Isoko yarimo abantu benshi n'amabara menshi y'imbuto. Bataha nishimye n'urutaka rwuzuye.`,
    translation: `Amina and her aunt go to the market every Friday. The market is near their home. They go to buy vegetables and fruits — beans, bananas, lemons, and greens.\n\nThe seller asks: "What do you want?"\nAmina answers: "We want beans and bananas, thank you."\nThe seller responds: "That is two hundred francs."\n\nAfter buying, Amina and her aunt talk together. The market was full of many people and many colors of fruit. They go home happy with a full basket.`,
    vocabulary: [
      { kiny: 'Isoko', eng: 'Market' },
      { kiny: 'Imboga', eng: 'Vegetables' },
      { kiny: 'Umucuruzi', eng: 'Seller / Trader' },
      { kiny: 'Amafaranga', eng: 'Money / Francs' },
      { kiny: 'Urutaka', eng: 'Basket' },
      { kiny: 'Wa gatanu', eng: 'Friday' },
    ],
    questions: [
      { id: 'q1', question: 'When do Amina and her aunt go to the market?', options: ['Every Monday', 'Every Friday', 'Every Sunday', 'Every day'], answer: 'Every Friday' },
      { id: 'q2', question: 'What does "Umucuruzi" mean?', options: ['Buyer', 'Seller', 'Teacher', 'Friend'], answer: 'Seller' },
      { id: 'q3', question: 'How much did they pay?', options: ['100 francs', '200 francs', '300 francs', '500 francs'], answer: '200 francs' },
      { id: 'q4', question: 'What did they buy?', options: ['Only beans', 'Beans and bananas', 'Beans, bananas, lemons and greens', 'Only fruits'], answer: 'Beans, bananas, lemons and greens' },
    ],
    xpReward: 20,
  },
  {
    id: 's3',
    title: 'The Gorilla Trekkers',
    titleKiny: "Abashakashatsi b'Ingagi",
    level: 'Intermediate',
    levelColor: '#F9A825',
    emoji: '🦍',
    text: `Mu mashyamba ya Virunga, ingagi zijya zibana mu miryango. Ingagi ifite umuryango wayo — sekuru, nyirabukwe, n'abana bato. Ingagi ni ikinyabuzima gikomeye gifite ubwenge bwinshi.\n\nAbashyitsi baturuka mu bihugu bitandukanye bajya mu ishyamba kureba ingagi. Umuyobozi w'ingendo abagira inama: "Nimukurikire inzira, ntimuvuge cyane, kandi murebe gusa."\n\nMu ishyamba, ingagi ntizigunga — zikomeza gusa imirimo yazo: kurya ibitoki byo mu ishyamba, gukinana, n'ubu aborozi b'abana barabirinda. Ni ishusho nziza cyane y'ubukungu n'umuco w'u Rwanda.`,
    translation: `In the Virunga forests, gorillas live in family groups. A gorilla has its own family — grandfather, grandmother, and young children. The gorilla is a strong animal with great intelligence.\n\nVisitors from different countries go into the forest to see gorillas. The tour guide advises them: "Follow the path, do not speak too much, and only look."\n\nIn the forest, gorillas do not fear — they simply continue their activities: eating forest bananas, playing, and the caregivers of the young ones protect them. It is a very beautiful image of Rwanda's nature and culture.`,
    vocabulary: [
      { kiny: 'Ingagi', eng: 'Gorilla' },
      { kiny: 'Mashyamba', eng: 'Forests' },
      { kiny: 'Abashyitsi', eng: 'Visitors / Guests' },
      { kiny: 'Umuyobozi', eng: 'Leader / Guide' },
      { kiny: 'Ubukungu', eng: 'Nature / Ecosystem' },
      { kiny: 'Gukurikira', eng: 'To follow' },
    ],
    questions: [
      { id: 'q1', question: 'Where do gorillas live in this story?', options: ['Nyungwe Forest', 'Virunga Forest', 'Akagera Park', 'Gishwati Forest'], answer: 'Virunga Forest' },
      { id: 'q2', question: 'What does the guide tell visitors NOT to do?', options: ['Take photos', 'Speak too much', 'Wear bright colors', 'Bring food'], answer: 'Speak too much' },
      { id: 'q3', question: 'What does "Abashyitsi" mean?', options: ['Gorillas', 'Guides', 'Visitors', 'Soldiers'], answer: 'Visitors' },
      { id: 'q4', question: 'What are gorillas doing in the forest?', options: ['Sleeping only', 'Eating, playing, and caring for young', 'Running away', 'Fighting'], answer: 'Eating, playing, and caring for young' },
    ],
    xpReward: 25,
  },
  {
    id: 's4',
    title: 'The Hills of Rwanda',
    titleKiny: "Imisozi y'u Rwanda",
    level: 'Intermediate',
    levelColor: '#F9A825',
    emoji: '🏔️',
    text: `U Rwanda bwitwa "Igihugu cy'imisozi igihumbi" kubera ko hano hari imisozi myinshi cyane. Imisozi igwa yo ku majyaruguru, aho imisozi ya Virunga iherereye, igera kuri kilometero icumi hejuru y'inyanja.\n\nImisozi y'u Rwanda ifite ubuziranenge bw'amashyamba, ibiyahe, n'amabuye mashya. Abahinzi bakunda gutuza hano kubera ubutaka bwiza. Amababi y'icyatsi, ameza ya kafeyi, na tiye byaratse neza kuri iyi misozi.\n\nIkintu cy'akamaaro ni uko imisozi itanga amazi meza akoreshwa mu mirima no mu miryango. Ni ukuri ko imisozi ifasha u Rwanda kuba igihugu cy'amahoro n'ubuziranenge.`,
    translation: `Rwanda is called the "Land of a Thousand Hills" because there are very many hills here. The hills in the north, where the Virunga mountains are located, reach up to ten kilometers above sea level.\n\nRwanda's hills have the richness of forests, tea plantations, and fresh stones. Farmers love settling here because of the good soil. Tea leaves, coffee, and tea have grown well on these hills.\n\nA remarkable thing is how the hills provide clean water used in fields and homes. It is true that the hills help Rwanda to be a country of peace and natural richness.`,
    vocabulary: [
      { kiny: 'Imisozi igihumbi', eng: 'A thousand hills' },
      { kiny: 'Abahinzi', eng: 'Farmers' },
      { kiny: 'Ubutaka', eng: 'Soil / Land' },
      { kiny: 'Ibiyahe', eng: 'Tea plantations' },
      { kiny: 'Ubuziranenge', eng: 'Natural richness' },
      { kiny: 'Amahoro', eng: 'Peace' },
    ],
    questions: [
      { id: 'q1', question: "What is Rwanda's famous nickname?", options: ['Land of sunshine', 'Land of a thousand hills', 'Pearl of Africa', 'Land of gorillas'], answer: 'Land of a thousand hills' },
      { id: 'q2', question: 'What grows well on the hills?', options: ['Rice and maize', 'Tea and coffee', 'Bananas only', 'Flowers'], answer: 'Tea and coffee' },
      { id: 'q3', question: 'What does "Amahoro" mean?', options: ['Hills', 'Peace', 'Water', 'Soil'], answer: 'Peace' },
      { id: 'q4', question: 'What important resource do the hills provide?', options: ['Gold', 'Clean water', 'Oil', 'Fish'], answer: 'Clean water' },
    ],
    xpReward: 25,
  },
  {
    id: 's5',
    title: 'Inanga — The Rwandan Harp',
    titleKiny: "Inanga y'u Rwanda",
    level: 'Advanced',
    levelColor: '#7B1FA2',
    emoji: '🎵',
    text: `Inanga ni umuziki w'akamaro cyane mu nkuru z'u Rwanda. Inanga irashushanya intego z'u Rwanda bw'umuco, urukundo, n'amateka mashya. Inanga igizwe n'inzizi z'umunyinya zishyirwa ku kibaho kirekire.\n\nAbahanzi b'inanga babayeho kuva kera, barahita bahimbura indirimbo z'ibyishimo n'inzira zigorofa. Inanga yakoreshwaga cyane mu mikino y'abami n'ibibereho by'abasore bakundagana.\n\nUyu munsi, inanga irakomeza kwandikwa mu mashuri n'amacakara y'umuco w'u Rwanda. Abana benshi biga gukina inanga ngo bakomeze umurage w'abakurambere babo. Inanga ni intangarugero y'ubwenge bw'u Rwanda.`,
    translation: `The inanga is a very important musical instrument in the stories of Rwanda. The inanga represents the goals of Rwanda's culture, love, and new history. The inanga is made of dry banana fibers placed on a long board.\n\nInanga musicians have existed from long ago, always composing songs of joy and complex melodies. The inanga was widely used in the games of kings and in the lives of young people in love.\n\nToday, the inanga continues to be taught in schools and Rwandan cultural centers. Many children learn to play the inanga to continue the heritage of their ancestors. The inanga is a symbol of Rwanda's intelligence.`,
    vocabulary: [
      { kiny: 'Inanga', eng: 'Traditional Rwandan harp' },
      { kiny: 'Abahanzi', eng: 'Artists / Musicians' },
      { kiny: 'Umurage', eng: 'Heritage / Legacy' },
      { kiny: 'Abakurambere', eng: 'Ancestors' },
      { kiny: 'Ubwenge', eng: 'Intelligence / Wisdom' },
      { kiny: 'Amacakara', eng: 'Cultural centers' },
    ],
    questions: [
      { id: 'q1', question: 'What is the inanga?', options: ['A type of food', 'A Rwandan harp', 'A traditional dance', 'A Rwandan king'], answer: 'A Rwandan harp' },
      { id: 'q2', question: 'What is the inanga made of?', options: ['Metal strings', 'Dry banana fibers on a board', 'Animal skin', 'Wood only'], answer: 'Dry banana fibers on a board' },
      { id: 'q3', question: 'What does "Umurage" mean?', options: ['Music', 'Heritage', 'School', 'Joy'], answer: 'Heritage' },
      { id: 'q4', question: "Why do children learn to play the inanga today?", options: ['To earn money', 'To impress tourists', "To continue their ancestors' heritage", 'Because it is required'], answer: "To continue their ancestors' heritage" },
    ],
    xpReward: 30,
  },
];

type StoryView = 'list' | 'reading' | 'quiz' | 'result';

const COMPLETED_KEY = 'menya_completed_stories';

export const StoriesScreen: React.FC<{ navigation: any }> = () => {
  const { colors } = useTheme();
  const { addXP } = useAppStore();
  const [view, setView] = useState<StoryView>('list');
  const [selected, setSelected] = useState<Story | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = React.useState<string[]>([]);

  React.useEffect(() => {
    AsyncStorage.getItem(COMPLETED_KEY).then(v => {
      if (v) setCompleted(JSON.parse(v));
    });
  }, []);

  const openStory = (story: Story) => {
    setSelected(story);
    setShowTranslation(false);
    setView('reading');
  };

  const startQuiz = () => {
    setQuizIdx(0);
    setAnswers({});
    setScore(0);
    setView('quiz');
  };

  const handleAnswer = (answer: string) => {
    if (!selected) return;
    const q = selected.questions[quizIdx];
    const correct = answer === q.answer;
    const newAnswers = { ...answers, [q.id]: answer };
    setAnswers(newAnswers);
    const newScore = score + (correct ? 1 : 0);
    setScore(newScore);
    setTimeout(() => {
      if (quizIdx + 1 >= selected.questions.length) {
        const earned = Math.floor((newScore / selected.questions.length) * selected.xpReward);
        addXP(earned);
        if (!completed.includes(selected.id)) {
          const next = [...completed, selected.id];
          setCompleted(next);
          AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(next));
        }
        setView('result');
      } else {
        setQuizIdx(i => i + 1);
      }
    }, 600);
  };

  // ── List ──
  if (view === 'list') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient colors={['#0d3320', '#20603D']} style={styles.header}>
          <Text style={styles.headerTitle}>📖 Inkuru</Text>
          <Text style={styles.headerSub}>Kinyarwanda Reading Stories</Text>
        </LinearGradient>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={[styles.sectionNote, { color: colors.textSecondary }]}>Read · Learn · Understand</Text>
          {stories.map(story => {
            const done = completed.includes(story.id);
            return (
              <TouchableOpacity
                key={story.id}
                style={[styles.card, { backgroundColor: colors.card, borderColor: done ? story.levelColor : colors.border }]}
                onPress={() => openStory(story)}
                activeOpacity={0.8}
              >
                <Text style={styles.cardEmoji}>{story.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{story.title}</Text>
                  <Text style={[styles.cardTitleKiny, { color: colors.textSecondary }]}>{story.titleKiny}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <View style={[styles.levelBadge, { backgroundColor: story.levelColor + '22', borderColor: story.levelColor }]}>
                      <Text style={[styles.levelText, { color: story.levelColor }]}>{story.level}</Text>
                    </View>
                    <Text style={[styles.xpText, { color: '#F9A825' }]}>+{story.xpReward} XP</Text>
                    {done && <Text style={{ fontSize: 14 }}>✅</Text>}
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
        <LinearGradient colors={['#0d3320', '#20603D']} style={styles.readHeader}>
          <TouchableOpacity onPress={() => setView('list')} style={{ padding: 8 }}>
            <AppIcon name="arrowLeft" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.readTitle}>{selected.emoji} {selected.title}</Text>
            <Text style={styles.readTitleKiny}>{selected.titleKiny}</Text>
          </View>
        </LinearGradient>
        <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
          <View style={[styles.textBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.storyText, { color: colors.text }]}>{selected.text}</Text>
          </View>
          <TouchableOpacity
            style={[styles.transBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowTranslation(v => !v)}
          >
            <Text style={[styles.transBtnText, { color: colors.primary }]}>
              {showTranslation ? '🙈 Hide Translation' : '🌍 Show English Translation'}
            </Text>
          </TouchableOpacity>
          {showTranslation && (
            <View style={[styles.textBox, { backgroundColor: colors.card, borderColor: colors.primary + '44', borderWidth: 1.5, marginBottom: 14 }]}>
              <Text style={[styles.storyText, { color: colors.textSecondary, fontStyle: 'italic' }]}>{selected.translation}</Text>
            </View>
          )}
          <Text style={[styles.vocabTitle, { color: colors.text }]}>📚 Key Vocabulary</Text>
          <View style={[styles.vocabBox, { backgroundColor: colors.card }]}>
            {selected.vocabulary.map(v => (
              <View key={v.kiny} style={[styles.vocabRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.vocabKiny, { color: colors.primary }]}>{v.kiny}</Text>
                <Text style={[styles.vocabEng, { color: colors.textSecondary }]}>{v.eng}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={[styles.quizBtn, { backgroundColor: '#20603D' }]} onPress={startQuiz} activeOpacity={0.85}>
            <Text style={styles.quizBtnText}>📝 Start Comprehension Quiz (+{selected.xpReward} XP)</Text>
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
      <LinearGradient colors={['#0a1628', '#1a2a4a', '#0d3320']} style={styles.container}>
        <View style={styles.quizHeader}>
          <TouchableOpacity onPress={() => setView('reading')} style={{ padding: 8 }}>
            <AppIcon name="arrowLeft" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.quizProgress}>{quizIdx + 1} / {selected.questions.length}</Text>
        </View>
        <View style={styles.quizBody}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>{selected.emoji}</Text>
          <Text style={styles.quizQ}>{q.question}</Text>
          <View style={{ gap: 10, width: '100%' }}>
            {q.options.map(opt => {
              const isSelected = answered === opt;
              const isRight = opt === q.answer;
              let bg = 'rgba(255,255,255,0.08)';
              let border = 'rgba(255,255,255,0.15)';
              if (answered) {
                if (isRight) { bg = '#20603D33'; border = '#20603D'; }
                else if (isSelected) { bg = '#E74C3C22'; border = '#E74C3C'; }
              }
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.quizOpt, { backgroundColor: bg, borderColor: border }]}
                  onPress={() => !answered && handleAnswer(opt)}
                  disabled={!!answered}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.quizOptText, answered && isRight && { color: '#4CAF50' }, answered && isSelected && !isRight && { color: '#E74C3C' }]}>{opt}</Text>
                  {answered && isRight && <Text>✅</Text>}
                  {answered && isSelected && !isRight && <Text>❌</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </LinearGradient>
    );
  }

  // ── Result ──
  if (view === 'result' && selected) {
    const pct = Math.round((score / selected.questions.length) * 100);
    const earned = Math.floor((score / selected.questions.length) * selected.xpReward);
    return (
      <LinearGradient colors={['#0a1628', '#1a2a4a', '#0d3320']} style={styles.container}>
        <View style={styles.resultBox}>
          <Text style={{ fontSize: 60 }}>{pct === 100 ? '🏆' : pct >= 75 ? '⭐' : pct >= 50 ? '👍' : '📚'}</Text>
          <Text style={styles.resultTitle}>{pct === 100 ? 'Perfect!' : pct >= 75 ? 'Great job!' : pct >= 50 ? 'Good effort!' : 'Keep reading!'}</Text>
          <Text style={styles.resultScore}>{score}/{selected.questions.length} correct · {pct}%</Text>
          <Text style={styles.resultXP}>+{earned} XP earned!</Text>
          <TouchableOpacity style={[styles.quizBtn, { backgroundColor: '#20603D', marginTop: 24 }]} onPress={() => setView('list')}>
            <Text style={styles.quizBtnText}>← Back to Stories</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quizBtn, { backgroundColor: '#F9A825', marginTop: 12 }]} onPress={() => openStory(selected)}>
            <Text style={[styles.quizBtnText, { color: '#1A1A1A' }]}>📖 Read Again</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 54, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#FFD700' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  sectionNote: { fontSize: 13, textAlign: 'center', marginVertical: 14, fontStyle: 'italic' },
  card: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12, padding: 14, borderRadius: 14, borderWidth: 1.5, gap: 12 },
  cardEmoji: { fontSize: 32 },
  cardTitle: { fontSize: 15, fontWeight: '800' },
  cardTitleKiny: { fontSize: 11, marginTop: 2 },
  levelBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  levelText: { fontSize: 10, fontWeight: '700' },
  xpText: { fontSize: 12, fontWeight: '700' },
  readHeader: { flexDirection: 'row', alignItems: 'center', paddingTop: 54, paddingBottom: 16, paddingHorizontal: 16, gap: 12 },
  readTitle: { fontSize: 16, fontWeight: '900', color: '#FFD700' },
  readTitleKiny: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  textBox: { borderRadius: 14, padding: 18, marginBottom: 14 },
  storyText: { fontSize: 15, lineHeight: 26 },
  transBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 10 },
  transBtnText: { fontSize: 13, fontWeight: '700' },
  vocabTitle: { fontSize: 16, fontWeight: '900', marginBottom: 10 },
  vocabBox: { borderRadius: 12, overflow: 'hidden', marginBottom: 20 },
  vocabRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1 },
  vocabKiny: { fontSize: 14, fontWeight: '700' },
  vocabEng: { fontSize: 13 },
  quizBtn: { borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 8 },
  quizBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  quizHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 54, paddingHorizontal: 20, paddingBottom: 10 },
  quizProgress: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '700' },
  quizBody: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  quizQ: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', marginBottom: 24, lineHeight: 28 },
  quizOpt: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, borderRadius: 12, padding: 16 },
  quizOptText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', flex: 1 },
  resultBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  resultTitle: { fontSize: 28, fontWeight: '900', color: '#FFD700', marginTop: 12 },
  resultScore: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 8 },
  resultXP: { fontSize: 20, fontWeight: '900', color: '#4CAF50', marginTop: 8 },
});
