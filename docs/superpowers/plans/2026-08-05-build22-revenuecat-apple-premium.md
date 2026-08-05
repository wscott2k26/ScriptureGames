# Build 22 RevenueCat Apple Premium Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the protected placeholder Premium flow with one verified Apple non-consumable lifetime purchase through RevenueCat while preserving the physically tested Build 21 experience and preventing accidental Expo charges or unsafe GitHub automation.

**Architecture:** Preserve the existing `usePremiumEntitlement()` public hook so Journey, backgrounds, and navigation do not need broad rewrites. Put RevenueCat behind a small platform-resolved `PurchaseClient`, make the RevenueCat `premium` entitlement the only authority for app-wide access, and keep web and unsupported platforms fail-closed. Before any app merge, archive every legacy executable workflow except the source-only quality gate and add an audit that rejects automatic EAS builds, submissions, workflow chains, polling, auto-merges, and pushes back to `main`.

**Tech Stack:** Expo SDK 54.0.36, React Native 0.81.5, React 19.1.0, TypeScript 5.9.3, Expo Router 6.0.24, `react-native-purchases` 10.4.4, RevenueCat Entitlements and Offerings, Apple StoreKit through RevenueCat, Node regression scripts, GitHub Actions source-only quality gate.

## Global Constraints

- Protected rollback baseline: Scripture Games 1.0.0 Build 21.
- Release target: Scripture Games 1.0.0 Build 22.
- Apple bundle ID: `com.willywill.scripturegames`.
- App Store Connect app ID: `6795368257`.
- Apple product type: Non-Consumable.
- Apple product ID: `com.willywill.scripturegames.premium`.
- RevenueCat entitlement ID: `premium`.
- RevenueCat offering ID: `default`, containing exactly one lifetime package for the Apple product.
- The ten free Journey books remain `GEN`, `EXO`, `LEV`, `NUM`, `DEU`, `MAT`, `MRK`, `LUK`, `JHN`, and `ACT`.
- The remaining 56 Journey books require an active trusted RevenueCat entitlement.
- Complete offline Bible, core quizzes, Lumi, Faith Journeys, Prayer Garden, local profiles, and all Build 21 free features remain free.
- Premium is app-wide for the current Apple purchase identity, not attached to one local player profile.
- Legacy profile fields remain only for data compatibility and must never unlock Premium.
- No direct edits on `main`; use one isolated implementation branch and one PR.
- No EAS build, EAS submission, TestFlight upload, Android cloud build, or App Review submission during source implementation.
- Never use `--auto-submit`.
- Never automatically retry a paid build.
- A paid iOS build, TestFlight upload, and App Review submission require three separate explicit user authorizations.
- Apple passwords, `.p8` files, App Store Connect private keys, Apple In-App Purchase private keys, and RevenueCat secret keys are never committed or pasted into chat.
- Only RevenueCat's public Apple SDK key may be compiled into the client.
- Pin `react-native-purchases` to exactly `10.4.4`; do not float to `latest` during Build 22.
- Do not delete, skip, weaken, or rewrite an existing regression test merely to obtain a passing run.
- Target CI budget: one complete PR quality-gate run and at most one corrective run after a real source correction.
- Every shell section begins from the directory stated in that section; do not rely on the previous task's current directory.

---

## File Map

### Create

- `scripts/audit-release-automation.mjs` — rejects executable release automation.
- `frontend/src/purchases/purchase-types.ts` — store-neutral purchase types and `PurchaseClient` interface.
- `frontend/src/purchases/purchase-core.ts` — pure IDs, trusted-entitlement check, package selection, and error normalization.
- `frontend/src/purchases/purchase-client.ts` — safe web/default implementation that never charges or unlocks.
- `frontend/src/purchases/purchase-client.native.ts` — iOS RevenueCat implementation; Android remains unsupported for Build 22.
- `frontend/scripts/test-build22-purchases.ts` — purchase, profile-independence, and UI source contract.
- `frontend/scripts/audit-build22-store-config.ts` — exact IDs, dependency pin, and credential-boundary audit.
- `frontend/BUILD_22_SOURCE_VALIDATION_20260805.md` — final source-only evidence.

### Modify

- `frontend/package.json`
- `frontend/yarn.lock`
- `frontend/expo-env.d.ts`
- `frontend/src/premium-entitlement.tsx`
- `frontend/src/premium-entitlement-core.ts`
- `frontend/src/profile-context.tsx`
- `frontend/app/premium.tsx`
- `frontend/scripts/test-build15-piano-premium.ts`
- `.github/workflows/quality-gate.yml`
- `APP_STORE_METADATA.md`
- `APP_REVIEW_NOTES.md`
- `APP_STORE_SUBMISSION_1.0.0.md`

### Preserve unless a verified test requires a narrow change

- `frontend/app/_layout.tsx` — current provider placement is already correct.
- `frontend/eas.json` — no private or public RevenueCat key is written here; the public SDK key is set through EAS Environment Variables immediately before the separately authorized build.
- All gameplay, Bible, Lumi, audio, background, profile, and Journey files outside the purchase seam.

### Archive

