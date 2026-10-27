import type { Exercise, Lesson } from './lessons';

// ── Dynamic & Hybrid Curriculum Question Bank ─────────────────────
// Blends authored lesson exercises from lessons.ts with dynamic
// topic-scoped reinforcement exercises and organizes each lesson into a
// 4-stage Duolingo-style learning journey:
//   1. Learn (Guided discovery cards)
//   2. Practice (Guided recognition)
//   3. Reinforce (Active recall & context)
//   4. Assessment (Final lesson mastery check)

export type LessonStage = 'learn' | 'practice' | 'reinforce' | 'assessment';

export interface LearningStudyItem {
  id: string;
  kiny: string;
  eng: string;
  tip?: string;
  audioWord?: string;
}

export interface DynamicQuestion {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'sentence_build' | 'word_match';
  category: string;
  stage?: LessonStage;
  stageLabel?: string;
  question: string;
  audioWord?: string;
  options?: string[];
  blanks?: string[];
  words?: string[];
  pairs?: { kiny: string; eng: string }[];
  answer: string;
  hint?: string;
}

export const UNIT_CATEGORY_MAP: Record<string, string> = {
  unit1: 'greetings',
  unit2: 'numbers',
  unit3: 'colors',
  unit4: 'family',
  unit5: 'food',
  unit6: 'animals',
  unit7: 'body',
  unit8: 'time',
  unit9: 'verbs',
  unit10: 'places',
  unit11: 'weather',
  unit12: 'culture',
  unit13: 'phrases',
  unit14: 'home',
};

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
  { kiny: 'Ibihogo', eng: 'Brown', category: 'colors' },
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
  { kiny: 'Ishyamba', eng: 'Forest', category: 'places' },
  // Weather
  { kiny: 'Imvura', eng: 'Rain', category: 'weather' },
  { kiny: 'Izuba', eng: 'Sun', category: 'weather' },
  { kiny: 'Umwuka', eng: 'Wind', category: 'weather' },
  { kiny: 'Igicu', eng: 'Cloud', category: 'weather' },
  { kiny: 'Amapfa', eng: 'Drought', category: 'weather' },
  { kiny: 'Ubushyuhe', eng: 'Heat', category: 'weather' },
  { kiny: 'Ubukonje', eng: 'Cold', category: 'weather' },
  { kiny: 'Umurabyo', eng: 'Lightning', category: 'weather' },
  { kiny: 'Inkuba', eng: 'Thunder', category: 'weather' },
  { kiny: 'Umukororombya', eng: 'Rainbow', category: 'weather' },
  { kiny: 'Umwuzure', eng: 'Flood', category: 'weather' },
  { kiny: "Igihe cy'imvura", eng: 'Rainy season', category: 'weather' },
  // Home
  { kiny: 'Icyumba', eng: 'Room', category: 'home' },
  { kiny: 'Urugi', eng: 'Door', category: 'home' },
  { kiny: 'Idirishya', eng: 'Window', category: 'home' },
  { kiny: 'Intebe', eng: 'Chair', category: 'home' },
  { kiny: 'Ameza', eng: 'Table', category: 'home' },
  { kiny: 'Inzu', eng: 'House', category: 'home' },
  { kiny: 'Uruganiriro', eng: 'Living room', category: 'home' },
  { kiny: 'Icyumba cyo kurya', eng: 'Dining room', category: 'home' },
  { kiny: 'Isanduku', eng: 'Box', category: 'home' },
  { kiny: 'Umusambi', eng: 'Carpet', category: 'home' },
  { kiny: 'Urupapuro', eng: 'Paper', category: 'home' },
  { kiny: 'Ikarita', eng: 'Card/Map', category: 'home' },
  // Culture & values
  { kiny: 'Amahoro', eng: 'Peace', category: 'culture' },
  { kiny: 'Ubumwe', eng: 'Unity', category: 'culture' },
  { kiny: 'Umuco', eng: 'Culture', category: 'culture' },
  { kiny: 'Imisozi', eng: 'Hills', category: 'culture' },
  { kiny: 'Inanga', eng: 'Rwandan harp', category: 'culture' },
  { kiny: 'Umurage', eng: 'Heritage', category: 'culture' },
  { kiny: 'Ubuntu', eng: 'Humanity', category: 'culture' },
  { kiny: 'Ubuvandimwe', eng: 'Brotherhood/Sisterhood', category: 'culture' },
  { kiny: 'Ingoma', eng: 'Drum', category: 'culture' },
  { kiny: 'Inyambo', eng: 'Sacred cow', category: 'culture' },
  // Useful Phrases & Questions (Unit 13)
  { kiny: 'Ndasaba', eng: 'Please / I ask', category: 'phrases' },
  { kiny: 'Mbabarira', eng: 'Excuse me / Sorry', category: 'phrases' },
  { kiny: 'Ni byiza', eng: 'It is good', category: 'phrases' },
  { kiny: 'Mfasha', eng: 'Help me', category: 'phrases' },
  { kiny: 'Ese', eng: 'Is it?', category: 'phrases' },
  { kiny: 'Kubera iki?', eng: 'Why?', category: 'phrases' },
  { kiny: 'Hehe?', eng: 'Where?', category: 'phrases' },
  { kiny: 'Ikihe?', eng: 'Which one?', category: 'phrases' },
];

