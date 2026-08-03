import { getJourneyBook } from './bible-journey/catalog.ts';

export const PREMIUM_PRODUCT_ID = 'com.willywill.scripturegames.premium';
export type PremiumEntitlementSource = 'app-store' | 'play-store';

export type PremiumEntitlementClaim = {
  is_premium?: boolean;
  premium_entitlement_source?: PremiumEntitlementSource;
  premium_product_id?: string;
  premium_expires_at?: string;
};

export function hasValidatedPremiumEntitlement(
  profile: PremiumEntitlementClaim | null | undefined,
): boolean {
  if (!profile?.is_premium) return false;
  if (profile.premium_product_id !== PREMIUM_PRODUCT_ID) return false;
  if (profile.premium_entitlement_source !== 'app-store' && profile.premium_entitlement_source !== 'play-store') return false;
  if (!profile.premium_expires_at) return true;
  const expiresAt = Date.parse(profile.premium_expires_at);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

export function canAccessJourneyBook(bookId: string, hasPremium: boolean): boolean {
  const book = getJourneyBook(bookId);
  if (!book) return false;
  return book.access === 'free' || hasPremium;
}