Move every active `.github/workflows/*.yml` except `quality-gate.yml` to `docs/archive/github-workflows-pre-build22/` with `.txt` appended. Move all `.github/release-triggers/*.md` beside them. GitHub cannot execute archived `.txt` files, while the old workflow text remains available for history.

---

### Task 1: Create the Isolated Baseline

**Files:**
- Create at execution time: worktree branch `feature/build22-revenuecat-apple-premium`
- Read only: current Build 21 identifiers and Premium files

**Interfaces:**
- Consumes: exact current `origin/main` SHA.
- Produces: clean isolated worktree and immutable baseline SHA.

- [ ] **Step 1: Create the worktree**

From the existing repository root:

```bash
git fetch origin main
git worktree add ../ScriptureGames-build22 -b feature/build22-revenuecat-apple-premium origin/main
cd ../ScriptureGames-build22
git rev-parse HEAD
git status --short
```

Expected: one SHA and an empty status.

- [ ] **Step 2: Record the SHA outside the repository**

```bash
printf '%s\n' "Build 22 baseline: $(git rev-parse HEAD)" > /tmp/scripture-games-build22-baseline.txt
```

Expected: no repository change and no Actions run.

- [ ] **Step 3: Verify immutable identifiers**

```bash
cd ../ScriptureGames-build22/frontend
node -e "const a=require('./app.json').expo; if(a.version!=='1.0.0'||a.ios.bundleIdentifier!=='com.willywill.scripturegames') process.exit(1); console.log(a.version,a.ios.bundleIdentifier,a.extra.eas.projectId)"
grep -F '6795368257' eas.json
grep -F 'com.willywill.scripturegames.premium' src/premium-entitlement-core.ts
```

Expected: all exact IDs are found. Stop on any mismatch.

- [ ] **Step 4: Do not commit**

This task intentionally creates no commit.

---

### Task 2: Quarantine Legacy Automation Test-First

**Files:**
- Create: `scripts/audit-release-automation.mjs`
- Modify: `.github/workflows/quality-gate.yml`
- Move: all other active workflows and release-trigger files into the docs archive

**Interfaces:**
- Consumes: repository root.
- Produces: `node scripts/audit-release-automation.mjs`, which passes only when `quality-gate.yml` is the sole active workflow and contains no release command.

- [ ] **Step 1: Write the failing audit**

From `../ScriptureGames-build22` create:

```js
// scripts/audit-release-automation.mjs
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const workflowsDir = join(process.cwd(), '.github', 'workflows');
const files = readdirSync(workflowsDir).filter((name) => /\.ya?ml$/i.test(name));
const violations = [];
const forbidden = [
  /\beas\s+build\b/i,
  /\beas\s+submit\b/i,
  /--auto-submit/i,
  /\bworkflow_run\s*:/i,
  /\bschedule\s*:/i,
  /git\s+push\s+origin\s+HEAD:main/i,
  /gh\s+pr\s+merge/i,
  /gh\s+workflow\s+run/i,
  /gh\s+run\s+rerun/i,
];

for (const file of files) {
  const source = readFileSync(join(workflowsDir, file), 'utf8');
  if (file !== 'quality-gate.yml') violations.push(`unexpected active workflow: ${file}`);
  for (const pattern of forbidden) {
    if (pattern.test(source)) violations.push(`${file}: ${pattern}`);
  }
}

if (violations.length) {
  throw new Error(`Unsafe release automation found:\n- ${violations.join('\n- ')}`);
}
console.log('Release automation audit passed: only the source-only quality gate is active.');
```

- [ ] **Step 2: Prove RED**

```bash
cd ../ScriptureGames-build22
node scripts/audit-release-automation.mjs
```

Expected: FAIL and list the current RC3, monitor, EAS, submission, retry, and trigger workflows.

- [ ] **Step 3: Archive all executable legacy workflows**

```bash
cd ../ScriptureGames-build22
mkdir -p docs/archive/github-workflows-pre-build22/release-triggers
for file in .github/workflows/*.yml; do
  [ "$(basename "$file")" = "quality-gate.yml" ] && continue
  mv "$file" "docs/archive/github-workflows-pre-build22/$(basename "$file").txt"
done
for file in .github/release-triggers/*.md; do
  mv "$file" "docs/archive/github-workflows-pre-build22/release-triggers/$(basename "$file").txt"
done
rmdir .github/release-triggers
```

Expected: `.github/workflows/quality-gate.yml` is the only active workflow.

- [ ] **Step 4: Add the audit near the beginning of the quality gate**

After checkout and Node setup, before dependency installation:

```yaml
      - name: Reject automatic release automation
        run: node scripts/audit-release-automation.mjs
```

- [ ] **Step 5: Prove GREEN**

```bash
cd ../ScriptureGames-build22
node scripts/audit-release-automation.mjs
git grep -nE 'eas build|eas submit|--auto-submit|workflow_run|gh run rerun' -- .github/workflows || true
```

Expected: audit PASS and grep returns no forbidden command.

- [ ] **Step 6: Commit one coherent safety change**

