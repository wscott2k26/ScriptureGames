import { useMotionIntensity } from './use-motion-intensity';

export function useReducedMotionPreference() {
  return useMotionIntensity() === 'off';
}
