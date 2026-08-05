# Build 22 RevenueCat Apple Premium Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the protected placeholder Premium flow with one verified Apple non-consumable lifetime purchase through RevenueCat while preserving the physically tested Build 21 experience and preventing accidental Expo charges or unsafe GitHub automation.

**Architecture:** Keep the existing `usePremiumEntitlement()` public interface so Journey, backgrounds, and navigation do not need broad rewrites. Put RevenueCat behind a small injectable purchase client, make the RevenueCat `premium` entitlement the only authority for app-wide access, and keep web/unsupported platforms fail-closed. Before any app merge, archive legacy release workflows and add a repository audit that rejects automatic EAS builds, automatic submissions, workflow chains, and release polling.

**Tech Stack:** Expo SDK 54.0.36, React Native 0.81.5, React 19.1.0, TypeScript 5.9.3, Expo Router 6.0.24, `react-native-purchases` 10.4.4, RevenueCat Entitlements/Offerings, Apple StoreKit 2 through RevenueCat, Node-based regression scripts, GitHub Actions quality gate.

## Global Constraints

- Protected rollback baseline: Scripture Games 1.0.0 Build 21.
- Release target: Scripture Games 1.0.0 Build 22.
- Apple bundle ID: `com.willywill.scripturegames`.
- App Store Connect app ID: `6795368257`.
- Apple product type: Non-Consumable.
- Apple product ID: `com.willywill.scripturegames.premium`.
- RevenueCat entitlement ID: `premium`.
- RevenueCat offering ID: `default` with exactly one lifetime package for the Apple product.
- The ten free Journey books remain `GEN`, `EXO`, `LEV`, `NUM`, `DEU`, `MAT`, `MRK`, `LUK`, `JHN`, and `ACT`.
- The remaining 56 Journey books require an active, trusted RevenueCat entitlement.
- Complete offline Bible, core quizzes, Lumi, Faith Journeys, Prayer Garden, local profiles, and Build 21 free features remain free.
- Premium is app-wide for the current Apple purchase identity, not tied to one local player profile.
- Legacy profile fields may remain for data compatibility but must never unlock Premium.
- No direct edits on `main`; implementation uses one isolated branch and one PR.
- No EAS build, EAS submission, TestFlight upload, Android cloud build, or App Review submission during source implementation.
- Never use `--auto-submit`.
- Never automatically retry a paid build.
- A paid iOS build, TestFlight submission, and App Review submission require three separate explicit user authorizations.
- Store passwords, `.p8` files, App Store Connect private keys, Apple In-App Purchase private keys, and RevenueCat secret keys are never committed or pasted into chat.
- Only RevenueCat's public Apple SDK key may be compiled into the client.
- Pin `react-native-purchases` to exactly `10.4.4`; do not float to `latest` during Build 22.
- No existing regression test may be deleted, skipped, weakened, or changed merely to obtain a passing run.
- Target CI budget: one complete PR quality-gate run and at most one corrective run after a real source correction.

---

## File Map

### New purchase files

- `frontend/src/purchases/purchase-types.ts` — store-neutral states, results, errors, and `PurchaseClient` interface.
- `frontend/src/purchases/purchase-core.ts` — pure entitlement verification, package selection, and error-normalization helpers.
- `frontend/src/purchases/purchase-client.ts` — safe default/web implementation that never charges and never unlocks.
- `frontend/src/purchases/purchase-client.native.ts` — iOS RevenueCat implementation; Android remains explicitly unsupported for Build 22.
- `frontend/src/purchases/purchase-client-factory.ts` — creates the platform implementation and allows test injection.
- `frontend/scripts/test-build22-purchases.ts` — pure purchase and app-wide entitlement regression contract.
- `frontend/scripts/audit-build22-store-config.ts` — source/config audit for exact IDs, dependency pin, public-key boundary, and forbidden local unlocks.
- `scripts/audit-release-automation.mjs` — repository safety audit that rejects paid or chained release automation.

### Modified application files

