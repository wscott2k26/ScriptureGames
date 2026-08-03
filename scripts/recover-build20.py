from __future__ import annotations

import base64
import io
import json
import math
import random
import re
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "frontend"


def read(relative: str) -> str:
    return (FRONTEND / relative).read_text(encoding="utf-8")


def write(relative: str, content: str) -> None:
    path = FRONTEND / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def replace_once(relative: str, old: str, new: str) -> None:
    content = read(relative)
    if old not in content:
        raise RuntimeError(f"Expected recovery seam was not found in {relative}: {old[:120]!r}")
    write(relative, content.replace(old, new, 1))


def make_loop(kind: str, seconds: int = 8, sample_rate: int = 16000) -> str:
    rng = random.Random(20260802 if kind == "rain" else 20260803)
    count = seconds * sample_rate
    samples: list[float] = []
    low = 0.0
    brown = 0.0
    drops: dict[int, float] = {}
    if kind == "rain":
        for _ in range(44):
            drops[rng.randrange(count)] = rng.uniform(0.18, 0.52)

    for index in range(count):
        white = rng.uniform(-1.0, 1.0)
        if kind == "rain":
            low = low * 0.88 + white * 0.12
            high = white - low
            value = low * 0.38 + high * 0.13
            for start, strength in tuple(drops.items()):
                offset = index - start
                if 0 <= offset < 320:
                    envelope = math.exp(-offset / 80)
                    value += math.sin(offset * 0.41) * envelope * strength
        else:
            brown = max(-1.0, min(1.0, brown + white * 0.018))
            low = low * 0.995 + white * 0.005
            hum = math.sin(2 * math.pi * 72 * index / sample_rate) * 0.018
            slow = math.sin(2 * math.pi * 0.17 * index / sample_rate) * 0.025
            crackle = white * 0.05 if rng.random() < 0.003 else 0.0
            value = brown * 0.22 + low * 0.12 + hum + slow + crackle
        samples.append(value)

    crossfade = sample_rate // 2
    for i in range(crossfade):
        ratio = i / crossfade
        end_index = count - crossfade + i
        blended = samples[end_index] * (1 - ratio) + samples[i] * ratio
        samples[end_index] = blended

    peak = max(max(abs(value) for value in samples), 0.001)
    scale = 0.78 / peak
    pcm = bytearray()
    for value in samples:
        sample = int(max(-1.0, min(1.0, value * scale)) * 32767)
        pcm.extend(sample.to_bytes(2, "little", signed=True))

    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        wav.writeframes(bytes(pcm))
    return base64.b64encode(buffer.getvalue()).decode("ascii")


# Preferences: preserve the old music toggle while adding one selected ambient source.
replace_once(
    "src/preferences-core.ts",
    "export type VoiceReplyMode = 'always' | 'voice-only' | 'off';\n",
    "export type VoiceReplyMode = 'always' | 'voice-only' | 'off';\nexport type AmbientSound = 'piano' | 'rain' | 'reading';\n",
)
replace_once(
    "src/preferences-core.ts",
    "  musicEnabled: boolean;\n",
    "  musicEnabled: boolean;\n  ambientSound: AmbientSound;\n",
)
replace_once(
    "src/preferences-core.ts",
    "  musicEnabled: true,\n",
    "  musicEnabled: true,\n  ambientSound: 'piano',\n",
)
replace_once(
    "src/preferences-core.ts",
    "const VOICE_MODES: readonly VoiceReplyMode[] = ['always', 'voice-only', 'off'];\n",
    "const VOICE_MODES: readonly VoiceReplyMode[] = ['always', 'voice-only', 'off'];\nconst AMBIENT_SOUNDS: readonly AmbientSound[] = ['piano', 'rain', 'reading'];\n",
)
replace_once(
    "src/preferences-core.ts",
    "    musicEnabled: typeof saved.musicEnabled === 'boolean' ? saved.musicEnabled : DEFAULT_PREFERENCES.musicEnabled,\n",
    "    musicEnabled: typeof saved.musicEnabled === 'boolean' ? saved.musicEnabled : DEFAULT_PREFERENCES.musicEnabled,\n    ambientSound: AMBIENT_SOUNDS.includes(saved.ambientSound as AmbientSound) ? saved.ambientSound as AmbientSound : DEFAULT_PREFERENCES.ambientSound,\n",
)
replace_once(
    "src/preferences-context.tsx",
    "  type AppPreferences,\n  type VoiceReplyMode,\n",
    "  type AmbientSound,\n  type AppPreferences,\n  type VoiceReplyMode,\n",
)
replace_once(
    "src/preferences-context.tsx",
    "export type { AppPreferences, MotionMode, VoiceReplyMode };\n",
    "export type { AmbientSound, AppPreferences, MotionMode, VoiceReplyMode };\n",
)