```bash
git add .github docs/archive scripts/audit-release-automation.mjs
git commit -m "chore: quarantine legacy release automation"
```

---

### Task 3: Add the Pinned SDK and Pure Purchase Core

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/yarn.lock`
- Create: `frontend/src/purchases/purchase-types.ts`
- Create: `frontend/src/purchases/purchase-core.ts`
- Create: `frontend/scripts/test-build22-purchases.ts`

**Interfaces:**
- Produces:
  - `PurchaseClient`
  - `PurchaseSnapshot`
  - `PurchaseResult`
  - `PurchaseFailureCode`
  - `PREMIUM_PRODUCT_ID`
  - `PREMIUM_ENTITLEMENT_ID`
  - `hasTrustedPremiumEntitlement()`
  - `selectLifetimeProduct()`
  - `normalizePurchaseError()`

- [ ] **Step 1: Install the exact SDK without invoking EAS**

```bash
cd ../ScriptureGames-build22/frontend
npx expo install react-native-purchases@10.4.4
yarn why react-native-purchases
```

Expected: `package.json` and `yarn.lock` resolve exactly `10.4.4`.

- [ ] **Step 2: Define the store-neutral contract**

```ts
// src/purchases/purchase-types.ts
export type PurchaseFailureCode =
  | 'cancelled'
  | 'pending'
  | 'network'
  | 'product-unavailable'
  | 'store-unavailable'
  | 'verification-failed'
  | 'unknown';

export type PurchaseSnapshot = {
  configured: boolean;
  hasPremium: boolean;
  localizedPrice: string | null;
  failure: PurchaseFailureCode | null;
};

export type PurchaseResult = {
  hasPremium: boolean;
  failure: PurchaseFailureCode | null;
};

export interface PurchaseClient {
  configure(): Promise<PurchaseSnapshot>;
  refresh(): Promise<PurchaseSnapshot>;
  purchaseLifetime(): Promise<PurchaseResult>;
  restore(): Promise<PurchaseResult>;
  subscribe(listener: (snapshot: PurchaseSnapshot) => void): () => void;
}
```

- [ ] **Step 3: Write the failing pure tests**

```ts
// scripts/test-build22-purchases.ts
import assert from 'node:assert/strict';
import {
  PREMIUM_ENTITLEMENT_ID,
  PREMIUM_PRODUCT_ID,
  hasTrustedPremiumEntitlement,
  normalizePurchaseError,
  selectLifetimeProduct,
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
assert.equal(normalizePurchaseError({ code: '1', userCancelled: true }), 'cancelled');
assert.equal(normalizePurchaseError({ code: 'PaymentPendingError' }), 'pending');
assert.equal(normalizePurchaseError({ code: 'NetworkError' }), 'network');
assert.equal(normalizePurchaseError({ code: 'ProductNotAvailableForPurchaseError' }), 'product-unavailable');
assert.equal(normalizePurchaseError(new Error('unexpected')), 'unknown');
console.log('Build 22 purchase core tests passed.');
```

- [ ] **Step 4: Prove RED**

```bash
cd ../ScriptureGames-build22/frontend
node --experimental-strip-types scripts/test-build22-purchases.ts
```

Expected: FAIL because `purchase-core.ts` does not exist.

- [ ] **Step 5: Implement the minimum pure core**

```ts
// src/purchases/purchase-core.ts
import type { PurchaseFailureCode } from './purchase-types';

export const PREMIUM_PRODUCT_ID = 'com.willywill.scripturegames.premium';
export const PREMIUM_ENTITLEMENT_ID = 'premium';

export type EntitlementVerification = 'NOT_REQUESTED' | 'VERIFIED' | 'FAILED' | 'VERIFIED_ON_DEVICE';
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
  return 'unknown';
}
```

- [ ] **Step 6: Prove GREEN and check compatibility**

```bash
cd ../ScriptureGames-build22/frontend
node --experimental-strip-types scripts/test-build22-purchases.ts
npx expo install --check
yarn typecheck
```

Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add package.json yarn.lock src/purchases scripts/test-build22-purchases.ts
git commit -m "test: define trusted Build 22 purchase core"
```

---

### Task 4: Implement Fail-Closed Platform Clients

**Files:**
- Create: `frontend/src/purchases/purchase-client.ts`
- Create: `frontend/src/purchases/purchase-client.native.ts`
- Modify: `frontend/scripts/test-build22-purchases.ts`

**Interfaces:**
- Both platform files export `createPurchaseClient(): PurchaseClient`.
- Metro resolves `.native.ts` for native builds and `.ts` for web/default builds.

- [ ] **Step 1: Implement the safe default client**

```ts
// src/purchases/purchase-client.ts
import type { PurchaseClient, PurchaseSnapshot } from './purchase-types';

const unavailable: PurchaseSnapshot = {
  configured: false,
  hasPremium: false,
  localizedPrice: null,
  failure: 'store-unavailable',
};

export function createPurchaseClient(): PurchaseClient {
  return {
    async configure() { return unavailable; },
    async refresh() { return unavailable; },
    async purchaseLifetime() { return { hasPremium: false, failure: 'store-unavailable' }; },
    async restore() { return { hasPremium: false, failure: 'store-unavailable' }; },
    subscribe() { return () => undefined; },
  };
}
```