- `frontend/src/premium-entitlement.tsx` — preserve the public hook, remove profile authority, initialize the purchase client once, and expose price/purchase/restore states.
- `frontend/src/premium-entitlement-core.ts` — retain Journey access logic and product ID; remove profile-validation authority from runtime use.
- `frontend/app/premium.tsx` — show Apple's localized lifetime price and honest purchase/restore states.
- `frontend/app/_layout.tsx` — preserve provider placement; only adjust provider props if test injection requires it.
- `frontend/package.json` — add the exact RevenueCat dependency and Build 22 scripts to `validate` and `eas-build-post-install`.
- `frontend/yarn.lock` — lock the exact dependency tree.
- `frontend/eas.json` — reference only the RevenueCat public SDK key through `EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY`; do not add any private credential.
- `frontend/expo-env.d.ts` — declare the public environment variable.
- `frontend/src/profile-context.tsx` — document legacy fields as non-authoritative; avoid a schema-breaking removal in Build 22.
- `frontend/scripts/test-build15-piano-premium.ts` — update only the obsolete assertion that profile entitlement is authoritative; preserve the free-book and all other Build 15 assertions.
- `.github/workflows/quality-gate.yml` — add release-automation, Build 22 purchase, and store-config audits.
- `APP_STORE_METADATA.md`, `APP_REVIEW_NOTES.md`, `APP_STORE_SUBMISSION_1.0.0.md` — replace outdated “no purchase flow” statements with the final lifetime-purchase disclosure and review path.

### Archived release automation

Move every active workflow except `quality-gate.yml` out of `.github/workflows/` into `docs/archive/github-workflows-pre-build22/` with a `.yml.txt` suffix. Archive the four `.github/release-triggers/` files beside them. This preserves history while making GitHub unable to execute them.

---

### Task 1: Establish the Isolated Implementation Baseline

**Files:**
- Create at execution time: isolated git worktree for branch `feature/build22-revenuecat-apple-premium`
- Read: `frontend/package.json`
- Read: `frontend/app.json`
- Read: `frontend/eas.json`
- Read: `frontend/src/premium-entitlement.tsx`
- Read: `frontend/app/premium.tsx`

**Interfaces:**
- Consumes: exact current `main` SHA.
- Produces: immutable baseline SHA recorded in the implementation PR and clean worktree evidence.

- [ ] **Step 1: Create an isolated worktree from current `main`**

```bash
git fetch origin main
git worktree add ../ScriptureGames-build22 -b feature/build22-revenuecat-apple-premium origin/main
cd ../ScriptureGames-build22
git rev-parse HEAD
git status --short
```

Expected: one SHA is printed and `git status --short` prints nothing.

- [ ] **Step 2: Record the baseline without triggering CI**

```bash
printf '%s\n' "Build 22 baseline: $(git rev-parse HEAD)" > /tmp/scripture-games-build22-baseline.txt
```

Expected: no repository file changes and no GitHub Actions run.

- [ ] **Step 3: Verify Build 21 identifiers before any edit**

```bash
cd frontend
node -e "const a=require('./app.json').expo; if(a.ios.bundleIdentifier!=='com.willywill.scripturegames') process.exit(1); console.log(a.version,a.ios.bundleIdentifier,a.extra.eas.projectId)"
grep -F '6795368257' eas.json
grep -F 'com.willywill.scripturegames.premium' src/premium-entitlement-core.ts
```

Expected: version `1.0.0`, correct bundle ID, EAS project ID, App Store Connect ID, and Premium product ID.

- [ ] **Step 4: Do not commit**

This task creates no repository change. Stop if the worktree is not clean or `main` changed unexpectedly.

---

### Task 2: Quarantine Legacy Release Automation with a Failing Safety Audit

**Files:**
- Create: `scripts/audit-release-automation.mjs`
- Modify: `.github/workflows/quality-gate.yml`
- Move: all active `.github/workflows/*.yml` except `quality-gate.yml` to `docs/archive/github-workflows-pre-build22/*.yml.txt`
- Move: `.github/release-triggers/*.md` to `docs/archive/github-workflows-pre-build22/release-triggers/*.md.txt`

**Interfaces:**
- Consumes: repository root.
- Produces: `node scripts/audit-release-automation.mjs`, which exits nonzero if an active workflow can build, submit, chain, poll, auto-merge, or mutate `main`.

- [ ] **Step 1: Write the failing repository audit**

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
  if (file === 'quality-gate.yml') continue;
  const source = readFileSync(join(workflowsDir, file), 'utf8');
  for (const pattern of forbidden) {
    if (pattern.test(source)) violations.push(`${file}: ${pattern}`);
  }
}

if (files.some((file) => file !== 'quality-gate.yml')) {
  violations.push(`unexpected active workflows: ${files.filter((file) => file !== 'quality-gate.yml').join(', ')}`);
}

if (violations.length) {
  throw new Error(`Unsafe release automation found:\n- ${violations.join('\n- ')}`);
}
console.log('Release automation audit passed: only the source-only quality gate is active.');
```

- [ ] **Step 2: Run it and verify RED**

Run:

```bash
node scripts/audit-release-automation.mjs
```

Expected: FAIL listing the existing RC3, monitor, EAS, submission, and trigger workflows.

- [ ] **Step 3: Archive executable workflows instead of deleting their history**

```bash
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

- [ ] **Step 4: Add the audit to the beginning of the quality gate**

