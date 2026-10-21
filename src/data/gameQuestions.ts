export interface GameQuestion {
  id: string;
  question: string;
  questionKiny: string;
  options: string[];
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

// Traditional Ibisakuzo Riddles from the PDF
const ibisakuzoRiddles: { question: string; answer: string }[] = [
  // Easy Riddles
  { question: 'Nagutera icyambuka amazi kitagira amaguru', answer: 'IJWI' },
  { question: 'Hagarara hakuno, mpagare hakurya turate abeza', answer: 'AMENYO' },
  { question: 'Hakurya ni umukoki, hakuno ni umukoki', answer: 'IKIBUNO' },
  { question: 'Nshinze umwe ndasakara', answer: 'ICYOBO' },
  { question: 'Inka yanjye nyikama igaramye', answer: 'UMUVURE' },
  { question: 'Twavamo umwe ntitwarya', answer: 'ISHYIGA' },
  { question: 'Mutamu irabyina mu gatabire', answer: 'IMBWA MU MASINDE' },
  { question: 'Nkubise urushyi rurumira', answer: 'IBARA RY\'INKA' },
  { question: 'Sogokuru aryoha aboze', answer: 'UMUNEKE' },
  { question: 'Ruganzu araguye n\'ingabo ze', answer: 'IGITOKI' },
  
  // Medium Riddles
  { question: 'Abakobwa banjye barara bahagaze bwacya bakaryama', answer: 'IMYUGARIRO' },
  { question: 'Nagutera nakwiteguye', answer: 'GUSITARA' },
  { question: 'Icyo nsasira ntikirame', answer: 'IKAWA' },
  { question: 'Nagutera ruganwa iganira n\'abantu', answer: 'TEREFONI' },
  { question: 'Abana b\'Umwami bicaye ku ntebe imwe', answer: 'INTOKI KU BIGANZA' },
  { question: 'Ndi kagufi nahina so', answer: 'ICYANZU' },
  { question: 'Aka kariza so', answer: 'AKANYARIRAJISHO' },
  { question: 'Karatembashyashya', answer: 'AMAZI KU ITEKE' },
  { question: 'Hari agate utakurira', answer: 'UMUNYERERI' },
  { question: 'Nicaye iwacu murika isi', answer: 'IZUBA' },
  
  // Hard Riddles
  { question: 'Nagiye mu rutoki nsimbuka abapfumu bapfuye', answer: 'IMITUMBA' },
  { question: 'Ni iki cyatanze umuzungu kwambara karuvati', answer: 'ICYIYONI' },
  { question: 'Nagiye I Kigali ndi umusenzi ngaruka ndi umuzungu', answer: 'IGITOKI CYA KAMARA' },
  { question: 'Dore abakobwa berekana amabere', answer: 'AMAPAPAYI' },
  { question: 'Mira isupu nkasiga inyama', answer: 'IBIKONGORWA BY\'IBISHEKE' },
  { question: 'Nicaye iwanjye nzengururka isi yose', answer: 'TELEVIZIYO' },
  { question: 'Mfite icyumba gihora gikonje', answer: 'FIRIGO' },
  { question: 'Kiribwa kidahingwa', answer: 'INYAMA' },
  { question: 'Mfite ibuye rimena irindi', answer: 'INYUNDO' },
  { question: 'Ntuye heza njye ngira Imana', answer: 'UMUGINA WO MU GISHANGA' },
  
  // More Easy Riddles
  { question: 'Mpambye umwe nzura benshi', answer: 'IGISHYIMBO' },
  { question: 'Ngenda bwangu nkogoga amahanga', answer: 'INDEGE' },
  { question: 'Kigenda cyane kitagira amaguru', answer: 'UMUYAGA' },
  { question: 'Gitare n\'iyayo birakina', answer: 'IJURU N\'UKWEZI' },
  { question: 'Giteye isusumira', answer: 'URUZI' },
  { question: 'Dore iryo shyamba ritabona', answer: 'UMUSATSI W\'INTABWA' },
  { question: 'Wambazaga ibyo uzi kubera iki', answer: 'UMWARIMU' },
  { question: 'Iryo mvuze rihama mu gihugu', answer: 'IJAMBO RYA PEREZIDA' },
  { question: 'Amazi yacu arusha ay\'ahandi kuryoha', answer: 'AMATA' },
  { question: 'Ubutaka bw\'iwacu turabuteka', answer: 'IFU' },
  
  // More Medium Riddles
  { question: 'Icwende ryange iyo riba bugufi mba ngukoreyemo', answer: 'UKWEZI' },
  { question: 'Mfite inka yanjye nyiragira ku manga ntitembe', answer: 'AMATWI' },
  { question: 'Abasore b\'i Gisaka barasa n\'abakiri bato', answer: 'ISUSA' },
  { question: 'Akababaje umugabo kamurenza impinga', answer: 'IFARANGA' },
  { question: 'Zisa zitagira isano', answer: 'INKOKO N\'INKWARE' },
  { question: 'Umuzungu atwara imodoka umusatsi uri hanze', answer: 'IKIGORI' },
  { question: 'Nteye agapira kagera I Roma', answer: 'IBARUWA' },
  { question: 'Inka yanjye irishiriza mu mishito igataha mu mishito', answer: 'URURIMI' },
  { question: 'Inkuba ikubita ikwerekejeho umugongo', answer: 'UMUHETO' },
  { question: 'Ino karahari na Kongo karahari', answer: 'IFARANGA' },
  
  // More Hard Riddles
  { question: 'Ninjye muzindutsi wa cyane nasanze umuzimu yicariye ukuguru', answer: 'INKWARE' },
  { question: 'Nubatse urugo hejuru y\'urupfu', answer: 'UBWATO HEJURU Y\'IKIYAGA' },
  { question: 'Ruvudukana imbaraga, rukavumera rutagira amahembe', answer: 'IMODOKA' },
  { question: 'Zishotse zitendeje, zikuka ziteye hejuru', answer: 'ABAVOMYI' },
  { question: 'Ndi mugufi nahina So', answer: 'ICYANZU' },
  { question: 'Icwende ryanjye ribaye kure mba ngukoreyemo', answer: 'UKWEZI' },
  { question: 'Mugongo mugari mpekera abana', answer: 'UBURIRI' },
  { question: 'Mpagaze mu Rwanda ndeba mu mahanga', answer: 'TELEVIZIYO' },
  { question: 'Nagutera inyamaswa igendesha amaguru 4 mu gitondo, amaguru 2 saa sita n\'amaguru 3 nimugoroba', answer: 'UMUNTU' },
  { question: 'Nkubise urushyi rurumira', answer: 'IBARA RY\'INKA' },
];

// Convert to GameQuestion format
const convertToGameQuestions = (): GameQuestion[] => {
  return ibisakuzoRiddles.map((riddle, index) => {
    // Generate wrong options
    const allAnswers = ibisakuzoRiddles.map(r => r.answer);
    const wrongOptions = allAnswers
      .filter(a => a !== riddle.answer)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    // Shuffle options
    const options = [...wrongOptions, riddle.answer].sort(() => Math.random() - 0.5);
    
    // Determine difficulty based on index
    let difficulty: 'easy' | 'medium' | 'hard' = 'easy';
    if (index >= 20 && index < 40) difficulty = 'medium';
    if (index >= 40) difficulty = 'hard';
    
    // Determine category
    const categories = ['Traditional', 'Animals', 'Nature', 'Food', 'Culture', 'People'];
    const category = categories[index % categories.length];
    
    return {
      id: `ibisakuzo_${index + 1}`,
      question: `What is the answer to this Ibisakuzo?\n\n"${riddle.question}"`,
      questionKiny: riddle.question,
      options,
      answer: riddle.answer,
      difficulty,
      category,
    };
  });
};

export const gameQuestions: GameQuestion[] = convertToGameQuestions();

// Get random questions
export const getRandomQuestions = (count: number, difficulty?: string): GameQuestion[] => {
  let filtered = [...gameQuestions];
  if (difficulty) {
    filtered = filtered.filter(q => q.difficulty === difficulty);
  }
  // Shuffle
  for (let i = filtered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
  }
  return filtered.slice(0, count);
};

// Get AI answer (simulated)
export const getAIAnswer = (question: GameQuestion): string => {
  // AI has 70% chance of correct answer
  const isCorrect = Math.random() < 0.7;
  if (isCorrect) {
    return question.answer;
  }
  // Return random wrong answer
  const wrongOptions = question.options.filter(o => o !== question.answer);
  return wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
};