- [ ] **Step 2: Implement the native RevenueCat client**

Use this initialization and snapshot seam in `purchase-client.native.ts`:

```ts
import { Platform } from 'react-native';
import Purchases, {
  ENTITLEMENT_VERIFICATION_MODE,
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesPackage,
} from 'react-native-purchases';
import {
  hasTrustedPremiumEntitlement,
  normalizePurchaseError,
  selectLifetimeProduct,
} from './purchase-core';
import type { PurchaseClient, PurchaseResult, PurchaseSnapshot } from './purchase-types';

const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY?.trim() ?? '';
let configured = false;
let lifetimePackage: PurchasesPackage | null = null;

function snapshot(customerInfo?: CustomerInfo): PurchaseSnapshot {
  return {
    configured,
    hasPremium: hasTrustedPremiumEntitlement(customerInfo?.entitlements),
    localizedPrice: lifetimePackage?.product.priceString ?? null,
    failure: null,
  };
}

async function load(): Promise<PurchaseSnapshot> {
  const [offerings, customerInfo] = await Promise.all([
    Purchases.getOfferings(),
    Purchases.getCustomerInfo(),
  ]);
  lifetimePackage = selectLifetimeProduct(offerings.current?.availablePackages ?? []);
  return {
    ...snapshot(customerInfo),
    failure: lifetimePackage ? null : 'product-unavailable',
  };
}
```

`configure()` must:

```ts
if (Platform.OS !== 'ios' || !apiKey) {
  return { configured: false, hasPremium: false, localizedPrice: null, failure: 'store-unavailable' };
}
if (!configured) {
  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN);
  Purchases.configure({
    apiKey,
    entitlementVerificationMode: ENTITLEMENT_VERIFICATION_MODE.INFORMATIONAL,
  });
  configured = true;
}
return load();
```

`refresh()` calls `load()` and maps failures without erasing a previously trusted provider state.

`purchaseLifetime()` must:

```ts
if (!configured || !lifetimePackage) {
  return { hasPremium: false, failure: lifetimePackage ? 'store-unavailable' : 'product-unavailable' };
}
try {
  const { customerInfo } = await Purchases.purchasePackage(lifetimePackage);
  const hasPremium = hasTrustedPremiumEntitlement(customerInfo.entitlements);
  return { hasPremium, failure: hasPremium ? null : 'verification-failed' };
} catch (error) {
  return { hasPremium: false, failure: normalizePurchaseError(error) };
}
```

`restore()` calls `Purchases.restorePurchases()` and applies the same trusted-entitlement check.

`subscribe(listener)` registers one `CustomerInfo` listener and returns cleanup that removes that exact listener.

- [ ] **Step 3: Add static client-boundary assertions**

Append to `test-build22-purchases.ts`:

```ts
import { readFileSync } from 'node:fs';
const nativeClient = readFileSync('src/purchases/purchase-client.native.ts', 'utf8');
const webClient = readFileSync('src/purchases/purchase-client.ts', 'utf8');
assert.match(nativeClient, /ENTITLEMENT_VERIFICATION_MODE\.INFORMATIONAL/);
assert.match(nativeClient, /Purchases\.purchasePackage/);
assert.match(nativeClient, /Purchases\.restorePurchases/);
assert.match(nativeClient, /EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY/);
assert.doesNotMatch(nativeClient + webClient, /ASC_PRIVATE_KEY|APPLE_IAP_PRIVATE_KEY|REVENUECAT_V2_SECRET_KEY/);
assert.doesNotMatch(webClient, /react-native-purchases/);
```

- [ ] **Step 4: Run source-only checks**

```bash
cd ../ScriptureGames-build22/frontend
node --experimental-strip-types scripts/test-build22-purchases.ts
yarn typecheck
yarn lint
yarn export:ios
yarn export:android
```

Expected: all PASS. No EAS command is run.

- [ ] **Step 5: Commit**

```bash
git add src/purchases scripts/test-build22-purchases.ts
git commit -m "feat: add fail-closed RevenueCat purchase client"
```

---

### Task 5: Replace Profile Authority While Preserving the Hook

**Files:**
- Modify: `frontend/src/premium-entitlement.tsx`
- Modify: `frontend/src/premium-entitlement-core.ts`
- Modify: `frontend/src/profile-context.tsx`
- Modify: `frontend/scripts/test-build15-piano-premium.ts`
- Modify: `frontend/scripts/test-build22-purchases.ts`

**Interfaces:**
- Consumes: `createPurchaseClient()` and `PurchaseSnapshot`.
- Produces: unchanged `usePremiumEntitlement()` name plus `localizedPrice` and explicit purchase states.

- [ ] **Step 1: Add failing provider assertions**

Append:

```ts
const providerSource = readFileSync('src/premium-entitlement.tsx', 'utf8');
assert.doesNotMatch(providerSource, /hasValidatedPremiumEntitlement\(profile\)/);
assert.doesNotMatch(providerSource, /useProfile\(\)/);
assert.match(providerSource, /createPurchaseClient/);
assert.match(providerSource, /localizedPrice/);
```