Add after checkout and runtime setup, before dependency installation:

```yaml
      - name: Reject automatic release automation
        run: node scripts/audit-release-automation.mjs
```

- [ ] **Step 5: Run the audit and verify GREEN**

```bash
node scripts/audit-release-automation.mjs
```

Expected: `Release automation audit passed: only the source-only quality gate is active.`

- [ ] **Step 6: Inspect the exact workflow diff**

```bash
git diff --stat -- .github docs/archive scripts/audit-release-automation.mjs
git grep -nE 'eas build|eas submit|--auto-submit|workflow_run|gh run rerun' -- .github/workflows || true
```

Expected: only `quality-gate.yml` remains active and the grep produces no forbidden release command.

- [ ] **Step 7: Commit the safety boundary**

```bash
git add .github docs/archive scripts/audit-release-automation.mjs
git commit -m "chore: quarantine legacy release automation"
```

---

### Task 3: Add the Pinned RevenueCat Dependency and Store-Neutral Contracts

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/yarn.lock`
- Create: `frontend/src/purchases/purchase-types.ts`
- Create: `frontend/src/purchases/purchase-core.ts`
- Create: `frontend/scripts/test-build22-purchases.ts`

**Interfaces:**
- Consumes: RevenueCat customer information represented by a minimal test shape.
- Produces:
  - `PurchaseClient`
  - `PurchaseSnapshot`
  - `PurchaseFailureCode`
  - `hasTrustedPremiumEntitlement(customerInfo)`
  - `selectLifetimeProduct(packages)`
  - `normalizePurchaseError(error)`

- [ ] **Step 1: Add the exact SDK version without running EAS**

```bash
cd frontend
npx expo install react-native-purchases@10.4.4
yarn why react-native-purchases
```

Expected: `react-native-purchases@10.4.4` appears exactly in `package.json` and the lockfile.

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

- [ ] **Step 3: Write failing pure-core tests**

```ts
// scripts/test-build22-purchases.ts
import assert from 'node:assert/strict';
import {
  PREMIUM_ENTITLEMENT_ID,
  PREMIUM_PRODUCT_ID,
  hasTrustedPremiumEntitlement,
  selectLifetimeProduct,
} from '../src/purchases/purchase-core.ts';

assert.equal(PREMIUM_PRODUCT_ID, 'com.willywill.scripturegames.premium');
assert.equal(PREMIUM_ENTITLEMENT_ID, 'premium');
assert.equal(hasTrustedPremiumEntitlement(undefined), false);
assert.equal(hasTrustedPremiumEntitlement({ active: {} }), false);
assert.equal(hasTrustedPremiumEntitlement({
  active: { premium: { verification: 'FAILED' } },
}), false);
assert.equal(hasTrustedPremiumEntitlement({
  active: { premium: { verification: 'VERIFIED' } },
}), true);
assert.equal(hasTrustedPremiumEntitlement({
  active: { premium: { verification: 'VERIFIED_ON_DEVICE' } },
}), true);
assert.equal(selectLifetimeProduct([
  { product: { identifier: 'wrong', priceString: '$0.99' } },
  { product: { identifier: PREMIUM_PRODUCT_ID, priceString: '$9.99' } },
])?.product.priceString, '$9.99');
console.log('Build 22 purchase core tests passed.');
```

- [ ] **Step 4: Run the test and verify RED**

```bash
node --experimental-strip-types scripts/test-build22-purchases.ts
```

Expected: FAIL because `purchase-core.ts` does not exist.

- [ ] **Step 5: Implement the minimal pure core**

```ts
// src/purchases/purchase-core.ts
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
```

- [ ] **Step 6: Run tests and compatibility checks**

```bash
node --experimental-strip-types scripts/test-build22-purchases.ts
npx expo install --check
yarn typecheck
```

Expected: purchase test PASS, Expo dependency check PASS, TypeScript PASS.

- [ ] **Step 7: Commit**

```bash
git add package.json yarn.lock src/purchases scripts/test-build22-purchases.ts
git commit -m "test: define trusted Build 22 purchase core"
```

---

### Task 4: Implement the Fail-Closed Platform Purchase Clients

**Files:**
- Create: `frontend/src/purchases/purchase-client.ts`
- Create: `frontend/src/purchases/purchase-client.native.ts`
- Create: `frontend/src/purchases/purchase-client-factory.ts`
- Modify: `frontend/src/purchases/purchase-core.ts`
- Modify: `frontend/scripts/test-build22-purchases.ts`

**Interfaces:**
- Consumes: `PurchaseClient`, exact public Apple SDK key, RevenueCat offerings/customer info.
- Produces: `createPurchaseClient()` and one configured singleton per app launch.

- [ ] **Step 1: Extend tests for fail-closed error normalization**

Add these assertions:

```ts
import { normalizePurchaseError } from '../src/purchases/purchase-core.ts';

