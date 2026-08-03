import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = path.resolve(process.cwd());
const failures = [];
let passed = 0;

function check(condition, message) {
  if (condition) passed += 1;
  else failures.push(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function exists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

const requiredRoutes = [
  'app/(tabs)/bible-journey.tsx',
  'app/book-library.tsx',
  'app/book-season.tsx',
  'app/book-trial.tsx',
  'app/book-victory.tsx',
  'app/background-picker.tsx',
  'app/premium.tsx',
];
for (const route of requiredRoutes) check(exists(route), `Missing Bible Journey route: ${route}`);

const catalog = read('src/bible-journey/catalog.ts');
check(catalog.includes("['GEN', 'Genesis'"), 'Genesis is missing from the journey catalog.');
check(catalog.includes("['EXO', 'Exodus'"), 'Exodus is missing from the journey catalog.');
check(catalog.includes("['LEV', 'Leviticus'"), 'Leviticus is missing from the journey catalog.');
check(catalog.includes("['REV', 'Revelation'"), 'Revelation is missing from the journey catalog.');
check(catalog.includes("FREE_JOURNEY_BOOK_IDS = new Set(['GEN', 'EXO', 'LEV', 'MAT'])"), 'Genesis, Exodus, Leviticus, and Matthew are not the exact free access boundary.');
check(catalog.includes('BIBLE_JOURNEY_BOOKS'), 'Canonical Bible Journey export is missing.');

const progressCore = read('src/bible-journey/progress-core.ts');
for (const token of [
  'version: 1',
  'sequentialBookId',
  'completedBookIds',
  'recordJourneyTrialResult',
  'completeJourneyBook',
  'syncGenesisCompletion',
]) check(progressCore.includes(token), `Journey progress core is missing ${token}.`);
check(progressCore.includes('BIBLE_JOURNEY_BOOKS.filter'), 'Completed books are not normalized into canonical order.');

const progressStore = read('src/bible-journey/progress-store.ts');
for (const token of ['queues', 'corrupt_backup', 'serialize', 'removeItem']) {
  check(progressStore.includes(token), `Journey storage is missing ${token}.`);
}

const questionEngine = read('src/bible-journey/questions.ts');
for (const token of ['buildBookTrials', 'Array.from({ length: 5 }', "kind: 'reference' | 'verse'", 'Bible data']) {
  check(questionEngine.includes(token), `Offline question engine is missing ${token}.`);
}
check(!questionEngine.includes('fetch('), 'Question engine performs a runtime network fetch.');
check(!/https?:\/\//.test(questionEngine), 'Question engine contains a runtime web endpoint.');

const tabs = read('app/(tabs)/_layout.tsx');
check(/name="bible-journey"[^>]*title: 'Journey'/s.test(tabs), 'Visible Journey tab is not the complete Bible Journey hub.');
check(/name="journey"[^>]*href: null/s.test(tabs), 'Original Genesis map is not preserved as a hidden route.');
check(tabs.includes('detachInactiveScreens'), 'Inactive tab screens are not detached.');
check(tabs.includes('freezeOnBlur: true'), 'Inactive tab screens are not frozen.');
check(!tabs.includes('detachInactiveScreens={false}'), 'The Build 10 hidden-screen flashing regression is present.');

const genesisSeason = read('src/genesis-season.ts');
const genesisQuiz = read('app/genesis-quiz.tsx');
for (const token of ['GENESIS_TRIALS', 'trial-10', 'GENESIS_BACKGROUNDS']) check(genesisSeason.includes(token), `Genesis source invariant missing: ${token}.`);
for (const token of ['completeSeasonTrial', 'trial.manna', 'trial.xp', 'api.completeNode']) check(genesisQuiz.includes(token), `Genesis gameplay invariant missing: ${token}.`);

const seasonVictory = read('app/season-victory.tsx');
for (const token of ['Continue to Exodus', 'Choose Any Bible Book', 'Replay the Final Genesis Trial', 'Return to Genesis Map']) {
  check(seasonVictory.includes(token), `Genesis Victory Hall is missing ${token}.`);
}

const scenes = read('src/backgrounds/peaceful-scenes.ts');
const sceneDefinitions = [...scenes.matchAll(/\bscene\('/g)].length;
check(sceneDefinitions === 50, `Expected 50 peaceful scenes, found ${sceneDefinitions}.`);
check(scenes.includes("DEFAULT_PEACEFUL_SCENE_ID = 'cross-on-the-hill'"), 'Cross on the Hill is not the default peaceful scene.');
check(scenes.includes("'Bethlehem Dawn'"), 'Bethlehem scene is missing.');
check(scenes.includes("'Peaceful Lake'"), 'Peaceful lake scene is missing.');
check(scenes.includes("'Ocean Sunrise'"), 'Ocean scene is missing.');
check(scenes.includes('resolveRotatingSceneId'), 'Background rotation helper is missing.');

for (const route of [
  'app/(tabs)/bible-journey.tsx',
  'app/book-library.tsx',
  'app/book-trial.tsx',
  'app/background-picker.tsx',
  'app/(tabs)/preferences.tsx',
  'app/premium.tsx',
]) {
  check(read(route).includes('PeacefulBackdrop'), `${route} does not use the selected peaceful background system.`);
}

const preferences = `${read('src/preferences-core.ts')}\n${read('src/preferences-context.tsx')}`;
for (const token of ['backgroundId', 'backgroundRotationEnabled', 'favoriteBackgroundIds', 'motionMode', 'restorePreferences']) {
  check(preferences.includes(token), `Preference migration is missing ${token}.`);
}
const settings = read('app/(tabs)/preferences.tsx');
for (const token of ['Choose Peaceful Background', 'Motion Off', 'Gentle Motion', 'Full Experience', 'Faith Rhythm', 'Grace Leaves']) {
  check(settings.includes(token), `Visible Settings is missing ${token}.`);
}

const entitlement = read('src/premium-entitlement.tsx');
for (const token of ['PREMIUM_PRODUCT_ID', 'purchase', 'restore', 'store-unavailable', 'hasPremium']) {
  check(entitlement.includes(token), `Premium entitlement boundary is missing ${token}.`);
}
check(!entitlement.includes('AsyncStorage'), 'Premium entitlement is granted through a local flag.');
check(!/is_premium\s*:\s*true/.test(entitlement), 'Premium entitlement is faked in the client.');
const premium = read('app/premium.tsx');
check(premium.includes('No charge was attempted'), 'Premium screen does not clearly state the protected store boundary.');
check(premium.includes('13 memory passages'), 'Existing free memory passage access is not preserved in Premium copy.');

const mastery = read('src/components/premium/MasteryAnswerFeedback.tsx');
for (const token of ['useMotionIntensity', 'withSequence', 'withSpring', 'pointerEvents="none"']) {
  check(mastery.includes(token), `Mastery feedback is missing ${token}.`);
}
for (const forbidden of ['recordBibleJourneyTrial', 'completeBibleJourneyBook', 'score']) {
  check(!mastery.includes(forbidden), `Decorative mastery feedback owns forbidden gameplay logic: ${forbidden}.`);
}

const sourceRoots = ['app', 'src'];
const userFacingSources = [];
function walk(relativePath) {
  for (const entry of fs.readdirSync(path.join(ROOT, relativePath), { withFileTypes: true })) {
    const child = `${relativePath}/${entry.name}`;
    if (entry.isDirectory()) walk(child);
    else if (/\.(tsx|ts)$/.test(entry.name)) userFacingSources.push(read(child));
  }
}
for (const sourceRoot of sourceRoots) walk(sourceRoot);
const combined = userFacingSources.join('\n').toLowerCase();
for (const forbidden of ['you failed god', 'your faith is weak', 'buy a streak repair', 'pay to repair your streak']) {
  check(!combined.includes(forbidden), `Forbidden guilt or pay-to-win copy found: ${forbidden}.`);
}

const packageJson = JSON.parse(read('package.json'));
check(packageJson.scripts?.['audit:journey'] === 'node scripts/audit-bible-journey.mjs', 'audit:journey is not wired in package scripts.');

if (failures.length) {
  console.error('COMPLETE BIBLE JOURNEY AUDIT — FAIL');
  for (const [index, failure] of failures.entries()) console.error(`${index + 1}. ${failure}`);
  console.error(`${passed} checks passed; ${failures.length} failed.`);
  process.exit(1);
}

console.log('COMPLETE BIBLE JOURNEY AUDIT — PASS');
console.log(`${passed} checks passed across catalog, progress, storage, routes, Genesis invariants, Premium, backgrounds, motion, mastery, and healthy retention.`);
