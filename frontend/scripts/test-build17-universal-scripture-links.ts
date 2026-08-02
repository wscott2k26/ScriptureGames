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
if (!existsSync(path(linkPath))) throw new Error('Build 17 requires a shared ScriptureLink component.');

const link = read(linkPath);
const bible = read('app/(tabs)/bible.tsx');
const quiz = read('app/quiz-play.tsx');
const daily = read('app/daily-challenge.tsx');
const devotional = read('app/devotional.tsx');
const faithJourney = read('app/faith-journey.tsx');
const stories = read('app/(tabs)/stories.tsx');
const genesisQuiz = read('app/genesis-quiz.tsx');
const verse = read('app/verse.tsx');

requireMatch(link, /\bPressable\b/, 'ScriptureLink must use a native Pressable.');
requireNoMatch(link, /TactilePressable/, 'ScriptureLink must not use the animated TactilePressable layer.');
requireMatch(link, /parseBibleReference\(reference\)/, 'ScriptureLink must validate references with the bundled parser.');
requireMatch(link, /router\.navigate\(/, 'ScriptureLink must use the app proven tab-navigation method.');
requireMatch(link, /pathname:\s*'\/\(tabs\)\/bible'/, 'ScriptureLink must target the registered Bible tab route.');
requireNoMatch(link, /pathname:\s*'\/bible'/, 'ScriptureLink must not use the unresolved root Bible path.');
requireMatch(link, /minHeight:\s*44/, 'ScriptureLink must provide a 44-point height.');
requireMatch(link, /minWidth:\s*44/, 'ScriptureLink must provide a 44-point width.');
requireMatch(link, /hitSlop=\{\{\s*top:\s*10,\s*right:\s*10,\s*bottom:\s*10,\s*left:\s*10\s*\}\}/,
  'ScriptureLink must add ten-point hit slop.');
requireMatch(link, /accessibilityRole="link"/, 'ScriptureLink must identify itself as a link.');
requireNoMatch(link, /disabled=\{!valid\}/,
  'A visible Scripture link must not silently disable itself when a format needs Bible-reader feedback.');
requireNoMatch(link, /accessibilityState=\{\{ disabled: !valid \}\}/,
  'A visible Scripture link must not advertise itself as disabled before the Bible reader can respond.');
requireNoMatch(link, /router\.replace\(/, 'ScriptureLink must not replace the origin.');

requireMatch(bible, /const \{ reference, fromQuiz, fromScriptureLink, returnLabel \} = useLocalSearchParams/,
  'Bible must accept universal Scripture-link parameters.');
requireMatch(bible, /reference \? parseBibleReference\(String\(reference\)\) : null/,
  'Bible must parse the incoming reference.');
requireMatch(bible, /fromScriptureLink === '1'/, 'Bible must recognize universal link navigation.');
requireMatch(bible, /router\.canGoBack\(\)/, 'Bible return must verify stack history.');
requireMatch(bible, /referenceError/, 'Bible must visibly handle invalid references.');

const structuredScreens: Array<[string, string]> = [
  ['Classic Quiz', quiz],
  ['Daily Challenge', daily],
  ['Devotional', devotional],
  ['Faith Journey', faithJourney],
  ['Stories', stories],
  ['Genesis Quiz', genesisQuiz],
  ['Verse Memory', verse],
];
for (const [name, source] of structuredScreens) {
  requireMatch(source, /ScriptureLink/, `${name} must use ScriptureLink.`);
}

requireMatch(quiz, /reference=\{question\.verse\}/, 'Classic Quiz must pass the exact source.');
requireMatch(quiz, /returnLabel="Return to Quiz"/, 'Classic Quiz must label its return path.');
requireNoMatch(quiz, /openReference/, 'Classic Quiz must not retain a separate navigation implementation.');
requireNoMatch(quiz, /pathname:\s*'\/\(tabs\)\/bible'/, 'Classic Quiz must not retain a separate local Bible route.');

requireMatch(daily, /reference=\{question\.verse\}/, 'Daily Challenge references must be linked.');
requireMatch(daily, /reference=\{witnessVerse\}/, 'Daily Challenge Witness Card must be linked.');
requireMatch(devotional, /reference=\{devo\.reference\}/, 'Devotional reference must be linked.');
requireMatch(faithJourney, /reference=\{day\.reference\}/, 'Faith Journey reference must be linked.');
requireMatch(stories, /reference=\{devo\.reference\}/, 'Stories devotional reference must be linked.');
requireMatch(genesisQuiz, /reference=\{question\.reference\}/, 'Genesis references must be linked.');
requireMatch(verse, /right=\{<ScriptureLink reference=\{verse\.reference\}/,
  'Verse Memory gray header reference must be linked.');

requireNoMatch(quiz, /<Text[^>]*>Source: \{question\.verse\}<\/Text>/,
  'Classic Quiz source must not remain plain text.');
requireNoMatch(daily, /<Text[^>]*>\{question\.verse\}<\/Text>/,
  'Daily Challenge references must not remain plain text.');
requireNoMatch(genesisQuiz, /<Text style=\{styles\.(?:questionReference|feedbackReference|truthReference)\}>\{question\.reference\}<\/Text>/,
  'Genesis gray, feedback, and result references must not remain plain text.');

console.log('Build 17 universal Scripture-link contract passed through the registered Bible-tab runtime.');