assert.equal(normalizePurchaseError({ code: '1', userCancelled: true }), 'cancelled');
assert.equal(normalizePurchaseError({ code: 'PaymentPendingError' }), 'pending');
assert.equal(normalizePurchaseError({ code: 'NetworkError' }), 'network');
assert.equal(normalizePurchaseError({ code: 'ProductNotAvailableForPurchaseError' }), 'product-unavailable');
assert.equal(normalizePurchaseError(new Error('unexpected')), 'unknown');
```

- [ ] **Step 2: Run RED**

```bash
node --experimental-strip-types scripts/test-build22-purchases.ts
```

Expected: FAIL because `normalizePurchaseError` is missing.

- [ ] **Step 3: Add a resilient error normalizer**

```ts
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

- [ ] **Step 4: Implement the safe default client**

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

- [ ] **Step 5: Implement the iOS native RevenueCat client**

Use these exact rules in `purchase-client.native.ts`:

```ts
import { Platform } from 'react-native';
import Purchases, {
  ENTITLEMENT_VERIFICATION_MODE,
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesPackage,
} from 'react-native-purchases';
import { hasTrustedPremiumEntitlement, normalizePurchaseError, selectLifetimeProduct } from './purchase-core';
import type { PurchaseClient, PurchaseSnapshot } from './purchase-types';

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

`purchaseLifetime()` must refuse to call StoreKit until `lifetimePackage` exists, call `Purchases.purchasePackage(lifetimePackage)`, and return `hasPremium: true` only when the returned customer information passes `hasTrustedPremiumEntitlement`.

`restore()` must call `Purchases.restorePurchases()` and use the same trusted-entitlement check.

`subscribe()` must register `Purchases.addCustomerInfoUpdateListener`, update from `snapshot(customerInfo)`, and remove the listener in cleanup.

- [ ] **Step 6: Run source-only verification**

```bash
node --experimental-strip-types scripts/test-build22-purchases.ts
yarn typecheck
yarn lint
yarn export:ios
yarn export:android
```

Expected: all commands PASS. No EAS command is run.

- [ ] **Step 7: Commit**

```bash
git add src/purchases scripts/test-build22-purchases.ts
git commit -m "feat: add fail-closed RevenueCat purchase client"
```

---

### Task 5: Make the Existing Premium Provider App-Wide and Testable

**Files:**
- Modify: `frontend/src/premium-entitlement.tsx`
- Modify: `frontend/src/premium-entitlement-core.ts`
- Modify: `frontend/src/profile-context.tsx`
- Modify: `frontend/scripts/test-build22-purchases.ts`
- Modify: `frontend/scripts/test-build15-piano-premium.ts`

**Interfaces:**
- Consumes: `PurchaseClient`.
- Produces: unchanged hook name `usePremiumEntitlement()` plus `localizedPrice` and richer status values.

- [ ] **Step 1: Add source-level regression assertions before modifying the provider**

Add to `test-build22-purchases.ts`:

```ts
import { readFileSync } from 'node:fs';
const providerSource = readFileSync('src/premium-entitlement.tsx', 'utf8');
assert.doesNotMatch(providerSource, /hasValidatedPremiumEntitlement\(profile\)/);
assert.doesNotMatch(providerSource, /useProfile\(\)/);
assert.match(providerSource, /createPurchaseClient/);
assert.match(providerSource, /localizedPrice/);
```

- [ ] **Step 2: Run RED**

```bash
node --experimental-strip-types scripts/test-build22-purchases.ts
```

Expected: FAIL because the current provider still uses the local profile.

- [ ] **Step 3: Preserve the public context while changing its authority**

The context must expose:

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

Provider behavior:

1. Create the client once with `useRef(createPurchaseClient())`.
2. Call `configure()` once after mount.
3. Subscribe once to customer information changes.
4. Render children immediately with free access while checking.
5. Set `hasPremium` only from `PurchaseSnapshot.hasPremium`.
6. Never read `profile.is_premium` or other legacy entitlement fields.
7. Treat cancellation as non-destructive.
8. Treat pending as locked until a later trusted update.
9. Preserve cached trusted Premium when a refresh has a temporary network failure.
10. Never optimistically unlock before a trusted purchase or restore result.

- [ ] **Step 4: Mark legacy profile fields as non-authoritative without deleting them**

Add a code comment above the four legacy fields in `Profile`:

```ts
// Legacy compatibility only. Build 22 purchase access is owned by RevenueCat,
// and these fields must never be used to unlock Premium.
```

Do not migrate or rewrite saved profiles in this task.

- [ ] **Step 5: Correct the Build 15 regression assertion**

Replace only the provider-authority assertion with:

```ts
check('provider rejects local profile authority', () => {
  assert.doesNotMatch(provider, /hasValidatedPremiumEntitlement\(profile\)/);
  assert.doesNotMatch(provider, /Boolean\(profile\?\.is_premium\)/);
  assert.match(provider, /createPurchaseClient/);
});
```

Keep the ten-free-books, audio, quiz background, Scripture links, Bible return, copy, and Genesis assertions unchanged.

- [ ] **Step 6: Run focused tests**

```bash
node --experimental-strip-types scripts/test-build22-purchases.ts
yarn test:build15
yarn test:journey
yarn typecheck
yarn lint
```

Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add src/premium-entitlement.tsx src/premium-entitlement-core.ts src/profile-context.tsx scripts/test-build22-purchases.ts scripts/test-build15-piano-premium.ts
git commit -m "feat: make Premium a trusted app-wide entitlement"
```

