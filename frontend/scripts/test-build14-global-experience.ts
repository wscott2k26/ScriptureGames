import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const read = (path: string) => readFileSync(fileURLToPath(new URL(`../${path}`, import.meta.url)), 'utf8');

const audio = read('src/audio-context.tsx');
assert.match(audio, /playsInSilentMode:\s*true/, 'App audio must play while an iPhone is in silent mode.');
assert.doesNotMatch(audio, /playsInSilentMode:\s*false/, 'Silent-mode suppression must not remain in the app audio session.');
assert.match(audio, /ensureAudioSession/, 'Audio must use one shared session activation helper.');
assert.match(audio, /configureSoundEffects[\s\S]*ensureAudioSession/, 'Sound effects must reactivate the audio session before replaying.');

const cinematic = read('src/components/premium/CinematicBackdrop.tsx');
assert.match(cinematic, /PeacefulBackdrop/, 'Ordinary cinematic screens must render the saved peaceful photo.');
assert.match(cinematic, /preserveSource\s*=\s*false/, 'Saved backgrounds must be the default for ordinary app screens.');
assert.match(cinematic, /preserveSource\s*\?/, 'The original local artwork must remain available for protected gameplay screens.');

const protectedGenesisScreens = [
  'app/(tabs)/journey.tsx',
  'app/genesis-trial.tsx',
  'app/genesis-quiz.tsx',
  'app/season-victory.tsx',
];
for (const path of protectedGenesisScreens) {
  assert.match(read(path), /<CinematicBackdrop[^>]*preserveSource/, `${path} must preserve the approved Genesis gameplay artwork.`);
}

const ordinaryScreens = [
  'app/(tabs)/command.tsx',
  'app/(tabs)/quiz.tsx',
  'app/(tabs)/bible.tsx',
  'app/(tabs)/companion.tsx',
];
for (const path of ordinaryScreens) {
  assert.doesNotMatch(read(path), /<CinematicBackdrop[^>]*preserveSource/, `${path} must follow the saved global background.`);
}

console.log('Build 14 global audio and background regression tests passed.');