- [ ] **Step 2: Prove RED**

```bash
cd ../ScriptureGames-build22/frontend
node --experimental-strip-types scripts/test-build22-purchases.ts
```

Expected: FAIL because the current provider uses the local profile.

- [ ] **Step 3: Preserve the public context with these exact fields**

```ts
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
```

Provider rules:

1. Create one client with `useRef<PurchaseClient | null>(null)` and initialize it once.
2. Call `configure()` once after mount.
3. Subscribe once and remove the listener on unmount.
4. Render children immediately with free access while checking.
5. Set `hasPremium` only from trusted `PurchaseSnapshot.hasPremium`.
6. Never read `profile.is_premium` or the other legacy fields.
7. Cancellation does not unlock and does not show an alarming error.
8. Pending remains locked until a later trusted listener update.
9. A temporary network error must not erase already trusted in-memory Premium.
10. A fresh install without a trusted response remains locked.
11. Purchase and restore never optimistically unlock.

- [ ] **Step 4: Keep Journey access pure**

In `premium-entitlement-core.ts`, retain:

```ts
export const PREMIUM_PRODUCT_ID = 'com.willywill.scripturegames.premium';
export function canAccessJourneyBook(bookId: string, hasPremium: boolean): boolean {
  const book = getJourneyBook(bookId);
  if (!book) return false;
  return book.access === 'free' || hasPremium;
}
```

The old `hasValidatedPremiumEntitlement(profile)` may remain temporarily for migration tests, but runtime provider code must not import or call it.

- [ ] **Step 5: Mark legacy fields clearly**

Above the four legacy fields in `Profile` add:

```ts
// Legacy compatibility only. Build 22 purchase access is owned by RevenueCat,
// and these fields must never be used to unlock Premium.
```

Do not rewrite saved profiles.

- [ ] **Step 6: Correct only the obsolete Build 15 provider assertion**

```ts
check('provider rejects local profile authority', () => {
  assert.doesNotMatch(provider, /hasValidatedPremiumEntitlement\(profile\)/);
  assert.doesNotMatch(provider, /Boolean\(profile\?\.is_premium\)/);
  assert.match(provider, /createPurchaseClient/);
});
```

Keep every other Build 15 assertion unchanged.

- [ ] **Step 7: Prove GREEN**

```bash
cd ../ScriptureGames-build22/frontend
node --experimental-strip-types scripts/test-build22-purchases.ts
yarn test:build15
yarn test:journey
yarn typecheck
yarn lint
```

Expected: all PASS.

- [ ] **Step 8: Commit**

```bash
git add src/premium-entitlement.tsx src/premium-entitlement-core.ts src/profile-context.tsx scripts/test-build15-piano-premium.ts scripts/test-build22-purchases.ts
git commit -m "feat: make Premium a trusted app-wide entitlement"
```

---

### Task 6: Connect the Existing Premium Screen Without Redesign

**Files:**
- Modify: `frontend/app/premium.tsx`
- Modify: `frontend/scripts/test-build22-purchases.ts`

**Interfaces:**
- Consumes: `hasPremium`, `localizedPrice`, `status`, `message`, `purchase()`, and `restore()`.
- Produces: current Premium layout with accurate Apple lifetime-purchase behavior.

- [ ] **Step 1: Add failing UI assertions**

```ts
const premiumSource = readFileSync('app/premium.tsx', 'utf8');
assert.match(premiumSource, /localizedPrice/);
assert.match(premiumSource, /One-time lifetime purchase/);
assert.doesNotMatch(premiumSource, /billing is not connected/i);
assert.doesNotMatch(premiumSource, /No charge was attempted/i);
assert.match(premiumSource, /Restore Purchase/);
```

- [ ] **Step 2: Prove RED**

```bash
cd ../ScriptureGames-build22/frontend
node --experimental-strip-types scripts/test-build22-purchases.ts
```

- [ ] **Step 3: Add price and busy-state behavior**

```ts
const { hasPremium, productId, localizedPrice, status, message, purchase, restore } = usePremiumEntitlement();
const busy = status === 'checking' || status === 'purchasing' || status === 'restoring';
const purchaseLabel = localizedPrice
  ? `Unlock Forever — ${localizedPrice}`
  : status === 'checking'
    ? 'Loading Apple Price…'
    : 'Unlock Complete Bible Journey';
```

Disable purchase while busy or when `localizedPrice` is absent. Keep Restore visible.

Replace the placeholder notice with exactly:

```text
One-time lifetime purchase
Apple will show the final localized price and confirmation sheet before charging. Restore Purchase is available for an eligible purchase made with the same Apple Account.
```

Do not promise Family Sharing until enabled and physically verified.

- [ ] **Step 4: Preserve visual and navigation contracts**

Do not change backdrop darkness, hero structure, section order, feature lists, always-free copy structure, route destinations, Genesis/Journey artwork, or theme tokens.

- [ ] **Step 5: Run focused and visual checks**