export const PRONUNCIATION_TIPS: Record<string, string> = {
  // Greetings
  muraho: 'Pronounced moo-RAH-ho · Standard polite greeting anytime',
  murabeho: 'Pronounced moo-ra-BEH-ho · Said when parting or saying goodbye',
  murakoze: 'Pronounced moo-ra-KOH-zeh · Polite thank you, stress the penult',
  mwaramutse: 'Pronounced mwa-ra-MOOT-seh · Morning greeting used until midday',
  mwiriwe: 'Pronounced mwee-REE-weh · Afternoon & evening greeting',
  'bite?': 'Pronounced BEE-teh · Friendly, informal greeting for friends',
  bite: 'Pronounced BEE-teh · Friendly, informal greeting for friends',
  'meze neza': 'Pronounced MEH-zeh NEH-za · Literally "I am doing well"',
  yego: 'Pronounced YEH-goh · Gentle upward pitch for "yes"',
  oya: 'Pronounced OH-yah · Clear two syllables for "no"',
  mbabarira: 'Pronounced mba-ba-REE-rah · Soft initial "m", polite apology',
  ndasaba: 'Pronounced nda-SAH-ba · Soft "nd", used when requesting',
  nitwa: 'Pronounced NEE-twa · Means "I am called", followed by name',
  // Numbers
  rimwe: 'Pronounced REEM-weh · Single smooth "m-w" glide',
  kabiri: 'Pronounced ka-BEE-ree · Pure vowels, stress on "bi"',
  gatatu: 'Pronounced ga-TAH-too · Pure "u" sounds like [oo]',
  kane: 'Pronounced KAH-neh · Short, crisp syllables',
  gatanu: 'Pronounced ga-TAH-noo · Open "a" and pure "u"',
  gatandatu: 'Pronounced ga-tan-DAH-too · Stress on "da"',
  karindwi: 'Pronounced ka-REEND-wee · Smooth "ndw" blend',
  umunani: 'Pronounced oo-moo-NAH-nee · Pure [oo] vowels',
  icyenda: 'Pronounced ee-CHYEHN-da · "c" sounds like "ch" in chair',
  icumi: 'Pronounced ee-CHOO-mee · "c" sounds like "ch", number ten',
  'mirongo ibiri': 'Pronounced mee-ROHN-goh ee-BEE-ree · Twenty',
  ijana: 'Pronounced ee-ZHAH-nah · "j" is voiced softly like "measure"',
  igihumbi: 'Pronounced ee-gee-HOOM-bee · One thousand',
  // Colors
  umutuku: 'Pronounced oo-moo-TOO-koo · Red, stress on penult',
  ubururu: 'Pronounced oo-boo-ROO-roo · Blue, vibrant pure "u"',
  icyatsi: 'Pronounced ee-CHYAHT-see · "c" sounds like "ch", green',
  umuhondo: 'Pronounced oo-moo-HOHN-doh · Yellow, smooth "nd"',
  umweru: 'Pronounced oom-WEH-roo · White, blended "mw" glide',
  umukara: 'Pronounced oo-moo-KAH-rah · Black, open vowels',
  inzahabu: 'Pronounced een-za-HAH-boo · Gold, soft "z"',
  ibihogo: 'Pronounced ee-bee-HOH-goh · Brown, open "o"',
  // Family
  ababyeyi: 'Pronounced ah-ba-BYEH-yee · Parents, soft "by" glide',
  musaza: 'Pronounced moo-SAH-za · Brother, open vowels',
  se: 'Pronounced SEH · Father, crisp short vowel',
  umugore: 'Pronounced oo-moo-GOH-reh · Wife or woman, open "o"',
  umugabo: 'Pronounced oo-moo-GAH-boh · Husband or man',
  umwana: 'Pronounced oom-WAH-nah · Child, smooth "mw" blend',
  abana: 'Pronounced ah-BAH-nah · Children, gentle rhythm',
  nyina: 'Pronounced NYEE-nah · "ny" sounds like "ñ" in Spanish',
  // Food
  amata: 'Pronounced ah-MAH-tah · Milk, culturally revered drink',
  amazi: 'Pronounced ah-MAH-zee · Water, open "a" and voiced "z"',
  igitoki: 'Pronounced ee-gee-TOH-kee · Cooking banana, staple food',
  ibishyimbo: 'Pronounced ee-bee-SHEEM-boh · "shy" sounds like "sh"',
  isosi: 'Pronounced ee-SOH-see · Sauce, open "o"',
  isupu: 'Pronounced ee-SOO-poo · Soup, pure [oo] vowels',
  imbuto: 'Pronounced eem-BOO-toh · Fruit or seed, soft "mb"',
  imboga: 'Pronounced eem-BOH-gah · Vegetables, crisp ending',
  inanasi: 'Pronounced ee-na-NAH-see · Pineapple, open vowels',
  indimu: 'Pronounced een-DEE-moo · Lemon, soft "nd"',
  // Animals
  ingagi: 'Pronounced een-GAH-gee · Mountain gorilla of the Virungas',
  intare: 'Pronounced een-TAH-reh · Lion, symbol of strength',
  inka: 'Pronounced EEN-kah · Cow, traditional symbol of prosperity',
  ingurube: 'Pronounced een-goo-ROO-beh · Pig, pure vowels',
  inkoko: 'Pronounced een-KOH-koh · Chicken, open "o"',
  ihene: 'Pronounced ee-HEH-neh · Goat, light breath on "h"',
  inyoni: 'Pronounced een-YOH-nee · Bird, "ny" as in canyon',
  // Body
  umutwe: 'Pronounced oo-MOOT-weh · Head, blended "tw"',
  umunwa: 'Pronounced oo-MOON-wah · Mouth, smooth "nw" blend',
  amaso: 'Pronounced ah-MAH-soh · Eyes, open vowels',
  izuru: 'Pronounced ee-ZOO-roo · Nose, pure [oo]',
  ukuboko: 'Pronounced oo-koo-BOH-koh · Arm, rhythmic cadence',
  ukuguru: 'Pronounced oo-koo-GOO-roo · Leg, pure [oo]',
  urutoki: 'Pronounced oo-roo-TOH-kee · Finger, stress on penult',
  // Time
  ukwezi: 'Pronounced ook-WEH-zee · Month or moon, "kw" glide',
  umwaka: 'Pronounced oom-WAH-kah · Year, blended "mw"',
  igihe: 'Pronounced ee-GEE-heh · Time, voiced "g"',
  saa: 'Pronounced SAH-ah · Hour or clock, elongated vowel',
  umunota: 'Pronounced oo-moo-NOH-tah · Minute, stress on penult',
  ejo: 'Pronounced EH-zhoh · "j" is soft like "measure"',
  'uyu munsi': 'Pronounced OO-yoo MOON-see · Today, literally "this day"',
  // Verbs
  kurya: 'Pronounced KOOR-gya · Infinitive "to eat", soft palatal glide',
  kunywa: 'Pronounced KOON-ywa · Infinitive "to drink", "nyw" blend',
  gusinzira: 'Pronounced goo-seen-ZEE-rah · To sleep, voiced "z"',
  kugenda: 'Pronounced koo-GEN-da · To go or walk, soft "nd"',
  kubona: 'Pronounced koo-BOH-nah · To see or find',
  kumva: 'Pronounced KOOM-va · To hear, feel, or understand',
  kuvuga: 'Pronounced koo-VOO-gah · To speak or say',
  kwiga: 'Pronounced KWEE-gah · To learn or study',
  kugura: 'Pronounced koo-GOO-rah · To buy',
  kubaka: 'Pronounced koo-BAH-kah · To build',
  // Places
  umujyi: 'Pronounced oo-MOO-zhyee · City, soft "jy" sound',
  isoko: 'Pronounced ee-SOH-koh · Market, open "o"',
  ishuri: 'Pronounced ee-SHOO-ree · School, "sh" sounds like "shoe"',
  ikibuga: 'Pronounced ee-kee-BOO-gah · Field or stadium',
  uruganda: 'Pronounced oo-roo-GAHN-da · Factory or industry',
  ibitaro: 'Pronounced ee-bee-TAH-roh · Hospital, stress on "ta"',
  banki: 'Pronounced BAHN-kee · Bank',
  agace: 'Pronounced ah-GAH-cheh · "c" sounds like "ch", district',
  umudugudu: 'Pronounced oo-moo-doo-GOO-doo · Village community',
  pariki: 'Pronounced pa-REE-kee · Park or national park',
  // Weather
  imvura: 'Pronounced eem-VOO-rah · Rain, soft "mv" blend',
  izuba: 'Pronounced ee-ZOO-bah · Sun, warm pure vowels',
  umwuka: 'Pronounced oom-WOO-kah · Wind or breath',
  ibicu: 'Pronounced ee-BEE-choo · "c" sounds like "ch", clouds',
  amapfa: 'Pronounced ah-MAHP-fa · Drought, light "pf"',
  ubushyuhe: 'Pronounced oo-boo-SHYOO-heh · Heat, "shy" blend',
  ubukonje: 'Pronounced oo-boo-KOHN-zheh · Cold, soft "j"',
  umurabyo: 'Pronounced oo-moo-RAH-byoh · Lightning',
  inkuba: 'Pronounced een-KOO-bah · Thunder',
  umukororombya: 'Pronounced oo-moo-koh-roh-ROHM-bya · Rainbow',
  umwuzure: 'Pronounced oom-woo-ZOO-reh · Flood',
  "igihe cy'imvura": 'Pronounced ee-GEE-heh CHEEM-voo-rah · Rainy season',
  // Home
  icyumba: 'Pronounced ee-CHOOM-bah · "c" sounds like "ch", room',
  urugi: 'Pronounced oo-ROO-gee · Door, voiced "g"',
  idirishya: 'Pronounced ee-dee-REE-shya · Window, "shy" blend',
  intebe: 'Pronounced een-TEH-beh · Chair, open "e"',
  ameza: 'Pronounced ah-MEH-za · Table, voiced "z"',
  inzu: 'Pronounced EEN-zoo · House, voiced "z"',
  uruganiriro: 'Pronounced oo-roo-ga-nee-REE-roh · Living room',
  'icyumba cyo kurya': 'Pronounced ee-CHOOM-bah chyo KOOR-gya · Dining room',
  isanduku: 'Pronounced ee-sahn-DOO-koo · Box or chest',
  umusambi: 'Pronounced oo-moo-SAHM-bee · Traditional woven mat or carpet',
  urupapuro: 'Pronounced oo-roo-pa-POO-roh · Paper',
  ikarita: 'Pronounced ee-ka-REE-tah · Card or map',
  // Culture & values
  amahoro: 'Pronounced ah-ma-HOH-roh · Peace, Rwanda core cultural greeting',
  ubumwe: 'Pronounced oo-BOOM-weh · Unity, national motto value',
  umuco: 'Pronounced oo-MOO-choh · "c" sounds like "ch", culture',
  imisozi: 'Pronounced ee-mee-SOH-zee · Hills, Rwanda is Land of 1,000 Hills',
  inanga: 'Pronounced ee-NAHN-gah · Rwandan harp / traditional zither',
  umurage: 'Pronounced oo-moo-RAH-geh · Heritage or legacy',
  ubuntu: 'Pronounced oo-BOON-too · Shared humanity & kindness',
  ubuvandimwe: 'Pronounced oo-boo-vahn-DEEM-weh · Brotherhood / sisterhood',
  ingoma: 'Pronounced een-GOH-mah · Traditional drum',
  inyambo: 'Pronounced een-YAHM-boh · Sacred long-horned royal cow',
  // Useful Phrases & Questions (Unit 13)
  'ni byiza': 'Pronounced nee BYEE-zah · Means "It is good / great"',
  sindabonye: 'Pronounced seen-da-BOHN-yeh · "I do not understand"',
  ese: 'Pronounced EH-seh · Question marker placed at sentence start',
  'kubera iki?': 'Pronounced koo-BEH-rah EE-kee · Means "Why?"',
  'hehe?': 'Pronounced HEH-heh · Question word meaning "Where?"',
  'ikihe?': 'Pronounced ee-KEE-heh · Question word meaning "Which one?"',
};

