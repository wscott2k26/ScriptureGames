import { AppState, type AppStateStatus } from 'react-native';
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
    if (!readyRef.current || !musicEnabledRef.current || appState.current !== 'active') return;
    if (sound === 'piano') {
      if (!pianoStatus.isLoaded) return;
    } else if (sound === 'rain') {
      if (!rainStatus.isLoaded) return;
    } else {
      if (!readingStatus.isLoaded) return;
    }
    try {
      await ensureAudioSession();
      ambientPlayers[sound].play();
    } catch {
      // Ambient sound is optional and must never crash the app.
    }
  }, [ambientPlayers, pianoStatus.isLoaded, rainStatus.isLoaded, readingStatus.isLoaded]);

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
