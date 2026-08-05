import { getJourneyBook } from './bible-journey/catalog.ts';
import { PREMIUM_PRODUCT_ID } from './purchases/purchase-core.ts';

export { PREMIUM_PRODUCT_ID };

export function canAccessJourneyBook(bookId: string, hasPremium: boolean): boolean {
  const book = getJourneyBook(bookId);
  if (!book) return false;
  return book.access === 'free' || hasPremium;
}

/** @deprecated Legacy profile migration shim. RevenueCat owns all runtime access. */
export function hasValidatedPremiumEntitlement(_profile: unknown): boolean {
  return false;
}