---

### Task 6: Update the Premium Screen Without Redesigning It

**Files:**
- Modify: `frontend/app/premium.tsx`
- Modify: `frontend/scripts/test-build22-purchases.ts`

**Interfaces:**
- Consumes: `hasPremium`, `localizedPrice`, `status`, `message`, `purchase()`, and `restore()`.
- Produces: existing Premium layout with accurate Apple purchase states.

- [ ] **Step 1: Add failing UI source assertions**

```ts
const premiumSource = readFileSync('app/premium.tsx', 'utf8');
assert.match(premiumSource, /localizedPrice/);
assert.match(premiumSource, /One-time lifetime purchase/);
assert.doesNotMatch(premiumSource, /billing is not connected/i);
assert.doesNotMatch(premiumSource, /No charge was attempted/i);
assert.match(premiumSource, /Restore Purchase/);
```

- [ ] **Step 2: Run RED**

```bash
node --experimental-strip-types scripts/test-build22-purchases.ts
```

Expected: FAIL on current placeholder copy.

- [ ] **Step 3: Change only purchase-dependent UI behavior**

Use:

```ts
const { hasPremium, productId, localizedPrice, status, message, purchase, restore } = usePremiumEntitlement();
const busy = status === 'checking' || status === 'purchasing' || status === 'restoring';
const purchaseLabel = localizedPrice
  ? `Unlock Forever — ${localizedPrice}`
  : status === 'checking'
    ? 'Loading Apple Price…'
    : 'Unlock Complete Bible Journey';
```

The purchase button must be disabled while busy or when `localizedPrice` is absent. Keep the Restore button visible.

Replace the placeholder notice with:

```text
One-time lifetime purchase
Apple will show the final localized price and confirmation sheet before charging. Restore Purchase is available for an eligible purchase made with the same Apple Account.
```

Do not promise Family Sharing unless it is enabled and physically verified later.

- [ ] **Step 4: Preserve the Build 21 visual structure**

Do not change:

- backdrop darkness
- hero panel structure
- section order
- feature lists
- always-free list
- route destinations
- Genesis/Journey artwork
- theme tokens

- [ ] **Step 5: Run focused UI and visual checks**

```bash
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

### Task 7: Add Build-Time Configuration and Store-Config Audits

**Files:**
- Modify: `frontend/eas.json`
- Modify: `frontend/expo-env.d.ts`
- Create: `frontend/scripts/audit-build22-store-config.ts`
- Modify: `frontend/package.json`
- Modify: `.github/workflows/quality-gate.yml`

**Interfaces:**
- Consumes: `EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY` at native build time.
- Produces: source-only audit that fails on missing IDs, wrong dependency version, private-key leakage, or local entitlement authority.

- [ ] **Step 1: Declare the public build variable**

```ts
// expo-env.d.ts addition
declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY?: string;
  }
}
```

- [ ] **Step 2: Reference the public key in EAS profiles without embedding a value**

Do not place an actual key in Git. Add this comment-equivalent requirement to release documentation rather than a fake value: the variable is set in EAS Environment Variables for production immediately before the authorized Build 22 build. Local source validation intentionally runs with it absent and must remain fail-closed.

Do not add `ASC_*`, `APPLE_IAP_*`, or `REVENUECAT_V2_SECRET_KEY` to `eas.json`.

- [ ] **Step 3: Write the store-config audit**

The audit must assert:

```ts
assert.equal(pkg.dependencies['react-native-purchases'], '10.4.4');
assert.equal(app.expo.ios.bundleIdentifier, 'com.willywill.scripturegames');
assert.equal(eas.submit.production.ios.ascAppId, '6795368257');
assert.match(core, /com\.willywill\.scripturegames\.premium/);
assert.match(purchaseCore, /PREMIUM_ENTITLEMENT_ID = 'premium'/);
assert.doesNotMatch(allClientSource, /ASC_PRIVATE_KEY|APPLE_IAP_PRIVATE_KEY|REVENUECAT_V2_SECRET_KEY/);
assert.doesNotMatch(provider, /is_premium|premium_entitlement_source|premium_product_id/);
```

Also scan tracked source for PEM headers and fail on:

```text
-----BEGIN PRIVATE KEY-----
-----BEGIN EC PRIVATE KEY-----
```

- [ ] **Step 4: Add scripts**

```json
"test:build22": "node --experimental-strip-types scripts/test-build22-purchases.ts",
"audit:store": "node --experimental-strip-types scripts/audit-build22-store-config.ts"
```

Append `yarn test:build22 && yarn audit:store` to both `validate` and `eas-build-post-install` before exports.

- [ ] **Step 5: Add the focused jobs to the quality gate**

```yaml
      - name: Test Build 22 Apple Premium
        working-directory: frontend
        run: yarn test:build22

      - name: Audit Build 22 store configuration
        working-directory: frontend
        run: yarn audit:store
