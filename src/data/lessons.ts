// ── Kinyarwanda Lessons based on Iriza Dictionary ─────────────────
// Real vocabulary from: Iriza Kinyarwanda-English Dictionary (2006)
// Authors: Emmanuel Habumuremyi & Claudine Uwamahoro

export type ExerciseType = 'multiple_choice' | 'translate' | 'listen' | 'word_match' | 'fill_blank' | 'sentence_build';

export interface Exercise {
  id: string;
  type: ExerciseType;
  question: string;
  audioWord?: string;
  options?: string[];       // for multiple_choice
  answer: string;
  hint?: string;
  pairs?: { kiny: string; eng: string }[];  // for word_match
  blanks?: string[];        // for fill_blank: words to arrange
  words?: string[];         // for sentence_build: scrambled words to arrange
}

export interface Lesson {
  id: string;
  title: string;
  titleKiny: string;
  description: string;
  xpReward: number;
  exercises: Exercise[];
}

export interface Unit {
  id: string;
  title: string;
  titleKiny: string;
  color: string;
  colorDark: string;
  lessons: Lesson[];
}

export const units: Unit[] = [
  // ── UNIT 1: Greetings (Gusuhuza) ─────────────────────────────
  {
    id: 'unit1',
    title: 'Greetings',
    titleKiny: 'Gusuhuza',
    color: '#0B6E84',
    colorDark: '#085468',
    lessons: [
      {
        id: 'l1_1',
        title: 'Hello & Goodbye',
        titleKiny: 'Muraho & Murabeho',
        description: 'Basic everyday greetings',
        xpReward: 10,
        exercises: [
          { id: 'e1', type: 'multiple_choice', question: 'What does "Muraho" mean?', audioWord: 'Muraho', options: ['Goodbye', 'Hello', 'Thank you', 'Sorry'], answer: 'Hello', hint: 'Common greeting' },
          { id: 'e2', type: 'translate', question: 'Translate: "Murabeho"', audioWord: 'Murabeho', answer: 'Goodbye', hint: 'Said when leaving' },
          { id: 'e3', type: 'multiple_choice', question: 'How do you say "Good morning"?', options: ['Mwiriwe', 'Mwaramutse', 'Muraho', 'Bite'], answer: 'Mwaramutse', audioWord: 'Mwaramutse' },
          { id: 'e4', type: 'translate', question: 'Translate: "Mwiriwe"', audioWord: 'Mwiriwe', answer: 'Good evening', hint: 'Evening greeting' },
          { id: 'e5', type: 'multiple_choice', question: 'What does "Bite?" mean?', options: ['How are you?', 'What is your name?', 'Where are you?', 'Good night'], answer: 'How are you?' },
          { id: 'e6', type: 'word_match', question: 'Match each Kinyarwanda word to its meaning:', pairs: [
            { kiny: 'Muraho', eng: 'Hello' },
            { kiny: 'Murabeho', eng: 'Goodbye' },
            { kiny: 'Murakoze', eng: 'Thank you' },
            { kiny: 'Yego', eng: 'Yes' },
          ], answer: 'matched' },
          { id: 'e7', type: 'sentence_build', question: 'Build the sentence: "Good morning, how are you?"', words: ['Mwaramutse,', 'bite?', 'amakuru,', 'muraho'], answer: 'Mwaramutse, amakuru, bite?' },
        ],
      },
      {
        id: 'l1_2',
        title: 'Introductions',
        titleKiny: 'Kwiyerekana',
        description: 'Introduce yourself',
        xpReward: 10,
        exercises: [
          { id: 'e1', type: 'multiple_choice', question: 'How do you say "My name is..."?', options: ['Nitwa...', 'Mva...', 'Ndi umuntu...', 'Izina ryanjye...'], answer: 'Nitwa...', audioWord: 'Nitwa' },
          { id: 'e2', type: 'translate', question: 'Translate: "Ntuye hehe?"', audioWord: 'Ntuye hehe', answer: 'Where do you live?' },
          { id: 'e3', type: 'multiple_choice', question: '"Ndakwishimiye guhura nawe" means?', options: ['Nice to meet you', 'How are you?', 'I am fine', 'See you tomorrow'], answer: 'Nice to meet you' },
          { id: 'e4', type: 'translate', question: 'Translate: "Mva mu Rwanda"', audioWord: 'Mva mu Rwanda', answer: 'I am from Rwanda' },
          { id: 'e5', type: 'multiple_choice', question: 'How do you say "I am fine"?', options: ['Ni nziza', 'Amahoro', 'Meze neza', 'Yewe'], answer: 'Meze neza' },
          { id: 'e6', type: 'fill_blank', question: 'Complete: "_____ ndi umwarimu" (I am a teacher)', blanks: ['Jye', 'Ndi', 'Uyu', 'We'], answer: 'Ndi', hint: 'First person pronoun' },
          { id: 'e7', type: 'sentence_build', question: 'Build: "My name is Amina"', words: ['Amina', 'Nitwa', 'ndi', 'Rwanda'], answer: 'Nitwa Amina' },
        ],
      },
      {
        id: 'l1_3',
        title: 'Politeness',
        titleKiny: 'Kugira Isoni',
        description: 'Please, thank you, sorry',
        xpReward: 15,
        exercises: [
          { id: 'e1', type: 'multiple_choice', question: 'How do you say "Thank you"?', options: ['Murakoze', 'Murabaza', 'Murabeho', 'Muraho'], answer: 'Murakoze', audioWord: 'Murakoze' },
          { id: 'e2', type: 'translate', question: 'Translate: "Ndabyemeye"', audioWord: 'Ndabyemeye', answer: 'I agree' },
          { id: 'e3', type: 'multiple_choice', question: 'What does "Yego" mean?', options: ['No', 'Maybe', 'Yes', 'Please'], answer: 'Yes', audioWord: 'Yego' },
          { id: 'e4', type: 'multiple_choice', question: 'What does "Oya" mean?', options: ['Yes', 'No', 'Hello', 'Thank you'], answer: 'No', audioWord: 'Oya' },
          { id: 'e5', type: 'translate', question: 'Translate: "Mbabarira"', audioWord: 'Mbabarira', answer: 'Sorry / Forgive me' },
        ],
      },
    ],
  },

  // ── UNIT 2: Numbers (Ibiharuro) ──────────────────────────────
  {
    id: 'unit2',
    title: 'Numbers',
    titleKiny: 'Ibiharuro',
    color: '#C9891C',
    colorDark: '#A56B2A',
    lessons: [
      {
        id: 'l2_1',
        title: 'Numbers 1-10',
        titleKiny: 'Ibiharuro 1-10',
        description: 'Count from 1 to 10',
        xpReward: 10,
        exercises: [
          { id: 'e1', type: 'multiple_choice', question: 'What is "Rimwe" in English?', audioWord: 'Rimwe', options: ['Two', 'One', 'Three', 'Ten'], answer: 'One' },
          { id: 'e2', type: 'translate', question: 'What is "Kabiri" in English?', audioWord: 'Kabiri', answer: 'Two' },
          { id: 'e3', type: 'multiple_choice', question: 'What is "Gatatu"?', options: ['Four', 'Five', 'Three', 'Seven'], answer: 'Three', audioWord: 'Gatatu' },
          { id: 'e4', type: 'translate', question: 'What is "Kane"?', audioWord: 'Kane', answer: 'Four' },
          { id: 'e5', type: 'multiple_choice', question: 'What is "Gatanu"?', options: ['Six', 'Five', 'Eight', 'Nine'], answer: 'Five', audioWord: 'Gatanu' },
          { id: 'e6', type: 'translate', question: 'What is "Gatandatu"?', audioWord: 'Gatandatu', answer: 'Six' },
          { id: 'e7', type: 'multiple_choice', question: 'What is "Karindwi"?', options: ['Seven', 'Eight', 'Nine', 'Ten'], answer: 'Seven', audioWord: 'Karindwi' },
          { id: 'e8', type: 'translate', question: 'What is "UMunani"?', audioWord: 'UMunani', answer: 'Eight' },
          { id: 'e9', type: 'multiple_choice', question: 'What is "Icyenda"?', options: ['Ten', 'Nine', 'Seven', 'Five'], answer: 'Nine', audioWord: 'Icyenda' },
          { id: 'e10', type: 'translate', question: 'What is "Icumi"?', audioWord: 'Icumi', answer: 'Ten' },
          { id: 'e11', type: 'word_match', question: 'Match numbers to their Kinyarwanda:', pairs: [
            { kiny: 'Rimwe', eng: '1' },
            { kiny: 'Kabiri', eng: '2' },
            { kiny: 'Gatatu', eng: '3' },
            { kiny: 'Kane', eng: '4' },
          ], answer: 'matched' },
        ],
      },
      {
        id: 'l2_2',
        title: 'Numbers 11-50',
        titleKiny: 'Ibiharuro 11-50',
        description: 'Count from 11 to 50',
        xpReward: 15,
        exercises: [
          { id: 'e1', type: 'multiple_choice', question: 'What is "Cumi na rimwe"?', options: ['12', '11', '13', '20'], answer: '11', audioWord: 'Cumi na rimwe' },
          { id: 'e2', type: 'translate', question: 'What is "Cumi na kabiri"?', audioWord: 'Cumi na kabiri', answer: '12' },
          { id: 'e3', type: 'multiple_choice', question: 'What is "Ijana"?', options: ['100', '1000', '50', '10'], answer: '100', audioWord: 'Ijana' },
          { id: 'e4', type: 'translate', question: 'What is "Mirongo ibiri"?', audioWord: 'Mirongo ibiri', answer: '20' },
          { id: 'e5', type: 'multiple_choice', question: 'What is "Mirongo itatu"?', options: ['30', '40', '50', '60'], answer: '30', audioWord: 'Mirongo itatu' },
        ],
      },
      {
        id: 'l2_3',
        title: 'Numbers 100+',
        titleKiny: 'Ibiharuro 100+',
        description: 'Hundreds and thousands',
        xpReward: 20,
        exercises: [
          { id: 'e1', type: 'multiple_choice', question: 'What is "Igihumbi"?', options: ['100', '1000', '10000', '500'], answer: '1000', audioWord: 'Igihumbi' },
          { id: 'e2', type: 'translate', question: 'What is "Ibihumbi bibiri"?', audioWord: 'Ibihumbi bibiri', answer: '2000' },
          { id: 'e3', type: 'multiple_choice', question: 'What is "Igihumbi na kabiri"?', options: ['100', '1000', '1002', '1200'], answer: '1002', audioWord: 'Igihumbi na kabiri' },
          { id: 'e4', type: 'multiple_choice', question: 'What is "Ibihumbi icyenda"?', options: ['9000', '900', '990', '4000'], answer: '9000', audioWord: 'Ibihumbi icyenda' },
        ],
      },
    ],
  },

  // ── UNIT 3: Colors (Amabara) ─────────────────────────────────
  {
    id: 'unit3',
    title: 'Colors',
    titleKiny: 'Amabara',
    color: '#2B6CB0',
    colorDark: '#22578C',
    lessons: [
      {
        id: 'l3_1',
        title: 'Basic Colors',
        titleKiny: 'Amabara y\'Isanzwe',
        description: 'Learn colors',
        xpReward: 10,
        exercises: [
          { id: 'e1', type: 'multiple_choice', question: 'What is "Umutuku"?', options: ['Blue', 'Red', 'Green', 'Yellow'], answer: 'Red', audioWord: 'Umutuku' },
          { id: 'e2', type: 'translate', question: 'What is "Ubururu"?', audioWord: 'Ubururu', answer: 'Blue' },
          { id: 'e3', type: 'multiple_choice', question: 'What is "Icyatsi"?', options: ['Yellow', 'Green', 'White', 'Black'], answer: 'Green', audioWord: 'Icyatsi' },
          { id: 'e4', type: 'multiple_choice', question: 'What is "Umuhondo"?', options: ['Gold', 'Silver', 'Yellow', 'Bronze'], answer: 'Yellow', audioWord: 'Umuhondo' },
          { id: 'e5', type: 'multiple_choice', question: 'What is "Umweru"?', options: ['Black', 'White', 'Brown', 'Pink'], answer: 'White', audioWord: 'Umweru' },
          { id: 'e6', type: 'multiple_choice', question: 'What is "Umukara"?', options: ['Red', 'Black', 'Blue', 'Orange'], answer: 'Black', audioWord: 'Umukara' },
        ],
      },
      {
        id: 'l3_2',
        title: 'More Colors',
        titleKiny: 'Amabara Akenewe',
        description: 'Additional colors',
        xpReward: 12,
        exercises: [
          { id: 'e1', type: 'multiple_choice', question: 'What is "Inzahabu"?', options: ['Silver', 'Gold', 'Copper', 'Bronze'], answer: 'Gold', audioWord: 'Inzahabu' },
          { id: 'e2', type: 'multiple_choice', question: 'What is "Umuhondo"?', options: ['Yellow', 'Blue', 'Black', 'White'], answer: 'Yellow', audioWord: 'Umuhondo' },
          { id: 'e3', type: 'multiple_choice', question: 'What is "Umukara"?', options: ['Purple', 'Brown', 'Black', 'Grey'], answer: 'Black', audioWord: 'Umukara' },
          { id: 'e4', type: 'multiple_choice', question: 'What is "Ibihogo"? (ibara ry\'inka)', options: ['Purple', 'Brown', 'Pink', 'Silver'], answer: 'Brown', audioWord: 'Ibihogo' },
        ],
      },
    ],
  },

  // ── UNIT 4: Family (Umuryango) ───────────────────────────────
  {
    id: 'unit4',
    title: 'Family',
    titleKiny: 'Umuryango',
    color: '#0B6E84',
    colorDark: '#085468',
    lessons: [
      {
        id: 'l4_1',
        title: 'Family Members',
        titleKiny: 'Abanyumuryango',
        description: 'Learn family words',
        xpReward: 10,
        exercises: [
          { id: 'e1', type: 'multiple_choice', question: 'What is "Ababyeyi"?', options: ['Father', 'Mother', 'Parents', 'Siblings'], answer: 'Parents', audioWord: 'Ababyeyi' },
          { id: 'e2', type: 'translate', question: 'What is "Musaza"?', audioWord: 'Musaza', answer: 'Brother' },
          { id: 'e3', type: 'multiple_choice', question: 'What is "Se"?', options: ['Mother', 'Father', 'Uncle', 'Aunt'], answer: 'Father', audioWord: 'Se' },
          { id: 'e4', type: 'translate', question: 'What is "Umugore"?', audioWord: 'Umugore', answer: 'Wife' },
          { id: 'e5', type: 'multiple_choice', question: 'What is "Umugabo"?', options: ['Wife', 'Husband', 'Child', 'Parent'], answer: 'Husband', audioWord: 'Umugabo' },
          { id: 'e6', type: 'translate', question: 'What is "Umwana"?', audioWord: 'Umwana', answer: 'Child' },
          { id: 'e7', type: 'multiple_choice', question: 'What is "Abana"?', options: ['Children', 'Parents', 'Friends', 'Teachers'], answer: 'Children', audioWord: 'Abana' },
          { id: 'e8', type: 'translate', question: 'What is "Inda"?', audioWord: 'Inda', answer: 'Pregnancy' },
        ],
      },
      {
        id: 'l4_2',
        title: 'Extended Family',
        titleKiny: 'Umuryango Mugari',
        description: 'Grandparents and relatives',
        xpReward: 12,
        exercises: [
          { id: 'e1', type: 'multiple_choice', question: 'What is "Sekuru"?', options: ['Grandfather', 'Grandmother', 'Brother', 'Sister'], answer: 'Grandfather', audioWord: 'Sekuru' },
          { id: 'e2', type: 'multiple_choice', question: 'What is "Nyirakuru"?', options: ['Aunt', 'Grandmother', 'Mother', 'Cousin'], answer: 'Grandmother', audioWord: 'Nyirakuru' },
          { id: 'e3', type: 'multiple_choice', question: 'What is "Nyina"?', options: ['Mother', 'Father', 'Sister', 'Child'], answer: 'Mother', audioWord: 'Nyina' },
          { id: 'e4', type: 'multiple_choice', question: 'What is "Nyirasenge"?', options: ['Aunt', 'Uncle', 'Brother', 'Son'], answer: 'Aunt', audioWord: 'Nyirasenge' },
          { id: 'e5', type: 'word_match', question: 'Match family words:', pairs: [
            { kiny: 'Ababyeyi', eng: 'Parents' },
            { kiny: 'Umugore', eng: 'Wife' },
            { kiny: 'Umugabo', eng: 'Husband' },
            { kiny: 'Abana', eng: 'Children' },
          ], answer: 'matched' },
        ],
      },
    ],
  },

  // ── UNIT 5: Food & Drink (Ifunguro) ──────────────────────────
  {
    id: 'unit5',
    title: 'Food & Drink',
    titleKiny: 'Ibiribwa n\'Ibyonywa',
    color: '#C9891C',
    colorDark: '#A56B2A',
    lessons: [
      {
        id: 'l5_1',
        title: 'Common Foods',
        titleKiny: 'Ibiribwa Bisanzwe',
        description: 'Food and drink vocabulary',
        xpReward: 10,
        exercises: [
          { id: 'e1', type: 'multiple_choice', question: 'What is "Amata"?', options: ['Water', 'Milk', 'Tea', 'Juice'], answer: 'Milk', audioWord: 'Amata' },
          { id: 'e2', type: 'translate', question: 'What is "Umutobe"?', audioWord: 'Umutobe', answer: 'Banana juice' },
          { id: 'e3', type: 'multiple_choice', question: 'What is "Igitoki"?', options: ['Mango', 'Banana', 'Orange', 'Apple'], answer: 'Banana', audioWord: 'Igitoki' },
          { id: 'e4', type: 'multiple_choice', question: 'What is "Porici"?', options: ['Porridge', 'Tea', 'Juice', 'Milk'], answer: 'Porridge', audioWord: 'Porici' },
          { id: 'e5', type: 'multiple_choice', question: 'What is "Isosi"?', options: ['Sauce', 'Soup', 'Salad', 'Rice'], answer: 'Sauce', audioWord: 'Isosi' },
          { id: 'e6', type: 'multiple_choice', question: 'What is "Ibishyimbo"?', options: ['Beans', 'Bananas', 'Potatoes', 'Rice'], answer: 'Beans', audioWord: 'Ibishyimbo' },
          { id: 'e7', type: 'fill_blank', question: 'Complete: "Ndashaka _____ n\'amazi" (I want food and water)', blanks: ['kurya', 'gusinzira', 'kugenda', 'kubona'], answer: 'kurya', hint: 'To eat' },
          { id: 'e8', type: 'word_match', question: 'Match food words:', pairs: [
            { kiny: 'Amata', eng: 'Milk' },
            { kiny: 'Amazi', eng: 'Water' },
            { kiny: 'Igitoki', eng: 'Banana' },
            { kiny: 'Ibishyimbo', eng: 'Beans' },
          ], answer: 'matched' },
        ],
      },
      {
        id: 'l5_2',
        title: 'At the Restaurant',
        titleKiny: 'Ku Resitora',
        description: 'Ordering food',
        xpReward: 12,
        exercises: [
          { id: 'e1', type: 'multiple_choice', question: 'How do you say "I am hungry"?', options: ['Ndafite inzara', 'Ndafite amanzi', 'Ndafite ubushyuhe', 'Ndashaka kurya'], answer: 'Ndafite inzara' },
          { id: 'e2', type: 'translate', question: 'Translate: "Ndashaka kurya"', audioWord: 'Ndashaka kurya', answer: 'I want to eat' },
          { id: 'e3', type: 'multiple_choice', question: 'How do you say "Water"?', options: ['Amata', 'Amazi', 'Amakuru', 'Amabara'], answer: 'Amazi', audioWord: 'Amazi' },
          { id: 'e4', type: 'multiple_choice', question: 'What is "Isupu"?', options: ['Soup', 'Rice', 'Bread', 'Meat'], answer: 'Soup', audioWord: 'Isupu' },
        ],
      },
      {
        id: 'l5_3',
        title: 'Fruits & Vegetables',
        titleKiny: 'Imbuto n\'Imboga',
        description: 'Fruits and vegetables',
        xpReward: 12,
        exercises: [
          { id: 'e1', type: 'multiple_choice', question: 'What is "Imbuto"?', options: ['Vegetable', 'Fruit', 'Meat', 'Bread'], answer: 'Fruit', audioWord: 'Imbuto' },
          { id: 'e2', type: 'translate', question: 'What is "Imboga"?', audioWord: 'Imboga', answer: 'Vegetables' },
          { id: 'e3', type: 'multiple_choice', question: 'What is "Inanasi"?', options: ['Mango', 'Orange', 'Pineapple', 'Avocado'], answer: 'Pineapple', audioWord: 'Inanasi' },
          { id: 'e4', type: 'multiple_choice', question: 'What is "Indimu"?', options: ['Lemons', 'Bananas', 'Mangoes', 'Apples'], answer: 'Lemons', audioWord: 'Indimu' },
        ],
      },
    ],
  },

  // ── UNIT 6: Animals (Ibyamamara) ─────────────────────────────
  {
    id: 'unit6',
    title: 'Animals',
    titleKiny: 'Ibyamamara',
    color: '#2B6CB0',
    colorDark: '#22578C',
    lessons: [
      {
        id: 'l6_1',
        title: 'Wild Animals',
        titleKiny: 'Ibyamamara by\'Isengeli',
        description: 'Wild and farm animals',
        xpReward: 10,
        exercises: [
          { id: 'e1', type: 'multiple_choice', question: 'What is "Ingagi"?', options: ['Lion', 'Elephant', 'Gorilla', 'Leopard'], answer: 'Gorilla', audioWord: 'Ingagi', hint: 'National animal' },
          { id: 'e2', type: 'translate', question: 'What is "Intare"?', audioWord: 'Intare', answer: 'Lion' },
          { id: 'e3', type: 'multiple_choice', question: 'What is "Inka"?', options: ['Cow', 'Goat', 'Sheep', 'Pig'], answer: 'Cow', audioWord: 'Inka' },
          { id: 'e4', type: 'translate', question: 'What is "Amatungo"?', audioWord: 'Amatungo', answer: 'Livestock' },
          { id: 'e5', type: 'multiple_choice', question: 'What is "Ingurube"?', options: ['Cow', 'Goat', 'Pig', 'Sheep'], answer: 'Pig', audioWord: 'Ingurube' },
          { id: 'e6', type: 'translate', question: 'What is "Inkoko"?', audioWord: 'Inkoko', answer: 'Chicken' },
        ],
      },
      {
        id: 'l6_2',
        title: 'Farm Animals',
        titleKiny: 'Amatungo',
        description: 'Farm animals',
        xpReward: 10,
        exercises: [
          { id: 'e1', type: 'multiple_choice', question: 'What is "Ihene"?', options: ['Goat', 'Sheep', 'Cow', 'Horse'], answer: 'Goat', audioWord: 'Ihene' },
          { id: 'e2', type: 'translate', question: 'What is "Inswa"?', audioWord: 'Inswa', answer: 'Ant' },
          { id: 'e3', type: 'multiple_choice', question: 'What is "Inyoni"?', options: ['Fish', 'Bird', 'Snake', 'Frog'], answer: 'Bird', audioWord: 'Inyoni' },
          { id: 'e4', type: 'translate', question: 'What is "Inyenzi"?', audioWord: 'Inyenzi', answer: 'Cockroach' },
        ],
      },
    ],
  },

  // ── UNIT 7: Body Parts (Ibice by\'Umwubure) ──────────────────
  {
    id: 'unit7',
    title: 'Body Parts',
    titleKiny: 'Ibice by\'Umwubure',
    color: '#0B6E84',
    colorDark: '#085468',
    lessons: [
      {
        id: 'l7_1',
        title: 'Head & Face',
        titleKiny: 'Iso n\'Ubuso',
        description: 'Head and face parts',
        xpReward: 10,
        exercises: [
          { id: 'e1', type: 'multiple_choice', question: 'What is "Umutwe"?', options: ['Hand', 'Head', 'Foot', 'Eye'], answer: 'Head', audioWord: 'Umutwe' },
          { id: 'e2', type: 'translate', question: 'What is "Ijwi"?', audioWord: 'Ijwi', answer: 'Voice' },
          { id: 'e3', type: 'multiple_choice', question: 'What is "Umunwa"?', options: ['Eye', 'Ear', 'Mouth', 'Nose'], answer: 'Mouth', audioWord: 'Umunwa' },
          { id: 'e4', type: 'multiple_choice', question: 'What is "Amaso"?', options: ['Ears', 'Eyes', 'Nose', 'Mouth'], answer: 'Eyes', audioWord: 'Amaso' },
          { id: 'e5', type: 'multiple_choice', question: 'What is "Izuru"?', options: ['Ear', 'Nose', 'Mouth', 'Chin'], answer: 'Nose', audioWord: 'Izuru' },
        ],
      },
      {
        id: 'l7_2',
        title: 'Arms & Legs',
        titleKiny: 'Iruhunga n\'Inyuma',
        description: 'Arms and legs',
        xpReward: 12,
        exercises: [
          { id: 'e1', type: 'multiple_choice', question: 'What is "Ukuboko"?', options: ['Leg', 'Arm', 'Hand', 'Foot'], answer: 'Arm', audioWord: 'Ukuboko' },
          { id: 'e2', type: 'multiple_choice', question: 'What is "Ukuguru"?', options: ['Arm', 'Leg', 'Hand', 'Head'], answer: 'Leg', audioWord: 'Ukuguru' },
          { id: 'e3', type: 'multiple_choice', question: 'What is "Urutoki"?', options: ['Finger', 'Leg', 'Neck', 'Back'], answer: 'Finger', audioWord: 'Urutoki' },
          { id: 'e4', type: 'translate', question: 'What is "Inzara"?', audioWord: 'Inzara', answer: 'Hunger' },
        ],
      },
    ],
  },

  // ── UNIT 8: Time (Igihe) ─────────────────────────────────────
  {
    id: 'unit8',
    title: 'Time',
    titleKiny: 'Igihe',
    color: '#C9891C',
    colorDark: '#A56B2A',
    lessons: [
      {
        id: 'l8_1',
        title: 'Days & Months',
        titleKiny: 'Iminsi n\'Ukwezi',
        description: 'Days of the week and months',
        xpReward: 10,
        exercises: [
          { id: 'e1', type: 'multiple_choice', question: 'What is "Ukwezi"?', options: ['Week', 'Month', 'Year', 'Day'], answer: 'Month', audioWord: 'Ukwezi' },
          { id: 'e2', type: 'translate', question: 'What is "Iminsi"?', audioWord: 'Iminsi', answer: 'Days' },
          { id: 'e3', type: 'multiple_choice', question: 'What is "Umwaka"?', options: ['Month', 'Week', 'Year', 'Season'], answer: 'Year', audioWord: 'Umwaka' },
          { id: 'e4', type: 'translate', question: 'What is "Igihe"?', audioWord: 'Igihe', answer: 'Time' },
        ],
      },
      {
        id: 'l8_2',
        title: 'Telling Time',
        titleKiny: 'Kubwira Igihe',
        description: 'How to tell time',
        xpReward: 15,
        exercises: [
          { id: 'e1', type: 'multiple_choice', question: 'What is "Saa"?', options: ['Minute', 'Hour', 'Second', 'Day'], answer: 'Hour', audioWord: 'Saa' },
          { id: 'e2', type: 'multiple_choice', question: 'What is "Umunota"?', options: ['Minute', 'Hour', 'Second', 'Week'], answer: 'Minute', audioWord: 'Umunota' },
          { id: 'e3', type: 'multiple_choice', question: 'What is "Ejo"?', options: ['Yesterday', 'Today', 'Tomorrow', 'Now'], answer: 'Tomorrow', audioWord: 'Ejo' },
          { id: 'e4', type: 'multiple_choice', question: 'What is "Uyu munsi"?', options: ['Tomorrow', 'Today', 'Yesterday', 'Tonight'], answer: 'Today', audioWord: 'Uyu munsi' },
        ],
      },
    ],
  },

  // ── UNIT 9: Common Verbs (Ibikorwa) ──────────────────────────
  {
    id: 'unit9',
    title: 'Common Verbs',
    titleKiny: 'Ibikorwa',
    color: '#B4643C',
    colorDark: '#8A4A2E',
    lessons: [
      {
        id: 'l9_1',
        title: 'Daily Actions',
        titleKiny: 'Ibikorwa by\'Umusi',
        description: 'Common everyday verbs',
        xpReward: 12,
        exercises: [
          { id: 'e1', type: 'multiple_choice', question: 'What is "Kurya"?', options: ['To drink', 'To eat', 'To sleep', 'To run'], answer: 'To eat', audioWord: 'Kurya' },
          { id: 'e2', type: 'translate', question: 'What is "Kunywa"?', audioWord: 'Kunywa', answer: 'To drink' },
          { id: 'e3', type: 'multiple_choice', question: 'What is "Gusinzira"?', options: ['To wake up', 'To sleep', 'To dream', 'To rest'], answer: 'To sleep', audioWord: 'Gusinzira' },
          { id: 'e4', type: 'translate', question: 'What is "Kugenda"?', audioWord: 'Kugenda', answer: 'To go' },
          { id: 'e5', type: 'multiple_choice', question: 'What is "Kujya"?', options: ['To go', 'To eat', 'To sleep', 'To run'], answer: 'To go', audioWord: 'Kujya' },
          { id: 'e6', type: 'translate', question: 'What is "Kubona"?', audioWord: 'Kubona', answer: 'To see' },
          { id: 'e7', type: 'multiple_choice', question: 'What is "Kumva"?', options: ['To hear', 'To feel', 'To smell', 'To taste'], answer: 'To hear', audioWord: 'Kumva' },
          { id: 'e8', type: 'translate', question: 'What is "Kuvuga"?', audioWord: 'Kuvuga', answer: 'To speak' },
        ],
      },
      {
        id: 'l9_2',
        title: 'Action Verbs',
        titleKiny: 'Ibikorwa by\'Akazi',
        description: 'Work and action verbs',
        xpReward: 12,
        exercises: [
          { id: 'e1', type: 'multiple_choice', question: 'What is "Kubaka"?', options: ['To break', 'To build', 'To buy', 'To sell'], answer: 'To build', audioWord: 'Kubaka' },
          { id: 'e2', type: 'translate', question: 'What is "Kugura"?', audioWord: 'Kugura', answer: 'To buy' },
          { id: 'e3', type: 'multiple_choice', question: 'What is "Kugenda"?', options: ['To walk', 'To run', 'To jump', 'To sit'], answer: 'To walk', audioWord: 'Kugenda' },
          { id: 'e4', type: 'translate', question: 'What is "Guhugura"?', audioWord: 'Guhugura', answer: 'To teach' },
          { id: 'e5', type: 'multiple_choice', question: 'What is "Kwiga"?', options: ['To learn', 'To teach', 'To read', 'To write'], answer: 'To learn', audioWord: 'Kwiga' },
        ],
      },
    ],
  },

  // ── UNIT 10: Travel & Places (Ingendo n\'Ahantu) ──────────────
  {
    id: 'unit10',
    title: 'Travel & Places',
    titleKiny: 'Ingendo n\'Ahantu',
    color: '#2F9E6E',
    colorDark: '#257A57',
    lessons: [
      {
        id: 'l10_1',
        title: 'Places',
        titleKiny: 'Ahantu',
        description: 'Common places',
        xpReward: 12,
        exercises: [
          { id: 'e1', type: 'multiple_choice', question: 'What is "Umujyi"?', options: ['Village', 'City', 'Farm', 'Forest'], answer: 'City', audioWord: 'Umujyi' },
          { id: 'e2', type: 'multiple_choice', question: 'What is "Ikibuga"?', options: ['Field', 'House', 'River', 'Tree'], answer: 'Field', audioWord: 'Ikibuga' },
          { id: 'e3', type: 'multiple_choice', question: 'What is "Isoko"?', options: ['Market', 'School', 'Hospital', 'Church'], answer: 'Market', audioWord: 'Isoko' },
          { id: 'e4', type: 'translate', question: 'What is "Ishuri"?', audioWord: 'Ishuri', answer: 'School' },
          { id: 'e5', type: 'multiple_choice', question: 'What is "Ikigo"?', options: ['Institution', 'House', 'Shop', 'Farm'], answer: 'Institution', audioWord: 'Ikigo' },
        ],
      },
      {
        id: 'l10_2',
        title: 'Community & Travel',
        titleKiny: 'Umudugudu n\'Ingendo',
        description: 'Community and travel places',
        xpReward: 12,
        exercises: [
          { id: 'e1', type: 'multiple_choice', question: 'What is "Ibitaro"?', options: ['Hospital', 'Market', 'School', 'Bank'], answer: 'Hospital', audioWord: 'Ibitaro' },
          { id: 'e2', type: 'multiple_choice', question: 'What is "Umudugudu"?', options: ['Village', 'River', 'Mountain', 'Cloud'], answer: 'Village', audioWord: 'Umudugudu' },
          { id: 'e3', type: 'multiple_choice', question: 'What is "Uruganda"?', options: ['Factory', 'Garden', 'Bedroom', 'Bridge'], answer: 'Factory', audioWord: 'Uruganda' },
          { id: 'e4', type: 'multiple_choice', question: 'What is "Banki"?', options: ['Bank', 'Church', 'School', 'Forest'], answer: 'Bank', audioWord: 'Banki' },
          { id: 'e5', type: 'word_match', question: 'Match the places:', pairs: [
            { kiny: 'Umujyi', eng: 'City' },
            { kiny: 'Isoko', eng: 'Market' },
            { kiny: 'Ishuri', eng: 'School' },
            { kiny: 'Ibitaro', eng: 'Hospital' },
          ], answer: 'matched' },
        ],
      },
    ],
  },

  // ── UNIT 11: Weather (Ikirere) ───────────────────────────────
  {
    id: 'unit11',
    title: 'Weather',
    titleKiny: 'Ikirere',
    color: '#2B6CB0',
    colorDark: '#22578C',
    lessons: [
      {
        id: 'l11_1',
        title: 'Weather Words',
        titleKiny: 'Amagambo y\'Ikirere',
        description: 'Weather vocabulary',
        xpReward: 12,
        exercises: [
          { id: 'e1', type: 'multiple_choice', question: 'What is "Imvura"?', options: ['Wind', 'Rain', 'Sun', 'Cloud'], answer: 'Rain', audioWord: 'Imvura' },
          { id: 'e2', type: 'multiple_choice', question: 'What is "Amapfa"?', options: ['Drought', 'Rain', 'Wind', 'Flood'], answer: 'Drought', audioWord: 'Amapfa' },
          { id: 'e3', type: 'multiple_choice', question: 'What is "Ubushyuhe"?', options: ['Heat', 'Cold', 'Rain', 'Wind'], answer: 'Heat', audioWord: 'Ubushyuhe' },
          { id: 'e4', type: 'translate', question: 'What is "Ubukonje"?', audioWord: 'Ubukonje', answer: 'Cold' },
          { id: 'e5', type: 'multiple_choice', question: 'What is "Izuba"?', options: ['Moon', 'Sun', 'Star', 'Cloud'], answer: 'Sun', audioWord: 'Izuba' },
        ],
      },
      {
        id: 'l11_2',
        title: 'Sky & Elements',
        titleKiny: 'Ikirere n\'Ibicu',
        description: 'Clouds, thunder, and wind',
        xpReward: 12,
        exercises: [
          { id: 'e1', type: 'multiple_choice', question: 'What is "Ibicu"?', options: ['Cloud', 'Star', 'Moon', 'Fire'], answer: 'Cloud', audioWord: 'Ibicu' },
          { id: 'e2', type: 'multiple_choice', question: 'What is "Inkuba"?', options: ['Thunder', 'Breeze', 'Shade', 'Dust'], answer: 'Thunder', audioWord: 'Inkuba' },
          { id: 'e3', type: 'multiple_choice', question: 'What is "Umurabyo"?', options: ['Lightning', 'Drought', 'River', 'Fog'], answer: 'Lightning', audioWord: 'Umurabyo' },
          { id: 'e4', type: 'multiple_choice', question: 'What is "Umwuka"?', options: ['Wind', 'Stone', 'Grass', 'Sand'], answer: 'Wind', audioWord: 'Umwuka' },
          { id: 'e5', type: 'word_match', question: 'Match the weather words:', pairs: [
            { kiny: 'Imvura', eng: 'Rain' },
            { kiny: 'Izuba', eng: 'Sun' },
            { kiny: 'Ibicu', eng: 'Cloud' },
            { kiny: 'Inkuba', eng: 'Thunder' },
          ], answer: 'matched' },
        ],
      },
    ],
  },

  // ── UNIT 12: Culture (Umuco) ─────────────────────────────────
  {
    id: 'unit12',
    title: 'Culture',
    titleKiny: 'Umuco',
    color: '#7C5CBF',
    colorDark: '#5E4494',
    lessons: [
      {
        id: 'l12_1',
        title: 'Rwandan Culture',
        titleKiny: 'Umuco rw',
        description: 'Cultural vocabulary',
        xpReward: 15,
        exercises: [
          { id: 'e1', type: 'multiple_choice', question: 'What is "Ubuntu"?', options: ['Kindness', 'Humanity', 'Love', 'Peace'], answer: 'Humanity', audioWord: 'Ubuntu' },
          { id: 'e2', type: 'translate', question: 'What is "Ubuvandimwe"?', audioWord: 'Ubuvandimwe', answer: 'Brotherhood/Sisterhood' },
          { id: 'e3', type: 'multiple_choice', question: 'What is "Ubumwe"?', options: ['Unity', 'Peace', 'Love', 'Hope'], answer: 'Unity', audioWord: 'Ubumwe' },
          { id: 'e4', type: 'translate', question: 'What is "Ingoma"?', audioWord: 'Ingoma', answer: 'Drum' },
          { id: 'e5', type: 'multiple_choice', question: 'What is "Inyambo"?', options: ['Cow', 'Goat', 'Sheep', 'Horse'], answer: 'Cow', audioWord: 'Inyambo', hint: 'Sacred long-horn cow' },
        ],
      },
      {
        id: 'l12_2',
        title: 'Heritage & Music',
        titleKiny: 'Umurage n\'Inanga',
        description: 'Music, hills, and peace',
        xpReward: 15,
        exercises: [
          { id: 'e1', type: 'multiple_choice', question: 'What is "Amahoro"?', options: ['Peace', 'Song', 'Dance', 'Crown'], answer: 'Peace', audioWord: 'Amahoro' },
          { id: 'e2', type: 'multiple_choice', question: 'What is "Inanga"?', options: ['Rwandan harp', 'Spear', 'Pottery', 'Mat'], answer: 'Rwandan harp', audioWord: 'Inanga' },
          { id: 'e3', type: 'multiple_choice', question: 'What is "Umurage"?', options: ['Heritage', 'Market', 'Season', 'Bridge'], answer: 'Heritage', audioWord: 'Umurage' },
          { id: 'e4', type: 'multiple_choice', question: 'What is "Imisozi"?', options: ['Hills', 'Lakes', 'Valleys', 'Plains'], answer: 'Hills', audioWord: 'Imisozi' },
          { id: 'e5', type: 'word_match', question: 'Match the cultural words:', pairs: [
            { kiny: 'Amahoro', eng: 'Peace' },
            { kiny: 'Ubumwe', eng: 'Unity' },
            { kiny: 'Ingoma', eng: 'Drum' },
            { kiny: 'Umurage', eng: 'Heritage' },
          ], answer: 'matched' },
        ],
      },
    ],
  },

  // ── UNIT 13: Useful Phrases (Ijambo) ─────────────────────────
  {
    id: 'unit13',
    title: 'Useful Phrases',
    titleKiny: 'Ijambo',
    color: '#A34A5E',
    colorDark: '#7E3A49',
    lessons: [
      {
        id: 'l13_1',
        title: 'Everyday Phrases',
        titleKiny: 'Ijambo y\'Umunsi',
        description: 'Daily conversation phrases',
        xpReward: 12,
        exercises: [
          { id: 'e1', type: 'multiple_choice', question: 'How do you say "Please / I ask"?', options: ['Ndasaba', 'Ndabasha', 'Ndabona', 'Ndashaka'], answer: 'Ndasaba' },
          { id: 'e2', type: 'translate', question: 'Translate: "Ndasaba"', audioWord: 'Ndasaba', answer: 'Please / I ask' },
          { id: 'e3', type: 'multiple_choice', question: 'How do you say "Excuse me / Sorry"?', options: ['Murakoze', 'Mbabarira', 'Murabeho', 'Muraho'], answer: 'Mbabarira' },
          { id: 'e4', type: 'translate', question: 'Translate: "Ni byiza"', audioWord: 'Ni byiza', answer: 'It is good' },
          { id: 'e5', type: 'multiple_choice', question: 'How do you say "I don\'t understand"?', options: ['Ndabonye', 'Sindabona', 'Sindabonye', 'Ndayumva'], answer: 'Sindabonye' },
        ],
      },
      {
        id: 'l13_2',
        title: 'Asking Questions',
        titleKiny: 'Kubaza Ibibazo',
        description: 'How to ask questions',
        xpReward: 12,
        exercises: [
          { id: 'e1', type: 'multiple_choice', question: 'What is "Ese"?', options: ['Is it?', 'How many', 'Who', 'When'], answer: 'Is it?', audioWord: 'Ese' },
          { id: 'e2', type: 'translate', question: 'What is "Kubera iki?"', audioWord: 'Kubera iki', answer: 'Why?' },
          { id: 'e3', type: 'multiple_choice', question: 'What is "Hehe?"', options: ['When', 'Where', 'Who', 'What'], answer: 'Where', audioWord: 'Hehe' },
          { id: 'e4', type: 'multiple_choice', question: 'What is "Ikihe?"', options: ['Why', 'Which one?', 'Who', 'How many'], answer: 'Which one?', audioWord: 'Ikihe' },
        ],
      },
    ],
  },

  // ── UNIT 14: Home & Daily Life (Urumuri) ─────────────────────
  {
    id: 'unit14',
    title: 'Home & Daily Life',
    titleKiny: 'Urumuri',
    color: '#2F9E6E',
    colorDark: '#257A57',
    lessons: [
      {
        id: 'l14_1',
        title: 'House Vocabulary',
        titleKiny: 'Mu Nzu',
        description: 'House and furniture',
        xpReward: 12,
        exercises: [
          { id: 'e1', type: 'multiple_choice', question: 'What is "Icyumba"?', options: ['Kitchen', 'Room', 'Bathroom', 'Door'], answer: 'Room', audioWord: 'Icyumba' },
          { id: 'e2', type: 'multiple_choice', question: 'What is "Urugi"?', options: ['Roof', 'Door', 'Wall', 'Floor'], answer: 'Door', audioWord: 'Urugi' },
          { id: 'e3', type: 'multiple_choice', question: 'What is "Idirishya"?', options: ['Window', 'Table', 'Chair', 'Bed'], answer: 'Window', audioWord: 'Idirishya' },
          { id: 'e4', type: 'multiple_choice', question: 'What is "Intebe"?', options: ['Window', 'Table', 'Chair', 'Bed'], answer: 'Chair', audioWord: 'Intebe' },
          { id: 'e5', type: 'multiple_choice', question: 'What is "Ameza"?', options: ['Book', 'Pen', 'Paper', 'Table'], answer: 'Table', audioWord: 'Ameza' },
        ],
      },
      {
        id: 'l14_2',
        title: 'Living Spaces',
        titleKiny: 'Mu Rugo',
        description: 'Rooms and household items',
        xpReward: 12,
        exercises: [
          { id: 'e1', type: 'multiple_choice', question: 'What is "Inzu"?', options: ['House', 'Road', 'Tree', 'Car'], answer: 'House', audioWord: 'Inzu' },
          { id: 'e2', type: 'multiple_choice', question: 'What is "Uruganiriro"?', options: ['Living room', 'Garden', 'Roof', 'Fence'], answer: 'Living room', audioWord: 'Uruganiriro' },
          { id: 'e3', type: 'multiple_choice', question: 'What is "Umusambi"?', options: ['Carpet', 'Window', 'Ceiling', 'Lamp'], answer: 'Carpet', audioWord: 'Umusambi' },
          { id: 'e4', type: 'multiple_choice', question: 'What is "Isanduku"?', options: ['Box', 'Chair', 'Cup', 'Plate'], answer: 'Box', audioWord: 'Isanduku' },
          { id: 'e5', type: 'word_match', question: 'Match the home words:', pairs: [
            { kiny: 'Inzu', eng: 'House' },
            { kiny: 'Urugi', eng: 'Door' },
            { kiny: 'Intebe', eng: 'Chair' },
            { kiny: 'Ameza', eng: 'Table' },
          ], answer: 'matched' },
        ],
      },
    ],
  },
];

// Helper functions
export const getLessonById = (id: string): Lesson | undefined => {
  for (const unit of units) {
    const lesson = unit.lessons.find((l) => l.id === id);
    if (lesson) return lesson;
  }
  return undefined;
};

export const getUnitForLesson = (lessonId: string): Unit | undefined => {
  for (const unit of units) {
    if (unit.lessons.some((l) => l.id === lessonId)) return unit;
  }
  return undefined;
};

export const getTotalLessons = (): number => {
  return units.reduce((sum, unit) => sum + unit.lessons.length, 0);
};

export const getTotalExercises = (): number => {
  return units.reduce(
    (sum, unit) =>
      sum + unit.lessons.reduce((lSum, lesson) => lSum + lesson.exercises.length, 0),
    0
  );
};
