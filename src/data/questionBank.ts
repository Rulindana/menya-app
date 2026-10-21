// ── Dynamic Question Bank ─────────────────────────────────────────
// All exercises are drawn from this pool — no static questions in lessons.
// Each lesson picks N unique questions randomly from the relevant category.

export interface DynamicQuestion {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'sentence_build' | 'word_match';
  category: string;
  question: string;
  options?: string[];
  blanks?: string[];
  words?: string[];
  pairs?: { kiny: string; eng: string }[];
  answer: string;
  hint?: string;
}

// ── Word pair pool (used for word_match AND to generate MC distractors) ──
export const WORD_PAIRS: { kiny: string; eng: string; category: string }[] = [
  // Greetings
  { kiny: 'Muraho', eng: 'Hello', category: 'greetings' },
  { kiny: 'Murabeho', eng: 'Goodbye', category: 'greetings' },
  { kiny: 'Murakoze', eng: 'Thank you', category: 'greetings' },
  { kiny: 'Mwaramutse', eng: 'Good morning', category: 'greetings' },
  { kiny: 'Mwiriwe', eng: 'Good evening', category: 'greetings' },
  { kiny: 'Bite?', eng: 'How are you?', category: 'greetings' },
  { kiny: 'Meze neza', eng: 'I am fine', category: 'greetings' },
  { kiny: 'Yego', eng: 'Yes', category: 'greetings' },
  { kiny: 'Oya', eng: 'No', category: 'greetings' },
  { kiny: 'Mbabarira', eng: 'Sorry', category: 'greetings' },
  { kiny: 'Ndasaba', eng: 'Please', category: 'greetings' },
  { kiny: 'Nitwa', eng: 'My name is', category: 'greetings' },
  // Numbers
  { kiny: 'Rimwe', eng: 'One', category: 'numbers' },
  { kiny: 'Kabiri', eng: 'Two', category: 'numbers' },
  { kiny: 'Gatatu', eng: 'Three', category: 'numbers' },
  { kiny: 'Kane', eng: 'Four', category: 'numbers' },
  { kiny: 'Gatanu', eng: 'Five', category: 'numbers' },
  { kiny: 'Gatandatu', eng: 'Six', category: 'numbers' },
  { kiny: 'Karindwi', eng: 'Seven', category: 'numbers' },
  { kiny: 'Umunani', eng: 'Eight', category: 'numbers' },
  { kiny: 'Icyenda', eng: 'Nine', category: 'numbers' },
  { kiny: 'Icumi', eng: 'Ten', category: 'numbers' },
  { kiny: 'Mirongo ibiri', eng: 'Twenty', category: 'numbers' },
  { kiny: 'Ijana', eng: 'One hundred', category: 'numbers' },
  { kiny: 'Igihumbi', eng: 'One thousand', category: 'numbers' },
  // Colors
  { kiny: 'Umutuku', eng: 'Red', category: 'colors' },
  { kiny: 'Ubururu', eng: 'Blue', category: 'colors' },
  { kiny: 'Icyatsi', eng: 'Green', category: 'colors' },
  { kiny: 'Umuhondo', eng: 'Yellow', category: 'colors' },
  { kiny: 'Umweru', eng: 'White', category: 'colors' },
  { kiny: 'Umukara', eng: 'Black', category: 'colors' },
  { kiny: 'Inzahabu', eng: 'Gold', category: 'colors' },
  // Family
  { kiny: 'Ababyeyi', eng: 'Parents', category: 'family' },
  { kiny: 'Musaza', eng: 'Brother', category: 'family' },
  { kiny: 'Se', eng: 'Father', category: 'family' },
  { kiny: 'Umugore', eng: 'Wife', category: 'family' },
  { kiny: 'Umugabo', eng: 'Husband', category: 'family' },
  { kiny: 'Umwana', eng: 'Child', category: 'family' },
  { kiny: 'Abana', eng: 'Children', category: 'family' },
  { kiny: 'Nyina', eng: 'Mother', category: 'family' },
  // Food
  { kiny: 'Amata', eng: 'Milk', category: 'food' },
  { kiny: 'Amazi', eng: 'Water', category: 'food' },
  { kiny: 'Igitoki', eng: 'Banana', category: 'food' },
  { kiny: 'Ibishyimbo', eng: 'Beans', category: 'food' },
  { kiny: 'Isosi', eng: 'Sauce', category: 'food' },
  { kiny: 'Isupu', eng: 'Soup', category: 'food' },
  { kiny: 'Imbuto', eng: 'Fruit', category: 'food' },
  { kiny: 'Imboga', eng: 'Vegetables', category: 'food' },
  { kiny: 'Inanasi', eng: 'Pineapple', category: 'food' },
  { kiny: 'Indimu', eng: 'Lemon', category: 'food' },
  // Animals
  { kiny: 'Ingagi', eng: 'Gorilla', category: 'animals' },
  { kiny: 'Intare', eng: 'Lion', category: 'animals' },
  { kiny: 'Inka', eng: 'Cow', category: 'animals' },
  { kiny: 'Ingurube', eng: 'Pig', category: 'animals' },
  { kiny: 'Inkoko', eng: 'Chicken', category: 'animals' },
  { kiny: 'Ihene', eng: 'Goat', category: 'animals' },
  { kiny: 'Inyoni', eng: 'Bird', category: 'animals' },
  // Body
  { kiny: 'Umutwe', eng: 'Head', category: 'body' },
  { kiny: 'Umunwa', eng: 'Mouth', category: 'body' },
  { kiny: 'Amaso', eng: 'Eyes', category: 'body' },
  { kiny: 'Izuru', eng: 'Nose', category: 'body' },
  { kiny: 'Ukuboko', eng: 'Arm', category: 'body' },
  { kiny: 'Ukuguru', eng: 'Leg', category: 'body' },
  { kiny: 'Urutoki', eng: 'Finger', category: 'body' },
  // Time
  { kiny: 'Ukwezi', eng: 'Month', category: 'time' },
  { kiny: 'Umwaka', eng: 'Year', category: 'time' },
  { kiny: 'Igihe', eng: 'Time', category: 'time' },
  { kiny: 'Saa', eng: 'Hour', category: 'time' },
  { kiny: 'Umunota', eng: 'Minute', category: 'time' },
  { kiny: 'Ejo', eng: 'Tomorrow', category: 'time' },
  { kiny: 'Uyu munsi', eng: 'Today', category: 'time' },
  // Verbs
  { kiny: 'Kurya', eng: 'To eat', category: 'verbs' },
  { kiny: 'Kunywa', eng: 'To drink', category: 'verbs' },
  { kiny: 'Gusinzira', eng: 'To sleep', category: 'verbs' },
  { kiny: 'Kugenda', eng: 'To go', category: 'verbs' },
  { kiny: 'Kubona', eng: 'To see', category: 'verbs' },
  { kiny: 'Kumva', eng: 'To hear', category: 'verbs' },
  { kiny: 'Kuvuga', eng: 'To speak', category: 'verbs' },
  { kiny: 'Kwiga', eng: 'To learn', category: 'verbs' },
  { kiny: 'Kugura', eng: 'To buy', category: 'verbs' },
  { kiny: 'Kubaka', eng: 'To build', category: 'verbs' },
  // Places
  { kiny: 'Umujyi', eng: 'City', category: 'places' },
  { kiny: 'Isoko', eng: 'Market', category: 'places' },
  { kiny: 'Ishuri', eng: 'School', category: 'places' },
  { kiny: 'Ikibuga', eng: 'Field', category: 'places' },
  { kiny: 'Uruganda', eng: 'Factory', category: 'places' },
  { kiny: 'Ibitaro', eng: 'Hospital', category: 'places' },
  { kiny: 'Banki', eng: 'Bank', category: 'places' },
  { kiny: 'Agace', eng: 'District', category: 'places' },
  { kiny: 'Umudugudu', eng: 'Village', category: 'places' },
  { kiny: 'Ipaki', eng: 'Park', category: 'places' },
  // Weather
  { kiny: 'Imvura', eng: 'Rain', category: 'weather' },
  { kiny: 'Izuba', eng: 'Sun', category: 'weather' },
  { kiny: 'Umwuka', eng: 'Wind', category: 'weather' },
  { kiny: 'Ibicu', eng: 'Cloud', category: 'weather' },
  { kiny: 'Amapfa', eng: 'Drought', category: 'weather' },
  { kiny: 'Ubushyuhe', eng: 'Heat', category: 'weather' },
  { kiny: 'Ubukonje', eng: 'Cold', category: 'weather' },
  { kiny: 'Imurikagendo', eng: 'Lightning', category: 'weather' },
  { kiny: 'Inkuba', eng: 'Thunder', category: 'weather' },
  { kiny: 'Ubutayu', eng: 'Rainbow', category: 'weather' },
  { kiny: 'Umusaraba', eng: 'Flood', category: 'weather' },
  { kiny: 'Igihe cy\'imvura', eng: 'Rainy season', category: 'weather' },
  // Home
  { kiny: 'Icyumba', eng: 'Room', category: 'home' },
  { kiny: 'Urugi', eng: 'Door', category: 'home' },
  { kiny: 'Idirishya', eng: 'Window', category: 'home' },
  { kiny: 'Intebe', eng: 'Chair', category: 'home' },
  { kiny: 'Ameza', eng: 'Table', category: 'home' },
  { kiny: 'Inzu', eng: 'House', category: 'home' },
  { kiny: 'Urukumbi', eng: 'Living room', category: 'home' },
  { kiny: 'Icyumba cyo kurya', eng: 'Dining room', category: 'home' },
  { kiny: 'Isanduku', eng: 'Box', category: 'home' },
  { kiny: 'Agatafari', eng: 'Carpet', category: 'home' },
  { kiny: 'Ipapuro', eng: 'Paper', category: 'home' },
  { kiny: 'Ikarita', eng: 'Card/Map', category: 'home' },
  // Culture & values
  { kiny: 'Amahoro', eng: 'Peace', category: 'culture' },
  { kiny: 'Ubumwe', eng: 'Unity', category: 'culture' },
  { kiny: 'Umuco', eng: 'Culture', category: 'culture' },
  { kiny: 'Imisozi', eng: 'Hills', category: 'culture' },
  { kiny: 'Inanga', eng: 'Rwandan harp', category: 'culture' },
  { kiny: 'Umurage', eng: 'Heritage', category: 'culture' },
];