rain = make_loop("rain")
reading = make_loop("reading")
write("src/audio-soft-rain.ts", f"export const SOFT_RAIN_BASE64 = '{rain}';\n")
write("src/audio-reading-room.ts", f"export const READING_ROOM_BASE64 = '{reading}';\n")

write(
    "src/audio-context.tsx",
    """import { AppState, type AppStateStatus } from 'react-native';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { setAudioModeAsync, setIsAudioActiveAsync, useAudioPlayer, useAudioPlayerStatus, type AudioPlayer } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';

import { SOFT_PIANO_BASE64 } from './audio-soft-piano';
import { SOFT_RAIN_BASE64 } from './audio-soft-rain';
import { READING_ROOM_BASE64 } from './audio-reading-room';
import { TAP_SOUND_BASE64 } from './audio-tap';
import { SUCCESS_SOUND_BASE64 } from './audio-success';
import { ERROR_SOUND_BASE64 } from './audio-error';
import { configureLumiVoiceAudio } from './lumi-voice';
import { configureSoundEffects, type SoundCue } from './sfx';
import { usePreferences } from './preferences-context';
import type { AmbientSound } from './preferences-core';

type AudioFiles = Record<'piano' | 'rain' | 'reading' | 'tap' | 'success' | 'error', string>;

type AudioContextValue = {
  ready: boolean;
  previewSound: (cue: Exclude<SoundCue, 'tap'>) => void;
};

const AudioContext = createContext<AudioContextValue | null>(null);
const AUDIO_DIRECTORY = `${FileSystem.cacheDirectory || ''}scripture-games-audio/`;

const AUDIO_DEFINITIONS = [
  ['piano', 'soft-piano.m4a', SOFT_PIANO_BASE64],
  ['rain', 'soft-rain.wav', SOFT_RAIN_BASE64],
  ['reading', 'reading-room.wav', READING_ROOM_BASE64],
  ['tap', 'tap.m4a', TAP_SOUND_BASE64],
  ['success', 'success.m4a', SUCCESS_SOUND_BASE64],
  ['error', 'error.m4a', ERROR_SOUND_BASE64],
] as const;

async function materializeBundledAudio(): Promise<AudioFiles> {
  if (!FileSystem.cacheDirectory) throw new Error('Audio cache is unavailable.');
  await FileSystem.makeDirectoryAsync(AUDIO_DIRECTORY, { intermediates: true });
  const entries = await Promise.all(AUDIO_DEFINITIONS.map(async ([key, filename, data]) => {
    const uri = `${AUDIO_DIRECTORY}${filename}`;
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) await FileSystem.writeAsStringAsync(uri, data, { encoding: FileSystem.EncodingType.Base64 });
    return [key, uri] as const;
  }));
  return Object.fromEntries(entries) as AudioFiles;
}

async function ensureAudioSession() {
  await setAudioModeAsync({
    allowsRecording: false,
    playsInSilentMode: true,
    shouldPlayInBackground: false,
    interruptionMode: 'mixWithOthers',
  });
  await setIsAudioActiveAsync(true);
}

function replay(player: AudioPlayer) {
  void player.seekTo(0).then(() => player.play()).catch(() => undefined);
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const { preferences } = usePreferences();
  const piano = useAudioPlayer(null);
  const rain = useAudioPlayer(null);
  const reading = useAudioPlayer(null);
  const pianoStatus = useAudioPlayerStatus(piano);
  const rainStatus = useAudioPlayerStatus(rain);
  const readingStatus = useAudioPlayerStatus(reading);
  const tap = useAudioPlayer(null);
  const success = useAudioPlayer(null);
  const error = useAudioPlayer(null);
  const [ready, setReady] = useState(false);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const musicEnabledRef = useRef(preferences.musicEnabled);
  const ambientSoundRef = useRef<AmbientSound>(preferences.ambientSound);
  const readyRef = useRef(false);

  const ambientPlayers = useMemo<Record<AmbientSound, AudioPlayer>>(() => ({ piano, rain, reading }), [piano, rain, reading]);
  const ambientLoaded = useMemo<Record<AmbientSound, boolean>>(() => ({
    piano: pianoStatus.isLoaded,
    rain: rainStatus.isLoaded,
    reading: readingStatus.isLoaded,
  }), [pianoStatus.isLoaded, rainStatus.isLoaded, readingStatus.isLoaded]);

  useEffect(() => {
    musicEnabledRef.current = preferences.musicEnabled;
    ambientSoundRef.current = preferences.ambientSound;
  }, [preferences.ambientSound, preferences.musicEnabled]);

  useEffect(() => {
    let active = true;
    void ensureAudioSession()
      .then(() => materializeBundledAudio())
      .then((files) => {
        if (!active) return;
        piano.replace({ uri: files.piano });
        rain.replace({ uri: files.rain });
        reading.replace({ uri: files.reading });
        tap.replace({ uri: files.tap });
        success.replace({ uri: files.success });
        error.replace({ uri: files.error });
        piano.loop = true;
        rain.loop = true;
        reading.loop = true;
        piano.volume = 0.12;
        rain.volume = 0.17;
        reading.volume = 0.14;
        tap.volume = 0.28;
        success.volume = 0.32;
        error.volume = 0.25;
        readyRef.current = true;
        setReady(true);
      })
      .catch(() => {
        readyRef.current = false;
        setReady(false);
      });
    return () => { active = false; };
  }, [error, piano, rain, reading, success, tap]);

  const pauseMusic = useCallback(() => {
    for (const player of Object.values(ambientPlayers)) {
      try { player.pause(); } catch { /* Optional ambience. */ }
    }
  }, [ambientPlayers]);

  const resumeMusic = useCallback(async () => {
    const sound = ambientSoundRef.current;
    if (!readyRef.current || !musicEnabledRef.current || appState.current !== 'active' || !ambientLoaded[sound]) return;
    try {
      await ensureAudioSession();
      ambientPlayers[sound].play();
    } catch {
      // Ambient sound is optional and must never crash the app.
    }
  }, [ambientLoaded, ambientPlayers]);

  useEffect(() => {
    if (!ready) return;
    pauseMusic();
    if (preferences.musicEnabled) void resumeMusic();
  }, [pauseMusic, preferences.ambientSound, preferences.musicEnabled, ready, resumeMusic]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      appState.current = nextState;
      if (nextState === 'active') void resumeMusic();
      else pauseMusic();
    });
    return () => subscription.remove();
  }, [pauseMusic, resumeMusic]);

  useEffect(() => {
    const players: Record<SoundCue, AudioPlayer> = { tap, success, error };
    configureSoundEffects(preferences.soundEffectsEnabled
      ? (cue) => {
          if (!readyRef.current || appState.current !== 'active') return;
          void ensureAudioSession().then(() => replay(players[cue])).catch(() => undefined);
        }
      : null);
    return () => configureSoundEffects(null);
  }, [error, preferences.soundEffectsEnabled, success, tap]);

  useEffect(() => {
    configureLumiVoiceAudio({
      pauseForVoice: async () => {
        pauseMusic();
        try { await setIsAudioActiveAsync(false); } catch { /* Speech still gets a chance. */ }
      },
      resumeAfterVoice: async () => { await resumeMusic(); },
    });
    return () => configureLumiVoiceAudio({});
  }, [pauseMusic, resumeMusic]);

  const previewSound = useCallback((cue: Exclude<SoundCue, 'tap'>) => {
    if (!preferences.soundEffectsEnabled || !readyRef.current) return;
    void ensureAudioSession().then(() => replay(cue === 'success' ? success : error)).catch(() => undefined);
  }, [error, preferences.soundEffectsEnabled, success]);

  const value = useMemo(() => ({ ready, previewSound }), [previewSound, ready]);
  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAppAudio() {
  const value = useContext(AudioContext);
  if (!value) throw new Error('useAppAudio must be used inside AudioProvider');
  return value;
}
""",
)

