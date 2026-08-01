import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = path.resolve(process.cwd());
const APP_DIR = path.join(ROOT, 'app');
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(full);
    return [full];
  });
}

const appFiles = walk(APP_DIR)
  .filter((file) => /\.(tsx|ts)$/.test(file))
  .map((file) => path.relative(APP_DIR, file).replaceAll('\\', '/'));

function routeVariants(file) {
  if (file.startsWith('+') || file.endsWith('/_layout.tsx') || file === '_layout.tsx') return [];
  let route = file.replace(/\.(tsx|ts)$/, '');
  if (route.endsWith('/index')) route = route.slice(0, -'/index'.length);
  if (route === 'index') route = '';
  const grouped = `/${route}`.replace(/\/$/, '') || '/';
  const publicRoute = grouped.replace(/\/\([^/]+\)/g, '').replace(/\/+/g, '/') || '/';
  return [...new Set([grouped, publicRoute])];
}

const routePatterns = appFiles.flatMap(routeVariants).map((route) => {
  const escaped = route
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\\\[\.\.\.([^\]]+)\\\]/g, '.+')
    .replace(/\\\[([^\]]+)\\\]/g, '[^/]+');
  return { route, regex: new RegExp(`^${escaped}$`) };
});

function routeExists(target) {
  const clean = target.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
  return routePatterns.some(({ regex }) => regex.test(clean));
}

const literalNavigation = [];
for (const file of appFiles) {
  const source = fs.readFileSync(path.join(APP_DIR, file), 'utf8');
  const patterns = [
    /router\.(?:push|replace|navigate)\(\s*['"]([^'"]+)['"]/g,
    /pathname\s*:\s*['"]([^'"]+)['"]/g,
    /href\s*=\s*['"]([^'"]+)['"]/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      const target = match[1];
      if (!target.startsWith('/') || target.startsWith('//') || target.includes('${')) continue;
      literalNavigation.push({ file, target });
      if (!routeExists(target)) fail(`Broken route target ${target} in app/${file}`);
    }
  }
}

const tabsLayout = read('app/(tabs)/_layout.tsx');
if (!/<Tabs\.Screen\s+name=["']settings["']/.test(tabsLayout)) {
  fail('Settings is not a visible persistent tab.');
}
if (!appFiles.includes('(tabs)/settings.tsx')) {
  fail('The visible Settings tab has no app/(tabs)/settings.tsx route.');
}

const companion = read('app/(tabs)/companion.tsx');
if (companion.includes('iosCategory:')) fail('Companion still overrides the iOS audio-session category.');
if (/iosVoiceProcessingEnabled\s*:\s*true/.test(companion)) fail('Companion still enables crash-prone iOS voice processing.');
if (companion.includes('ExpoSpeechRecognitionModule.start(')) fail('Companion starts the native recognizer directly instead of using the guarded Lumi voice helper.');
if (!companion.includes('startLumiListening')) fail('Companion is not connected to startLumiListening.');

const preferences = read('src/preferences-context.tsx');
for (const field of ['musicEnabled', 'soundEffectsEnabled', 'hapticsEnabled', 'motionMode']) {
  if (!preferences.includes(field)) fail(`Preferences schema is missing ${field}.`);
}

const rootLayout = read('app/_layout.tsx');
if (!rootLayout.includes('AudioProvider')) fail('Root layout is missing the app-wide AudioProvider.');

const screenHeader = read('src/components/premium/ScreenHeader.tsx');
if (!screenHeader.includes('DoveMark')) fail('Shared ScreenHeader is missing the sacred DoveMark.');
if (!screenHeader.includes('goBackOrHome')) fail('Shared ScreenHeader Back does not use a safe history fallback.');

const settingsCandidates = ['app/(tabs)/settings.tsx', 'app/settings.tsx'];
const settingsPath = settingsCandidates.find((candidate) => fs.existsSync(path.join(ROOT, candidate)));
const settingsSource = settingsPath ? read(settingsPath) : '';
for (const copy of ['Soft Piano', 'Sound Effects', 'Haptic Feedback', 'Motion Off']) {
  if (!settingsSource.includes(copy)) fail(`Settings is missing the ${copy} control/copy.`);
}

const backExclusions = new Set([
  'index.tsx',
  'onboarding.tsx',
  'faction-select.tsx',
  '+not-found.tsx',
  '+html.tsx',
]);
for (const file of appFiles) {
  if (file.startsWith('(tabs)/') || file.includes('/_layout.') || backExclusions.has(file)) continue;
  const source = fs.readFileSync(path.join(APP_DIR, file), 'utf8');
  const hasBack = /<ScreenHeader[^>]*\bback\b/.test(source)
    || source.includes('goBackOrHome(')
    || source.includes('router.back()');
  if (!hasBack) fail(`User-facing route app/${file} has no Back affordance.`);
}

const packageJson = JSON.parse(read('package.json'));
if (!packageJson.dependencies?.['expo-audio']) fail('expo-audio is not installed for safe local music/SFX playback.');
for (const asset of ['soft-piano.m4a', 'tap.m4a', 'success.m4a', 'error.m4a']) {
  if (!fs.existsSync(path.join(ROOT, 'assets/audio', asset))) fail(`Missing local audio asset assets/audio/${asset}.`);
}

if (failures.length) {
  console.error('SCRIPTURE GAMES RUNTIME STABILITY AUDIT — FAIL');
  for (const [index, message] of failures.entries()) console.error(`${index + 1}. ${message}`);
  console.error(`Routes scanned: ${appFiles.length}; literal navigation targets scanned: ${literalNavigation.length}.`);
  process.exit(1);
}

console.log('SCRIPTURE GAMES RUNTIME STABILITY AUDIT — PASS');
console.log(`Routes scanned: ${appFiles.length}; literal navigation targets scanned: ${literalNavigation.length}.`);
console.log('Settings, Back navigation, route integrity, speech safety, preferences, audio assets, and sacred headers are present.');
