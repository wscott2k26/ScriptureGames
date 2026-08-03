import { DEFAULT_PEACEFUL_SCENE_ID, getPeacefulScene } from './backgrounds/peaceful-scenes.ts';
import type { MotionMode } from './motion-intensity.ts';

export type VoiceReplyMode = 'always' | 'voice-only' | 'off';
export type AmbientSound = 'piano' | 'rain' | 'reading';

export type AppPreferences = {
  musicEnabled: boolean;
  ambientSound: AmbientSound;
  soundEffectsEnabled: boolean;
  hapticsEnabled: boolean;
  motionMode: MotionMode;
  cinematicTextEnabled: boolean;
  voiceReplyMode: VoiceReplyMode;
  backgroundId: string;
  backgroundRotationEnabled: boolean;
  favoriteBackgroundIds: string[];
};

export const DEFAULT_PREFERENCES: AppPreferences = {
  musicEnabled: true,
  ambientSound: 'piano',
  soundEffectsEnabled: true,
  hapticsEnabled: true,
  motionMode: 'system',
  cinematicTextEnabled: true,
  voiceReplyMode: 'voice-only',
  backgroundId: DEFAULT_PEACEFUL_SCENE_ID,
  backgroundRotationEnabled: false,
  favoriteBackgroundIds: [],
};

const MOTION_MODES: readonly MotionMode[] = ['system', 'reduced', 'gentle', 'full'];
const VOICE_MODES: readonly VoiceReplyMode[] = ['always', 'voice-only', 'off'];
const AMBIENT_SOUNDS: readonly AmbientSound[] = ['piano', 'rain', 'reading'];

export function restorePreferences(value: unknown): AppPreferences {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ...DEFAULT_PREFERENCES };
  const saved = value as Partial<AppPreferences>;
  const backgroundId = typeof saved.backgroundId === 'string' && getPeacefulScene(saved.backgroundId)
    ? saved.backgroundId
    : DEFAULT_PEACEFUL_SCENE_ID;
  const favoriteBackgroundIds = Array.isArray(saved.favoriteBackgroundIds)
    ? [...new Set(saved.favoriteBackgroundIds.filter((id): id is string => typeof id === 'string' && Boolean(getPeacefulScene(id))))]
    : [];

  return {
    musicEnabled: typeof saved.musicEnabled === 'boolean' ? saved.musicEnabled : DEFAULT_PREFERENCES.musicEnabled,
    ambientSound: AMBIENT_SOUNDS.includes(saved.ambientSound as AmbientSound) ? saved.ambientSound as AmbientSound : DEFAULT_PREFERENCES.ambientSound,
    soundEffectsEnabled: typeof saved.soundEffectsEnabled === 'boolean' ? saved.soundEffectsEnabled : DEFAULT_PREFERENCES.soundEffectsEnabled,
    hapticsEnabled: typeof saved.hapticsEnabled === 'boolean' ? saved.hapticsEnabled : DEFAULT_PREFERENCES.hapticsEnabled,
    motionMode: MOTION_MODES.includes(saved.motionMode as MotionMode) ? saved.motionMode as MotionMode : DEFAULT_PREFERENCES.motionMode,
    cinematicTextEnabled: typeof saved.cinematicTextEnabled === 'boolean' ? saved.cinematicTextEnabled : DEFAULT_PREFERENCES.cinematicTextEnabled,
    voiceReplyMode: VOICE_MODES.includes(saved.voiceReplyMode as VoiceReplyMode) ? saved.voiceReplyMode as VoiceReplyMode : DEFAULT_PREFERENCES.voiceReplyMode,
    backgroundId,
    backgroundRotationEnabled: typeof saved.backgroundRotationEnabled === 'boolean' ? saved.backgroundRotationEnabled : DEFAULT_PREFERENCES.backgroundRotationEnabled,
    favoriteBackgroundIds,
  };
}