export const getPronunciationTip = (kiny: string, hint?: string): string => {
  const clean = kiny.toLowerCase().replace(/[?.,!"']/g, '').trim();
  if (PRONUNCIATION_TIPS[clean]) {
    return PRONUNCIATION_TIPS[clean];
  }
  if (PRONUNCIATION_TIPS[kiny.toLowerCase().trim()]) {
    return PRONUNCIATION_TIPS[kiny.toLowerCase().trim()];
  }
  for (const [key, val] of Object.entries(PRONUNCIATION_TIPS)) {
    if (clean.includes(key) && key.length >= 4) {
      return val;
    }
  }

  const rules: string[] = [];
  if (/c/i.test(clean)) rules.push('"c" sounds like "ch" in chair');
  if (/j/i.test(clean)) rules.push('"j" sounds like "zh" in measure');
  if (/shy/i.test(clean)) rules.push('"shy" sounds like "sh"');
  if (/ny/i.test(clean)) rules.push('"ny" sounds like "ñ" in canyon');
  if (/rw/i.test(clean)) rules.push('"rw" blends smoothly together');
  if (/mw/i.test(clean)) rules.push('"mw" blends as a single glide');

  const phoneticRule =
    rules.length > 0 ? rules.join(', ') : 'Vowels: a=[ah], e=[eh], i=[ee], o=[oh], u=[oo]';
  if (hint && hint.trim().length > 0) {
    return `${hint} · ${phoneticRule} · Stress penult`;
  }
  return `Pronounced with pure vowels · ${phoneticRule} · Stress penultimate syllable`;
};

// ── Sentence templates ────────────────────────────────────────────
export const SENTENCE_TEMPLATES: { words: string[]; answer: string; hint: string }[] = [
  { words: ['Nitwa', 'Amina', 'Rwanda', 'ndi'], answer: 'Nitwa Amina', hint: 'My name is Amina' },
  { words: ['Ndakunda', 'u', 'cyane', 'Rwanda'], answer: 'Ndakunda u Rwanda', hint: 'I love Rwanda' },
  { words: ['Ndashaka', 'kurya', 'amazi', 'gusa'], answer: 'Ndashaka kurya', hint: 'I want to eat' },
  { words: ['Meze', 'neza', 'cyane', 'ejo'], answer: 'Meze neza', hint: 'I am fine' },
  { words: ['Murakoze', 'cyane', 'bana', 'bose'], answer: 'Murakoze cyane', hint: 'Thank you very much' },
  { words: ['Ndafite', 'inzara', 'amazi', 'make'], answer: 'Ndafite inzara', hint: 'I am hungry' },
  { words: ['Imisozi', "y'u", 'Rwanda', 'myinshi'], answer: "Imisozi y'u Rwanda", hint: 'Hills of Rwanda' },
  { words: ['Abana', 'biga', 'mu', 'ishuri'], answer: 'Abana biga mu ishuri', hint: 'Children study at school' },
  { words: ['Amahoro', 'ni', 'ingirakamaro', 'cyane'], answer: 'Amahoro ni ingirakamaro', hint: 'Peace is important' },
  { words: ['Ndashaka', 'kunywa', 'amazi', 'kurya'], answer: 'Ndashaka kunywa amazi', hint: 'I want to drink water' },
  { words: ['Ingagi', 'zibera', 'mu', 'mashyamba'], answer: 'Ingagi zibera mu mashyamba', hint: 'Gorillas live in forests' },
  { words: ['Uyu', 'munsi', 'ni', 'mwiza'], answer: 'Uyu munsi ni mwiza', hint: 'Today is good' },
  { words: ['Ntuye', 'i', 'Kigali', 'Rwanda'], answer: 'Ntuye i Kigali', hint: 'I live in Kigali' },
  { words: ['Bite?', 'amakuru?', 'neza', 'cyane'], answer: 'Bite? amakuru?', hint: 'How are you? Any news?' },
  { words: ['Mwiriwe', 'bose', 'cyane', 'muraho'], answer: 'Mwiriwe bose', hint: 'Good evening everyone' },
];

// ── Shuffle helper ────────────────────────────────────────────────
export const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

// ── Pick N unique items ───────────────────────────────────────────
export const pickUnique = <T>(arr: T[], n: number): T[] => {
  const shuffled = shuffle(arr);
  return shuffled.slice(0, Math.min(n, shuffled.length));
};

// ── Extract Guided Learning Cards for Stage 1 (Pre-Assessment Learn Step) ──
export const extractLessonLearningItems = (
  lesson: Lesson,
  unitId?: string
): LearningStudyItem[] => {
  const category = (unitId && UNIT_CATEGORY_MAP[unitId]) || 'greetings';
  const catPairs = WORD_PAIRS.filter((p) => p.category === category);
  const items: LearningStudyItem[] = [];
  const seenKiny = new Set<string>();

  const addItem = (kiny: string, eng: string, hint?: string, audioWordOverride?: string) => {
    const cleanKiny = kiny.trim();
    const cleanEng = eng.trim();
    if (!cleanKiny || !cleanEng) return;
    const key = cleanKiny.toLowerCase();
    if (seenKiny.has(key)) return;
    seenKiny.add(key);

    const audioWord = (audioWordOverride || cleanKiny).replace(/[?.,!"']/g, '').trim();
    const tip = getPronunciationTip(cleanKiny, hint);

    items.push({
      id: `learn_${lesson.id}_${items.length}`,
      kiny: cleanKiny,
      eng: cleanEng,
      tip,
      audioWord,
    });
  };

  for (const ex of lesson.exercises) {
    if (ex.type === 'word_match' && ex.pairs) {
      for (const pair of ex.pairs) {
        addItem(pair.kiny, pair.eng, ex.hint, pair.kiny);
      }
      continue;
    }

    if (ex.audioWord) {
      const kiny = ex.audioWord;
      const knownPair = WORD_PAIRS.find(
        (p) => p.kiny.toLowerCase() === kiny.toLowerCase()
      );
      if (ex.answer.toLowerCase() !== kiny.toLowerCase()) {
        addItem(kiny, ex.answer, ex.hint, ex.audioWord);
      } else {
        const quotedMatch = ex.question.match(/"([^"]+)"/);
        const eng =
          (quotedMatch && quotedMatch[1].toLowerCase() !== kiny.toLowerCase()
            ? quotedMatch[1]
            : knownPair?.eng) ||
          ex.hint ||
          'Key lesson phrase';
        addItem(kiny, eng, ex.hint, ex.audioWord);
      }
      continue;
    }

    if (ex.type === 'multiple_choice' || ex.type === 'translate') {
      const quotedMatch = ex.question.match(/"([^"]+)"/);
      if (quotedMatch) {
        const quoted = quotedMatch[1];
        if (ex.question.toLowerCase().includes('how do you say')) {
          addItem(ex.answer, quoted, ex.hint, ex.answer);
        } else {
          addItem(quoted, ex.answer, ex.hint, quoted);
        }
      } else {
        const knownPair = WORD_PAIRS.find(
          (p) => p.kiny.toLowerCase() === ex.answer.toLowerCase()
        );
        if (knownPair) {
          addItem(knownPair.kiny, knownPair.eng, ex.hint, knownPair.kiny);
        }
      }
      continue;
    }

    if (ex.type === 'fill_blank') {
      const parenMatch = ex.question.match(/\(([^)]+)\)/);
      const knownPair = WORD_PAIRS.find(
        (p) => p.kiny.toLowerCase() === ex.answer.toLowerCase()
      );
      const eng = parenMatch ? parenMatch[1] : knownPair?.eng || ex.hint || 'Lesson word';
      addItem(ex.answer, eng, ex.hint, ex.answer);
      continue;
    }

    if (ex.type === 'sentence_build') {
      const quotedMatch = ex.question.match(/"([^"]+)"/);
      const eng = quotedMatch ? quotedMatch[1] : ex.hint || 'Sentence practice';
      addItem(ex.answer, eng, ex.hint, ex.answer);
    }
  }

  // Ensure at least 3-4 learning cards by supplementing from the unit's category pool
  for (const p of catPairs) {
    if (items.length >= 4) break;
    addItem(p.kiny, p.eng, `Core ${category} vocabulary`, p.kiny);
  }

  // Fallback to all WORD_PAIRS if needed
  if (items.length < 4) {
    for (const p of WORD_PAIRS) {
      if (items.length >= 4) break;
      addItem(p.kiny, p.eng, 'Essential Kinyarwanda vocabulary', p.kiny);
    }
  }

  return items.slice(0, 5);
};

