import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

const tabs = read('app/(tabs)/_layout.tsx');
assert.match(tabs, /name="bible-journey"[^>]*title: 'Journey'/s, 'The visible Journey tab must point to the additive Bible Journey hub.');
assert.match(tabs, /name="journey"[^>]*href: null/s, 'The existing Genesis map must stay available as a hidden route.');
assert.match(tabs, /detachInactiveScreens/);
assert.match(tabs, /freezeOnBlur: true/);
assert.doesNotMatch(tabs, /detachInactiveScreens=\{false\}/);

const hub = read('app/(tabs)/bible-journey.tsx');
for (const token of [
  'Continue Bible Journey',
  'Choose Any Book',
  "pathname: '/book-season'",
  "router.push('/book-library')",
  "router.push('/(tabs)/journey')",
  'loadBibleJourneyProgress',
  'syncGenesisJourneyCompletion',
  '66',
]) assert.equal(hub.includes(token), true, `Bible Journey hub must include ${token}.`);

const library = read('app/book-library.tsx');
for (const token of [
  'BIBLE_JOURNEY_BOOKS',
  'TextInput',
  'Old Testament',
  'New Testament',
  "router.push('/premium')",
  "pathname: '/book-season'",
  'Not Started',
  'In Progress',
  'Completed',
]) assert.equal(library.includes(token), true, `Book Library must include ${token}.`);

const season = read('app/book-season.tsx');
for (const token of [
  'buildBookTrials',
  'loadBibleJourneyProgress',
  "router.replace('/book-library')",
  "router.replace('/premium')",
  "pathname: '/book-trial'",
  'Return to Book Library',
]) assert.equal(season.includes(token), true, `Book season route must include ${token}.`);

const trial = read('app/book-trial.tsx');
for (const token of [
  'recordBibleJourneyTrial',
  'recordDailyCompletion',
  'question.explanation',
  "router.replace('/book-library')",
  "pathname: '/book-season'",
  'Save failed',
  'REFERENCE REVEALED AFTER ANSWER',
  'book-trial-feedback-scripture',
  'book-trial-result-scripture',
]) assert.equal(trial.includes(token), true, `Book trial route must include ${token}.`);
assert.doesNotMatch(trial, /<Text style=\{styles\.questionReference\}>\{question\.reference\}<\/Text>/, 'Book trials must not reveal references before grading.');
assert.doesNotMatch(trial, /<Text style=\{styles\.explanationReference\}>\{question\.reference\}<\/Text>/, 'Book-trial feedback references must be clickable.');

const victory = read('app/book-victory.tsx');
for (const token of [
  'completeBibleJourneyBook',
  'Continue to',
  'Choose Any Bible Book',
  'Replay',
  "router.replace('/book-library')",
]) assert.equal(victory.includes(token), true, `Book victory route must include ${token}.`);

const genesisVictory = read('app/season-victory.tsx');
assert.equal(genesisVictory.includes('Continue to Exodus'), true, 'Genesis Victory Hall must offer the next canonical book.');
assert.equal(genesisVictory.includes('Choose Any Bible Book'), true, 'Genesis Victory Hall must open the full library.');
assert.equal(genesisVictory.includes("params: { bookId: 'EXO' }"), true, 'Genesis handoff must target Exodus explicitly.');
assert.equal(genesisVictory.includes('Replay the Final Genesis Trial'), true, 'Existing Genesis replay action must remain.');
assert.equal(genesisVictory.includes('Return to Genesis Map'), true, 'Existing Genesis map action must remain.');

const settings = read('app/(tabs)/preferences.tsx');
for (const token of [
  'Choose Peaceful Background',
  "router.push('/background-picker')",
  'Daily Background Rotation',
  'Motion Off',
  'Gentle Motion',
  'Full Experience',
  'Faith Rhythm',
  'Grace Leaves',
  'Soft Piano',
  'Sound Effects',
  'Haptic Feedback',
]) assert.equal(settings.includes(token), true, `Settings must include ${token}.`);

const picker = read('app/background-picker.tsx');
for (const token of [
  'PEACEFUL_SCENES',
  'Cross on the Hill',
  'Random Rotation',
  'favorites',
  "router.push('/premium')",
  'Show All 50',
]) assert.equal(picker.includes(token), true, `Background picker must include ${token}.`);

const rootLayout = read('app/_layout.tsx');
assert.equal(rootLayout.includes('PremiumEntitlementProvider'), true, 'Root layout must provide Premium entitlement state below ProfileProvider.');

const entitlement = read('src/premium-entitlement.tsx');
for (const token of [
  'PREMIUM_PRODUCT_ID',
  'hasPremium',
  'purchaseLifetime',
  'restore',
  'store-unavailable',
  'createPurchaseClient',
  'localizedPrice',
]) assert.equal(entitlement.includes(token), true, `Premium entitlement boundary must include ${token}.`);
assert.doesNotMatch(entitlement, /is_premium\s*:\s*true/, 'The client must never fake a Premium profile flag.');
assert.doesNotMatch(entitlement, /useProfile\(\)/, 'Build 22 Premium must not use a local player profile as purchase authority.');
assert.doesNotMatch(entitlement, /AsyncStorage/, 'Production Premium access must not be granted through a local flag.');

const nativePurchaseClient = read('src/purchases/purchase-client.native.ts');
for (const token of [
  'EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY',
  'Purchases.purchasePackage',
  'Purchases.restorePurchases',
  'Purchases.ENTITLEMENT_VERIFICATION_MODE.INFORMATIONAL',
  'refresh',
]) assert.equal(nativePurchaseClient.includes(token), true, `Native purchase client must include ${token}.`);

const premium = read('app/premium.tsx');
for (const token of [
  'Genesis through Deuteronomy and Matthew through Acts',
  'remaining 56 Journey books',
  'Ten Full Books',
  'Unlock Forever',
  'Restore Purchase',
  'usePremiumEntitlement',
  'localizedPrice',
  'One-time lifetime purchase',
]) assert.equal(premium.includes(token), true, `Premium screen must include ${token}.`);
assert.doesNotMatch(premium, /remaining 62 Journey books/, 'Premium copy must not retain the old four-free-book count.');
assert.doesNotMatch(premium, /No charge was attempted|billing is not connected/i, 'Build 22 must not retain placeholder store copy.');

console.log('Bible journey route, Settings, and RevenueCat Premium contracts passed.');