replace_once(
    "app/(tabs)/preferences.tsx",
    "import { usePreferences, type MotionMode } from '@/src/preferences-context';",
    "import { usePreferences, type AmbientSound, type MotionMode } from '@/src/preferences-context';",
)
replace_once(
    "app/(tabs)/preferences.tsx",
    "];\n\nexport default function PreferencesScreen()",
    "];\n\nconst AMBIENT_OPTIONS: { value: AmbientSound; label: string; description: string; icon: keyof typeof Ionicons.glyphMap }[] = [\n  { value: 'piano', label: 'Soft Piano', description: 'Quiet original piano for prayer, study, and calm play.', icon: 'musical-notes' },\n  { value: 'rain', label: 'Gentle Rain', description: 'A soft looping rain bed with no thunder or sudden volume changes.', icon: 'rainy' },\n  { value: 'reading', label: 'Quiet Reading Room', description: 'Warm room tone for focused Bible reading and reflection.', icon: 'book-outline' },\n];\n\nexport default function PreferencesScreen()",
)
old_piano = """            <SettingToggle
              icon="musical-notes"
              title="Soft Piano"
              description="Play quiet original piano ambience. It pauses for Lumi’s microphone and whenever the app leaves the foreground."
              value={preferences.musicEnabled}
              onValueChange={(musicEnabled) => void updatePreferences({ musicEnabled })}
            />
            <View style={styles.divider} />
"""
new_ambient = """            <SettingToggle
              icon="volume-high"
              title="Ambient Audio"
              description="Play the selected peaceful sound. It pauses for Lumi’s microphone and whenever the app leaves the foreground."
              value={preferences.musicEnabled}
              onValueChange={(musicEnabled) => void updatePreferences({ musicEnabled })}
            />
            <View style={styles.divider} />
            <Text style={styles.label}>AMBIENT SOUND</Text>
            <View style={styles.motionList}>
              {AMBIENT_OPTIONS.map((option) => {
                const selected = preferences.ambientSound === option.value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${option.label}. ${option.description}`}
                    onPress={() => void updatePreferences({ ambientSound: option.value, musicEnabled: true })}
                    style={[styles.motionOption, selected && styles.motionSelected]}
                  >
                    <View style={styles.toggleIcon}><Ionicons name={option.icon} size={20} color={colors.brand} /></View>
                    <View style={styles.motionCopy}>
                      <Text style={styles.motionTitle}>{option.label}</Text>
                      <Text style={styles.motionDescription}>{option.description}</Text>
                    </View>
                    <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={22} color={selected ? colors.brand : colors.muted} />
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.divider} />
"""
replace_once("app/(tabs)/preferences.tsx", old_piano, new_ambient)
replace_once(
    "app/(tabs)/preferences.tsx",
    "Music, feedback sounds, and Bible content are bundled offline.",
    "Piano, rain, reading-room ambience, feedback sounds, and Bible content are bundled offline.",
)

