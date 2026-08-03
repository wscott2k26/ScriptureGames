import assert from 'node:assert/strict';

import { BIBLE_JOURNEY_BOOKS } from '../src/bible-journey/catalog.ts';
import { canAccessJourneyBook, PREMIUM_PRODUCT_ID } from '../src/premium-entitlement-core.ts';
import {
  DEFAULT_PEACEFUL_SCENE_ID,
  PEACEFUL_SCENES,
  getPeacefulScene,
  resolveRotatingSceneId,
} from '../src/backgrounds/peaceful-scenes.ts';
import { DEFAULT_PREFERENCES, restorePreferences } from '../src/preferences-core.ts';
import { resolveMotionIntensity } from '../src/motion-intensity.ts';

assert.equal(PREMIUM_PRODUCT_ID, 'com.willywill.scripturegames.premium');
const freeJourneyBookIds = new Set(['GEN', 'EXO', 'LEV', 'MAT']);
for (const book of BIBLE_JOURNEY_BOOKS) {
  assert.equal(canAccessJourneyBook(book.id, false), freeJourneyBookIds.has(book.id), `${book.name} has the wrong free/Premium access rule.`);
  assert.equal(canAccessJourneyBook(book.id, true), true, `Premium must unlock ${book.name}.`);
}
assert.equal(canAccessJourneyBook('missing', true), false);

assert.equal(PEACEFUL_SCENES.length, 50, 'The peaceful scene library must contain exactly 50 presets.');
assert.equal(new Set(PEACEFUL_SCENES.map((scene) => scene.id)).size, 50, 'Every peaceful scene id must be unique.');
assert.equal(DEFAULT_PEACEFUL_SCENE_ID, 'cross-on-the-hill');
assert.equal(getPeacefulScene(DEFAULT_PEACEFUL_SCENE_ID)?.access, 'free', 'The default cross scene must be free.');
assert.equal(PEACEFUL_SCENES.filter((scene) => scene.access === 'free').length >= 10, true, 'At least ten peaceful scenes must be free.');

const requiredCategories = new Set(['Cross & Worship', 'Bible Lands', 'Water', 'Mountains', 'Forest & Garden', 'Sky & Light']);
for (const category of requiredCategories) {
  assert.equal(PEACEFUL_SCENES.some((scene) => scene.category === category), true, `Missing peaceful scene category: ${category}`);
}

for (const scene of PEACEFUL_SCENES) {
  assert.equal(scene.name.trim().length > 0, true);
  assert.equal(scene.access === 'free' || scene.access === 'premium', true);
  assert.equal(scene.colors.length, 3);
  assert.equal(new Set(scene.colors).size >= 2, true, `${scene.name} needs a meaningful gradient.`);
  assert.equal(scene.darkness >= 0.08 && scene.darkness <= 0.72, true, `${scene.name} darkness must stay readable.`);
  assert.equal(scene.accessibilityLabel.trim().length > 10, true, `${scene.name} needs descriptive accessibility copy.`);
}

assert.equal(resolveRotatingSceneId(DEFAULT_PEACEFUL_SCENE_ID, false, [], false, '2026-08-01'), DEFAULT_PEACEFUL_SCENE_ID);
const freeRotation = resolveRotatingSceneId(DEFAULT_PEACEFUL_SCENE_ID, true, [], false, '2026-08-01');
assert.equal(getPeacefulScene(freeRotation)?.access, 'free', 'Free rotation must never select a Premium scene.');
const favoriteRotation = resolveRotatingSceneId(DEFAULT_PEACEFUL_SCENE_ID, true, ['peaceful-lake', 'ocean-sunrise'], true, '2026-08-01');
assert.equal(['peaceful-lake', 'ocean-sunrise'].includes(favoriteRotation), true, 'Rotation should prefer valid favorites.');

assert.equal(DEFAULT_PREFERENCES.backgroundId, DEFAULT_PEACEFUL_SCENE_ID);
assert.equal(DEFAULT_PREFERENCES.backgroundRotationEnabled, false);
assert.deepEqual(DEFAULT_PREFERENCES.favoriteBackgroundIds, []);

const migrated = restorePreferences({ musicEnabled: false, motionMode: 'reduced' });
assert.equal(migrated.musicEnabled, false);
assert.equal(migrated.motionMode, 'reduced');
assert.equal(migrated.backgroundId, DEFAULT_PEACEFUL_SCENE_ID, 'Old preference records must migrate to the default scene.');

const cleaned = restorePreferences({
  motionMode: 'gentle',
  backgroundId: 'not-real',
  backgroundRotationEnabled: true,
  favoriteBackgroundIds: ['peaceful-lake', 'peaceful-lake', 'bad-id'],
});
assert.equal(cleaned.motionMode, 'gentle');
assert.equal(cleaned.backgroundId, DEFAULT_PEACEFUL_SCENE_ID);
assert.deepEqual(cleaned.favoriteBackgroundIds, ['peaceful-lake']);
assert.equal(cleaned.backgroundRotationEnabled, true);

assert.equal(resolveMotionIntensity('full', false, false), 'full');
assert.equal(resolveMotionIntensity('gentle', false, false), 'gentle');
assert.equal(resolveMotionIntensity('reduced', false, false), 'off');
assert.equal(resolveMotionIntensity('system', false, false), 'full');
assert.equal(resolveMotionIntensity('system', true, false), 'off');
assert.equal(resolveMotionIntensity('full', true, false), 'off', 'System Reduce Motion must override decorative full motion.');
assert.equal(resolveMotionIntensity('full', false, true), 'off', 'Explicit runtime motion safety must override decoration.');

console.log('Bible Journey Premium, peaceful scene, preference, and motion tests passed.');
