import { AppState, type AppStateStatus } from 'react-native';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { setAudioModeAsync, setIsAudioActiveAsync, useAudioPlayer, type AudioPlayer } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';

import { SOFT_PIANO_BASE64 } from './audio-soft-piano';
import { TAP_SOUND_BASE64 } from './audio-tap';
import { SUCCESS_SOUND_BASE64 } from './audio-success';
import { ERROR_SOUND_BASE64 } from './audio-error';
import { configureLumiVoiceAudio } from './lumi-voice';
import { configureSoundEffects, type SoundCue } from './sfx';
import { usePreferences } from './preferences-context';

type AudioFiles = Record<'piano' | 'tap' | 'success' | 'error', string>;

type AudioContextValue = {
  ready: boolean;
  previewSound: (cue: Exclude<SoundCue, 'tap'>) => void;
};

const AudioContext = createContext<AudioContextValue | null>(null);
const AUDIO_DIRECTORY = `${FileSystem.cacheDirectory || ''}scripture-games-audio/`;

const AUDIO_DEFINITIONS = [
  ['piano', 'soft-piano.m4a', SOFT_PIANO_BASE64],
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
    if (!info.exists) {
      await FileSystem.writeAsStringAsync(uri, data, { encoding: FileSystem.EncodingType.Base64 });
    }
    return [key, uri] as const;
  }));
  return Object.fromEntries(entries) as AudioFiles;
}

function replay(player: AudioPlayer) {
  void player.seekTo(0)
    .then(() => player.play())
    .catch(() => {
      // Sound effects are optional and never block gameplay or navigation.
    });
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const { preferences } = usePreferences();
  const piano = useAudioPlayer(null);
  const tap = useAudioPlayer(null);
  const success = useAudioPlayer(null);
  const error = useAudioPlayer(null);
  const [ready, setReady] = useState(false);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const musicEnabledRef = useRef(preferences.musicEnabled);
  const readyRef = useRef(false);

  useEffect(() => {
    musicEnabledRef.current = preferences.musicEnabled;
  }, [preferences.musicEnabled]);

  useEffect(() => {
    let active = true;
    void materializeBundledAudio()
      .then((files) => {
        if (!active) return;
        piano.replace({ uri: files.piano });
        tap.replace({ uri: files.tap });
        success.replace({ uri: files.success });
        error.replace({ uri: files.error });
        piano.loop = true;
        piano.volume = 0.12;
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
  }, [error, piano, success, tap]);

  const pauseMusic = useCallback(() => {
    try { piano.pause(); } catch { /* Optional audio. */ }
  }, [piano]);

  const resumeMusic = useCallback(async () => {
    if (!readyRef.current || !musicEnabledRef.current || appState.current !== 'active') return;
    try {
      await setIsAudioActiveAsync(true);
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: false, shouldPlayInBackground: false });
      piano.play();
    } catch {
      // Ambient music is optional and must never crash the app.
    }
  }, [piano]);

  useEffect(() => {
    if (!ready) return;
    if (preferences.musicEnabled) void resumeMusic();
    else pauseMusic();
  }, [pauseMusic, preferences.musicEnabled, ready, resumeMusic]);

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
          replay(players[cue]);
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
      resumeAfterVoice: async () => {
        try { await setIsAudioActiveAsync(true); } catch { /* Optional audio. */ }
        await resumeMusic();
      },
    });
    return () => configureLumiVoiceAudio({});
  }, [pauseMusic, resumeMusic]);

  const previewSound = useCallback((cue: Exclude<SoundCue, 'tap'>) => {
    if (!preferences.soundEffectsEnabled || !readyRef.current) return;
    replay(cue === 'success' ? success : error);
  }, [error, preferences.soundEffectsEnabled, success]);

  const value = useMemo(() => ({ ready, previewSound }), [previewSound, ready]);
  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAppAudio() {
  const value = useContext(AudioContext);
  if (!value) throw new Error('useAppAudio must be used inside AudioProvider');
  return value;
}
