import { AccessibilityInfo } from 'react-native';
import { useEffect, useState } from 'react';

export function useReducedTransparencyPreference() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceTransparencyEnabled?.()
      .then((value) => {
        if (active) setReduced(Boolean(value));
      })
      .catch(() => {
        if (active) setReduced(false);
      });
    return () => { active = false; };
  }, []);

  return reduced;
}
