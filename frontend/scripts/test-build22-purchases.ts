import assert from 'node:assert/strict';
import {
  PREMIUM_ENTITLEMENT_ID,
  PREMIUM_PRODUCT_ID,
  hasTrustedPremiumEntitlement,
  selectLifetimeProduct,
  normalizePurchaseError,
} from '../src/purchases/purchase-core.ts';

assert.equal(PREMIUM_PRODUCT_ID, 'com.willywill.scripturegames.premium');
assert.equal(PREMIUM_ENTITLEMENT_ID, 'premium');
assert.equal(hasTrustedPremiumEntitlement(undefined), false);
assert.equal(hasTrustedPremiumEntitlement({ active: {} }), false);
assert.equal(hasTrustedPremiumEntitlement({ active: { premium: { verification: 'FAILED' } } }), false);
assert.equal(hasTrustedPremiumEntitlement({ active: { premium: { verification: 'NOT_REQUESTED' } } }), false);
assert.equal(hasTrustedPremiumEntitlement({ active: { premium: { verification: 'VERIFIED' } } }), true);
assert.equal(hasTrustedPremiumEntitlement({ active: { premium: { verification: 'VERIFIED_ON_DEVICE' } } }), true);
assert.equal(selectLifetimeProduct([
  { product: { identifier: 'wrong', priceString: '$0.99' } },
  { product: { identifier: PREMIUM_PRODUCT_ID, priceString: '$9.99' } },
])?.product.priceString, '$9.99');
assert.equal(selectLifetimeProduct([]), null);
assert.equal(normalizePurchaseError({ code: '1', userCancelled: true }), 'cancelled');
assert.equal(normalizePurchaseError({ code: 'PaymentPendingError' }), 'pending');
assert.equal(normalizePurchaseError({ code: 'NetworkError' }), 'network');
assert.equal(normalizePurchaseError({ code: 'ProductNotAvailableForPurchaseError' }), 'product-unavailable');
assert.equal(normalizePurchaseError({ code: 'ConfigurationError' }), 'store-unavailable');
assert.equal(normalizePurchaseError(new Error('unexpected')), 'unknown');
console.log('Build 22 purchase core tests passed.');

import { readFileSync } from 'node:fs';
const providerSource = readFileSync('src/premium-entitlement.tsx', 'utf8');
const premiumSource = readFileSync('app/premium.tsx', 'utf8');
const defaultClientSource = readFileSync('src/purchases/purchase-client.ts', 'utf8');
const nativeClientSource = readFileSync('src/purchases/purchase-client.native.ts', 'utf8');

assert.doesNotMatch(providerSource, /hasValidatedPremiumEntitlement\(profile\)/);
assert.doesNotMatch(providerSource, /useProfile\(\)/);
assert.match(providerSource, /createPurchaseClient/);
assert.match(providerSource, /localizedPrice/);
assert.match(providerSource, /purchaseLifetime/);
assert.match(providerSource, /restore\(\)/);
assert.match(defaultClientSource, /store-unavailable/);
assert.doesNotMatch(defaultClientSource, /hasPremium:\s*true/);
assert.match(nativeClientSource, /ENTITLEMENT_VERIFICATION_MODE\.INFORMATIONAL/);
assert.match(nativeClientSource, /Purchases\.purchasePackage/);
assert.match(nativeClientSource, /Purchases\.restorePurchases/);
assert.match(nativeClientSource, /Platform\.OS !== 'ios'/);
assert.match(premiumSource, /localizedPrice/);
assert.match(premiumSource, /One-time lifetime purchase/);
assert.doesNotMatch(premiumSource, /billing is not connected/i);
assert.doesNotMatch(premiumSource, /No charge was attempted/i);
assert.match(premiumSource, /Restore Purchase/);
assert.match(premiumSource, /disabled=\{busy \|\| !localizedPrice\}/);
console.log('Build 22 purchase source contract passed.');
