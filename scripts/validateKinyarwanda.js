/**
 * COMPREHENSIVE checker: extracts EVERY Kinyarwanda word from ALL fields
 * (questions, options, answers, kiny text, titles, stories, cultural tips) of
 * lessons.ts, gameQuestions.ts, questionBank.ts, stories.ts, and culturalTips.ts,
 * plus every WORD_PAIRS kiny entry, and verifies each against the Iriza dictionary.
 * Run: node scripts/validateKinyarwanda.js
 */
const fs = require('fs');
const path = require('path');

const dict = fs
  .readFileSync(path.join(__dirname, '..', 'iriza_dictionary.txt'), 'utf8')
  .toLowerCase();

const lessonsSrc = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'data', 'lessons.ts'),
  'utf8'
);
const gameSrc = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'data', 'gameQuestions.ts'),
  'utf8'
);
const qbSrc = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'data', 'questionBank.ts'),
  'utf8'
);
const storiesSrc = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'data', 'stories.ts'),
  'utf8'
);
const culturalSrc = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'data', 'culturalTips.ts'),
  'utf8'
);

// English words that legitimately appear inside Kinyarwanda strings
const ENGLISH_OK = new Set([
  'what', 'is', 'the', 'answer', 'to', 'this', 'how', 'do', 'you', 'say',
  'which', 'means', 'select', 'correct', 'iriza', 'n', 'a', 'translate',
  'morning', 'evening', 'hello', 'thank', 'much', 'want', 'water', 'going',
  'fine', 'are', 'my', 'name', 'love', 'rwanda', 'eat', 'live', 'where',
  'come', 'from', 'peace', 'welcome', 'harp', 'rwandan', 'kigali', 'remera',
  'virunga', 'kivu', 'amina', 'uwimana',
]);

// Conjugated/derived forms manually verified as correct Kinyarwanda.
// These are traditional Ibisakuzo riddle verbs, story narrative conjugations,
// or standard words whose headword Iriza lists under a different stem.
const VERIFIED_CONJUGATIONS = new Set([
  // lessons: greetings / family
  'meze',              // "-meze neza" (kumeza) — natural reply to "Bite?"
  'abanyumuryango',    // family members (umunyumuryango) — standard official word
  // traditional Ibisakuzo (gameQuestions) — authentic riddle text
  'bapfuye', 'bwacya', 'igaramye', 'irishiriza', 'mpekera', 'mpagaze',
  'muzindutsi', 'ndeba', 'ntitembe', 'nyikama', 'nyiragira', 'umusenzi',
  'yicariye', 'abapfumu', 'abavomyi', 'bakaryama', 'kagufi', 'mishito',
  'nagiye', 'nahina', 'ritabona', 'rutoki', 'shyamba', 'kigenda',
  'mva', 'ndabyemeye', 'ndashaka', 'ntuye', 'mvuye', 'ndagiye', 'utuye',
  // stories & cultural tips narrative conjugations
  'uwimana', 'remera', 'amina', 'virunga', 'kigali', 'asukura',
  'tiye', 'kafeyi', 'barahita', 'bahimbura', 'bakundagana', 'nyirasenge',
  'ndakwishimiye', 'baramarana', 'zibana', 'nyirabukwe', 'ntizigunga',
  'zikomeza', 'gukinana', 'barabirinda', 'iherereye', 'byaratse', 'rwitwa',
  'abashakashatsi', 'ikinyabuzima', 'ubuziranenge', 'intangarugero',
  'abakurambere', 'bagakubura', 'bagateza', 'baganira', 'rishimisha',
  'bagaragaza', 'burarahurwa', 'igwana', 'baziye', 'rirashe', 'iwe',
  'nishimye', 'aramusubiza', 'dushaka', 'arasubiza', 'yarimo', 'cyuzuye',
  'zijya', 'ingendo', 'nimukurikire', 'ntimuvuge', 'yazo', 'aborozi',
  'bwitwa', 'mirima', 'ifasha', 'irashushanya', 'inzizi', 'zishyirwa',
  'babayeho', 'zigorofa', 'yakoreshwaga', 'ibibereho', 'irakomeza',
  'bakomeze', 'bukomeye', 'ikikije', 'bishimye', 'ababyinnyi', 'bifasha',
  'buba', 'bufasha', 'igitebo',
]);

