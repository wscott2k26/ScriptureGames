import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

const companion = read('app/(tabs)/companion.tsx');
assert.match(companion, /useBottomTabBarHeight/, 'Lumi must measure the floating native tab bar.');
assert.match(companion, /tabBarHeight\s*\+\s*spacing\./, 'Lumi composer must reserve space above the tab bar when the keyboard is closed.');
assert.match(companion, /testID="chat-input"/, 'Lumi typed chat input must remain present.');
assert.match(companion, /testID="send-btn"/, 'Lumi Send control must remain present.');

const access = read('src/bible-journey/access.ts');
for (const token of ['canOpenJourneyBook', 'PREMIUM REQUIRED', 'FREE', 'PREMIUM ACTIVE']) {
  assert.equal(access.includes(token), true, `Journey access policy must include ${token}.`);
}

for (const route of [
  'app/(tabs)/bible-journey.tsx',
  'app/book-library.tsx',
  'app/book-season.tsx',
  'app/book-trial.tsx',
  'app/book-victory.tsx',
]) {
  const source = read(route);
  assert.equal(source.includes('usePremiumEntitlement'), true, `${route} must use the central Premium entitlement.`);
  assert.equal(source.includes('canOpenJourneyBook'), true, `${route} must enforce the same Premium access policy.`);
}

const hub = read('app/(tabs)/bible-journey.tsx');
assert.equal(hub.includes('View Premium'), true, 'Journey must expose a visible Premium option.');
assert.equal(hub.includes('Completing a free book never unlocks Premium books'), true, 'Journey must explain that progress cannot bypass Premium.');

const library = read('app/book-library.tsx');
assert.equal(library.includes('PREMIUM REQUIRED'), true, 'Locked library cards must say Premium Required, not rely on a lock icon alone.');
assert.equal(library.includes('View Premium Options'), true, 'The book library must expose a visible Premium option.');

const home = read('app/(tabs)/command.tsx');
assert.equal(home.includes("router.push('/tutorial')"), true, 'Home must offer the optional guided tutorial.');
assert.equal(home.includes('App Tour & Tutorial'), true, 'Home must label the tutorial clearly.');
assert.equal(home.includes('View Premium Options'), true, 'Home must expose Premium clearly.');

const settings = read('app/(tabs)/preferences.tsx');
assert.equal(settings.includes("router.push('/tutorial')"), true, 'Settings must let users replay the tutorial.');
assert.equal(settings.includes('App Tour & Tutorial'), true, 'Settings must label the tutorial clearly.');
assert.equal(settings.includes("router.push('/premium')"), true, 'Settings must expose Premium options.');

assert.equal(existsSync(resolve(root, 'app/tutorial.tsx')), true, 'A guided tutorial route must exist.');
const tutorial = read('app/tutorial.tsx');
for (const token of [
  'Welcome to Scripture Games',
  'Home',
  'Journey',
  'Games',
  'Bible',
  'Lumi',
  'Settings',
  'Premium',
  'Not Now',
  'Next',
  'Finish Tutorial',
]) assert.equal(tutorial.includes(token), true, `Tutorial must explain ${token}.`);

const tutorialCore = read('src/tutorial-core.ts');
assert.equal(tutorialCore.includes('TUTORIAL_STEPS'), true, 'Tutorial steps must live in a reusable data model.');
assert.equal((tutorialCore.match(/id:/g) || []).length >= 8, true, 'Tutorial must cover at least eight app concepts.');

const scenes = read('src/backgrounds/peaceful-scenes.ts');
assert.equal(scenes.includes('photoUrl'), true, 'Peaceful scenes must provide real photo sources.');
assert.equal((scenes.match(/https:\/\/images\.pexels\.com\/photos\//g) || []).length, 50, 'All 50 peaceful scene choices must use real licensed photos.');

const backdrop = read('src/components/premium/PeacefulBackdrop.tsx');
assert.equal(backdrop.includes("from 'expo-image'"), true, 'Peaceful backgrounds must render real photos with expo-image.');
assert.equal(backdrop.includes('cachePolicy="disk"'), true, 'Real photos must be cached on device.');
assert.equal(backdrop.includes('SceneArt'), true, 'Procedural art must remain only as an offline/error fallback.');

console.log('Build 13 acceptance regression contracts passed.');