// ── Generate a word_match question from 4 random pairs ────────────
export const makeWordMatchQuestion = (
  topicPairs: { kiny: string; eng: string; category: string }[],
  usedIds: Set<string>
): DynamicQuestion => {
  const available = topicPairs.filter((p) => !usedIds.has('wm_' + p.kiny));
  const pool = available.length >= 4 ? available : topicPairs;
  const pairs = pickUnique(pool, 4);
  const id =
    'wm_' +
    pairs.map((p) => p.kiny).join('_') +
    '_' +
    Math.random().toString(36).slice(2, 7);
  pairs.forEach((p) => usedIds.add('wm_' + p.kiny));
  return {
    id,
    type: 'word_match',
    category: topicPairs[0]?.category || 'mixed',
    question: 'Match each Kinyarwanda word to its English meaning:',
    pairs,
    answer: 'matched',
  };
};

// ── Generate a multiple_choice question ──────────────────────────
export const makeMCQuestion = (
  pair: { kiny: string; eng: string; category?: string },
  topicPairs: { kiny: string; eng: string }[],
  allPairs: { kiny: string; eng: string }[],
  usedIds: Set<string>
): DynamicQuestion => {
  const distractorPool =
    topicPairs.filter((p) => p.eng !== pair.eng).length >= 3 ? topicPairs : allPairs;
  const wrong = shuffle(distractorPool.filter((p) => p.eng !== pair.eng))
    .slice(0, 3)
    .map((p) => p.eng);
  const options = shuffle([pair.eng, ...wrong]);
  const id = 'mc_' + pair.kiny;
  usedIds.add(id);
  return {
    id,
    type: 'multiple_choice',
    category: pair.category || 'mixed',
    question: `What does "${pair.kiny}" mean?`,
    audioWord: pair.kiny,
    options,
    answer: pair.eng,
  };
};

