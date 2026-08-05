import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { PREMIUM_PRODUCT_ID } from './premium-entitlement-core.ts';
import { createPurchaseClient } from './purchases/purchase-client';
import type { PurchaseClient, PurchaseFailureCode, PurchaseSnapshot } from './purchases/purchase-types.ts';

export type PremiumEntitlementStatus =
  | 'idle'
  | 'checking'
  | 'ready'
  | 'purchasing'
  | 'restoring'
  | 'active'
  | 'cancelled'
  | 'pending'
  | 'not-found'
  | 'store-unavailable'
  | 'network-error'
  | 'verification-error';

type PremiumEntitlementContextValue = {
  hasPremium: boolean;
  productId: string;
  localizedPrice: string | null;
  status: PremiumEntitlementStatus;
  message: string | null;
  purchase: () => Promise<void>;
  restore: () => Promise<void>;
  clearMessage: () => void;
};

const PremiumEntitlementContext = createContext<PremiumEntitlementContextValue | null>(null);

function statusForFailure(failure: PurchaseFailureCode | null): PremiumEntitlementStatus {
  switch (failure) {
    case 'cancelled':
      return 'cancelled';
    case 'pending':
      return 'pending';
    case 'network':
      return 'network-error';
    case 'verification-failed':
      return 'verification-error';
    case 'product-unavailable':
    case 'store-unavailable':
    case 'unknown':
      return 'store-unavailable';
    default:
      return 'ready';
  }
}

function messageForFailure(failure: PurchaseFailureCode | null): string | null {
  switch (failure) {
    case 'cancelled':
      return 'Purchase cancelled. Nothing was charged.';
    case 'pending':
      return 'Apple is still processing this purchase. Premium will unlock only after the purchase is confirmed.';
    case 'network':
      return 'The store could not be reached. Your existing Premium access is unchanged; please try again when connected.';
    case 'product-unavailable':
      return 'Complete Bible Journey Premium is not available from Apple right now. Please try again later.';
    case 'verification-failed':
      return 'The purchase could not be securely verified, so Premium remains locked. Restore Purchase may resolve this.';
    case 'store-unavailable':
    case 'unknown':
      return 'Apple purchasing is unavailable right now. No charge was completed.';
    default:
      return null;
  }
}

export function PremiumEntitlementProvider({
  children,
  client,
}: {
  children: ReactNode;
  client?: PurchaseClient;
}) {
  const clientRef = useRef<PurchaseClient | null>(null);
  if (!clientRef.current) clientRef.current = client ?? createPurchaseClient();

  const [hasPremium, setHasPremium] = useState(false);
  const [localizedPrice, setLocalizedPrice] = useState<string | null>(null);
  const [status, setStatus] = useState<PremiumEntitlementStatus>('checking');
  const [message, setMessage] = useState<string | null>(null);

  const applySnapshot = useCallback((snapshot: PurchaseSnapshot) => {
    setHasPremium(snapshot.hasPremium);
    setLocalizedPrice(snapshot.localizedPrice);
    if (snapshot.hasPremium) {
      setStatus('active');
      setMessage('Complete Bible Journey Premium is active for this Apple purchase identity.');
      return;
    }
    setStatus(statusForFailure(snapshot.failure));
    setMessage(messageForFailure(snapshot.failure));
  }, []);

  useEffect(() => {
    let mounted = true;
    const purchaseClient = clientRef.current;
    if (!purchaseClient) return undefined;

    let unsubscribe: () => void = () => undefined;

    void purchaseClient.configure().then((snapshot) => {
      if (!mounted) return;
      applySnapshot(snapshot);
      unsubscribe = purchaseClient.subscribe((nextSnapshot) => {
        if (mounted) applySnapshot(nextSnapshot);
      });
    }).catch(() => {
      if (!mounted) return;
      applySnapshot({
        configured: false,
        hasPremium: false,
        localizedPrice: null,
        failure: 'store-unavailable',
      });
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [applySnapshot]);

  const purchase = useCallback(async () => {
    if (hasPremium) {
      setStatus('active');
      setMessage('Premium is already active.');
      return;
    }

    setStatus('purchasing');
    setMessage(null);
    try {
      const result = await clientRef.current!.purchaseLifetime();
      if (result.hasPremium) {
        setHasPremium(true);
        setStatus('active');
        setMessage('Purchase verified. All 66 Bible Journey books are unlocked.');
        return;
      }
      setStatus(statusForFailure(result.failure));
      setMessage(messageForFailure(result.failure));
    } catch {
      setStatus('store-unavailable');
      setMessage(messageForFailure('store-unavailable'));
    }
  }, [hasPremium]);

  const restore = useCallback(async () => {
    setStatus('restoring');
    setMessage('Checking Apple for an eligible lifetime purchase…');
    try {
      const result = await clientRef.current!.restore();
      if (result.hasPremium) {
        setHasPremium(true);
        setStatus('active');
        setMessage(result.failure
          ? 'Premium remains active. Apple could not complete a fresh restore check right now.'
          : 'Purchase restored. Complete Bible Journey Premium is active.');
        return;
      }
      if (!result.failure) {
        setHasPremium(false);
        setStatus('not-found');
        setMessage('No eligible Complete Bible Journey Premium purchase was found for this Apple Account.');
        return;
      }
      setStatus(statusForFailure(result.failure));
      setMessage(messageForFailure(result.failure));
    } catch {
      setStatus('store-unavailable');
      setMessage(messageForFailure('store-unavailable'));
    }
  }, []);

  const clearMessage = useCallback(() => setMessage(null), []);
  const value = useMemo<PremiumEntitlementContextValue>(() => ({
    hasPremium,
    productId: PREMIUM_PRODUCT_ID,
    localizedPrice,
    status,
    message,
    purchase,
    restore,
    clearMessage,
  }), [clearMessage, hasPremium, localizedPrice, message, purchase, restore, status]);

  return <PremiumEntitlementContext.Provider value={value}>{children}</PremiumEntitlementContext.Provider>;
}

export function usePremiumEntitlement(): PremiumEntitlementContextValue {
  const value = useContext(PremiumEntitlementContext);
  if (!value) throw new Error('usePremiumEntitlement must be used inside PremiumEntitlementProvider');
  return value;
}