// ── Sentence templates ────────────────────────────────────────────
export const SENTENCE_TEMPLATES: { words: string[]; answer: string; hint: string }[] = [
  { words: ['Nitwa', 'Amina', 'Rwanda', 'ndi'], answer: 'Nitwa Amina', hint: 'My name is Amina' },
  { words: ['Ndakunda', 'u', 'cyane', 'Rwanda'], answer: 'Ndakunda u Rwanda', hint: 'I love Rwanda' },
  { words: ['Ndashaka', 'kurya', 'amazi', 'gusa'], answer: 'Ndashaka kurya', hint: 'I want to eat' },
  { words: ['Meze', 'neza', 'cyane', 'ejo'], answer: 'Meze neza', hint: 'I am fine' },
  { words: ['Murakoze', 'cyane', 'bana', 'bose'], answer: 'Murakoze cyane', hint: 'Thank you very much' },
  { words: ['Ndafite', 'inzara', 'amazi', 'make'], answer: 'Ndafite inzara', hint: 'I am hungry' },
  { words: ['Imisozi', 'y\'u', 'Rwanda', 'myinshi'], answer: "Imisozi y'u Rwanda", hint: 'Hills of Rwanda' },
  { words: ['Abana', 'biga', 'mu', 'ishuri'], answer: 'Abana biga mu ishuri', hint: 'Children study at school' },
  { words: ['Amahoro', 'ni', 'ingirakamaro', 'cyane'], answer: 'Amahoro ni ingirakamaro', hint: 'Peace is important' },
  { words: ['Ndashaka', 'kunywa', 'amazi', 'kurya'], answer: 'Ndashaka kunywa amazi', hint: 'I want to drink water' },
  { words: ['Ingagi', 'zibera', 'mu', 'mashyamba'], answer: 'Ingagi zibera mu mashyamba', hint: 'Gorillas live in forests' },
  { words: ['Uyu', 'munsi', 'ni', 'nziza'], answer: 'Uyu munsi ni nziza', hint: 'Today is good' },
  { words: ['Ntuye', 'i', 'Kigali', 'Rwanda'], answer: 'Ntuye i Kigali', hint: 'I live in Kigali' },
  { words: ['Bite?', 'amakuru', 'neza', 'cyane'], answer: 'Bite? amakuru?', hint: 'How are you? Any news?' },
  { words: ['Mwiriwe', 'bose', 'cyane', 'muraho'], answer: 'Mwiriwe bose', hint: 'Good evening everyone' },
];