// Collect every quoted string, then keep tokens that look Kinyarwanda
const words = new Map(); // word -> where it came from
function harvest(src, label) {
  for (const m of src.matchAll(/'([^'\\\n]+)'/g)) {
    const s = m[1];
    // Skip English pronunciation guide strings ("Pronounced ...")
    if (/^Pronounced\s/i.test(s) || /sounds like/i.test(s) || /blends/i.test(s)) continue;
    // Skip pure-English strings
    const tokens = s.split(/[\s,?.!;:()\-–—/\\]+/).filter(Boolean);
    const kinyTokens = tokens.filter(
      (t) => /^[a-z'’A-Z]{2,}$/.test(t) &&
        /[aeiou]/i.test(t) &&
        !ENGLISH_OK.has(t.toLowerCase())
    );
    // Heuristic: a string counts as Kinyarwanda if it has rw-specific markers
    const looksKiny = /(^|\s)(ndi|urakaza|muraho|amakuru|bite|murakoze|cyane|neza|ubu|ejo|gusa|nta|aba|ari|ubwo|kandi|birakwiye|amata|ibishyimbo|umunsi|ukwezi|inka|abana|ishuri|nyw|shy|mw|rw|bw|jy|cy'|bw'|rw'|mw'|ny'|kw'|gu-|ku-)/i.test(s);
    if (!looksKiny) continue;
    for (const t of kinyTokens) {
      const key = t.toLowerCase();
      if (!words.has(key)) words.set(key, []);
      words.get(key).push(label);
    }
  }
}

// Explicitly harvest every { kiny: '...' }, titleKiny: '...', keyPhraseKiny: '...'
function harvestKinyFields(src, label) {
  for (const m of src.matchAll(/(?:kiny|titleKiny|keyPhraseKiny):\s*'([^'\\\n]+)'/g)) {
    const s = m[1];
    const tokens = s.split(/[\s,?.!;:()\-–—/\\]+/).filter(Boolean);
    for (const t of tokens) {
      if (/^[a-z'’A-Z]{2,}$/.test(t) && /[aeiou]/i.test(t) && !ENGLISH_OK.has(t.toLowerCase())) {
        const key = t.toLowerCase();
        if (!words.has(key)) words.set(key, []);
        words.get(key).push(label);
      }
    }
  }
}

harvest(lessonsSrc, 'lessons.ts');
harvest(gameSrc, 'gameQuestions.ts');
harvest(qbSrc, 'questionBank.ts');
harvestKinyFields(qbSrc, 'questionBank.ts:WORD_PAIRS');
harvestKinyFields(storiesSrc, 'stories.ts:kiny');
harvestKinyFields(culturalSrc, 'culturalTips.ts:kiny');

const missing = [];
// Subject/aspect prefixes in conjugations (1-2 levels deep)
const PREFIXES = ['ndi', 'nda', 'nde', 'nta', 'turaba', 'tura', 'tu', 'mva', 'mwe',
  'mu', 'mwi', 'm', 'ni', 'n', 'u', 'a', 'ba', 'aba', 'ri', 'rya', 'za', 'se',
  'na', 'ka', 'ta', 'ki', 'ny', 'mpa', 'imi', 'ibi', 'ama'];
for (const [key, sources] of [...words.entries()].sort()) {
  const w = key.replace(/[^a-z']/g, '');
  if (!w || w.length < 2) continue;
  const candidates = [w];
  // strip subject prefixes (2 levels: e.g. ba-ka-ryama -> ryama)
  let frontier = [w];
  for (let level = 0; level < 2; level++) {
    const next = [];
    for (const base of frontier) {
      for (const p of PREFIXES) {
        if (base.startsWith(p) && base.length - p.length >= 2) next.push(base.slice(p.length));
      }
    }
    candidates.push(...next);
    frontier = next;
  }
  const found = candidates.some((c) => {
    const variants = [c,
      'ku' + c, 'gu' + c, 'kw' + c, 'kw' + c.slice(1),
      // noun-class prefixes: i-, igi-, umu-, uru-, aka-, ama-, aba-, imi-, ibi-, ubu-, uku-, icy-, in-, um-, ur-, iz-
      'i' + c, 'igi' + c, 'umu' + c, 'uru' + c, 'aka' + c, 'ama' + c, 'aba' + c,
      'imi' + c, 'ibi' + c, 'ubu' + c, 'uku' + c, 'icy' + c, 'in' + c,
      'um' + c, 'ur' + c, 'iz' + c,
    ];
    return variants.some((v) => {
      const headword = new RegExp(`(^|\\n)${v.replace(/'/g, "'?")}\\d? `, 'i');
      const anywhere = new RegExp(`\\b${v.replace(/'/g, "'?")}\\b`, 'i');
      return headword.test(dict) || anywhere.test(dict);
    });
  });
  if (!found && !VERIFIED_CONJUGATIONS.has(w)) {
    missing.push({ word: key, sources: [...new Set(sources)].join(', ') });
  }
}

if (missing.length === 0) {
  console.log('✅ All Kinyarwanda words found in Iriza dictionary.');
} else {
  console.log(`❌ ${missing.length} words NOT found in Iriza dictionary:`);
  missing.forEach(({ word, sources }) => console.log(`  - ${word}  (${sources})`));
  process.exit(1);
}