// ── Generate a fill_blank question ───────────────────────────────
export const makeFillBlankQuestion = (
  pair: { kiny: string; eng: string; category?: string },
  topicPairs: { kiny: string; eng: string }[],
  allPairs: { kiny: string; eng: string }[],
  usedIds: Set<string>
): DynamicQuestion => {
  const distractorPool =
    topicPairs.filter((p) => p.kiny !== pair.kiny).length >= 3 ? topicPairs : allPairs;
  const wrong = shuffle(distractorPool.filter((p) => p.kiny !== pair.kiny))
    .slice(0, 3)
    .map((p) => p.kiny);
  const blanks = shuffle([pair.kiny, ...wrong]);
  const id = 'fb_' + pair.kiny;
  usedIds.add(id);
  return {
    id,
    type: 'fill_blank',
    category: pair.category || 'mixed',
    question: `Fill in the blank: "_____" means "${pair.eng}"`,
    audioWord: pair.kiny,
    blanks,
    answer: pair.kiny,
    hint: `Topic: ${pair.category || 'vocabulary'}`,
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
    audioWord: template.answer,
    words: shuffle(template.words),
    answer: template.answer,
    hint: template.hint,
  };
};

// ── Convert an authored Exercise from lessons.ts into a DynamicQuestion ──
const convertAuthoredExercise = (
  ex: Exercise,
  lesson: Lesson,
  category: string,
  topicPairs: { kiny: string; eng: string; category: string }[]
): DynamicQuestion => {
  const id = `${lesson.id}_${ex.id}`;

  if (ex.type === 'word_match' && ex.pairs && ex.pairs.length >= 2) {
    return {
      id,
      type: 'word_match',
      category,
      question: ex.question,
      pairs: shuffle(ex.pairs),
      answer: 'matched',
      hint: ex.hint,
    };
  }

  if (ex.type === 'sentence_build' && ex.words && ex.words.length >= 2) {
    return {
      id,
      type: 'sentence_build',
      category,
      question: ex.question,
      audioWord: ex.audioWord || ex.answer,
      words: shuffle(ex.words),
      answer: ex.answer,
      hint: ex.hint,
    };
  }

  if (ex.type === 'fill_blank' && ex.blanks && ex.blanks.length >= 2) {
    return {
      id,
      type: 'fill_blank',
      category,
      question: ex.question,
      audioWord: ex.audioWord || ex.answer,
      blanks: shuffle(ex.blanks),
      answer: ex.answer,
      hint: ex.hint,
    };
  }

  let audioWord = ex.audioWord;
  if (!audioWord) {
    const quotedMatch = ex.question.match(/"([^"]+)"/);
    if (quotedMatch) {
      if (ex.question.toLowerCase().includes('how do you say')) {
        audioWord = ex.answer;
      } else {
        audioWord = quotedMatch[1];
      }
    } else {
      const known = topicPairs.find((p) => p.kiny.toLowerCase() === ex.answer.toLowerCase());
      if (known) audioWord = known.kiny;
    }
  }

  if (ex.type === 'multiple_choice' && ex.options && ex.options.length >= 2) {
    return {
      id,
      type: 'multiple_choice',
      category,
      question: ex.question,
      audioWord,
      options: shuffle(ex.options),
      answer: ex.answer,
      hint: ex.hint,
    };
  }

  // Convert 'translate' or fallback exercises into 4-option multiple choice
  const siblingAnswers = lesson.exercises
    .filter(
      (other) =>
        other.id !== ex.id &&
        other.type !== 'word_match' &&
        other.type !== 'sentence_build' &&
        other.answer !== ex.answer
    )
    .map((other) => other.answer);
  const topicDistractors = topicPairs
    .map((p) => p.eng)
    .filter(
      (eng) =>
        eng.toLowerCase() !== ex.answer.toLowerCase() && !siblingAnswers.includes(eng)
    );
  const fallbackDistractors = WORD_PAIRS.map((p) => p.eng).filter(
    (eng) => eng.toLowerCase() !== ex.answer.toLowerCase()
  );

  const combinedPool = [
    ...new Set([
      ...shuffle(siblingAnswers),
      ...shuffle(topicDistractors),
      ...shuffle(fallbackDistractors),
    ]),
  ].filter((opt) => opt.trim().toLowerCase() !== ex.answer.trim().toLowerCase());
  const distractors = combinedPool.slice(0, 3);
  const options = shuffle([ex.answer, ...distractors]);

  return {
    id,
    type: 'multiple_choice',
    category,
    question: ex.question,
    audioWord,
    options,
    answer: ex.answer,
    hint: ex.hint,
  };
};

