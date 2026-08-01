import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { PEACEFUL_SCENES } from '../src/backgrounds/peaceful-scenes.ts';
import { PEACEFUL_PHOTO_SOURCES } from '../src/backgrounds/peaceful-photo-sources.ts';

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
assert.equal(settings.includes('download once'), true, 'Settings must explain real-photo caching honestly.');

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

const photoIds = PEACEFUL_SCENES.map((scene) => {
  const source = PEACEFUL_PHOTO_SOURCES[scene.id];
  assert.ok(source, `Missing real photo source for ${scene.id}.`);
  assert.equal(source.provider, 'Pexels');
  const match = source.url.match(/photos\/(\d+)\//);
  assert.ok(match, `Photo URL for ${scene.id} must include a Pexels photo ID.`);
  assert.equal(source.sourcePage.includes(match[1]), true, `Source page for ${scene.id} must match its photo ID.`);
  return match[1];
});
assert.equal(PEACEFUL_SCENES.length, 50, 'The picker must retain exactly 50 peaceful scenes.');
assert.equal(Object.keys(PEACEFUL_PHOTO_SOURCES).length, 50, 'The real-photo map must contain exactly 50 entries.');
assert.equal(new Set(photoIds).size, 50, 'All 50 peaceful scene choices must use different real photos.');

const picker = read('app/background-picker.tsx');
assert.equal(picker.includes('curated real photos'), true, 'The picker must describe the new real-photo experience.');
assert.equal(picker.includes('cached on this device'), true, 'The picker must disclose photo caching.');
assert.doesNotMatch(picker, /not downloaded stock photos/i, 'The old procedural-only claim must be removed.');

const backdrop = read('src/components/premium/PeacefulBackdrop.tsx');
assert.equal(backdrop.includes("from 'expo-image'"), true, 'Peaceful backgrounds must render real photos with expo-image.');
assert.equal(backdrop.includes('cachePolicy="disk"'), true, 'Real photos must be cached on device.');
assert.equal(backdrop.includes('SceneArt'), true, 'Procedural art must remain only as an offline/error fallback.');
assert.equal(backdrop.includes('getPeacefulPhotoSource'), true, 'The backdrop must resolve the curated photo for each scene.');

console.log('Build 13 acceptance regression contracts passed.');
