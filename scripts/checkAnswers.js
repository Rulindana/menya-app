// Checks that every multiple-choice answer exists in its options.
const fs = require('fs');
let bad = 0;
for (const f of ['src/data/lessons.ts', 'src/data/gameQuestions.ts']) {
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
}
console.log(bad === 0 ? '✅ Every multiple-choice answer is present in its options.' : `Found ${bad} broken questions.`);
if (bad > 0) process.exit(1);