// ── Build a pedagogically structured lesson session ───────────────
// Organizes the exercises into strictly ordered Practice -> Reinforce -> Assessment stages
export const buildLessonSession = (
  lesson: Lesson,
  unitId?: string,
  isReplay = false
): DynamicQuestion[] => {
  const category = (unitId && UNIT_CATEGORY_MAP[unitId]) || 'greetings';
  const catPairs = WORD_PAIRS.filter((p) => p.category === category);
  const topicPool = catPairs.length >= 4 ? catPairs : WORD_PAIRS;

  const authored = lesson.exercises.map((ex) =>
    convertAuthoredExercise(ex, lesson, category, topicPool)
  );

  const usedIds = new Set<string>(authored.map((q) => q.id));

  // Separate authored exercises by cognitive mode:
  // Recognition: multiple_choice
  // Active Recall: word_match, fill_blank, sentence_build
  const authoredRecognition = authored.filter((q) => q.type === 'multiple_choice');
  const authoredRecall = authored.filter(
    (q) => q.type === 'fill_blank' || q.type === 'word_match' || q.type === 'sentence_build'
  );

  // ── Stage 2: Practice (Guided Recognition: multiple_choice) ──────
  const practiceItems: DynamicQuestion[] = [];
  const mcPool = isReplay ? shuffle(authoredRecognition) : [...authoredRecognition];

  const practiceCount = Math.min(3, Math.max(2, Math.floor(mcPool.length / 2)));
  for (let i = 0; i < practiceCount && i < mcPool.length; i++) {
    practiceItems.push(mcPool[i]);
  }

  // Ensure Practice has at least 2 multiple choice exercises
  while (practiceItems.length < 2) {
    const unusedPairs = topicPool.filter(
      (p) => !usedIds.has('mc_' + p.kiny) && !practiceItems.some((q) => q.answer === p.eng)
    );
    const pair = unusedPairs[0] || topicPool[practiceItems.length % topicPool.length];
    practiceItems.push(makeMCQuestion(pair, topicPool, WORD_PAIRS, usedIds));
  }

  const practiceQuestions: DynamicQuestion[] = practiceItems.map((q) => ({
    ...q,
    stage: 'practice',
    stageLabel: 'Step 2 · Guided Practice',
  }));

  // ── Stage 3: Reinforce (Active Recall: word_match, fill_blank, sentence_build) ──
  const reinforceItems: DynamicQuestion[] = [];
  const recallPool = isReplay ? shuffle(authoredRecall) : [...authoredRecall];

  const reinforceRecallCount = recallPool.length > 2 ? recallPool.length - 1 : recallPool.length;
  for (let i = 0; i < reinforceRecallCount; i++) {
    reinforceItems.push(recallPool[i]);
  }

  // Add a dynamic topic word_match if not present
  if (!reinforceItems.some((q) => q.type === 'word_match') && topicPool.length >= 4) {
    reinforceItems.push(makeWordMatchQuestion(topicPool, usedIds));
  }

  // Ensure Reinforce has at least 2 active recall exercises
  if (reinforceItems.length < 2) {
    const unusedPairs = topicPool.filter(
      (p) => !usedIds.has('fb_' + p.kiny) && !reinforceItems.some((q) => q.answer === p.kiny)
    );
    const pair = unusedPairs[0] || topicPool[0];
    reinforceItems.push(makeFillBlankQuestion(pair, topicPool, WORD_PAIRS, usedIds));
  }

  const reinforceQuestions: DynamicQuestion[] = reinforceItems.map((q) => ({
    ...q,
    stage: 'reinforce',
    stageLabel: 'Step 3 · Active Reinforcement',
  }));

  // ── Stage 4: Assessment (Final Mastery Check) ─────────────────────
  // Balanced mix of recognition and recall, with hints disabled
  const assessmentItems: DynamicQuestion[] = [];

  const remainingRecognition = mcPool.filter((q) => !practiceItems.some((p) => p.id === q.id));
  if (remainingRecognition.length > 0) {
    assessmentItems.push(remainingRecognition[0]);
  } else {
    const unusedPairs = topicPool.filter(
      (p) => !usedIds.has('mc_assess_' + p.kiny)
    );
    const pair = unusedPairs[0] || topicPool[1 % topicPool.length];
    const mc = makeMCQuestion(pair, topicPool, WORD_PAIRS, usedIds);
    mc.id = 'mc_assess_' + pair.kiny;
    assessmentItems.push(mc);
  }

  const remainingRecall = recallPool.filter((q) => !reinforceItems.some((r) => r.id === q.id));
  if (remainingRecall.length > 0) {
    assessmentItems.push(remainingRecall[0]);
  } else {
    const unusedPairs = topicPool.filter(
      (p) => !usedIds.has('fb_assess_' + p.kiny)
    );
    const pair = unusedPairs[0] || topicPool[2 % topicPool.length];
    const fb = makeFillBlankQuestion(pair, topicPool, WORD_PAIRS, usedIds);
    fb.id = 'fb_assess_' + pair.kiny;
    assessmentItems.push(fb);
  }

  const assessmentQuestions: DynamicQuestion[] = assessmentItems.map((q) => ({
    ...q,
    stage: 'assessment',
    stageLabel: 'Step 4 · Final Assessment',
    hint: undefined,
  }));

  // Strict monotonic ordering: practice -> reinforce -> assessment
  return [...practiceQuestions, ...reinforceQuestions, ...assessmentQuestions];
};

