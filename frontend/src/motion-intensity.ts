export type MotionMode = 'system' | 'reduced' | 'gentle' | 'full';
export type MotionIntensity = 'off' | 'gentle' | 'full';

export function resolveMotionIntensity(
  mode: MotionMode,
  systemReduceMotion: boolean,
  runtimeSafetyOverride: boolean,
): MotionIntensity {
  if (runtimeSafetyOverride || systemReduceMotion || mode === 'reduced') return 'off';
  if (mode === 'gentle') return 'gentle';
  return 'full';
}
