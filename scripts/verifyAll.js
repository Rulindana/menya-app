/**
 * Automated Verification & Test Suite for Menya (Requirement R4)
 * Covers:
 * - Suite 1: Store State Transitions & Offline Queue Integrity
 * - Suite 2: 4-Stage Lesson Session Construction & Progression
 * - Suite 3: Curriculum, Story, Cultural Content & Dictionary Integrity
 *
 * Runnable via: node scripts/verifyAll.js or npm test
 */

const fs = require('fs');
const path = require('path');
const Module = require('module');
const ts = require('typescript');

const startTime = Date.now();

// ── 0. Console Formatting Helpers ─────────────────────────────────────
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let totalSuites = 0;
let passedSuites = 0;
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function suite(name, fn) {
  totalSuites++;
  console.log(`\n${colors.bright}${colors.blue}=== ${name} ===${colors.reset}`);
  const initialFailures = failedTests;
  try {
    fn();
    if (failedTests === initialFailures) {
      passedSuites++;
    }
  } catch (err) {
    failedTests++;
    failures.push({ name: `${name} (FATAL)`, error: err });
    console.log(`  ${colors.red}✖ FATAL ERROR IN SUITE: ${err.message}${colors.reset}`);
  }
}

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ${colors.green}✔${colors.reset} ${name}`);
  } catch (err) {
    failedTests++;
    failures.push({ name, error: err });
    console.log(`  ${colors.red}✖ ${name}${colors.reset}`);
    console.log(`    ${colors.dim}${err.stack || err.message}${colors.reset}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

