import { AccessibilityInfo } from 'react-native';
import { useEffect, useState } from 'react';

import { usePreferences } from '@/src/preferences-context';
import { resolveMotionIntensity, type MotionIntensity } from '@/src/motion-intensity';

export function useMotionIntensity(runtimeSafetyOverride = false): MotionIntensity {
  const { preferences } = usePreferences();
  const [systemReduced, setSystemReduced] = useState(false);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (active) setSystemReduced(value);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystemReduced);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return resolveMotionIntensity(preferences.motionMode, systemReduced, runtimeSafetyOverride);
}
