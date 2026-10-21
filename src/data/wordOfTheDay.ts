export interface WordOfTheDay {
  kiny: string;
  english: string;
  pronunciation: string;
  example: string;
  exampleTranslation: string;
  category: string;
}

const words: WordOfTheDay[] = [
  { kiny: 'Amahoro', english: 'Peace', pronunciation: 'a-ma-HO-ro', example: 'Amahoro muri leta yose.', exampleTranslation: 'Peace in every home.', category: 'Values' },
  { kiny: 'Ubumwe', english: 'Unity', pronunciation: 'u-BU-mwe', example: 'Ubumwe bufasha igihugu.', exampleTranslation: 'Unity helps the country.', category: 'Values' },
  { kiny: 'Ingagi', english: 'Gorilla', pronunciation: 'i-NGA-gi', example: 'Ingagi zibera mu mashyamba.', exampleTranslation: 'Gorillas live in forests.', category: 'Animals' },
  { kiny: 'Imisozi', english: 'Hills', pronunciation: 'i-mi-SO-zi', example: 'U Rwanda rufite imisozi myinshi.', exampleTranslation: 'Rwanda has many hills.', category: 'Nature' },
  { kiny: 'Kwiga', english: 'To learn', pronunciation: 'KWI-ga', example: 'Ndashaka kwiga Ikinyarwanda.', exampleTranslation: 'I want to learn Kinyarwanda.', category: 'Verbs' },
  { kiny: 'Umuryango', english: 'Family', pronunciation: 'u-mu-RYAN-go', example: 'Umuryango wanjye ni wo munziza.', exampleTranslation: 'My family is the most beautiful.', category: 'Family' },
  { kiny: 'Ishuli', english: 'School', pronunciation: 'i-SHU-li', example: 'Abana biga mu ishuli.', exampleTranslation: 'Children study at school.', category: 'Places' },
  { kiny: 'Akazi', english: 'Work / Job', pronunciation: 'a-KA-zi', example: 'Ndafite akazi keza.', exampleTranslation: 'I have a good job.', category: 'Work' },
  { kiny: 'Gutura', english: 'To live/settle', pronunciation: 'gu-TU-ra', example: 'Ntuye i Kigali.', exampleTranslation: 'I live in Kigali.', category: 'Verbs' },
  { kiny: 'Inzira', english: 'Road / Path', pronunciation: 'i-NZI-ra', example: 'Inzira ni nziza cyane.', exampleTranslation: 'The road is very good.', category: 'Travel' },
  { kiny: 'Ubutumwa', english: 'Message', pronunciation: 'u-bu-TU-mwa', example: 'Nawe ubutumwa bwiza.', exampleTranslation: 'You have a good message.', category: 'Communication' },
  { kiny: 'Gukunda', english: 'To love', pronunciation: 'gu-KUN-da', example: 'Ndakunda u Rwanda.', exampleTranslation: 'I love Rwanda.', category: 'Emotions' },
  { kiny: 'Icyeza', english: 'Light / Clarity', pronunciation: 'i-CIYE-za', example: 'Icyeza cy\'izuba kirahije.', exampleTranslation: 'The sunlight is beautiful.', category: 'Nature' },
  { kiny: 'Urukundo', english: 'Love', pronunciation: 'u-ru-KUN-do', example: 'Urukundo ni ingirakamaro.', exampleTranslation: 'Love is important.', category: 'Emotions' },
  { kiny: 'Agatoki', english: 'Finger', pronunciation: 'a-ga-TO-ki', example: 'Agatoki kanjye gakomeye.', exampleTranslation: 'My finger is strong.', category: 'Body' },
  { kiny: 'Ubwoko', english: 'Type / Kind', pronunciation: 'u-BWO-ko', example: 'Ubwoko bw\'imbuto ni bwinshi.', exampleTranslation: 'There are many types of fruits.', category: 'General' },
  { kiny: 'Inkuru', english: 'Story / News', pronunciation: 'i-NKU-ru', example: 'Inkuru nziza igwa buri munsi.', exampleTranslation: 'Good news comes every day.', category: 'Communication' },
  { kiny: 'Umugeni', english: 'Guest / Bride', pronunciation: 'u-mu-GE-ni', example: 'Umugeni aramutswa neza.', exampleTranslation: 'The guest is greeted well.', category: 'Social' },
  { kiny: 'Gukiranuka', english: 'To be righteous', pronunciation: 'gu-ki-ra-NU-ka', example: 'Gukiranuka ni ingirakamaro.', exampleTranslation: 'Being righteous is important.', category: 'Values' },
  { kiny: 'Inyota', english: 'Thirst', pronunciation: 'i-NYO-ta', example: 'Mfite inyota ndashaka amazi.', exampleTranslation: 'I am thirsty, I want water.', category: 'Body' },
  { kiny: 'Amafaranga', english: 'Money', pronunciation: 'a-ma-fa-RAN-ga', example: 'Mfite amafaranga make.', exampleTranslation: 'I have little money.', category: 'Commerce' },
  { kiny: 'Imbuto', english: 'Fruit / Seed', pronunciation: 'i-MBU-to', example: 'Imbuto z\'igitoki ni nziza.', exampleTranslation: 'Banana fruits are good.', category: 'Food' },
  { kiny: 'Uburyo', english: 'Way / Method', pronunciation: 'u-BU-ryo', example: 'Ni uburyo bwiza bwo kwiga.', exampleTranslation: 'It is a good way to learn.', category: 'General' },
  { kiny: 'Gutuza', english: 'To settle down', pronunciation: 'gu-TU-za', example: 'Baratuza mu cyaro.', exampleTranslation: 'They settle in the countryside.', category: 'Verbs' },
  { kiny: 'Ubukangurambaga', english: 'Awareness/Advocacy', pronunciation: 'u-bu-kan-gu-RAM-ba-ga', example: 'Ubukangurambaga bufasha abantu.', exampleTranslation: 'Advocacy helps people.', category: 'Values' },
  { kiny: 'Umuco', english: 'Culture / Tradition', pronunciation: 'u-MU-co', example: 'Umuco w\'u Rwanda ni muzima.', exampleTranslation: 'Rwanda\'s culture is rich.', category: 'Culture' },
  { kiny: 'Gutura', english: 'To live / reside', pronunciation: 'gu-TU-ra', example: 'Atuye mu nzu nziza.', exampleTranslation: 'He lives in a beautiful house.', category: 'Verbs' },
  { kiny: 'Ikinyarwanda', english: 'Kinyarwanda language', pronunciation: 'i-ki-nya-RWAN-da', example: 'Ndiga Ikinyarwanda buri munsi.', exampleTranslation: 'I study Kinyarwanda every day.', category: 'Language' },
  { kiny: 'Inyange', english: 'Crane bird (symbol)', pronunciation: 'i-NYAN-ge', example: 'Inyange ni inyoni y\'u Rwanda.', exampleTranslation: 'The crane is the bird of Rwanda.', category: 'Culture' },
  { kiny: 'Umurage', english: 'Heritage / Legacy', pronunciation: 'u-mu-RA-ge', example: 'Umurage wacu ni ingirakamaro.', exampleTranslation: 'Our heritage is important.', category: 'Culture' },
];

export const getWordOfTheDay = (): WordOfTheDay => {
  // Use day-of-year as seed for consistent daily word
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return words[dayOfYear % words.length];
};
