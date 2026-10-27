// Checks that every multiple-choice/fill-blank answer exists in its options,
// and every sentence-build answer can be formed from its words array.
const fs = require('fs');
let bad = 0;

for (const f of [
  'src/data/lessons.ts',
  'src/data/gameQuestions.ts',
  'src/data/questionBank.ts',
  'src/data/stories.ts',
]) {
  const src = fs.readFileSync(f, 'utf8');
  const re = /\{[^{}]*options:\s*\[([^\]]+)\][^{}]*answer:\s*'((?:[^'\\]|\\.)*)'/g;
  let m;
  while ((m = re.exec(src))) {
    const opts = (m[1].match(/'((?:[^'\\]|\\.)*)'/g) || []).map((o) => o.slice(1, -1));
    const ans = m[2];
    if (!opts.includes(ans)) {
      bad++;
      console.log(`❌ ${f}: answer "${ans}" not in options [${opts.join(', ')}]`);
    }
  }

  // Also verify sentence_build templates: every token in answer must exist in words
  const sentenceRe = /\{[^{}]*words:\s*\[([^\]]+)\][^{}]*answer:\s*'((?:[^'\\]|\\.)*)'/g;
  let sm;
  while ((sm = sentenceRe.exec(src))) {
    const words = (sm[1].match(/'((?:[^'\\]|\\.)*)'/g) || []).map((w) => w.slice(1, -1));
    const ans = sm[2];
    const pool = [...words];
    const answerTokens = ans.split(' ').filter(Boolean);
    for (const token of answerTokens) {
      const idx = pool.findIndex((w) => w.toLowerCase() === token.toLowerCase());
      if (idx === -1) {
        bad++;
        console.log(`❌ ${f}: sentence answer "${ans}" requires token "${token}" missing from words [${words.join(', ')}]`);
      } else {
        pool.splice(idx, 1);
      }
    }
  }
}

console.log(
  bad === 0
    ? '✅ Every multiple-choice, fill-blank, and sentence-build answer is valid.'
    : `Found ${bad} broken questions.`
);
if (bad > 0) process.exit(1);