```bash
cd ../ScriptureGames-build22/frontend
node --experimental-strip-types scripts/test-build22-purchases.ts
yarn test:build15
yarn audit:visual
yarn typecheck
yarn lint
yarn export:ios
yarn export:android
```

Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add app/premium.tsx scripts/test-build22-purchases.ts
git commit -m "feat: connect Premium screen to lifetime Apple pricing"
```

---

### Task 7: Add Environment Typing and Store Safety Audits

**Files:**
- Modify: `frontend/expo-env.d.ts`
- Create: `frontend/scripts/audit-build22-store-config.ts`
- Modify: `frontend/package.json`
- Modify: `.github/workflows/quality-gate.yml`

**Interfaces:**
- Consumes at build time: `EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY`.
- Produces: `yarn test:build22` and `yarn audit:store`.

- [ ] **Step 1: Declare only the public key**

```ts
// expo-env.d.ts addition
declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY?: string;
  }
}
```

Do not add a value to Git. Do not modify `eas.json` for this key.

- [ ] **Step 2: Write the config audit**

`audit-build22-store-config.ts` must load `package.json`, `app.json`, `eas.json`, `premium-entitlement-core.ts`, `purchase-core.ts`, both purchase clients, and `premium-entitlement.tsx`, then assert:

```ts
assert.equal(pkg.dependencies['react-native-purchases'], '10.4.4');
assert.equal(app.expo.ios.bundleIdentifier, 'com.willywill.scripturegames');
assert.equal(eas.submit.production.ios.ascAppId, '6795368257');
assert.match(core, /com\.willywill\.scripturegames\.premium/);
assert.match(purchaseCore, /PREMIUM_ENTITLEMENT_ID = 'premium'/);
assert.doesNotMatch(clientSource, /ASC_PRIVATE_KEY|APPLE_IAP_PRIVATE_KEY|REVENUECAT_V2_SECRET_KEY/);
assert.doesNotMatch(provider, /hasValidatedPremiumEntitlement\(profile\)|useProfile\(\)/);
```

Recursively scan tracked text source and fail on:

```text
-----BEGIN PRIVATE KEY-----
-----BEGIN EC PRIVATE KEY-----
```

Exclude archived historical workflow text only from command-pattern checks, not from private-key checks.

- [ ] **Step 3: Register scripts**

Add:

```json
"test:build22": "node --experimental-strip-types scripts/test-build22-purchases.ts",
"audit:store": "node --experimental-strip-types scripts/audit-build22-store-config.ts"
```

Append `yarn test:build22 && yarn audit:store` to both `validate` and `eas-build-post-install` before local exports.

- [ ] **Step 4: Add two source-only quality-gate steps**

```yaml
      - name: Test Build 22 Apple Premium
        working-directory: frontend
        run: yarn test:build22

      - name: Audit Build 22 store configuration
        working-directory: frontend
        run: yarn audit:store