```

- [ ] **Step 6: Run focused verification**

```bash
node ../scripts/audit-release-automation.mjs
yarn test:build22
yarn audit:store
yarn typecheck
yarn lint
```

Expected: all PASS with no EAS invocation.

- [ ] **Step 7: Commit**

```bash
git add eas.json expo-env.d.ts scripts/audit-build22-store-config.ts package.json ../.github/workflows/quality-gate.yml
git commit -m "chore: add Build 22 store and release safety gates"
```

---

### Task 8: Update Store Metadata, Privacy Disclosure, and Review Instructions

**Files:**
- Modify: `APP_STORE_METADATA.md`
- Modify: `APP_REVIEW_NOTES.md`
- Modify: `APP_STORE_SUBMISSION_1.0.0.md`
- Modify: Vercel `scripture-games-support` privacy/support source only if its repository source is identified and reviewed

**Interfaces:**
- Consumes: finalized Build 22 purchase behavior.
- Produces: accurate copy for App Store Connect and reviewer navigation.

- [ ] **Step 1: Write exact customer-facing disclosure**

Use this wording consistently:

```text
Scripture Games includes an optional one-time lifetime purchase, Complete Bible Journey Premium. The purchase unlocks the remaining 56 Bible Journey book seasons, the full peaceful scene collection, and complete mastery records. Ten complete Journey books, the entire offline Bible reader, core quizzes, Lumi, and faith tools remain available without purchase.
```

- [ ] **Step 2: Write exact App Review navigation**

```text
Open Scripture Games → select or create a local player → open Complete Bible Journey → choose any Premium-marked book, or open the Premium screen directly. The screen displays Apple's localized lifetime price. Tap Unlock Forever to open Apple's purchase sheet. Tap Restore Purchase to restore an eligible prior purchase. No login is required.
```

- [ ] **Step 3: Remove all outdated statements**

Search and remove statements that claim:

- there is no active purchase flow
- all release content is unlocked
- purchases/subscriptions are “none”
- Premium is attached to one player profile
- tapping Unlock can never charge

- [ ] **Step 4: Update privacy disclosure narrowly**

Document that RevenueCat processes purchase-related identifiers, transaction records, product interaction, and entitlement status for app functionality. Do not claim that prayer notes, Bible notes, Lumi messages, family names, quiz answers, or reading history are sent to RevenueCat.

- [ ] **Step 5: Verify support-site source before editing Vercel**

Use Vercel to identify the exact production project and deployment. Do not deploy from an unverified local directory. If the source repository cannot be identified, document the required text and leave production untouched until its source is confirmed.

- [ ] **Step 6: Commit repository metadata**

```bash
git add APP_STORE_METADATA.md APP_REVIEW_NOTES.md APP_STORE_SUBMISSION_1.0.0.md
git commit -m "docs: prepare Build 22 lifetime purchase review metadata"
```

---

### Task 9: Configure Apple and RevenueCat Without Exposing Credentials

**Files:**
- No app source change required for dashboard setup
- Optional create after review: `.github/workflows/store-connect-inspect.yml` as read-only, manual-dispatch-only automation
- Optional create after review: `scripts/store-connect-inspect.mjs`

**Interfaces:**
- Consumes secure credentials added directly by the user to encrypted service settings.
- Produces Apple product, RevenueCat product/entitlement/offering, and sanitized configuration evidence.

- [ ] **Step 1: Confirm Apple business readiness manually**

In App Store Connect, Account Holder confirms:

- Paid Apps Agreement is active
- tax information is complete
- banking information is complete
- Scripture Games app ID is `6795368257`
- bundle ID is `com.willywill.scripturegames`

Stop if any business requirement is incomplete; do not create a paid build.

- [ ] **Step 2: Generate the two separate Apple keys**

Create:

1. App Store Connect API team key with App Manager role.
2. Apple In-App Purchase key under Users and Access → Integrations → In-App Purchase.

Record issuer ID and key ID securely. Download each `.p8` once. Do not paste either key into chat.

- [ ] **Step 3: Create the RevenueCat project and iOS app**

Use:

```text
Project: Scripture Games
Platform: App Store
Bundle ID: com.willywill.scripturegames
```

Upload the App Store Connect API credential and Apple In-App Purchase credential directly in RevenueCat's secure dashboard.

- [ ] **Step 4: Create or import the exact product**

Apple product:

```text
Type: Non-Consumable
Reference Name: Complete Bible Journey Premium
Product ID: com.willywill.scripturegames.premium
Display Name: Complete Bible Journey Premium
Description: Unlock all 66 Bible Journey book seasons, complete mastery records, and the full peaceful scene collection with one lifetime purchase.
```

Choose the final price deliberately. Do not invent a price in source code; the app displays Apple's localized price.

- [ ] **Step 5: Configure RevenueCat entitlement and offering**

```text
Entitlement ID: premium
Offering ID: default
Package type: Lifetime
Attached product: com.willywill.scripturegames.premium
```

Verify exactly one lifetime package is active in the current offering.

- [ ] **Step 6: Add only the public SDK key to the build environment**

Set `EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY` in the EAS production environment. Do not trigger a build.

- [ ] **Step 7: Keep App Store Connect private automation optional and read-only first**

If a GitHub bridge is still desired, its first version must:

- use `workflow_dispatch` only
- request `mode=inspect`
- contain no EAS commands
- perform no Apple or RevenueCat write
- print no credentials
- emit only app ID, bundle ID, product ID, product state, offering ID, and entitlement ID

Do not create a write-capable Apple workflow until the read-only output has been reviewed and a separate exact action contract is approved.

---

### Task 10: Run the Complete Local Regression Matrix Before Opening One PR

**Files:**
- Modify only files required to correct real failures
- Create: `frontend/BUILD_22_SOURCE_VALIDATION_20260805.md`

**Interfaces:**
- Consumes: final implementation branch head.
- Produces: one immutable source-validation report tied to one commit SHA.

- [ ] **Step 1: Run focused safety checks first**

```bash
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

