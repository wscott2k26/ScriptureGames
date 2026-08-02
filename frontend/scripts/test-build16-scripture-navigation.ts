import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function read(relativePath: string) {
  return readFileSync(join(process.cwd(), relativePath), 'utf8');
}

function requireMatch(source: string, pattern: RegExp, message: string) {
  if (!pattern.test(source)) throw new Error(message);
}

const quiz = read('app/quiz-play.tsx');
const bible = read('app/(tabs)/bible.tsx');
const link = read('src/components/ScriptureLink.tsx');

requireMatch(quiz, /<ScriptureLink[\s\S]*?reference=\{question\.verse\}[\s\S]*?returnLabel="Return to Quiz"/,
  'Quiz feedback must route its exact graded-question reference through ScriptureLink.');
requireMatch(link, /pathname:\s*'\/bible'[\s\S]*?reference[\s\S]*?fromScriptureLink:\s*'1'/,
  'ScriptureLink must route the exact reference to the public Bible page.');
requireMatch(link, /minHeight:\s*44[\s\S]*?minWidth:\s*44/,
  'The visible Scripture source must provide a finger-sized target.');
requireMatch(bible, /reference \? parseBibleReference\(String\(reference\)\) : null/,
  'The Bible tab must parse the incoming reference before selecting the passage.');
requireMatch(bible, /fromScriptureLink === '1'[\s\S]*?router\.canGoBack\(\)[\s\S]*?router\.back\(\)/,
  'The Bible tab must preserve a Return action for Scripture lookups.');

console.log('Build 16 Scripture-reference navigation contract passed through the universal link system.');