```

- [ ] **Step 5: Run focused checks**

```bash
cd ../ScriptureGames-build22
node scripts/audit-release-automation.mjs
cd frontend
yarn test:build22
yarn audit:store
yarn typecheck
yarn lint
```

Expected: all PASS and zero EAS activity.

- [ ] **Step 6: Commit**

```bash
git add expo-env.d.ts scripts/audit-build22-store-config.ts package.json ../.github/workflows/quality-gate.yml
git commit -m "chore: add Build 22 store and release safety gates"
```

---

### Task 8: Correct Store Metadata and Support Disclosures

**Files:**
- Modify: `APP_STORE_METADATA.md`
- Modify: `APP_REVIEW_NOTES.md`
- Modify: `APP_STORE_SUBMISSION_1.0.0.md`
- Modify Vercel support/privacy source only after identifying its exact source repository

**Interfaces:**
- Produces: accurate customer disclosure and reviewer path.

- [ ] **Step 1: Use this customer-facing disclosure**

```text
Scripture Games includes an optional one-time lifetime purchase, Complete Bible Journey Premium. The purchase unlocks the remaining 56 Bible Journey book seasons, the full peaceful scene collection, and complete mastery records. Ten complete Journey books, the entire offline Bible reader, core quizzes, Lumi, and faith tools remain available without purchase.
```

- [ ] **Step 2: Use this App Review path**

```text
Open Scripture Games → select or create a local player → open Complete Bible Journey → choose any Premium-marked book, or open the Premium screen directly. The screen displays Apple's localized lifetime price. Tap Unlock Forever to open Apple's purchase sheet. Tap Restore Purchase to restore an eligible prior purchase. No login is required.
```

- [ ] **Step 3: Remove obsolete statements**

Remove claims that there is no active purchase flow, all release content is unlocked, purchases are “none,” Premium belongs to one player profile, or Unlock can never charge.

- [ ] **Step 4: Document RevenueCat narrowly**

State that RevenueCat processes purchase-related identifiers, transaction records, product interaction, and entitlement status for app functionality. Do not claim prayer notes, Bible notes, Lumi messages, family names, quiz answers, or reading history are sent to RevenueCat.

- [ ] **Step 5: Verify Vercel source before writing**

Use Vercel to confirm the `scripture-games-support` production project and deployment. Identify its source repository before any deployment. If source cannot be proven, leave production untouched and place the final copy in the repository evidence report.

- [ ] **Step 6: Commit from the repository root**

```bash
cd ../ScriptureGames-build22
git add APP_STORE_METADATA.md APP_REVIEW_NOTES.md APP_STORE_SUBMISSION_1.0.0.md
git commit -m "docs: prepare Build 22 lifetime purchase review metadata"
```

---

### Task 9: Configure Apple and RevenueCat Securely

**Files:**
- No app source change required for dashboard setup
- Optional only after separate review: manual-dispatch read-only store inspection workflow

**Interfaces:**
- Consumes: credentials entered directly by the user into Apple and RevenueCat secure dashboards.
- Produces: exact Apple product, RevenueCat entitlement/offering, and public SDK key.

- [ ] **Step 1: Confirm Apple business readiness**

The Account Holder confirms in App Store Connect:

- Paid Apps Agreement active
- tax information complete
- banking information complete
- app ID `6795368257`
- bundle ID `com.willywill.scripturegames`

Stop if any item is incomplete. No paid build is created.

- [ ] **Step 2: Generate two separate Apple credentials**

1. App Store Connect API team key with App Manager role.
2. Apple In-App Purchase key under Users and Access → Integrations → In-App Purchase.

Store issuer IDs, key IDs, and one-time `.p8` downloads securely. Do not paste private keys into chat.

- [ ] **Step 3: Create the RevenueCat app**

```text
Project: Scripture Games
Platform: App Store
Bundle ID: com.willywill.scripturegames
```

Upload the App Store Connect API credential and Apple In-App Purchase credential directly into RevenueCat's secure Apple app configuration.

- [ ] **Step 4: Create or import the Apple product**

```text
Type: Non-Consumable
Reference Name: Complete Bible Journey Premium
Product ID: com.willywill.scripturegames.premium
Display Name: Complete Bible Journey Premium
Description: Unlock all 66 Bible Journey book seasons, complete mastery records, and the full peaceful scene collection with one lifetime purchase.
```

Choose the price deliberately in Apple. Never hardcode the price in the app.

- [ ] **Step 5: Configure the RevenueCat entitlement and offering**

```text
Entitlement ID: premium
Offering ID: default
Package type: Lifetime
Attached product: com.willywill.scripturegames.premium
```

Verify exactly one lifetime package is active in the current offering.

- [ ] **Step 6: Set only the public SDK key for the future build**

Set `EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY` in the EAS production environment. This action must not start a build.

- [ ] **Step 7: Keep Apple API automation read-only first**

A bridge is optional because this chat has no native App Store Connect connector. Its first version, if approved separately, must use `workflow_dispatch` only, accept only `mode=inspect`, contain no EAS command, perform no Apple/RevenueCat write, print no credential, and emit only sanitized IDs and states. Do not create write-capable automation until read-only evidence is reviewed.

---

### Task 10: Run the Full Source Matrix Once

**Files:**
- Create: `frontend/BUILD_22_SOURCE_VALIDATION_20260805.md`
- Modify only files required to correct real failures

**Interfaces:**
- Produces: one source-validation record tied to one final SHA.

- [ ] **Step 1: Run focused checks**

```bash
cd ../ScriptureGames-build22
node scripts/audit-release-automation.mjs
cd frontend
yarn test:build22
yarn audit:store
yarn test:build15
yarn test:journey
yarn typecheck
yarn lint
```

Expected: all PASS.

- [ ] **Step 2: Run the complete chain exactly once locally**

```bash
cd ../ScriptureGames-build22/frontend
yarn validate
```

Expected: Bible generation/audit, cloud audit, Premium audit, quiz ordering, Book Mastery, Build 20 recovery, Lumi, voice, navigation, Journey, Build 13–18 regressions, runtime/content/visual audits, Expo Doctor, TypeScript, ESLint, and local iOS/Android exports all PASS.

- [ ] **Step 3: Verify no paid operation occurred**

```bash
cd ../ScriptureGames-build22
git grep -nE 'eas build|eas submit|--auto-submit' -- .github/workflows || true
git status --short
```

Expected: no EAS command in active workflows and only intended changes.

- [ ] **Step 4: Write the evidence report**

Record final SHA, every command, result, dependency version, modified files, zero EAS builds, zero submissions, zero Android cloud builds, and zero App Review actions. Do not claim sandbox purchase success.

- [ ] **Step 5: Commit and inspect**

```bash
cd ../ScriptureGames-build22/frontend
git add BUILD_22_SOURCE_VALIDATION_20260805.md
git commit -m "docs: record Build 22 source validation"
cd ..
git diff --stat origin/main...HEAD
git diff --check origin/main...HEAD
git log --oneline origin/main..HEAD
```

Expected: no unrelated redesign or whitespace error.

---

### Task 11: Open One PR and Use CI Once

**Files:**
- No new source change unless CI identifies a real defect

**Interfaces:**
- Produces: one reviewed implementation PR and one primary quality-gate run.

- [ ] **Step 1: Push once after local validation**

```bash
cd ../ScriptureGames-build22
git push -u origin feature/build22-revenuecat-apple-premium
```

- [ ] **Step 2: Open one PR**

PR body must include:

```text
Source implementation only. No EAS build, TestFlight upload, Android cloud build, App Review submission, or public release is authorized by this PR.
```

Include baseline SHA, final SHA, exact IDs, workflow quarantine, test evidence, and Build 21 rollback.

- [ ] **Step 3: Allow one full quality-gate run**

Do not push cosmetic changes while it runs. If a real defect appears, fix and prove it locally, batch one corrective commit, and push once. Retry only the failed job when possible.

- [ ] **Step 4: Review exact evidence**

Confirm the release-automation audit, Build 22 purchase test, store audit, full legacy matrix, secret scan, and absence of EAS/submission runs.

- [ ] **Step 5: Merge only after final workflow inventory**

Immediately before merge, verify `.github/workflows/` contains only `quality-gate.yml` and merging cannot start EAS.

---

### Task 12: Paid Build and Apple Release as Three Separate Gates

**Files:**
- Create release evidence after each completed gate
- No source edit between approved source SHA and submission

**Interfaces:**
- Produces: one iOS Build 22, one TestFlight upload, sandbox evidence, screenshots from that exact binary, and one App Review submission.

- [ ] **Step 1: Check the next remote build number without building**

From `../ScriptureGames-build22/frontend`, authenticate only after explicit approval to inspect Expo and run:

```bash
eas build:version:get --platform ios --profile production
```

Expected: the remote value makes the next auto-incremented build number `22`. Stop on mismatch; do not build.

- [ ] **Step 2: Paid-build authorization gate**

Proceed only after the user authorizes exactly one paid iOS build from the exact SHA.

```bash
cd ../ScriptureGames-build22/frontend
eas build --platform ios --profile production --non-interactive
```

Forbidden: `--auto-submit`, Android, all-platform builds, automatic retry.

- [ ] **Step 3: Verify the artifact**

Confirm version `1.0.0`, build `22`, bundle ID, source SHA, finished status, exactly one new iOS build, and no Android build.

- [ ] **Step 4: TestFlight authorization gate**

Obtain separate authorization to submit that existing artifact without rebuilding.

- [ ] **Step 5: Run the physical sandbox matrix**

On exact TestFlight Build 22 verify:

1. fresh install without purchase
2. localized price loads
3. purchase succeeds
4. Premium unlocks without restart
5. relaunch preserves access
6. offline access works after trusted validation
7. switching local profiles preserves Premium
8. reinstall and Restore Purchase recover access
9. cancellation does not unlock
10. pending/interrupted purchase does not unlock early
11. ten free books remain free before purchase
12. Premium-only book locks before and opens after purchase
13. no duplicate-charge path
14. support/privacy links load
15. Lumi, audio, backgrounds, Bible links, Journey, profiles, and Genesis remain functional

Stop on any failure. A second paid build requires new authorization.

- [ ] **Step 6: Capture screenshots from exact Build 22**

Capture Journey map/library, Daily Bread Run, Bible reader, Church Mode, notes/highlights/search, Training Hub, Family Hub, achievements/Witness Card, and Premium with localized lifetime price. Create the separate IAP review screenshot. Do not use development previews.

- [ ] **Step 7: Complete the Apple submission package**

Attach the first non-consumable to the new app version. Verify price, availability, review notes, privacy answers, screenshots, age rating, support URL, and Paid Apps Agreement.

- [ ] **Step 8: App Review authorization gate**

Show the final checklist and obtain separate explicit authorization before Add for Review/Create Submission and Submit for Review.

- [ ] **Step 9: Revoke temporary access after release**

After approval and production verification, revoke temporary App Store Connect automation keys no longer needed. Keep the Apple In-App Purchase key connected to RevenueCat while required for production validation.

---

## Plan Self-Review

- **Spec coverage:** purchase architecture, app-wide entitlement, trusted verification, restore, offline continuity, localized price, free boundary, metadata, privacy, Apple/RevenueCat configuration, screenshots, sandbox testing, rollback, Expo cost controls, GitHub safety, and three authorization gates are covered.
- **Placeholder scan:** no `TBD`, `TODO`, “implement later,” or unspecified error-handling instruction remains.
- **Type consistency:** `PurchaseClient`, `PurchaseSnapshot`, `PurchaseResult`, `PurchaseFailureCode`, `createPurchaseClient`, `hasTrustedPremiumEntitlement`, `selectLifetimeProduct`, and `normalizePurchaseError` retain the same names throughout.
- **File consistency:** every created file has an implementation task; `purchase-client-factory.ts` was removed because platform resolution already provides the factory seam.
- **Directory consistency:** root and `frontend` commands explicitly change directory before use.
- **Configuration consistency:** `eas.json` remains unchanged; the public RevenueCat key is supplied through EAS Environment Variables only at the authorized build gate.
- **Scope:** all tasks lead to one working feature and are sequentially dependent. Subscriptions, Android billing release, web purchases, Supabase purchase authority, and unrelated redesign remain out of scope.