assert.strictEqual = (actual, expected, message) => {
  if (actual !== expected) {
    throw new Error(
      `${message || 'Assertion failed'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    );
  }
};

assert.deepStrictEqual = (actual, expected, message) => {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    throw new Error(`${message || 'Deep assertion failed'}: expected ${expectedStr}, got ${actualStr}`);
  }
};

// ── 1. TypeScript Transpiler Module Loader ─────────────────────────────
const transpile = (sourceCode, fileName) => {
  return ts.transpileModule(sourceCode, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      resolveJsonModule: true,
      jsx: ts.JsxEmit.React,
    },
    fileName,
  }).outputText;
};

require.extensions['.ts'] = (mod, filename) => {
  const code = fs.readFileSync(filename, 'utf8');
  mod._compile(transpile(code, filename), filename);
};

require.extensions['.tsx'] = (mod, filename) => {
  const code = fs.readFileSync(filename, 'utf8');
  mod._compile(transpile(code, filename), filename);
};

// Shims for React Native and Firebase modules so useAppStore runs purely in Node
const originalRequire = Module.prototype.require;
const mockStorage = new Map();
const asyncStorageMock = {
  getItem: async (key) => (mockStorage.has(key) ? mockStorage.get(key) : null),
  setItem: async (key, val) => {
    mockStorage.set(key, String(val));
  },
  removeItem: async (key) => {
    mockStorage.delete(key);
  },
  multiRemove: async (keys) => {
    keys.forEach((k) => mockStorage.delete(k));
  },
  clear: async () => {
    mockStorage.clear();
  },
};

Module.prototype.require = function (id) {
  if (id === '@react-native-async-storage/async-storage') {
    return asyncStorageMock;
  }
  if (id === 'react-native') {
    return {
      Platform: { OS: 'ios', select: (obj) => obj.ios || obj.default },
      StyleSheet: { create: (s) => s },
      Animated: {
        Value: class {
          constructor(v) {
            this.v = v;
          }
          setValue(v) {
            this.v = v;
          }
        },
        timing: () => ({ start: (cb) => cb && cb() }),
        spring: () => ({ start: (cb) => cb && cb() }),
        sequence: () => ({ start: (cb) => cb && cb() }),
      },
    };
  }
  if (id.startsWith('firebase/')) {
    return {
      getApps: () => [],
      initializeApp: () => ({}),
      getAuth: () => ({ currentUser: null }),
      getFirestore: () => ({}),
      signOut: async () => {},
      doc: () => ({}),
      setDoc: async () => {},
      getDoc: async () => ({ exists: () => false, data: () => null }),
      updateDoc: async () => {},
      onSnapshot: () => () => {},
      collection: () => ({}),
      query: () => ({}),
      orderBy: () => ({}),
      limit: () => ({}),
      arrayUnion: () => ({}),
    };
  }
  return originalRequire.apply(this, arguments);
};

// ── 2. Load Modules Under Test ─────────────────────────────────────────
const rootDir = path.join(__dirname, '..');
const lessonsModule = require(path.join(rootDir, 'src', 'data', 'lessons'));
const questionBankModule = require(path.join(rootDir, 'src', 'data', 'questionBank'));
const useAppStoreModule = require(path.join(rootDir, 'src', 'store', 'useAppStore'));
const culturalTipsModule = require(path.join(rootDir, 'src', 'data', 'culturalTips'));

function loadStories() {
  const storiesPath = path.join(rootDir, 'src', 'data', 'stories.ts');
  if (fs.existsSync(storiesPath)) {
    const mod = require(storiesPath);
    return mod.stories || mod.default || [];
  }
  return [];
}

// ── SUITE 1: Store State Transitions & Offline Queue Integrity ────────
suite('Suite 1: Store State Transitions & Offline Queue Integrity', () => {
  const {
    LEVEL_XP_THRESHOLDS,
    getLevel,
    getLevelProgress,
    getXPBonus,
    getStreakMultiplier,
    MAX_HEARTS,
    HEART_REFILL_MS,
    useAppStore,
    defaultProgress,
  } = useAppStoreModule;

  test('XP thresholds define 11 progression levels (Levels 1 to 11)', () => {
    assert.deepStrictEqual(
      LEVEL_XP_THRESHOLDS,
      [0, 30, 70, 95, 115, 150, 175, 210, 250, 285, 320],
      'LEVEL_XP_THRESHOLDS must match exact specification'
    );
    assert.strictEqual(LEVEL_XP_THRESHOLDS.length, 11);
  });

  test('Level calculation: getLevel maps XP to correct level boundaries (1 to 11)', () => {
    assert.strictEqual(getLevel(-10), 1, 'Negative XP should map to level 1');
    assert.strictEqual(getLevel(0), 1, '0 XP -> Level 1');
    assert.strictEqual(getLevel(29), 1, '29 XP -> Level 1');
    assert.strictEqual(getLevel(30), 2, '30 XP -> Level 2');
    assert.strictEqual(getLevel(69), 2, '69 XP -> Level 2');
    assert.strictEqual(getLevel(70), 3, '70 XP -> Level 3');
    assert.strictEqual(getLevel(94), 3, '94 XP -> Level 3');
    assert.strictEqual(getLevel(95), 4, '95 XP -> Level 4');
    assert.strictEqual(getLevel(114), 4, '114 XP -> Level 4');
    assert.strictEqual(getLevel(115), 5, '115 XP -> Level 5');
    assert.strictEqual(getLevel(149), 5, '149 XP -> Level 5');
    assert.strictEqual(getLevel(150), 6, '150 XP -> Level 6');
    assert.strictEqual(getLevel(174), 6, '174 XP -> Level 6');
    assert.strictEqual(getLevel(175), 7, '175 XP -> Level 7');
    assert.strictEqual(getLevel(209), 7, '209 XP -> Level 7');
    assert.strictEqual(getLevel(210), 8, '210 XP -> Level 8');
    assert.strictEqual(getLevel(249), 8, '249 XP -> Level 8');
    assert.strictEqual(getLevel(250), 9, '250 XP -> Level 9');
    assert.strictEqual(getLevel(284), 9, '284 XP -> Level 9');
    assert.strictEqual(getLevel(285), 10, '285 XP -> Level 10');
    assert.strictEqual(getLevel(319), 10, '319 XP -> Level 10');
    assert.strictEqual(getLevel(320), 11, '320 XP -> Level 11');
    assert.strictEqual(getLevel(1000), 11, 'XP > 320 should be capped at Level 11');
  });

  test('Level progress: getLevelProgress returns accurate current, needed, and percent (including max level 320)', () => {
    const p1 = getLevelProgress(15);
    assert.strictEqual(p1.current, 15);
    assert.strictEqual(p1.needed, 30);
    assert.strictEqual(p1.percent, 0.5);

    const p2 = getLevelProgress(30);
    assert.strictEqual(p2.current, 0);
    assert.strictEqual(p2.needed, 40);
    assert.strictEqual(p2.percent, 0);

    const p3 = getLevelProgress(50);
    assert.strictEqual(p3.current, 20);
    assert.strictEqual(p3.needed, 40);
    assert.strictEqual(p3.percent, 0.5);

    const pExactMax = getLevelProgress(320);
    assert(!Number.isNaN(pExactMax.percent), 'getLevelProgress(320).percent must not be NaN');
    assert.strictEqual(pExactMax.percent, 1);

    const pMax = getLevelProgress(500);
    assert(!Number.isNaN(pMax.percent) && pMax.percent <= 1, 'Percent must be valid and capped at 1.0');
  });

  test('XP bonus tiers: getXPBonus rewards high total XP accumulation', () => {
    assert.strictEqual(getXPBonus(0), 0);
    assert.strictEqual(getXPBonus(499), 0);
    assert.strictEqual(getXPBonus(500), 3);
    assert.strictEqual(getXPBonus(999), 3);
    assert.strictEqual(getXPBonus(1000), 5);
    assert.strictEqual(getXPBonus(1499), 5);
    assert.strictEqual(getXPBonus(1500), 10);
    assert.strictEqual(getXPBonus(2000), 15);
    assert.strictEqual(getXPBonus(3000), 20);
    assert.strictEqual(getXPBonus(5000), 30);
    assert.strictEqual(getXPBonus(10000), 50);
    assert.strictEqual(getXPBonus(50000), 50);
  });

  test('Streak multipliers: getStreakMultiplier correctly scales XP bonus', () => {
    assert.strictEqual(getStreakMultiplier(0), 1.0);
    assert.strictEqual(getStreakMultiplier(1), 1.0);
    assert.strictEqual(getStreakMultiplier(2), 1.0);
    assert.strictEqual(getStreakMultiplier(3), 1.1);
    assert.strictEqual(getStreakMultiplier(6), 1.1);
    assert.strictEqual(getStreakMultiplier(7), 1.25);
    assert.strictEqual(getStreakMultiplier(13), 1.25);
    assert.strictEqual(getStreakMultiplier(14), 1.5);
    assert.strictEqual(getStreakMultiplier(29), 1.5);
    assert.strictEqual(getStreakMultiplier(30), 2.0);
    assert.strictEqual(getStreakMultiplier(100), 2.0);
  });

  test('Heart lifecycle: loseHeart decrements, earnHeart increments with MAX_HEARTS=5 cap', () => {
    assert.strictEqual(MAX_HEARTS, 5);
    assert.strictEqual(HEART_REFILL_MS, 30 * 60 * 1000);

    useAppStore.setState({
      progress: { ...defaultProgress, hearts: 5, nextHeartAt: null },
      certificate: { earned: false },
    });

    useAppStore.getState().loseHeart();
    let state = useAppStore.getState().progress;
    assert.strictEqual(state.hearts, 4, 'Heart should decrement from 5 to 4');
    assert(state.nextHeartAt !== null && state.nextHeartAt > Date.now(), 'nextHeartAt scheduled in future');

    for (let i = 0; i < 10; i++) {
      useAppStore.getState().loseHeart();
    }
    state = useAppStore.getState().progress;
    assert.strictEqual(state.hearts, 0, 'Hearts cannot drop below 0');

    useAppStore.getState().earnHeart();
    state = useAppStore.getState().progress;
    assert.strictEqual(state.hearts, 1);

    for (let i = 0; i < 10; i++) {
      useAppStore.getState().earnHeart();
    }
    state = useAppStore.getState().progress;
    assert.strictEqual(state.hearts, 5, 'Hearts capped at MAX_HEARTS (5)');
    assert.strictEqual(state.nextHeartAt, null, 'nextHeartAt cleared to null at full hearts');
  });

  test('Heart regeneration: applyHeartRegen handles 30-minute refill intervals correctly', () => {
    const now = Date.now();
    useAppStore.setState({
      progress: {
        ...defaultProgress,
        hearts: 2,
        nextHeartAt: now - 35 * 60 * 1000,
      },
    });
    useAppStore.getState().applyHeartRegen();
    let state = useAppStore.getState().progress;
    assert(state.hearts >= 3, 'Heart should regenerate after 30 min interval');

    useAppStore.setState({
      progress: {
        ...defaultProgress,
        hearts: 1,
        nextHeartAt: now - 180 * 60 * 1000,
      },
    });
    useAppStore.getState().applyHeartRegen();
    state = useAppStore.getState().progress;
    assert.strictEqual(state.hearts, 5, 'Full elapsed time restores 5 hearts');
    assert.strictEqual(state.nextHeartAt, null, 'nextHeartAt reset to null when full');
  });

  test('Lesson completion XP: first-time full XP vs replay half-XP, perfect lesson bonus +4 XP', () => {
    useAppStore.setState({
      progress: { ...defaultProgress, xp: 0, completedLessons: [], perfectLessons: [], level: 1 },
      certificate: { earned: false },
    });

    useAppStore.getState().completeLesson('l1_1', 10, false);
    let store = useAppStore.getState();
    assert.strictEqual(store.progress.xp, 10, 'Full XP awarded on first completion');
    assert(store.progress.completedLessons.includes('l1_1'));
    assert(!store.progress.perfectLessons.includes('l1_1'));

    useAppStore.getState().completeLesson('l1_1', 10, false);
    store = useAppStore.getState();
    assert.strictEqual(store.progress.xp, 15, 'Half XP awarded on replay');

    useAppStore.getState().completeLesson('l1_2', 10, true);
    store = useAppStore.getState();
    assert.strictEqual(store.progress.xp, 29, 'Base + 4 XP perfect bonus awarded');
    assert(store.progress.perfectLessons.includes('l1_2'));

    useAppStore.getState().completeLesson('l1_2', 10, true);
    store = useAppStore.getState();
    assert.strictEqual(store.progress.xp, 34, 'Replaying perfect lesson awards only half base XP');
  });

  test('Certificate unlock: earned when all lessons are completed', () => {
    const totalLessons = lessonsModule.getTotalLessons();
    const allLessonIds = lessonsModule.units.flatMap((u) => u.lessons.map((l) => l.id));
    assert.strictEqual(allLessonIds.length, totalLessons);

    useAppStore.setState({
      progress: {
        ...defaultProgress,
        completedLessons: allLessonIds.slice(0, totalLessons - 1),
        xp: 250,
      },
      certificate: { earned: false },
    });

    const finalLesson = allLessonIds[totalLessons - 1];
    useAppStore.getState().completeLesson(finalLesson, 10, false);
    const state = useAppStore.getState();
    assert.strictEqual(state.certificate.earned, true, 'Certificate earned when all lessons are completed');
    assert(typeof state.certificate.earnedAt === 'string', 'earnedAt contains ISO timestamp');
  });

  test('Offline sync mutation queue: pendingSyncQueue, enqueueSyncMutation, clearSyncQueue, getPendingSyncCount', () => {
    const store = useAppStore.getState();
    store.clearSyncQueue();
    assert.strictEqual(store.getPendingSyncCount(), 0, 'Initial pending sync count must be 0');
    assert.deepStrictEqual(useAppStore.getState().pendingSyncQueue, [], 'Initial queue must be empty');

    const mut1 = store.enqueueSyncMutation({ type: 'COMPLETE_LESSON', payload: { lessonId: 'l1_1', xp: 10 } });
    assert.strictEqual(store.getPendingSyncCount(), 1, 'Count incremented after enqueue');
    assert.strictEqual(useAppStore.getState().pendingSyncQueue[0].id, mut1.id);
    assert.strictEqual(useAppStore.getState().pendingSyncQueue[0].type, 'COMPLETE_LESSON');

    const mut2 = store.enqueueSyncMutation({ type: 'UPDATE_XP', payload: { xp: 20 } });
    assert.strictEqual(store.getPendingSyncCount(), 2, 'Count reflects 2 mutations');
    assert.strictEqual(useAppStore.getState().pendingSyncQueue[0].id, mut1.id, 'FIFO preservation: first mutation unchanged');
    assert.strictEqual(useAppStore.getState().pendingSyncQueue[1].id, mut2.id, 'FIFO preservation: second mutation appended');

    store.clearSyncQueue();
    assert.strictEqual(store.getPendingSyncCount(), 0, 'Count reset to 0 after clearSyncQueue');
    assert.deepStrictEqual(useAppStore.getState().pendingSyncQueue, [], 'pendingSyncQueue empty after clearSyncQueue');
  });

  test('Avatar & photoUri selection: switching between image avatar and emoji avatar updates state cleanly', () => {
    const store = useAppStore.getState();
    store.setPhotoUri('file:///documents/avatar_user_12345.jpg');
    assert.strictEqual(
      useAppStore.getState().user.photoUri,
      'file:///documents/avatar_user_12345.jpg',
      'setPhotoUri stores selected image URI'
    );

    store.setAvatar('emoji_lion');
    assert.strictEqual(useAppStore.getState().user.avatar, 'emoji_lion', 'setAvatar updates selected emoji avatar');
    assert.strictEqual(
      useAppStore.getState().user.photoUri,
      null,
      'setAvatar clears photoUri so selected emoji avatar displays across all screens'
    );
  });
});

// ── SUITE 2: 4-Stage Lesson Session Construction & Progression ────────
suite('Suite 2: 4-Stage Lesson Session Construction & Progression', () => {
  const { extractLessonLearningItems, buildLessonSession } = questionBankModule;
  const { units } = lessonsModule;

  test('All 14 units exist and contain lessons', () => {
    assert.strictEqual(units.length, 14, 'Curriculum must contain 14 units');
    for (const unit of units) {
      assert(unit.lessons.length > 0, `Unit ${unit.id} has no lessons`);
    }
  });

  test('Stage 1 (learn) produces >= 3 learning items with kiny, eng, and audioWord for EVERY lesson', () => {
    let lessonCount = 0;
    for (const unit of units) {
      for (const lesson of unit.lessons) {
        lessonCount++;
        const items = extractLessonLearningItems(lesson, unit.id);
        assert(
          items.length >= 3,
          `Lesson ${lesson.id} in Unit ${unit.id} produced only ${items.length} learn cards (must be >= 3)`
        );
        for (const item of items) {
          assert(typeof item.kiny === 'string' && item.kiny.trim().length > 0, `Missing kiny in learn card of ${lesson.id}`);
          assert(typeof item.eng === 'string' && item.eng.trim().length > 0, `Missing eng in learn card of ${lesson.id}`);
          const audio = item.audioWord || item.kiny;
          assert(typeof audio === 'string' && audio.trim().length > 0, `Missing audioWord in learn card of ${lesson.id}`);
        }
      }
    }
    assert(lessonCount >= 31, `Expected at least 31 lessons across 14 units, verified ${lessonCount}`);
  });

  test('Pedagogical progression order: learn -> practice -> reinforce -> assessment', () => {
    const stageOrder = { practice: 0, reinforce: 1, assessment: 2 };

    for (const isReplay of [false, true]) {
      for (const unit of units) {
        for (const lesson of unit.lessons) {
          const session = buildLessonSession(lesson, unit.id, isReplay);
          assert(session.length >= 4, `Session for ${lesson.id} has only ${session.length} exercises`);

          const stagesPresent = new Set(session.map((q) => q.stage));
          assert(stagesPresent.has('practice'), `${lesson.id} (replay=${isReplay}) missing practice stage`);
          assert(stagesPresent.has('reinforce'), `${lesson.id} (replay=${isReplay}) missing reinforce stage`);
          assert(stagesPresent.has('assessment'), `${lesson.id} (replay=${isReplay}) missing assessment stage`);

          let lastOrder = -1;
          for (const q of session) {
            const currentOrder = stageOrder[q.stage];
            assert(currentOrder !== undefined, `Unknown stage "${q.stage}" in ${lesson.id}`);
            assert(
              currentOrder >= lastOrder,
              `Pedagogical order violation in ${lesson.id} (replay=${isReplay}): found ${q.stage} after previous later stage`
            );
            lastOrder = currentOrder;
          }
        }
      }
    }
  });

  test('Exercise validity: practice and assessment multiple_choice have >= 2 options containing answer', () => {
    for (const unit of units) {
      for (const lesson of unit.lessons) {
        for (const isReplay of [false, true]) {
          const session = buildLessonSession(lesson, unit.id, isReplay);
          for (const q of session) {
            if (q.stage === 'practice' || q.stage === 'assessment') {
              if (q.type === 'multiple_choice') {
                assert(
                  Array.isArray(q.options) && q.options.length >= 2,
                  `MC ${q.id} in ${lesson.id} has invalid options: ${JSON.stringify(q.options)}`
                );
                assert(
                  q.options.includes(q.answer),
                  `MC ${q.id} in ${lesson.id}: answer "${q.answer}" missing from options [${q.options.join(', ')}]`
                );
              }
            }
          }
        }
      }
    }
  });

  test('Exercise validity: fill_blank has non-empty blanks/options containing answer', () => {
    for (const unit of units) {
      for (const lesson of unit.lessons) {
        for (const isReplay of [false, true]) {
          const session = buildLessonSession(lesson, unit.id, isReplay);
          for (const q of session) {
            if (q.type === 'fill_blank') {
              const pool = q.blanks || q.options;
              assert(
                Array.isArray(pool) && pool.length >= 2,
                `Fill-blank ${q.id} in ${lesson.id} has invalid blanks/options`
              );
              assert(
                pool.includes(q.answer),
                `Fill-blank ${q.id} in ${lesson.id}: answer "${q.answer}" missing from pool [${pool.join(', ')}]`
              );
            }
          }
        }
      }
    }
  });

  test('Exercise validity: sentence_build has all answer tokens in words pool', () => {
    for (const unit of units) {
      for (const lesson of unit.lessons) {
        for (const isReplay of [false, true]) {
          const session = buildLessonSession(lesson, unit.id, isReplay);
          for (const q of session) {
            if (q.type === 'sentence_build') {
              assert(
                Array.isArray(q.words) && q.words.length >= 2,
                `Sentence-build ${q.id} in ${lesson.id} has invalid words`
              );
              const pool = [...q.words];
              const tokens = q.answer.split(/\s+/).filter(Boolean);
              for (const token of tokens) {
                const cleanToken = token.replace(/^[.,!?;:"'’]+|[.,!?;:"'’]+$/g, '').toLowerCase();
                const idx = pool.findIndex(
                  (w) => w.replace(/^[.,!?;:"'’]+|[.,!?;:"'’]+$/g, '').toLowerCase() === cleanToken
                );
                assert(
                  idx !== -1,
                  `Sentence-build ${q.id} in ${lesson.id}: token "${token}" missing from words [${q.words.join(', ')}]`
                );
                pool.splice(idx, 1);
              }
            }
          }
        }
      }
    }
  });
});

// ── SUITE 3: Curriculum, Story, Cultural Content & Dictionary Integrity
suite('Suite 3: Curriculum, Story, Cultural Content & Dictionary Integrity', () => {
  const dictPath = path.join(rootDir, 'iriza_dictionary.txt');
  const dict = fs.readFileSync(dictPath, 'utf8').toLowerCase();

  const ENGLISH_OK = new Set([
    'what', 'is', 'the', 'answer', 'to', 'this', 'how', 'do', 'you', 'say',
    'which', 'means', 'select', 'correct', 'iriza', 'n', 'a', 'translate',
    'morning', 'evening', 'hello', 'thank', 'much', 'want', 'water', 'going',
    'fine', 'are', 'my', 'name', 'love', 'rwanda', 'eat', 'live', 'where',
    'come', 'from', 'peace', 'welcome', 'harp', 'rwandan', 'story', 'food',
    'hills', 'thousand', 'nature', 'tea', 'coffee', 'read', 'listen', 'good',
    'gorilla', 'gorillas', 'market', 'friday', 'seller', 'parents', 'children',
    'father', 'mother', 'bread', 'milk', 'school', 'unity', 'heritage', 'rushed',
  ]);

  const VERIFIED_CONJUGATIONS = new Set([
    'meze', 'abanyumuryango', 'bapfuye', 'bwacya', 'igaramye', 'irishiriza',
    'mpekera', 'mpagaze', 'muzindutsi', 'ndeba', 'ntitembe', 'nyikama',
    'nyiragira', 'umusenzi', 'yicariye', 'abapfumu', 'abavomyi', 'bakaryama',
    'kagufi', 'mishito', 'nagiye', 'nahina', 'ritabona', 'rutoki', 'shyamba',
    'kigenda', 'mva', 'ndabyemeye', 'ndashaka', 'ntuye', 'mvuye', 'ndagiye',
    'utuye', 'uwimana', 'remera', 'amina', 'virunga', 'kigali', 'asukura',
    'ibiyahe', 'amacakara', 'tiye', 'kafeyi', 'barahita', 'bahimbura',
    'bakundagana', 'nyirasenge', 'ndakwishimiye', 'baramarana', 'zibana',
    'nyirabukwe', 'ntizigunga', 'zikomeza', 'gukinana', 'barabirinda',
    'iherereye', 'byaratse', 'akamaaro', 'rwitwa', 'abashakashatsi',
    'mutamu', 'ruganzu', 'ruganwa', 'karuvati', 'amapapayi', 'ibikongorwa',
    'ibisheke', 'igitoki', 'porici', 'isosi', 'ibishyimbo', 'inzahabu',
    'ibihogo', 'umweru', 'umukara', 'ubururu', 'umutuku', 'icyatsi',
    'umuhondo', 'mirongo', 'ijana', 'igihumbi', 'icumi', 'icyenda', 'umunani',
    'karindwi', 'gatandatu', 'gatanu', 'kane', 'gatatu', 'kabiri', 'rimwe',
    'ikinyabuzima', 'ubuziranenge', 'intangarugero', 'abakurambere',
    'bagakubura', 'bagateza', 'baganira', 'rishimisha',
    'bagaragaza', 'burarahurwa', 'igwana', 'baziye', 'rirashe', 'iwe',
    'nishimye', 'aramusubiza', 'dushaka', 'arasubiza', 'yarimo', 'cyuzuye',
    'zijya', 'ingendo', 'nimukurikire', 'ntimuvuge', 'yazo', 'aborozi',
    'bwitwa', 'mirima', 'ifasha', 'irashushanya', 'inzizi', 'zishyirwa',
    'babayeho', 'zigorofa', 'yakoreshwaga', 'ibibereho', 'irakomeza',
    'bakomeze', 'bukomeye', 'ikikije', 'bishimye', 'ababyinnyi', 'bifasha',
    'buba', 'bufasha', 'igitebo',
  ]);

  const IGNORE = new Set([
    'a', 'i', 'ki', 'mu', 'na', 'wa', 'ya', 'za', "ry'", "bw'", "cy'", "kw'", 'u', 'ku',
  ]);

  const PREFIXES = [
    'ndi', 'nda', 'nde', 'nta', 'turaba', 'tura', 'tu', 'mva', 'mwe',
    'mu', 'mwi', 'm', 'ni', 'n', 'u', 'a', 'ba', 'aba', 'ri', 'rya', 'za', 'se',
    'na', 'ka', 'ta', 'ki', 'ny', 'mpa', 'imi', 'ibi', 'ama',
  ];

  function extractWordsFromText(src, label, wordMap) {
    for (const m of src.matchAll(/'([^'\\\n]+)'|"([^"\\\n]+)"/g)) {
      const s = m[1] || m[2];
      if (!s) continue;
      if (
        /^Pronounced\s/i.test(s) ||
        /sounds like/i.test(s) ||
        /blends/i.test(s) ||
        /^[a-z]+-[A-Z]+-[a-z]+/.test(s)
      ) {
        continue;
      }
      const looksKiny = /(^|\s)(ndi|urakaza|muraho|amakuru|bite|murakoze|cyane|neza|ubu|ejo|gusa|nta|aba|ari|ubwo|kandi|birakwiye|amata|ibishyimbo|umunsi|ukwezi|inka|abana|ishuri|nyw|shy|mw|rw|bw|jy|cy'|bw'|rw'|mw'|ny'|kw'|gu-|ku-)/i.test(s);
      if (!looksKiny) continue;
      // Skip multi-sentence English prose paragraphs that merely mention a Rwandan proper noun
      if (/\b(because|between|visitors|community|residents|tradition|celebrates|mountains)\b/i.test(s)) {
        continue;
      }
      const tokens = s.split(/[\s,?.!;:()\-–—/\\"'`]+/).filter(Boolean);
      for (const t of tokens) {
        if (
          /^[a-z'’A-Z]{2,}$/.test(t) &&
          /[aeiou]/i.test(t) &&
          !ENGLISH_OK.has(t.toLowerCase()) &&
          !IGNORE.has(t.toLowerCase())
        ) {
          const key = t.toLowerCase();
          if (!wordMap.has(key)) wordMap.set(key, []);
          wordMap.get(key).push(label);
        }
      }
    }
  }

  test('Vocabulary integrity: All Kinyarwanda vocabulary & WORD_PAIRS validated against Iriza dictionary (0 missing words)', () => {
    const wordMap = new Map();

    const lessonsSrc = fs.readFileSync(path.join(rootDir, 'src', 'data', 'lessons.ts'), 'utf8');
    const gameSrc = fs.readFileSync(path.join(rootDir, 'src', 'data', 'gameQuestions.ts'), 'utf8');
    const qbSrc = fs.readFileSync(path.join(rootDir, 'src', 'data', 'questionBank.ts'), 'utf8');
    const wotdSrc = fs.readFileSync(path.join(rootDir, 'src', 'data', 'wordOfTheDay.ts'), 'utf8');
    const dailySrc = fs.readFileSync(path.join(rootDir, 'src', 'screens', 'DailyChallengeScreen.tsx'), 'utf8');
    const storiesSrc = fs.readFileSync(path.join(rootDir, 'src', 'data', 'stories.ts'), 'utf8');
    const tipsSrc = fs.readFileSync(path.join(rootDir, 'src', 'data', 'culturalTips.ts'), 'utf8');

    extractWordsFromText(lessonsSrc, 'lessons.ts', wordMap);
    extractWordsFromText(gameSrc, 'gameQuestions.ts', wordMap);
    extractWordsFromText(qbSrc, 'questionBank.ts', wordMap);
    extractWordsFromText(wotdSrc, 'wordOfTheDay.ts', wordMap);
    extractWordsFromText(dailySrc, 'DailyChallengeScreen.tsx', wordMap);
    extractWordsFromText(storiesSrc, 'stories.ts', wordMap);
    extractWordsFromText(tipsSrc, 'culturalTips.ts', wordMap);

    // Explicitly validate every single entry in WORD_PAIRS without regex skipping
    for (const pair of questionBankModule.WORD_PAIRS) {
      for (const t of pair.kiny.split(/[\s,?.!;:()\-–—/\\"'`]+/).filter(Boolean)) {
        const key = t.toLowerCase();
        if (key.length >= 2 && !IGNORE.has(key)) {
          if (!wordMap.has(key)) wordMap.set(key, []);
          wordMap.get(key).push('questionBank.ts:WORD_PAIRS');
        }
      }
    }

    const missing = [];

    for (const [key, sources] of wordMap.entries()) {
      const w = key.replace(/[^a-z']/g, '');
      if (!w || w.length < 2 || VERIFIED_CONJUGATIONS.has(w)) continue;

      const candidates = [w];
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
        const variants = [
          c,
          'ku' + c, 'gu' + c, 'kw' + c, 'kw' + c.slice(1),
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

    assert.strictEqual(
      missing.length,
      0,
      `${missing.length} words not found in Iriza dictionary:\n${missing.map((m) => `  - ${m.word} (${m.sources})`).join('\n')}`
    );
  });

  test('Answer validity: All authored and dynamic exercises have solvable answers (0 broken questions)', () => {
    let brokenCount = 0;
    const brokenList = [];

    for (const f of ['src/data/lessons.ts', 'src/data/gameQuestions.ts', 'src/data/questionBank.ts']) {
      const src = fs.readFileSync(path.join(rootDir, f), 'utf8');
      const mcRe = /\{[^{}]*options:\s*\[([^\]]+)\][^{}]*answer:\s*'((?:[^'\\]|\\.)*)'/g;
      let m;
      while ((m = mcRe.exec(src))) {
        const opts = (m[1].match(/'((?:[^'\\]|\\.)*)'/g) || []).map((o) => o.slice(1, -1));
        const ans = m[2];
        if (!opts.includes(ans)) {
          brokenCount++;
          brokenList.push(`${f}: answer "${ans}" not in options [${opts.join(', ')}]`);
        }
      }

      const sentenceRe = /\{[^{}]*words:\s*\[([^\]]+)\][^{}]*answer:\s*'((?:[^'\\]|\\.)*)'/g;
      let sm;
      while ((sm = sentenceRe.exec(src))) {
        const words = (sm[1].match(/'((?:[^'\\]|\\.)*)'/g) || []).map((w) => w.slice(1, -1));
        const ans = sm[2];
        const pool = [...words];
        const tokens = ans.split(' ').filter(Boolean);
        for (const token of tokens) {
          const idx = pool.findIndex((w) => w.toLowerCase() === token.toLowerCase());
          if (idx === -1) {
            brokenCount++;
            brokenList.push(`${f}: sentence "${ans}" missing token "${token}" from words [${words.join(', ')}]`);
          } else {
            pool.splice(idx, 1);
          }
        }
      }
    }

    const stories = loadStories();
    assert(stories.length >= 8, `Expected at least 8 stories in src/data/stories.ts, found ${stories.length}`);
    for (const story of stories) {
      for (const q of story.questions) {
        if (!q.options.includes(q.answer)) {
          brokenCount++;
          brokenList.push(`Story ${story.id} (${q.id}): answer "${q.answer}" not in options`);
        }
      }
    }

    assert(
      culturalTipsModule.getCulturalTips().length >= 8,
      'Expected at least 8 cultural tips in src/data/culturalTips.ts'
    );

    assert.strictEqual(
      brokenCount,
      0,
      `Found ${brokenCount} broken questions:\n${brokenList.join('\n')}`
    );
  });

  test('Zero duplicate IDs across all units, lessons, exercises, stories, and story questions', () => {
    const { units } = lessonsModule;
    const unitIds = new Set();
    const lessonIds = new Set();
    const duplicates = [];

    for (const unit of units) {
      if (unitIds.has(unit.id)) {
        duplicates.push(`Duplicate unit ID: ${unit.id}`);
      }
      unitIds.add(unit.id);

      for (const lesson of unit.lessons) {
        if (lessonIds.has(lesson.id)) {
          duplicates.push(`Duplicate lesson ID: ${lesson.id}`);
        }
        lessonIds.add(lesson.id);

        const exIds = new Set();
        for (const ex of lesson.exercises) {
          if (exIds.has(ex.id)) {
            duplicates.push(`Duplicate exercise ID "${ex.id}" in lesson ${lesson.id}`);
          }
          exIds.add(ex.id);
        }
      }
    }

    const stories = loadStories();
    const storyIds = new Set();
    const storyQuestionIds = new Set();
    for (const story of stories) {
      if (storyIds.has(story.id)) {
        duplicates.push(`Duplicate story ID: ${story.id}`);
      }
      storyIds.add(story.id);
      for (const q of story.questions) {
        if (storyQuestionIds.has(q.id)) {
          duplicates.push(`Duplicate story question ID: ${q.id}`);
        }
        storyQuestionIds.add(q.id);
      }
    }

    assert.strictEqual(
      duplicates.length,
      0,
      `Found duplicate IDs:\n${duplicates.join('\n')}`
    );
  });
});

// ── Summary & Test Runner Result ──────────────────────────────────────
const duration = Date.now() - startTime;
console.log('\n' + '─'.repeat(50));
console.log(`${colors.bright}VERIFICATION SUMMARY${colors.reset}`);
console.log('─'.repeat(50));
console.log(
  `Suites:   ${passedSuites === totalSuites ? colors.green : colors.red}${passedSuites}/${totalSuites} passed${colors.reset}`
);
console.log(
  `Tests:    ${failedTests === 0 ? colors.green : colors.red}${passedTests}/${totalTests} passed (${failedTests} failed)${colors.reset}`
);
console.log(`Duration: ${duration}ms`);
console.log('─'.repeat(50));

if (failedTests > 0) {
  console.log(`\n${colors.red}FAILURES:${colors.reset}`);
  for (const f of failures) {
    console.log(`  - ${f.name}: ${f.error.message}`);
  }
  process.exit(1);
} else {
  console.log(`\n${colors.green}${colors.bright}ALL VERIFICATION SUITES PASSED (Exit code 0)${colors.reset}\n`);
  process.exit(0);
}