# Reuse the physically proven ScriptureLink/Bible tab instead of a second passage reader.
book_mastery = read("app/book-mastery.tsx")
book_mastery = book_mastery.replace(
    "import { ScriptureReferenceLink } from '@/src/components/ScriptureReferenceLink';",
    "import { ScriptureLink } from '@/src/components/ScriptureLink';",
)
book_mastery = book_mastery.replace("<ScriptureReferenceLink", "<ScriptureLink")
book_mastery = book_mastery.replace(
    'label="Open Passage Before Answering" testID="mastery-open-passage"',
    'label="Open Passage Before Answering" returnLabel="Return to Book Mastery" testID="mastery-open-passage"',
)
book_mastery = book_mastery.replace(
    'reference={question.reference} testID="mastery-feedback-scripture"',
    'reference={question.reference} returnLabel="Return to Book Mastery" testID="mastery-feedback-scripture"',
)
write("app/book-mastery.tsx", book_mastery)
for duplicate in ["app/passage-reader.tsx", "src/components/ScriptureReferenceLink.tsx"]:
    path = FRONTEND / duplicate
    if path.exists():
        path.unlink()

# Add the two Bible book shelves to the proven Build 18 Training hub.
quiz_hub = read("app/(tabs)/quiz.tsx")
if "BOOK_MASTERY_BOOKS" not in quiz_hub:
    quiz_hub = quiz_hub.replace(
        "import { GENESIS_BACKGROUNDS } from '@/src/genesis-season';",
        "import { BOOK_MASTERY_BOOKS } from '@/src/book-mastery';\nimport { GENESIS_BACKGROUNDS } from '@/src/genesis-season';",
    )
    quiz_hub = quiz_hub.replace(
        "  };\n\n  return (",
        "  };\n\n  const openBook = (book: (typeof BOOK_MASTERY_BOOKS)[number]) => {\n    router.push({ pathname: '/book-mastery', params: { book: book.id, mode: 'core' } });\n  };\n\n  return (",
    )
    shelves = """
          <SectionTitle title="Old Testament Books" />
          <View style={styles.list}>
            {BOOK_MASTERY_BOOKS.filter((book) => book.testament === 'old').map((book) => (
              <FeatureCard
                key={book.id}
                testID={`book-mastery-${book.id}`}
                title={book.title}
                description={book.summary}
                accent={colors.brand}
                icon={<Text style={styles.bookIcon}>{book.icon}</Text>}
                badge="5 FREE · 10 DEEP"
                onPress={() => openBook(book)}
              />
            ))}
          </View>

          <SectionTitle title="New Testament Books" />
          <View style={styles.list}>
            {BOOK_MASTERY_BOOKS.filter((book) => book.testament === 'new').map((book) => (
              <FeatureCard
                key={book.id}
                testID={`book-mastery-${book.id}`}
                title={book.title}
                description={book.summary}
                accent={colors.brandSecondary}
                icon={<Text style={styles.bookIcon}>{book.icon}</Text>}
                badge="5 FREE · 10 DEEP"
                onPress={() => openBook(book)}
              />
            ))}
          </View>

"""
    quiz_hub = quiz_hub.replace('          <SectionTitle title="Memory & Skill" />', shelves + '          <SectionTitle title="Memory & Skill" />')
    quiz_hub = quiz_hub.replace("  list: { gap: spacing.md },\n", "  list: { gap: spacing.md },\n  bookIcon: { fontSize: 25 },\n")
