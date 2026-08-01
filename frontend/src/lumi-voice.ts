export type LumiVoiceStartOptions = {
  lang?: string;
  interimResults?: boolean;
  continuous?: boolean;
  addsPunctuation?: boolean;
  maxAlternatives?: number;
  contextualStrings?: string[];
  iosTaskHint?: 'unspecified' | 'dictation' | 'search' | 'confirmation';
};

export type VoiceStartResult =
  | { ok: true }
  | { ok: false; reason: 'busy' | 'unavailable' | 'permission-denied' | 'start-failed' };

export type LumiVoiceNativeAdapter = {
  isRecognitionAvailable: () => boolean;
  requestPermissionsAsync: () => Promise<{ granted: boolean }>;
  start: (options: LumiVoiceStartOptions) => void;
  stop: () => void;
  abort: () => void;
};

type AudioHooks = {
  pauseForVoice?: () => Promise<void> | void;
  resumeAfterVoice?: () => Promise<void> | void;
};

type ControllerState = 'idle' | 'starting' | 'active';

const noAudioHooks: Required<AudioHooks> = {
  pauseForVoice: async () => undefined,
  resumeAfterVoice: async () => undefined,
};

export function createLumiVoiceController(
  native: LumiVoiceNativeAdapter,
  audioHooks: AudioHooks = {},
) {
  let state: ControllerState = 'idle';
  let audioPaused = false;
  const hooks = { ...noAudioHooks, ...audioHooks };

  const restoreAudio = async () => {
    if (!audioPaused) return;
    audioPaused = false;
    try {
      await hooks.resumeAfterVoice();
    } catch {
      // Audio is optional. A failed resume must never crash typed or voice chat.
    }
  };

  const finish = async () => {
    if (state === 'idle' && !audioPaused) return;
    state = 'idle';
    await restoreAudio();
  };

  const start = async (options: LumiVoiceStartOptions): Promise<VoiceStartResult> => {
    if (state !== 'idle') return { ok: false, reason: 'busy' };
    state = 'starting';

    try {
      await hooks.pauseForVoice();
      audioPaused = true;
    } catch {
      // Continue without ambient audio coordination; speech still gets a chance to work.
      audioPaused = false;
    }

    try {
      if (!native.isRecognitionAvailable()) {
        await finish();
        return { ok: false, reason: 'unavailable' };
      }

      const permission = await native.requestPermissionsAsync();
      if (!permission.granted) {
        await finish();
        return { ok: false, reason: 'permission-denied' };
      }

      native.start({
        lang: options.lang || 'en-US',
        interimResults: options.interimResults ?? true,
        continuous: false,
        addsPunctuation: options.addsPunctuation ?? true,
        maxAlternatives: options.maxAlternatives ?? 1,
        contextualStrings: options.contextualStrings,
        iosTaskHint: options.iosTaskHint || 'dictation',
      });
      state = 'active';
      return { ok: true };
    } catch {
      await finish();
      return { ok: false, reason: 'start-failed' };
    }
  };

  const stop = () => {
    if (state !== 'active') return;
    try {
      native.stop();
    } catch {
      void finish();
    }
  };

  const abort = () => {
    if (state === 'idle') return;
    try {
      native.abort();
    } catch {
      // Native teardown can fail after an interrupted session. Restoration still runs below.
    }
    void finish();
  };

  return {
    start,
    stop,
    abort,
    finish,
    isActive: () => state !== 'idle',
  };
}

let configuredAudioHooks: Required<AudioHooks> = { ...noAudioHooks };
let defaultController: ReturnType<typeof createLumiVoiceController> | null = null;

export function configureLumiVoiceAudio(hooks: AudioHooks) {
  configuredAudioHooks = { ...noAudioHooks, ...hooks };
  defaultController = null;
}

async function getDefaultController() {
  if (defaultController) return defaultController;
  const { ExpoSpeechRecognitionModule } = await import('expo-speech-recognition');
  defaultController = createLumiVoiceController(
    {
      isRecognitionAvailable: () => ExpoSpeechRecognitionModule.isRecognitionAvailable(),
      requestPermissionsAsync: () => ExpoSpeechRecognitionModule.requestPermissionsAsync(),
      start: (options) => ExpoSpeechRecognitionModule.start(options),
      stop: () => ExpoSpeechRecognitionModule.stop(),
      abort: () => ExpoSpeechRecognitionModule.abort(),
    },
    {
      pauseForVoice: () => configuredAudioHooks.pauseForVoice(),
      resumeAfterVoice: () => configuredAudioHooks.resumeAfterVoice(),
    },
  );
  return defaultController;
}

export async function startLumiListening(options: LumiVoiceStartOptions): Promise<VoiceStartResult> {
  try {
    return await (await getDefaultController()).start(options);
  } catch {
    return { ok: false, reason: 'start-failed' };
  }
}

export async function stopLumiListening() {
  try {
    (await getDefaultController()).stop();
  } catch {
    // Typed chat remains available when the native recognizer cannot stop cleanly.
  }
}

export async function abortLumiListening() {
  try {
    (await getDefaultController()).abort();
  } catch {
    // Native teardown is best-effort and must never terminate the screen.
  }
}

export async function finishLumiListening() {
  try {
    await (await getDefaultController()).finish();
  } catch {
    // Audio restoration is best-effort.
  }
}

export async function isLumiListening() {
  try {
    return (await getDefaultController()).isActive();
  } catch {
    return false;
  }
}
