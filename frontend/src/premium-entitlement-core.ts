import { getJourneyBook } from './bible-journey/catalog.ts';

export const PREMIUM_PRODUCT_ID = 'com.willywill.scripturegames.premium';

export function canAccessJourneyBook(bookId: string, hasPremium: boolean): boolean {
  const book = getJourneyBook(bookId);
  if (!book) return false;
  return book.access === 'free' || hasPremium;
}
