import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useProfile } from './profile-context';
import { PREMIUM_PRODUCT_ID, hasValidatedPremiumEntitlement } from './premium-entitlement-core';

export type PremiumEntitlementStatus =
  | 'idle'
  | 'checking'
  | 'active'
  | 'not-found'
  | 'store-unavailable';

type PremiumEntitlementContextValue = {
  hasPremium: boolean;
  productId: string;
  status: PremiumEntitlementStatus;
  message: string | null;
  purchase: () => Promise<void>;
  restore: () => Promise<void>;
  clearMessage: () => void;
};

const PremiumEntitlementContext = createContext<PremiumEntitlementContextValue | null>(null);

export function PremiumEntitlementProvider({ children }: { children: ReactNode }) {
  const { profile, refresh } = useProfile();
  const hasPremium = hasValidatedPremiumEntitlement(profile);
  const [status, setStatus] = useState<PremiumEntitlementStatus>(hasPremium ? 'active' : 'idle');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (hasPremium) {
      setStatus('active');
      setMessage('Complete Bible Journey Premium is active on this player profile.');
    } else if (status === 'active') {
      setStatus('idle');
      setMessage(null);
    }
  }, [hasPremium, status]);

  const purchase = useCallback(async () => {
    if (hasPremium) {
      setStatus('active');
      setMessage('Premium is already active on this player profile.');
      return;
    }

    setStatus('store-unavailable');
    setMessage('Store billing is not connected in this source build. No charge was attempted. Purchase will open only after Apple and Google product validation is installed and sandbox-tested.');
  }, [hasPremium]);

  const restore = useCallback(async () => {
    setStatus('checking');
    setMessage('Checking this player profile for a validated Premium entitlement…');
    try {
      await refresh();
      if (hasPremium) {
        setStatus('active');
        setMessage('Premium is active on this player profile.');
      } else {
        setStatus('not-found');
        setMessage('No validated Premium entitlement is attached to this player profile yet. No charge was attempted.');
      }
    } catch {
      setStatus('store-unavailable');
      setMessage('Premium status could not be refreshed. No charge was attempted and no local unlock was created.');
    }
  }, [hasPremium, refresh]);

  const clearMessage = useCallback(() => setMessage(null), []);
  const value = useMemo<PremiumEntitlementContextValue>(() => ({
    hasPremium,
    productId: PREMIUM_PRODUCT_ID,
    status,
    message,
    purchase,
    restore,
    clearMessage,
  }), [clearMessage, hasPremium, message, purchase, restore, status]);

  return <PremiumEntitlementContext.Provider value={value}>{children}</PremiumEntitlementContext.Provider>;
}

export function usePremiumEntitlement(): PremiumEntitlementContextValue {
  const value = useContext(PremiumEntitlementContext);
  if (!value) throw new Error('usePremiumEntitlement must be used inside PremiumEntitlementProvider');
  return value;
}
