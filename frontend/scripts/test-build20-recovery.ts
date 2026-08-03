import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (relative: string) => fs.readFileSync(path.join(root, relative), 'utf8');
const exists = (relative: string) => fs.existsSync(path.join(root, relative));

function requireText(source: string, needle: string, label: string) {
  if (!source.includes(needle)) throw new Error(`${label} is missing: ${needle}`);
}

const preferences = read('app/(tabs)/preferences.tsx');
const audio = read('src/audio-context.tsx');
const preferenceCore = read('src/preferences-core.ts');
const lumi = read('app/(tabs)/companion.tsx');
const quizHub = read('app/(tabs)/quiz.tsx');
const quizPlay = read('app/quiz-play.tsx');
const localApi = read('src/local-api.ts');
const packageJson = read('package.json');

requireText(preferences, 'Choose Peaceful Background', 'Background picker control');
requireText(preferences, 'Soft Piano', 'Soft Piano option');
requireText(preferences, 'Gentle Rain', 'Gentle Rain option');
requireText(preferences, 'Quiet Reading Room', 'Quiet Reading Room option');
requireText(preferenceCore, "ambientSound: 'piano'", 'Default ambient sound');
requireText(audio, 'SOFT_RAIN_BASE64', 'Bundled rain ambience');
requireText(audio, 'READING_ROOM_BASE64', 'Bundled reading ambience');
requireText(audio, 'configureLumiVoiceAudio', 'Lumi/audio handoff');
requireText(lumi, "useSpeechRecognitionEvent('result'", 'Lumi microphone transcript handling');
requireText(lumi, 'startLumiListening', 'Lumi press-to-talk control');
requireText(lumi, 'TextInput', 'Lumi typed composer');

if (!exists('src/book-mastery-core.ts') || !exists('src/book-mastery.ts') || !exists('app/book-mastery.tsx')) {
  throw new Error('Ten-book Book Mastery files are missing.');
}
const masteryCore = read('src/book-mastery-core.ts');
requireText(quizHub, 'Old Testament Books', 'Old Testament mastery shelf');
requireText(quizHub, 'New Testament Books', 'New Testament mastery shelf');
requireText(masteryCore, "title: 'Genesis', testament: 'old'", 'First free Old Testament book');
requireText(masteryCore, "title: 'Matthew', testament: 'new'", 'First free New Testament book');
requireText(read('app/book-mastery.tsx'), "from '@/src/components/ScriptureLink'", 'Proven Scripture link reuse');
requireText(read('app/book-mastery.tsx'), 'REFERENCE REVEALED AFTER ANSWER', 'No pre-answer reference giveaway');
requireText(localApi, 'sortSelectedQuizQuestions', 'Chronological classic quiz ordering');
requireText(quizPlay, 'resolveQuizReference', 'Resolved clickable classic references');
requireText(packageJson, 'test:build20', 'Build 20 regression script');
requireText(packageJson, 'test:book-mastery', 'Book Mastery test script');
requireText(packageJson, 'test:quiz-ordering', 'Chronology test script');

for (const obsolete of [
  '../.github/workflows/ios-build18-testflight-once.yml',
  '../.github/status-triggers/ios-build18-authorized.md',
  '../.github/workflows/build19-status-watch.yml',
]) {
  if (fs.existsSync(path.resolve(root, obsolete))) throw new Error(`Obsolete release machinery remains: ${obsolete}`);
}

console.log('Build 20 recovery contract passed: Build 18 experience, mastery, chronology, Scripture links, and three ambient choices coexist.');
