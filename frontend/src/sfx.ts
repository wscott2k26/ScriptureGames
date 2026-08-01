import * as Haptics from 'expo-haptics';

export type SoundCue = 'tap' | 'success' | 'error';
type SoundEffectPlayer = (cue: SoundCue) => Promise<void> | void;

let hapticsEnabled = true;
let soundEffectPlayer: SoundEffectPlayer | null = null;
let lastTapAt = 0;

export function configureHaptics(enabled: boolean) {
  hapticsEnabled = enabled;
}

export function configureSoundEffects(player: SoundEffectPlayer | null) {
  soundEffectPlayer = player;
}

function safelyHaptic(run: () => Promise<void>) {
  if (!hapticsEnabled) return;
  run().catch(() => {
    // Haptics are optional and can be unavailable on simulators or the web.
  });
}

function safelySound(cue: SoundCue) {
  if (!soundEffectPlayer) return;
  if (cue === 'tap') {
    const now = Date.now();
    if (now - lastTapAt < 70) return;
    lastTapAt = now;
  }
  try {
    Promise.resolve(soundEffectPlayer(cue)).catch(() => undefined);
  } catch {
    // Feedback audio is optional and must never interrupt navigation or gameplay.
  }
}

export const sfx = {
  correct: () => {
    safelyHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
    safelySound('success');
  },
  wrong: () => {
    safelyHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
    safelySound('error');
  },
  win: () => {
    safelyHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
    safelySound('success');
  },
  warning: () => {
    safelyHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
    safelySound('error');
  },
  tap: () => {
    safelyHaptic(() => Haptics.selectionAsync());
    safelySound('tap');
  },
  press: () => {
    safelyHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
    safelySound('tap');
  },
};