// ── Shuffle helper ────────────────────────────────────────────────
export const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

// ── Pick N unique items ───────────────────────────────────────────
export const pickUnique = <T>(arr: T[], n: number): T[] => {
  const shuffled = shuffle(arr);
  return shuffled.slice(0, Math.min(n, shuffled.length));
};

// ── Generate a word_match question from 4 random pairs ────────────
// Pairs are drawn from the given topic pool so matched words always
// belong to the lesson's topic (never mixed from other categories).
export const makeWordMatchQuestion = (
  topicPairs: { kiny: string; eng: string; category: string }[],
  usedIds: Set<string>
): DynamicQuestion => {
  const available = topicPairs.filter(p => !usedIds.has('wm_' + p.kiny));
  const pool = available.length >= 4 ? available : topicPairs; // fallback if pool exhausted
  const pairs = pickUnique(pool, 4);
  // Unique id per generated question — two match exercises in one lesson
  // can pick the same pairs, and a duplicate key would break remounting.
  const id = 'wm_' + pairs.map(p => p.kiny).join('_') + '_' + Math.random().toString(36).slice(2, 7);
  pairs.forEach(p => usedIds.add('wm_' + p.kiny));
  return {
    id,
    type: 'word_match',
    category: 'mixed',
    question: 'Match each Kinyarwanda word to its English meaning:',
    pairs,
    answer: 'matched',
  };
};