- [ ] **Step 2: Run the full validation chain exactly once locally**

```bash
yarn validate
```

Expected: complete Bible generation/audit, cloud audit, Premium audit, quiz ordering, Book Mastery, Build 20 recovery, Lumi, voice, navigation, Journey, Build 13–18 regressions, runtime/content/visual audits, Expo Doctor, TypeScript, ESLint, and local iOS/Android exports all PASS.

- [ ] **Step 3: Verify no paid operation occurred**

```bash
git grep -nE 'eas build|eas submit|--auto-submit' -- .github/workflows || true
git status --short
```

Expected: no EAS command in active workflows and only intended source/report changes.

- [ ] **Step 4: Write the validation report**

Record:

- final branch SHA
- every command run
- pass/fail result
- exact dependency version
- zero EAS builds
- zero submissions
- zero Android cloud builds
- zero App Review actions
- list of modified files

Do not claim sandbox purchase success at the source-only stage.

- [ ] **Step 5: Commit the report**

```bash
git add BUILD_22_SOURCE_VALIDATION_20260805.md
git commit -m "docs: record Build 22 source validation"
```

- [ ] **Step 6: Inspect the entire diff against `main`**

```bash
git diff --stat origin/main...HEAD
git diff --check origin/main...HEAD
git log --oneline origin/main..HEAD
```

Expected: no whitespace errors, no unrelated app redesign, and coherent batched commits.

---

### Task 11: Open One PR and Spend the CI Budget Once

**Files:**
- No additional source change unless CI finds a real defect

**Interfaces:**
- Consumes: locally validated branch.
- Produces: one reviewed PR and one primary GitHub quality-gate run.

- [ ] **Step 1: Push the branch once after local validation**

```bash
git push -u origin feature/build22-revenuecat-apple-premium
```

- [ ] **Step 2: Open one PR with explicit release boundaries**

PR body must state:

```text
Source implementation only. No EAS build, TestFlight upload, Android cloud build, App Review submission, or public release is authorized by this PR.
```

Include the baseline SHA, final SHA, tests, exact product/entitlement IDs, workflow quarantine, and rollback to Build 21.

