import { AccessibilityInfo } from 'react-native';
import { useEffect, useState } from 'react';
import { usePreferences } from '@/src/preferences-context';

export function useReducedMotionPreference() {
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

  if (preferences.motionMode === 'reduced') return true;
  if (preferences.motionMode === 'full') return false;
  return systemReduced;
}
