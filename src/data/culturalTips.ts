export interface CulturalTip {
  id: string;
  category: 'traditions' | 'values' | 'customs';
  title: string;
  titleKiny: string;
  kinyPhrase: string;
  engTranslation: string;
  summary: string;
  unitId?: string;
}

export const culturalTips: CulturalTip[] = [
  {
    id: 'ct_1',
    category: 'traditions',
    title: 'Gorilla Naming Ceremony',
    titleKiny: 'Kwita Izina',
    kinyPhrase: 'Ingagi ni umurage wacu',
    engTranslation: 'Gorillas are our heritage',
    summary:
      'Inspired by the ancient Rwandan tradition of naming a newborn child in the presence of family and friends, Kwita Izina celebrates every baby mountain gorilla born in the Virunga massif.',
    unitId: 'unit6',
  },
  {
    id: 'ct_2',
    category: 'traditions',
    title: 'National Harvest Thanksgiving',
    titleKiny: 'Umuganura',
    kinyPhrase: 'Umuganura ni isoko y\'ubumwe',
    engTranslation: 'Umuganura is a source of unity',
    summary:
      'Celebrated in August, Umuganura is a centuries-old festival of thanksgiving where families and communities share the first harvest, milk, and cultural performances.',
    unitId: 'unit5',
  },
  {
    id: 'ct_3',
    category: 'traditions',
    title: 'Ancestral Proverbs & Riddles',
    titleKiny: 'Imigani n\'Ibisakuzo',
    kinyPhrase: 'Ubwenge burarahurwa',
    engTranslation: 'Wisdom is shared like fire from a neighbor',
    summary:
      'Evening storytelling in Rwanda traditionally begins with Ibisakuzo ("Sakwe sakwe!" — "Soma!") to sharpen children\'s wit, memory, and command of poetic Kinyarwanda.',
    unitId: 'unit12',
  },
  {
    id: 'ct_4',
    category: 'values',
    title: 'Noble Character & Integrity',
    titleKiny: 'Ubupfura',
    kinyPhrase: 'Ubupfura buba mu mutima',
    engTranslation: 'Nobility lives in the heart',
    summary:
      'Ubupfura represents grace, honesty, kindness, and emotional composure—qualities deeply admired in everyday Kinyarwanda speech and social life.',
    unitId: 'unit12',
  },
  {
    id: 'ct_5',
    category: 'values',
    title: 'Self-Worth & Dignity',
    titleKiny: 'Agaciro',
    kinyPhrase: 'Agaciro k\'umuntu ni umutima mwiza',
    engTranslation: 'A person\'s dignity is a good heart',
    summary:
      'Agaciro means dignity and self-respect. In Kinyarwanda culture, treating others with respect (kubaha) affirms both their agaciro and your own.',
    unitId: 'unit13',
  },
  {
    id: 'ct_6',
    category: 'values',
    title: 'Unity & Mutual Support',
    titleKiny: 'Ubumwe',
    kinyPhrase: 'Ubumwe n\'amahoro',
    engTranslation: 'Unity and peace',
    summary:
      'Ubumwe (unity) is a foundational Rwandan value reflected in community life, from mutual aid among neighbors to national community work.',
    unitId: 'unit1',
  },
  {
    id: 'ct_7',
    category: 'customs',
    title: 'The Sacred Gift of Milk',
    titleKiny: 'Amata n\'Inka',
    kinyPhrase: 'Amata ni umugisha mu rugo',
    engTranslation: 'Milk is a blessing in the home',
    summary:
      'Cattle (Inka) and fresh milk (Amata) hold a revered place in Rwandan hospitality. Offering milk to a guest is one of the highest expressions of warmth and friendship.',
    unitId: 'unit5',
  },
  {
    id: 'ct_8',
    category: 'customs',
    title: 'Warm Greetings & Respect',
    titleKiny: 'Gusuhuza mu Kinyarwanda',
    kinyPhrase: 'Mwaramutse neza',
    engTranslation: 'Good morning to you',
    summary:
      'Greetings in Rwanda are never rushed. Asking "Amakuru?" (How is the news?) and listening warmly before starting business shows genuine care.',
    unitId: 'unit1',
  },
];

export const getCulturalTips = (): CulturalTip[] => culturalTips;

export const getCulturalTipsByCategory = (
  category: CulturalTip['category']
): CulturalTip[] => culturalTips.filter((t) => t.category === category);

export const getRandomCulturalTip = (unitId?: string): CulturalTip => {
  if (unitId) {
    const matching = culturalTips.filter((t) => t.unitId === unitId);
    if (matching.length > 0) {
      return matching[Math.floor(Math.random() * matching.length)];
    }
  }
  return culturalTips[Math.floor(Math.random() * culturalTips.length)];
};
