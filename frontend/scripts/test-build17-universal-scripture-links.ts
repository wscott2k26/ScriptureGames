import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function path(relativePath: string) {
  return join(process.cwd(), relativePath);
}

function read(relativePath: string) {
  return readFileSync(path(relativePath), 'utf8');
}

function requireMatch(source: string, pattern: RegExp, message: string) {
  if (!pattern.test(source)) throw new Error(message);
}

function requireNoMatch(source: string, pattern: RegExp, message: string) {
  if (pattern.test(source)) throw new Error(message);
}

const linkPath = 'src/components/ScriptureLink.tsx';
if (!existsSync(path(linkPath))) {
  throw new Error('Build 17 requires a shared src/components/ScriptureLink.tsx component.');
}

const link = read(linkPath);
const bible = read('app/(tabs)/bible.tsx');
const quiz = read('app/quiz-play.tsx');
const daily = read('app/daily-challenge.tsx');
const devotional = read('app/devotional.tsx');
const faithJourney = read('app/faith-journey.tsx');
const stories = read('app/(tabs)/stories.tsx');
const genesisQuiz = read('app/genesis-quiz.tsx');
const verse = read('app/verse.tsx');
const command = read('app/(tabs)/command.tsx');

requireMatch(link, /from 'react-native'/, 'ScriptureLink must use React Native controls.');
requireMatch(link, /\bPressable\b/, 'ScriptureLink must use a native Pressable.');
requireNoMatch(link, /TactilePressable/, 'ScriptureLink must not depend on the animated TactilePressable hit layer.');
requireMatch(link, /parseBibleReference\(reference\)/, 'ScriptureLink must validate references with the bundled parser.');
requireMatch(link, /pathname:\s*'\/bible'/, 'ScriptureLink must navigate to the public /bible URL.');
requireNoMatch(link, /\/\(tabs\)\/bible/, 'ScriptureLink must not navigate through the internal route-group pathname.');
requireMatch(link, /minHeight:\s*44/, 'ScriptureLink must provide a minimum 44-point touch target.');
requireMatch(link, /minWidth:\s*44/, 'ScriptureLink must provide a minimum 44-point effective width.');
requireMatch(link, /hitSlop=\{\{\s*top:\s*10,\s*right:\s*10,\s*bottom:\s*10,\s*left:\s*10\s*\}\}/,
  'ScriptureLink must add 10-point hit slop on every side.');
requireMatch(link, /accessibilityRole="link"/, 'ScriptureLink must identify itself as a link.');
requireMatch(link, /accessibilityState=\{\{ disabled: !valid \}\}/,
  'Invalid references must expose an accessible disabled state.');
requireMatch(link, /router\.push\(/, 'ScriptureLink must push so the origin remains in navigation history.');
requireNoMatch(link, /router\.replace\(/, 'ScriptureLink must not replace the origin screen.');

requireMatch(bible, /const \{ reference, fromScriptureLink, returnLabel \} = useLocalSearchParams/,
  'The Bible screen must accept universal Scripture-link parameters.');
requireMatch(bible, /reference \? parseBibleReference\(String\(reference\)\) : null/,
  'The Bible screen must parse the incoming reference.');
requireMatch(bible, /fromScriptureLink === '1'/,
  'The Bible screen must show a return action for universal Scripture links.');
requireMatch(bible, /router\.canGoBack\(\)/,
  'The Bible return action must verify stack history.');
requireMatch(bible, /referenceError/,
  'The Bible screen must visibly handle an invalid incoming reference.');

const structuredScreens: Array<[string, string]> = [
  ['Classic Quiz', quiz],
  ['Daily Challenge', daily],
  ['Devotional', devotional],
  ['Faith Journey', faithJourney],
  ['Stories', stories],
  ['Genesis Quiz', genesisQuiz],
  ['Verse', verse],
  ['Command Center', command],
];

for (const [name, source] of structuredScreens) {
  requireMatch(source, /ScriptureLink/, `${name} must render known references through ScriptureLink.`);
}

requireMatch(quiz, /reference=\{question\.verse\}/,
  'Classic Quiz must pass the exact graded-question reference to ScriptureLink.');
requireMatch(quiz, /returnLabel="Return to Quiz"/,
  'Classic Quiz must provide a Return to Quiz label.');
requireNoMatch(quiz, /pathname:\s*'\/\(tabs\)\/bible'/,
  'Classic Quiz must not retain the broken internal group route.');

requireMatch(daily, /reference=\{question\.verse\}/,
  'Daily Challenge question and feedback references must be linked.');
requireMatch(daily, /reference=\{witnessVerse\}/,
  'Daily Challenge Witness Card reference must be linked.');

requireNoMatch(quiz, /<Text[^>]*>Source: \{question\.verse\}<\/Text>/,
  'Classic Quiz must not render its source as plain text.');
requireNoMatch(daily, /<Text[^>]*>\{question\.verse\}<\/Text>/,
  'Daily Challenge must not render question references as plain text.');
requireNoMatch(daily, /<Text[^>]*>Read it in context: \{question\.verse\}<\/Text>/,
  'Daily Challenge feedback references must not remain plain text.');

console.log('Build 17 universal Scripture-link contract passed.');