// ── Main function: generate N unique dynamic questions for practice/review ──
export const generateLessonQuestions = (
  lessonCategory: string,
  count: number
): DynamicQuestion[] => {
  const usedIds = new Set<string>();
  const questions: DynamicQuestion[] = [];

  const catPairs = WORD_PAIRS.filter((p) => p.category === lessonCategory);
  const allPairs = WORD_PAIRS;
  const pool = catPairs.length >= 6 ? catPairs : allPairs;
  const shuffledPool = shuffle(pool);

  const mcCount = Math.ceil(count * 0.4);
  const fbCount = Math.ceil(count * 0.25);
  const wmCount = Math.ceil(count * 0.2);
  const sbCount = count - mcCount - fbCount - wmCount;

  let poolIdx = 0;
  for (let i = 0; i < mcCount && poolIdx < shuffledPool.length; i++, poolIdx++) {
    questions.push(makeMCQuestion(shuffledPool[poolIdx], pool, allPairs, usedIds));
  }

  for (let i = 0; i < fbCount && poolIdx < shuffledPool.length; i++, poolIdx++) {
    questions.push(makeFillBlankQuestion(shuffledPool[poolIdx], pool, allPairs, usedIds));
  }

  const wmPool = pool.length >= 4 ? pool : allPairs;
  for (let i = 0; i < wmCount; i++) {
    questions.push(makeWordMatchQuestion(wmPool, new Set()));
  }

  const sentencePool = shuffle(SENTENCE_TEMPLATES);
  for (let i = 0; i < sbCount && i < sentencePool.length; i++) {
    questions.push(makeSentenceQuestion(sentencePool[i], usedIds));
  }

  return shuffle(questions).slice(0, count);
};
