import assert from 'node:assert/strict';
import { goBackOrHome } from '../src/navigation-fallback.ts';

function createRouter(canGoBack: boolean) {
  const calls = { back: 0, replace: [] as string[] };
  return {
    calls,
    router: {
      canGoBack: () => canGoBack,
      back: () => { calls.back += 1; },
      replace: (href: string) => { calls.replace.push(href); },
    },
  };
}

{
  const { router, calls } = createRouter(true);
  goBackOrHome(router);
  assert.equal(calls.back, 1);
  assert.deepEqual(calls.replace, []);
}

{
  const { router, calls } = createRouter(false);
  goBackOrHome(router);
  assert.equal(calls.back, 0);
  assert.deepEqual(calls.replace, ['/(tabs)/command']);
}

{
  const calls = { back: 0, replace: [] as string[] };
  goBackOrHome({
    back: () => { calls.back += 1; },
    replace: (href: string) => { calls.replace.push(href); },
  });
  assert.equal(calls.back, 0);
  assert.deepEqual(calls.replace, ['/(tabs)/command']);
}

console.log('Navigation fallback tests passed.');