- [ ] **Step 3: Let the quality gate run once**

Do not push cosmetic changes while CI is running. If a job fails because of a real source defect, fix locally, rerun only the focused failing command locally, batch the correction into one commit, and push once.

- [ ] **Step 4: Review CI evidence and exact diff**

Confirm:

- release-automation audit passed
- Build 22 purchase test passed
- store-config audit passed
- full legacy regression matrix passed
- no EAS or submission workflow ran
- no secret appears in logs or diff

- [ ] **Step 5: Merge only after the active-workflow inventory is safe**

Immediately before merge, verify `.github/workflows/` contains only `quality-gate.yml` and that merging cannot trigger an EAS build.

---

### Task 12: Paid Build, TestFlight, Sandbox, Screenshots, and App Review — Separate Gates

**Files:**
- Create after each completed gate: Build 22 release evidence documents
- No source edits between approved build SHA and submission

**Interfaces:**
- Consumes: merged, approved, immutable Build 22 source SHA.
- Produces: one paid iOS binary, one TestFlight upload, sandbox evidence, screenshots from that exact binary, and one App Review submission only after separate authorizations.

- [ ] **Step 1: Paid-build authorization gate**

Do not proceed until the user explicitly authorizes exactly one paid iOS Build 22 from the exact SHA.

Authorized command must be equivalent to:

```bash
eas build --platform ios --profile production --non-interactive
```

Forbidden:

```text
--auto-submit
--platform all
--platform android
automatic retry
```

- [ ] **Step 2: Verify the resulting artifact before submission**

Confirm:

- version `1.0.0`
- build number `22`
- bundle ID `com.willywill.scripturegames`
- source SHA matches authorization
- build status is finished
- exactly one new iOS build exists
- no Android build exists

- [ ] **Step 3: TestFlight-submission authorization gate**

Obtain separate explicit authorization to submit the already-built artifact. Submit it without rebuilding.

- [ ] **Step 4: Run the physical sandbox matrix**

Test on the exact TestFlight Build 22:

1. fresh install without purchase
2. localized price loads
3. purchase succeeds
4. Premium unlocks without restart
5. force-close/relaunch preserves access
6. offline access works after trusted validation
7. switching local profiles preserves app-wide Premium
8. reinstall and Restore Purchase recovers access
9. cancellation does not unlock
10. pending/interrupted state does not unlock early
11. ten free books remain free before purchase
12. Premium-only book is locked before and open after purchase
13. no duplicate-charge path appears
14. support/privacy links load
15. Lumi, audio, backgrounds, Bible links, Journey, profiles, and Genesis remain functional

Stop on any failure. Do not create another paid build without a new explicit authorization.

- [ ] **Step 5: Capture real screenshots from Build 22**

Capture the highest-resolution supported iPhone portrait screenshots from the exact binary:

- Journey map/library
- Daily Bread Run
- full Bible reader
- Church Mode
- notes/highlights/search
- Training Hub
- Family Hub
- achievements/Witness Card
- Premium screen with localized lifetime price

Create the separate App Review screenshot showing the Premium purchase entry point. Do not use development-preview images.

- [ ] **Step 6: Complete Apple submission metadata**

Attach the first non-consumable purchase to the new app version submission. Verify price, availability, review notes, privacy answers, screenshots, age rating, support URL, and Paid Apps Agreement state.

- [ ] **Step 7: App Review authorization gate**

Show the final checklist and obtain separate explicit authorization before selecting Add for Review/Create Submission and Submit for Review.

- [ ] **Step 8: Revoke temporary automation access after release**

After Apple approval and production verification, revoke temporary App Store Connect automation keys that are no longer needed. Keep the Apple In-App Purchase key connected to RevenueCat if RevenueCat still requires it for production validation.

---

## Plan Self-Review

- Spec coverage: purchase architecture, app-wide entitlement, trusted verification, restore, offline behavior, localized price, free boundary, metadata, privacy, Apple/RevenueCat configuration, screenshots, sandbox testing, rollback, Expo cost controls, GitHub account safety, and three authorization gates are covered.
- Placeholder scan: no `TBD`, `TODO`, “implement later,” or unspecified error-handling steps remain.
- Type consistency: `PurchaseClient`, `PurchaseSnapshot`, `PurchaseResult`, `PurchaseFailureCode`, `createPurchaseClient`, `hasTrustedPremiumEntitlement`, `selectLifetimeProduct`, and `normalizePurchaseError` retain the same names across tasks.
- Scope: all tasks lead to one working feature and are sequentially dependent; subscriptions, Android billing release, web purchases, Supabase purchase authority, and unrelated redesign remain out of scope.