write("app/(tabs)/quiz.tsx", quiz_hub)

# Chronological classic rounds while preserving randomized answer placement.
local_api = read("src/local-api.ts")
if "sortSelectedQuizQuestions" not in local_api:
    local_api = local_api.replace(
        "import { JOURNEY_NODES, PUZZLES, QUIZ_QUESTIONS, STORIES, VERSES } from './content.generated';",
        "import { JOURNEY_NODES, PUZZLES, QUIZ_QUESTIONS, STORIES, VERSES } from './content.generated';\nimport { sortSelectedQuizQuestions } from './quiz-ordering';",
    )
start = local_api.find("  async getQuiz(")
if start < 0:
    raise RuntimeError("getQuiz method was not found")
end = local_api.find("\n  },", start)
if end < 0:
    raise RuntimeError("getQuiz method end was not found")
method_header_end = local_api.find("{", start)
method_header = local_api[start:method_header_end + 1]
new_method = method_header + "\n    const all = QUIZ_QUESTIONS as unknown as Record<string, readonly QuizQuestion[]>;\n    const pool = all[topic] || all.general;\n    const selected = shuffle(pool).slice(0, Math.max(1, limit));\n    const questions = sortSelectedQuizQuestions(topic, selected).map(shuffleQuestion);\n    return { topic, questions };"
local_api = local_api[:start] + new_method + local_api[end:]
write("src/local-api.ts", local_api)

# Guarantee every classic and Daily Bread answer has a valid passage target.
quiz_play = read("app/quiz-play.tsx")
if "resolveQuizReference" not in quiz_play:
    quiz_play = quiz_play.replace(
        "import { ScriptureLink } from '@/src/components/ScriptureLink';",
        "import { ScriptureLink } from '@/src/components/ScriptureLink';\nimport { resolveQuizReference } from '@/src/quiz-reference-resolution';",
    )
    quiz_play = quiz_play.replace(
        "  const correctSelection = checked && selected === question?.answer;",
        "  const correctSelection = checked && selected === question?.answer;\n  const resolvedReference = question ? resolveQuizReference(question.q, question.verse) : '2 Timothy 3:16';",
    )
    old_link = """                {question.verse ? (
                  <ScriptureLink
                    reference={question.verse}
                    prefix="Source:"
                    returnLabel="Return to Quiz"
                    testID="quiz-scripture-reference"
                  />
                ) : null}
"""
    new_link = """                <ScriptureLink
                  reference={resolvedReference}
                  prefix="Source:"
                  returnLabel="Return to Quiz"
                  testID="quiz-scripture-reference"
                />
"""
    if old_link not in quiz_play:
        raise RuntimeError("Classic quiz Scripture link seam was not found")
    quiz_play = quiz_play.replace(old_link, new_link, 1)