// ── Generate a multiple_choice question ──────────────────────────
export const makeMCQuestion = (
  pair: { kiny: string; eng: string },
  topicPairs: { kiny: string; eng: string }[],
  allPairs: { kiny: string; eng: string }[],
  usedIds: Set<string>
): DynamicQuestion => {
  // 3 random wrong English answers — drawn from the SAME topic so no
  // foreign-topic words leak in (global pool only as a safety fallback)
  const distractorPool = topicPairs.filter(p => p.eng !== pair.eng).length >= 3 ? topicPairs : allPairs;
  const wrong = shuffle(distractorPool.filter(p => p.eng !== pair.eng)).slice(0, 3).map(p => p.eng);
  const options = shuffle([pair.eng, ...wrong]);
  const id = 'mc_' + pair.kiny;
  usedIds.add(id);
  return {
    id,
    type: 'multiple_choice',
    category: 'mixed',
    question: `What does "${pair.kiny}" mean?`,
    options,
    answer: pair.eng,
  };
};

// ── Generate a fill_blank question ───────────────────────────────
export const makeFillBlankQuestion = (
  pair: { kiny: string; eng: string },
  topicPairs: { kiny: string; eng: string }[],
  allPairs: { kiny: string; eng: string }[],
  usedIds: Set<string>
): DynamicQuestion => {
  // Wrong blanks drawn from the SAME topic (global pool only as fallback)
  const distractorPool = topicPairs.filter(p => p.kiny !== pair.kiny).length >= 3 ? topicPairs : allPairs;
  const wrong = shuffle(distractorPool.filter(p => p.kiny !== pair.kiny)).slice(0, 3).map(p => p.kiny);
  const blanks = shuffle([pair.kiny, ...wrong]);
  const id = 'fb_' + pair.kiny;
  usedIds.add(id);
  return {
    id,
    type: 'fill_blank',
    category: 'mixed',
    question: `Fill in the blank: "_____" means "${pair.eng}"`,
    blanks,
    answer: pair.kiny,
    hint: `Category: ${(pair as any).category || 'vocabulary'}`,
  };
};

// ── Generate a sentence_build question ───────────────────────────
export const makeSentenceQuestion = (
  template: { words: string[]; answer: string; hint: string },
  usedIds: Set<string>
): DynamicQuestion => {
  const id = 'sb_' + template.answer.replace(/\s/g, '_');
  usedIds.add(id);
  return {
    id,
    type: 'sentence_build',
    category: 'sentences',
    question: `Build the sentence: "${template.hint}"`,
    words: shuffle(template.words),
    answer: template.answer,
    hint: template.hint,
  };
};

// ── Main function: generate N unique dynamic questions for a lesson ──
export const generateLessonQuestions = (
  lessonCategory: string,
  count: number
): DynamicQuestion[] => {
  const usedIds = new Set<string>();
  const questions: DynamicQuestion[] = [];

  // Filter pairs by category, fallback to all if not enough
  const catPairs = WORD_PAIRS.filter(p => p.category === lessonCategory);
  const allPairs = WORD_PAIRS;
  const pool = catPairs.length >= 6 ? catPairs : allPairs;
  const shuffledPool = shuffle(pool);

  // Mix of types: ~40% MC, ~25% fill_blank, ~20% word_match, ~15% sentence_build
  const mcCount = Math.ceil(count * 0.4);
  const fbCount = Math.ceil(count * 0.25);
  const wmCount = Math.ceil(count * 0.2);
  const sbCount = count - mcCount - fbCount - wmCount;

  // Multiple choice
  let poolIdx = 0;
  for (let i = 0; i < mcCount && poolIdx < shuffledPool.length; i++, poolIdx++) {
    questions.push(makeMCQuestion(shuffledPool[poolIdx], pool, allPairs, usedIds));
  }

  // Fill blank
  for (let i = 0; i < fbCount && poolIdx < shuffledPool.length; i++, poolIdx++) {
    questions.push(makeFillBlankQuestion(shuffledPool[poolIdx], pool, allPairs, usedIds));
  }

  // Word match (each uses 4 pairs, drawn from the lesson topic pool)
  const wmPool = pool.length >= 4 ? pool : allPairs; // tiny topics still stay on-topic when possible
  for (let i = 0; i < wmCount; i++) {
    questions.push(makeWordMatchQuestion(wmPool, new Set())); // fresh set per match question
  }

  // Sentence build
  const sentencePool = shuffle(SENTENCE_TEMPLATES);
  for (let i = 0; i < sbCount && i < sentencePool.length; i++) {
    questions.push(makeSentenceQuestion(sentencePool[i], usedIds));
  }

  return shuffle(questions).slice(0, count);
};
