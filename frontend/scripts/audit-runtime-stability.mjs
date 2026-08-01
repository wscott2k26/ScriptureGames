import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = path.resolve(process.cwd());
const APP_DIR = path.join(ROOT, 'app');
const failures = [];

function fail(message) { failures.push(message); }
function read(relativePath) { return fs.readFileSync(path.join(ROOT, relativePath), 'utf8'); }
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
if (!/<Tabs\.Screen\s+name=["']preferences["']/.test(tabsLayout)) fail('Settings is not represented by the persistent preferences tab.');
if (!appFiles.includes('(tabs)/preferences.tsx')) fail('The visible Settings destination has no app/(tabs)/preferences.tsx route.');
if (!tabsLayout.includes('detachInactiveScreens={false}')) fail('Tab screens may detach and lose Lumi/Bible working state.');
if (!tabsLayout.includes('popToTopOnBlur: false')) fail('Tab switching is not explicitly configured to preserve each tab stack.');
if (!/tabBarStyle\s*:\s*\{[^}]*display\s*:\s*['"]none['"]/s.test(tabsLayout)) fail('The old navigator tab bar is still visible instead of the root-level persistent dock.');

const companion = read('app/(tabs)/companion.tsx');
if (companion.includes('iosCategory:')) fail('Companion still overrides the iOS audio-session category.');
if (/iosVoiceProcessingEnabled\s*:\s*true/.test(companion)) fail('Companion still enables crash-prone iOS voice processing.');
if (companion.includes('ExpoSpeechRecognitionModule.start(')) fail('Companion starts the native recognizer directly instead of using the guarded Lumi voice helper.');
if (!companion.includes('startLumiListening')) fail('Companion is not connected to startLumiListening.');
if (!companion.includes('LUMI_DRAFT_PREFIX')) fail('Lumi does not persist an unsent draft while users consult the Bible.');

const preferences = read('src/preferences-context.tsx');
for (const field of ['musicEnabled', 'soundEffectsEnabled', 'hapticsEnabled', 'motionMode']) {
  if (!preferences.includes(field)) fail(`Preferences schema is missing ${field}.`);
}

const rootLayout = read('app/_layout.tsx');
if (!rootLayout.includes('AudioProvider')) fail('Root layout is missing the app-wide AudioProvider.');
if (!rootLayout.includes('GlobalNavigationDock')) fail('The main navigation is not mounted above the root navigator.');
if (!fs.existsSync(path.join(ROOT, 'src/components/navigation/GlobalNavigationDock.tsx'))) fail('The persistent GlobalNavigationDock component is missing.');

const audioContext = read('src/audio-context.tsx');
if (!audioContext.includes('configureLumiVoiceAudio')) fail('App audio is not coordinated with Lumi speech recognition.');
if (!audioContext.includes('setIsAudioActiveAsync(false)')) fail('Lumi microphone does not safely release app playback audio.');
if (!audioContext.includes('shouldPlayInBackground: false')) fail('Ambient piano must remain foreground-only.');
if (!audioContext.includes('piano.volume = 0.12')) fail('Soft piano is not capped at a gentle volume.');

const screenHeader = read('src/components/premium/ScreenHeader.tsx');
if (!screenHeader.includes('DoveMark')) fail('Shared ScreenHeader is missing the sacred DoveMark.');
if (!screenHeader.includes('goBackOrHome')) fail('Shared ScreenHeader Back does not use a safe history fallback.');

const settingsSource = read('app/(tabs)/preferences.tsx');
for (const copy of ['Soft Piano', 'Sound Effects', 'Haptic Feedback', 'Motion Off']) {
  if (!settingsSource.includes(copy)) fail(`Visible Settings is missing the ${copy} control/copy.`);
}

const backExclusions = new Set(['_layout.tsx', 'index.tsx', 'onboarding.tsx', 'faction-select.tsx', '+not-found.tsx', '+html.tsx']);
for (const file of appFiles) {
  if (file.startsWith('(tabs)/') || file.includes('/_layout.') || backExclusions.has(file)) continue;
  const source = fs.readFileSync(path.join(APP_DIR, file), 'utf8');
  const hasStandardBack = /<ScreenHeader[^>]*\bback\b/.test(source) || source.includes('goBackOrHome(') || source.includes('router.back()');
  const hasDedicatedReturn = file === 'season-victory.tsx'
    && source.includes('Return to the Trial Map')
    && source.includes('Return to Genesis Map');
  if (!hasStandardBack && !hasDedicatedReturn) fail(`User-facing route app/${file} has no Back or dedicated return affordance.`);
}

const packageJson = JSON.parse(read('package.json'));
if (!packageJson.dependencies?.['expo-audio']) fail('expo-audio is not installed for safe local music/SFX playback.');
if (!packageJson.dependencies?.['expo-file-system']) fail('expo-file-system is not directly locked for offline audio materialization.');
for (const asset of ['audio-soft-piano.ts', 'audio-tap.ts', 'audio-success.ts', 'audio-error.ts']) {
  if (!fs.existsSync(path.join(ROOT, 'src', asset))) fail(`Missing bundled offline audio module src/${asset}.`);
}

if (failures.length) {
  console.error('SCRIPTURE GAMES RUNTIME STABILITY AUDIT — FAIL');
  for (const [index, message] of failures.entries()) console.error(`${index + 1}. ${message}`);
  console.error(`Routes scanned: ${appFiles.length}; literal navigation targets scanned: ${literalNavigation.length}.`);
  process.exit(1);
}

console.log('SCRIPTURE GAMES RUNTIME STABILITY AUDIT — PASS');
console.log(`Routes scanned: ${appFiles.length}; literal navigation targets scanned: ${literalNavigation.length}.`);
console.log('Persistent navigation, Settings, Back behavior, route integrity, Lumi draft retention, speech safety, offline audio, preferences, and sacred headers are present.');
