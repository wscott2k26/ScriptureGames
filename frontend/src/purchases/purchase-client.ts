import type { PurchaseClient, PurchaseSnapshot } from './purchase-types.ts';

const unavailable: PurchaseSnapshot = {
  configured: false,
  hasPremium: false,
  localizedPrice: null,
  failure: 'store-unavailable',
};

export function createPurchaseClient(): PurchaseClient {
  return {
    async configure() {
      return unavailable;
    },
    async refresh() {
      return unavailable;
    },
    async purchaseLifetime() {
      return { hasPremium: false, failure: 'store-unavailable' };
    },
    async restore() {
      return { hasPremium: false, failure: 'store-unavailable' };
    },
    subscribe() {
      return () => undefined;
    },
  };
}
