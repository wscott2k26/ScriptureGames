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

  const code = String(value?.code ?? '').toLowerCase();
  if (code.includes('cancel')) return 'cancelled';
  if (code.includes('pending')) return 'pending';
  if (code.includes('network')) return 'network';
  if (code.includes('product') && code.includes('available')) return 'product-unavailable';
  if (code.includes('store') || code.includes('configuration')) return 'store-unavailable';
  if (code.includes('verification')) return 'verification-failed';
  return 'unknown';
}
