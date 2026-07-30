import * as Haptics from 'expo-haptics';

let hapticsEnabled = true;

export function configureHaptics(enabled: boolean) {
  hapticsEnabled = enabled;
}

function safely(run: () => Promise<void>) {
  if (!hapticsEnabled) return;
  run().catch(() => {
    // Haptics are optional and can be unavailable on simulators or the web.
  });
}

export const sfx = {
  correct: () => safely(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  wrong: () => safely(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
  win: () => safely(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () => safely(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  tap: () => safely(() => Haptics.selectionAsync()),
  press: () => safely(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
};
