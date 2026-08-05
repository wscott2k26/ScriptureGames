import type { PurchaseFailureCode } from './purchase-types.ts';

export const PREMIUM_PRODUCT_ID = 'com.willywill.scripturegames.premium';
export const PREMIUM_ENTITLEMENT_ID = 'premium';

export type EntitlementVerification =
  | 'NOT_REQUESTED'
  | 'VERIFIED'
  | 'FAILED'
  | 'VERIFIED_ON_DEVICE';

export type EntitlementContainer = {
  active: Record<string, { verification?: EntitlementVerification } | undefined>;
};

export type PackageLike = {
  product: { identifier: string; priceString: string };
};

export function hasTrustedPremiumEntitlement(
  entitlements: EntitlementContainer | undefined,
): boolean {
  const premium = entitlements?.active[PREMIUM_ENTITLEMENT_ID];
  return premium?.verification === 'VERIFIED' || premium?.verification === 'VERIFIED_ON_DEVICE';
}

export function selectLifetimeProduct<T extends PackageLike>(packages: readonly T[]): T | null {
  return packages.find((item) => item.product.identifier === PREMIUM_PRODUCT_ID) ?? null;
}

export function normalizePurchaseError(error: unknown): PurchaseFailureCode {
  const value = error as { code?: unknown; userCancelled?: unknown } | null;
  if (value?.userCancelled === true) return 'cancelled';

  const rawCode = String(value?.code ?? '');
  const code = rawCode.toLowerCase();

  if (rawCode === '1' || code.includes('cancel')) return 'cancelled';
  if (rawCode === '20' || code.includes('pending')) return 'pending';
  if (['10', '32', '35'].includes(rawCode) || code.includes('network') || code.includes('offline') || code.includes('timed')) return 'network';
  if (rawCode === '5' || (code.includes('product') && code.includes('available'))) return 'product-unavailable';
  if (['7', '8', '9', '13'].includes(rawCode) || code.includes('receipt') || code.includes('verification')) return 'verification-failed';
  if (
    ['2', '3', '4', '11', '17', '19', '23', '24', '29', '30', '33'].includes(rawCode)
    || code.includes('store')
    || code.includes('configuration')
    || code.includes('credential')
    || code.includes('permission')
    || code.includes('unsupported')
  ) return 'store-unavailable';
  return 'unknown';
}
