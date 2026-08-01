import assert from 'node:assert/strict';
import { createLumiVoiceController } from '../src/lumi-voice.ts';

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

function fakeNative(overrides: Record<string, unknown> = {}) {
  const calls = { start: 0, stop: 0, abort: 0, options: null as Record<string, unknown> | null };
  return {
    calls,
    adapter: {
      isRecognitionAvailable: () => true,
      requestPermissionsAsync: async () => ({ granted: true }),
      start: (options: Record<string, unknown>) => { calls.start += 1; calls.options = options; },
      stop: () => { calls.stop += 1; },
      abort: () => { calls.abort += 1; },
      ...overrides,
    },
  };
}

{
  let paused = 0;
  let resumed = 0;
  const { adapter, calls } = fakeNative({ isRecognitionAvailable: () => false });
  const voice = createLumiVoiceController(adapter, {
    pauseForVoice: async () => { paused += 1; },
    resumeAfterVoice: async () => { resumed += 1; },
  });
  const result = await voice.start({ contextualStrings: ['Genesis'] });
  assert.deepEqual(result, { ok: false, reason: 'unavailable' });
  assert.equal(calls.start, 0);
  assert.equal(paused, 1);
  assert.equal(resumed, 1);
}

{
  const { adapter, calls } = fakeNative({ requestPermissionsAsync: async () => ({ granted: false }) });
  const voice = createLumiVoiceController(adapter);
  assert.deepEqual(await voice.start({}), { ok: false, reason: 'permission-denied' });
  assert.equal(calls.start, 0);
  assert.equal(voice.isActive(), false);
}

{
  let resumed = 0;
  const { adapter } = fakeNative({ start: () => { throw new Error('native audio session failure'); } });
  const voice = createLumiVoiceController(adapter, { resumeAfterVoice: async () => { resumed += 1; } });
  assert.deepEqual(await voice.start({}), { ok: false, reason: 'start-failed' });
  assert.equal(voice.isActive(), false);
  assert.equal(resumed, 1);
}

{
  const permission = deferred<{ granted: boolean }>();
  const { adapter, calls } = fakeNative({ requestPermissionsAsync: () => permission.promise });
  const voice = createLumiVoiceController(adapter);
  const first = voice.start({});
  assert.deepEqual(await voice.start({}), { ok: false, reason: 'busy' });
  permission.resolve({ granted: true });
  assert.deepEqual(await first, { ok: true });
  assert.equal(calls.start, 1);
}

{
  const { adapter, calls } = fakeNative();
  const voice = createLumiVoiceController(adapter);
  voice.stop();
  voice.abort();
  assert.equal(calls.stop, 0);
  assert.equal(calls.abort, 0);
  assert.deepEqual(await voice.start({ contextualStrings: ['Psalms'] }), { ok: true });
  assert.equal(calls.start, 1);
  assert.equal('iosCategory' in (calls.options || {}), false);
  assert.equal('iosVoiceProcessingEnabled' in (calls.options || {}), false);
  voice.stop();
  assert.equal(calls.stop, 1);
}

{
  let resumed = 0;
  const { adapter } = fakeNative();
  const voice = createLumiVoiceController(adapter, { resumeAfterVoice: async () => { resumed += 1; } });
  await voice.start({});
  await voice.finish();
  assert.equal(voice.isActive(), false);
  assert.equal(resumed, 1);
  await voice.finish();
  assert.equal(resumed, 1, 'audio restoration must be idempotent');
}

console.log('Lumi voice crash-regression tests passed.');
