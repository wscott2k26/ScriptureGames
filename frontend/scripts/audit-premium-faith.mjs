import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const failures = [];
const requireText = (file, text, message) => {
  const content = read(file);
  if (!content.includes(text)) failures.push(message || `${file} is missing ${text}`);
};
const forbidText = (file, text, message) => {
  const content = read(file);
  if (content.includes(text)) failures.push(message || `${file} must not include ${text}`);
};

for (const file of [
  'app/faith-journeys.tsx',
  'app/faith-journey.tsx',
  'app/prayer-garden.tsx',
  'src/faith-journeys.ts',
  'src/prayer-garden.ts',
  'app/(tabs)/companion.tsx',
]) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`Missing premium feature file: ${file}`);
}

requireText('src/faith-journeys.ts', "scripture_games_faith_journeys_v1", 'Faith Journey progress must use cloud-backup-safe app storage.');
requireText('src/prayer-garden.ts', "scripture_games_prayer_garden_v1", 'Prayer Garden must use cloud-backup-safe app storage.');
requireText('src/faith-journeys.ts', "id: 'peace-over-anxiety'", 'Peace Over Anxiety journey is missing.');
requireText('src/faith-journeys.ts', "id: 'broken-pieces'", 'Beautiful Broken Pieces journey is missing.');
requireText('src/faith-journeys.ts', "id: 'purpose-and-work'", 'Purpose in the Work journey is missing.');
requireText('src/faith-journeys.ts', "id: 'faith-at-home'", 'Faith at Home journey is missing.');

const journeySource = read('src/faith-journeys.ts');
const dayTitles = [...journeySource.matchAll(/title: '[^']+',\n\s+reference:/g)].length;
if (dayTitles < 28) failures.push(`Expected at least 28 guided journey days; found ${dayTitles}.`);

requireText('app/(tabs)/companion.tsx', 'testID="chat-input"', 'Lumi typed chat input must remain visible and testable.');
requireText('app/(tabs)/companion.tsx', 'testID="voice-input-btn"', 'Lumi press-to-talk control is missing.');
requireText('app/(tabs)/companion.tsx', "from 'expo-speech'", 'Lumi spoken replies must use Expo Speech.');
requireText('app/(tabs)/companion.tsx', "from 'expo-speech-recognition'", 'Lumi voice input must use native speech recognition.');
requireText('app/(tabs)/companion.tsx', "router.push('/faith-journeys')", 'Faith Journeys must be discoverable from Lumi.');
requireText('app/(tabs)/companion.tsx', "router.push('/prayer-garden')", 'Prayer Garden must be discoverable from Lumi.');
requireText('app/(tabs)/companion.tsx', 'LUMI_DRAFT_PREFIX', 'Lumi must preserve an unsent question while users consult the Bible.');
forbidText('app/(tabs)/companion.tsx', '86 + insets.bottom', 'Lumi must not reserve space for the removed floating tab bar.');
forbidText('app/(tabs)/companion.tsx', 'persist: true', 'Lumi must not persist microphone recordings.');

requireText('app.json', 'expo-speech-recognition', 'Native speech-recognition config plugin is missing.');
requireText('app.json', 'Audio is not saved by Scripture Games.', 'Speech permission copy must explain the audio boundary.');
requireText('app.json', 'NSPrivacyCollectedDataTypeEmailAddress', 'Cloud-account email must be declared in the iOS privacy manifest.');
requireText('app.json', 'NSPrivacyCollectedDataTypeUserID', 'Cloud-account user ID must be declared in the iOS privacy manifest.');
requireText('app.json', 'NSPrivacyCollectedDataTypeGameplayContent', 'Cloud-backed game progress must be declared in the iOS privacy manifest.');
requireText('app.json', 'NSPrivacyCollectedDataTypeOtherUserContent', 'Cloud-backed prayers, journals, notes, and chat must be declared in the iOS privacy manifest.');
requireText('app.json', 'NSPrivacyCollectedDataTypeSensitiveInfo', 'Potentially sensitive prayer and faith content must be declared in the iOS privacy manifest.');
requireText('app.json', 'NSPrivacyCollectedDataTypeHealth', 'Health-category prayer content must be declared in the iOS privacy manifest.');
forbidText('app.json', '"NSPrivacyCollectedDataTypes": []', 'The cloud-enabled app must not ship an empty collected-data manifest.');
requireText('package.json', '"expo-speech": "~14.0.8"', 'SDK 54 Expo Speech version is not locked.');
requireText('package.json', '"expo-speech-recognition": "3.1.3"', 'SDK 54 speech-recognition version is not locked.');

for (const file of ['src/faith-journeys.ts', 'src/prayer-garden.ts', 'app/(tabs)/companion.tsx']) {
  forbidText(file, 'service_role', `${file} must not contain a Supabase service-role credential.`);
}

if (failures.length) {
  console.error('PREMIUM FAITH RELEASE AUDIT FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Premium faith audit passed: 28 guided days, private prayer history, visible typed chat, guarded press-to-talk, spoken replies, persistent drafts, cloud-safe storage, and non-tracking privacy declarations are present.');
