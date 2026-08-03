import { getJourneyBook, type JourneyBook } from './catalog.ts';

export type JourneyAccessState = 'free' | 'premium-active' | 'premium-required';

function resolveBook(bookOrId: JourneyBook | string): JourneyBook | undefined {
  return typeof bookOrId === 'string' ? getJourneyBook(bookOrId) : bookOrId;
}

export function getJourneyAccessState(
  bookOrId: JourneyBook | string,
  hasPremium: boolean,
): JourneyAccessState {
  const book = resolveBook(bookOrId);
  if (!book || book.access === 'free') return 'free';
  return hasPremium ? 'premium-active' : 'premium-required';
}

export function canOpenJourneyBook(
  bookOrId: JourneyBook | string,
  hasPremium: boolean,
): boolean {
  return getJourneyAccessState(bookOrId, hasPremium) !== 'premium-required';
}

export function getJourneyAccessLabel(
  bookOrId: JourneyBook | string,
  hasPremium: boolean,
): 'FREE' | 'PREMIUM ACTIVE' | 'PREMIUM REQUIRED' {
  const state = getJourneyAccessState(bookOrId, hasPremium);
  if (state === 'premium-required') return 'PREMIUM REQUIRED';
  if (state === 'premium-active') return 'PREMIUM ACTIVE';
  return 'FREE';
}

export function getJourneyAccessDescription(
  bookOrId: JourneyBook | string,
  hasPremium: boolean,
): string {
  const state = getJourneyAccessState(bookOrId, hasPremium);
  if (state === 'premium-required') {
    return 'Premium is required. Completing free books or chapters never bypasses this lock.';
  }
  if (state === 'premium-active') return 'Available through the validated Premium entitlement on this profile.';
  return 'Included free for every player.';
}
