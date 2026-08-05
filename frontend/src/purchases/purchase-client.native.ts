import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type CustomerInfoUpdateListener,
  type PurchasesPackage,
} from 'react-native-purchases';

import {
  hasTrustedPremiumEntitlement,
  normalizePurchaseError,
  selectLifetimeProduct,
} from './purchase-core.ts';
import type {
  PurchaseClient,
  PurchaseFailureCode,
  PurchaseResult,
  PurchaseSnapshot,
} from './purchase-types.ts';

const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY?.trim() ?? '';
const unavailable: PurchaseSnapshot = {
  configured: false,
  hasPremium: false,
  localizedPrice: null,
  failure: 'store-unavailable',
};

let configured = false;
let lifetimePackage: PurchasesPackage | null = null;
let lastSnapshot: PurchaseSnapshot = unavailable;

function trusted(customerInfo: CustomerInfo | undefined): boolean {
  return hasTrustedPremiumEntitlement(customerInfo?.entitlements);
}

function updateSnapshot(
  customerInfo: CustomerInfo | undefined,
  failure: PurchaseFailureCode | null = null,
): PurchaseSnapshot {
  lastSnapshot = {
    configured,
    hasPremium: trusted(customerInfo),
    localizedPrice: lifetimePackage?.product.priceString ?? lastSnapshot.localizedPrice,
    failure,
  };
  return lastSnapshot;
}

async function loadSnapshot(): Promise<PurchaseSnapshot> {
  let customerInfo: CustomerInfo;
  try {
    customerInfo = await Purchases.getCustomerInfo();
  } catch (error) {
    lastSnapshot = {
      ...lastSnapshot,
      configured,
      failure: normalizePurchaseError(error),
    };
    return lastSnapshot;
  }

  try {
    const offerings = await Purchases.getOfferings();
    lifetimePackage = selectLifetimeProduct(offerings.current?.availablePackages ?? []);
    return updateSnapshot(customerInfo, lifetimePackage ? null : 'product-unavailable');
  } catch (error) {
    return updateSnapshot(customerInfo, normalizePurchaseError(error));
  }
}

function resultFromCustomerInfo(customerInfo: CustomerInfo): PurchaseResult {
  const hasPremium = trusted(customerInfo);
  return {
    hasPremium,
    failure: hasPremium ? null : 'verification-failed',
  };
}

export function createPurchaseClient(): PurchaseClient {
  async function configure(): Promise<PurchaseSnapshot> {
    if (Platform.OS !== 'ios' || !apiKey) return unavailable;

    try {
      if (!configured) {
        await Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN);
        Purchases.configure({
          apiKey,
          entitlementVerificationMode: Purchases.ENTITLEMENT_VERIFICATION_MODE.INFORMATIONAL,
        });
        configured = true;
        lastSnapshot = { ...unavailable, configured: true, failure: null };
      }
      return await loadSnapshot();
    } catch (error) {
      lastSnapshot = {
        ...lastSnapshot,
        configured,
        failure: normalizePurchaseError(error),
      };
      return lastSnapshot;
    }
  }

  async function refresh(): Promise<PurchaseSnapshot> {
    if (!configured) return configure();
    return loadSnapshot();
  }

  async function purchaseLifetime(): Promise<PurchaseResult> {
    const ready = configured ? await refresh() : await configure();
    if (!ready.configured) return { hasPremium: false, failure: ready.failure ?? 'store-unavailable' };
    if (!lifetimePackage) return { hasPremium: ready.hasPremium, failure: 'product-unavailable' };

    try {
      const { customerInfo } = await Purchases.purchasePackage(lifetimePackage);
      const result = resultFromCustomerInfo(customerInfo);
      updateSnapshot(customerInfo, result.failure);
      return result;
    } catch (error) {
      return { hasPremium: lastSnapshot.hasPremium, failure: normalizePurchaseError(error) };
    }
  }

  async function restore(): Promise<PurchaseResult> {
    const ready = configured ? lastSnapshot : await configure();
    if (!ready.configured) return { hasPremium: false, failure: ready.failure ?? 'store-unavailable' };

    try {
      const customerInfo = await Purchases.restorePurchases();
      const result = resultFromCustomerInfo(customerInfo);
      updateSnapshot(customerInfo, result.failure);
      return result;
    } catch (error) {
      return { hasPremium: lastSnapshot.hasPremium, failure: normalizePurchaseError(error) };
    }
  }

  function subscribe(listener: (snapshot: PurchaseSnapshot) => void): () => void {
    if (Platform.OS !== 'ios' || !apiKey || !configured) return () => undefined;

    const customerInfoListener: CustomerInfoUpdateListener = (customerInfo) => {
      listener(updateSnapshot(customerInfo));
    };
    Purchases.addCustomerInfoUpdateListener(customerInfoListener);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(customerInfoListener);
    };
  }

  return { configure, refresh, purchaseLifetime, restore, subscribe };
}