write("app/quiz-play.tsx", quiz_play)

daily = read("app/daily-challenge.tsx")
if "resolveQuizReference" not in daily:
    daily = daily.replace(
        "import { ScriptureLink } from '@/src/components/ScriptureLink';",
        "import { ScriptureLink } from '@/src/components/ScriptureLink';\nimport { resolveQuizReference } from '@/src/quiz-reference-resolution';",
    )
    daily = daily.replace(
        "  const question = challenge.questions[index];",
        "  const question = challenge.questions[index];\n  const resolvedReference = resolveQuizReference(question.q, question.verse);",
    )
    daily = daily.replace(
        "    const verse = challenge.questions.find((item) => item.verse)?.verse;",
        "    const verseQuestion = challenge.questions.find((item) => item.verse);\n    const verse = verseQuestion ? resolveQuizReference(verseQuestion.q, verseQuestion.verse) : undefined;",
    )
    daily = daily.replace(
        "    const witnessVerse = challenge.questions.find((item) => item.verse)?.verse;",
        "    const witnessQuestion = challenge.questions.find((item) => item.verse);\n    const witnessVerse = witnessQuestion ? resolveQuizReference(witnessQuestion.q, witnessQuestion.verse) : undefined;",
    )
    daily = daily.replace(
        "{question.verse ? <ScriptureLink reference={question.verse} compact tone=\"muted\" returnLabel=\"Return to Daily Bread\" /> : null}",
        "<ScriptureLink reference={resolvedReference} compact tone=\"muted\" returnLabel=\"Return to Daily Bread\" />",
    )
    daily = daily.replace(
        "{question.verse ? <ScriptureLink reference={question.verse} prefix=\"Read it in context:\" returnLabel=\"Return to Daily Bread\" /> : null}",
        "<ScriptureLink reference={resolvedReference} prefix=\"Read it in context:\" returnLabel=\"Return to Daily Bread\" />",
    )
write("app/daily-challenge.tsx", daily)

# Wire every old and new gate together.
package_path = FRONTEND / "package.json"
package_data = json.loads(package_path.read_text(encoding="utf-8"))
scripts = package_data["scripts"]
scripts["test:quiz-ordering"] = "node --experimental-strip-types scripts/test-quiz-ordering.ts"
scripts["test:book-mastery"] = "node --experimental-strip-types scripts/test-book-mastery.ts"
scripts["audit:book-mastery"] = "node --experimental-strip-types scripts/audit-book-mastery.ts"
scripts["test:build20"] = "node --experimental-strip-types scripts/test-build20-recovery.ts"
new_chain = "yarn test:quiz-ordering && yarn test:book-mastery && yarn audit:book-mastery && yarn test:build20"
for key in ["eas-build-post-install", "validate"]:
    if new_chain not in scripts[key]:
        scripts[key] = scripts[key].replace("yarn test:lumi", f"{new_chain} && yarn test:lumi", 1)
package_path.write_text(json.dumps(package_data, indent=2) + "\n", encoding="utf-8")

# Extend the Build 18 quality workflow rather than replacing it with the older main workflow.
quality_path = ROOT / ".github/workflows/quality-gate.yml"
quality = quality_path.read_text(encoding="utf-8")
if "Test Build 20 recovery coexistence" not in quality:
    marker = "      - name: Test Lumi response engine\n"
    additions = """      - name: Test chronological quiz ordering
        working-directory: frontend
        run: yarn test:quiz-ordering

      - name: Test Book Mastery selection and depth
        working-directory: frontend
        run: yarn test:book-mastery

      - name: Audit Book Mastery and Scripture links
        working-directory: frontend
        run: yarn audit:book-mastery

      - name: Test Build 20 recovery coexistence
        working-directory: frontend
        run: yarn test:build20

"""
    if marker not in quality:
        raise RuntimeError("Quality-gate insertion seam was not found")
    quality = quality.replace(marker, additions + marker, 1)
quality_path.write_text(quality, encoding="utf-8")

# Obsolete one-use release machinery must never follow the recovered source.
for relative in [
    ".github/workflows/ios-build18-testflight-once.yml",
    ".github/status-triggers/ios-build18-authorized.md",
    ".github/workflows/build19-status-watch.yml",
]:
    path = ROOT / relative
    if path.exists():
        path.unlink()

print("Build 20 recovery source assembled.")
