import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), 'utf8');
const pkg = JSON.parse(read('package.json')) as { dependencies: Record<string, string> };
const app = JSON.parse(read('app.json')) as { expo: { ios: { bundleIdentifier: string } } };
const eas = JSON.parse(read('eas.json')) as { submit: { production: { ios: { ascAppId: string } } } };
const core = read('src/purchases/purchase-core.ts');
const provider = read('src/premium-entitlement.tsx');
const defaultClient = read('src/purchases/purchase-client.ts');
const nativeClient = read('src/purchases/purchase-client.native.ts');

assert.equal(pkg.dependencies['react-native-purchases'], '10.4.4');
assert.equal(app.expo.ios.bundleIdentifier, 'com.willywill.scripturegames');
assert.equal(eas.submit.production.ios.ascAppId, '6795368257');
assert.match(core, /PREMIUM_PRODUCT_ID = 'com\.willywill\.scripturegames\.premium'/);
assert.match(core, /PREMIUM_ENTITLEMENT_ID = 'premium'/);
assert.doesNotMatch(provider, /useProfile\(\)|profile\.is_premium|premium_entitlement_source|premium_product_id/);
assert.doesNotMatch(defaultClient, /hasPremium:\s*true/);
assert.match(nativeClient, /EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY/);
assert.match(nativeClient, /ENTITLEMENT_VERIFICATION_MODE\.INFORMATIONAL/);
assert.match(nativeClient, /Purchases\.purchasePackage/);
assert.match(nativeClient, /Purchases\.restorePurchases/);

const forbidden = [
  /ASC_PRIVATE_KEY/,
  /APPLE_IAP_PRIVATE_KEY/,
  /REVENUECAT_V2_SECRET_KEY/,
  /-----BEGIN PRIVATE KEY-----/,
  /-----BEGIN EC PRIVATE KEY-----/,
];
const scanRoots = ['app', 'src', 'scripts', 'app.json', 'eas.json', 'expo-env.d.ts', 'package.json'];
const files: string[] = [];
function collect(path: string) {
  const absolute = join(root, path);
  if (statSync(absolute).isDirectory()) {
    for (const name of readdirSync(absolute)) collect(join(path, name));
  } else if (/\.(?:ts|tsx|js|mjs|json|d\.ts)$/.test(path)) {
    files.push(path);
  }
}
for (const path of scanRoots) collect(path);
for (const path of files) {
  if (path === 'scripts/audit-build22-store-config.ts') continue;
  const source = read(path);
  for (const pattern of forbidden) {
    assert.doesNotMatch(source, pattern, `Forbidden credential material in ${relative(root, join(root, path))}`);
  }
}

console.log('Build 22 store configuration audit passed.');
