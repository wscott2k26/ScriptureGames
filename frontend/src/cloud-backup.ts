import AsyncStorage from '@react-native-async-storage/async-storage';

const APP_KEY_PREFIX = 'scripture_games_';
const CLOUD_SESSION_KEY = 'scripture_games_cloud_session';
const CLOUD_DEVICE_KEY = 'scripture_games_cloud_device_id';
const CLOUD_LAST_BACKUP_KEY = 'scripture_games_cloud_last_backup_at';
const CLOUD_LAST_RESTORE_KEY = 'scripture_games_cloud_last_restore_at';
const CLOUD_RESTORE_SAFETY_KEY = 'scripture_games_cloud_restore_safety_snapshot';
const CLOUD_SCHEMA_VERSION = 1;
const BACKUP_TABLE = 'scripture_game_backups';

const LOCAL_ONLY_KEYS = new Set([
  CLOUD_SESSION_KEY,
  CLOUD_DEVICE_KEY,
  CLOUD_LAST_BACKUP_KEY,
  CLOUD_LAST_RESTORE_KEY,
  CLOUD_RESTORE_SAFETY_KEY,
]);

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, '') || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';

export const cloudBackupConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export type CloudSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: string;
  user: {
    id: string;
    email?: string;
  };
};

export type CloudBackupState = {
  configured: boolean;
  session: CloudSession | null;
  email: string | null;
  lastBackupAt: string | null;
  lastRestoreAt: string | null;
  remoteUpdatedAt: string | null;
};

type BackupPayload = Record<string, string>;

type BackupRow = {
  user_id: string;
  schema_version: number;
  payload: BackupPayload;
  device_id: string | null;
  client_updated_at: string | null;
  updated_at?: string;
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string;
  headers?: Record<string, string>;
};

function requireConfiguration(): void {
  if (!cloudBackupConfigured) {
    throw new Error('Cloud backup is not connected yet. The Supabase URL and anonymous key are missing.');
  }
}

function errorMessage(payload: unknown, status: number): string {
  if (payload && typeof payload === 'object') {
    const candidate = payload as Record<string, unknown>;
    const message = candidate.message || candidate.msg || candidate.error_description || candidate.error;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return `Cloud request failed with status ${status}.`;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  requireConfiguration();
  const response = await fetch(`${supabaseUrl}${path}`, {
    method: options.method || 'GET',
    headers: {
      apikey: supabaseAnonKey,
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }
  if (!response.ok) throw new Error(errorMessage(payload, response.status));
  return payload as T;
}

function sessionFromPayload(payload: unknown): CloudSession | null {
  if (!payload || typeof payload !== 'object') return null;
  const root = payload as Record<string, unknown>;
  const candidate = root.session && typeof root.session === 'object'
    ? root.session as Record<string, unknown>
    : root;
  const user = candidate.user;
  if (
    typeof candidate.access_token !== 'string' ||
    typeof candidate.refresh_token !== 'string' ||
    !user ||
    typeof user !== 'object' ||
    typeof (user as Record<string, unknown>).id !== 'string'
  ) return null;

  const expiresIn = typeof candidate.expires_in === 'number' ? candidate.expires_in : 3600;
  const expiresAt = typeof candidate.expires_at === 'number'
    ? candidate.expires_at
    : Math.floor(Date.now() / 1000) + expiresIn;

  return {
    access_token: candidate.access_token,
    refresh_token: candidate.refresh_token,
    expires_in: expiresIn,
    expires_at: expiresAt,
    token_type: typeof candidate.token_type === 'string' ? candidate.token_type : 'bearer',
    user: {
      id: (user as Record<string, unknown>).id as string,
      email: typeof (user as Record<string, unknown>).email === 'string'
        ? (user as Record<string, unknown>).email as string
        : undefined,
    },
  };
}

async function saveSession(session: CloudSession | null): Promise<void> {
  if (!session) {
    await AsyncStorage.removeItem(CLOUD_SESSION_KEY);
    return;
  }
  await AsyncStorage.setItem(CLOUD_SESSION_KEY, JSON.stringify(session));
}

async function storedSession(): Promise<CloudSession | null> {
  const raw = await AsyncStorage.getItem(CLOUD_SESSION_KEY);
  if (!raw) return null;
  try {
    return sessionFromPayload(JSON.parse(raw));
  } catch {
    await AsyncStorage.removeItem(CLOUD_SESSION_KEY);
    return null;
  }
}

async function validSession(): Promise<CloudSession | null> {
  const current = await storedSession();
  if (!current) return null;
  if (current.expires_at * 1000 > Date.now() + 60_000) return current;

  try {
    const payload = await request<unknown>('/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      body: { refresh_token: current.refresh_token },
    });
    const refreshed = sessionFromPayload(payload);
    if (!refreshed) throw new Error('The refreshed cloud session was invalid.');
    await saveSession(refreshed);
    return refreshed;
  } catch {
    await saveSession(null);
    return null;
  }
}

function isBackupPayload(value: unknown): value is BackupPayload {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.entries(value).every(
    ([key, item]) => key.startsWith(APP_KEY_PREFIX) && !LOCAL_ONLY_KEYS.has(key) && typeof item === 'string',
  );
}

async function getDeviceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(CLOUD_DEVICE_KEY);
  if (existing) return existing;
  const generated = `device-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  await AsyncStorage.setItem(CLOUD_DEVICE_KEY, generated);
  return generated;
}

async function exportLocalSnapshot(): Promise<BackupPayload> {
  const keys = (await AsyncStorage.getAllKeys()).filter(
    (key) => key.startsWith(APP_KEY_PREFIX) && !LOCAL_ONLY_KEYS.has(key),
  );
  const pairs = await AsyncStorage.multiGet(keys);
  return Object.fromEntries(
    pairs.filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  );
}

async function requireSession(): Promise<CloudSession> {
  const session = await validSession();
  if (!session) throw new Error('Sign in before using cloud backup.');
  return session;
}

async function remoteBackupRows(
  session: CloudSession,
  select: string,
): Promise<Record<string, unknown>[]> {
  const userId = encodeURIComponent(session.user.id);
  const columns = encodeURIComponent(select);
  return request<Record<string, unknown>[]>(
    `/rest/v1/${BACKUP_TABLE}?select=${columns}&user_id=eq.${userId}&limit=1`,
    { token: session.access_token },
  );
}

export async function getCloudBackupState(): Promise<CloudBackupState> {
  const [lastBackupAt, lastRestoreAt] = await Promise.all([
    AsyncStorage.getItem(CLOUD_LAST_BACKUP_KEY),
    AsyncStorage.getItem(CLOUD_LAST_RESTORE_KEY),
  ]);

  if (!cloudBackupConfigured) {
    return {
      configured: false,
      session: null,
      email: null,
      lastBackupAt,
      lastRestoreAt,
      remoteUpdatedAt: null,
    };
  }

  const session = await validSession();
  let remoteUpdatedAt: string | null = null;
  if (session) {
    const rows = await remoteBackupRows(session, 'updated_at');
    const value = rows[0]?.updated_at;
    remoteUpdatedAt = typeof value === 'string' ? value : null;
  }

  return {
    configured: true,
    session,
    email: session?.user.email || null,
    lastBackupAt,
    lastRestoreAt,
    remoteUpdatedAt,
  };
}

export async function createCloudAccount(email: string, password: string): Promise<CloudSession | null> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) throw new Error('Enter an email address.');
  if (password.length < 8) throw new Error('Use at least eight characters for the password.');

  const payload = await request<unknown>('/auth/v1/signup', {
    method: 'POST',
    body: { email: normalizedEmail, password },
  });
  const session = sessionFromPayload(payload);
  if (session) await saveSession(session);
  return session;
}

export async function signInToCloud(email: string, password: string): Promise<CloudSession> {
  const payload = await request<unknown>('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: { email: email.trim().toLowerCase(), password },
  });
  const session = sessionFromPayload(payload);
  if (!session) throw new Error('The cloud session could not be created.');
  await saveSession(session);
  return session;
}

export async function signOutOfCloud(): Promise<void> {
  const session = await validSession();
  try {
    if (session) {
      await request<unknown>('/auth/v1/logout', {
        method: 'POST',
        token: session.access_token,
        body: {},
      });
    }
  } finally {
    await saveSession(null);
  }
}

export async function sendCloudPasswordReset(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) throw new Error('Enter the account email first.');
  await request<unknown>('/auth/v1/recover', {
    method: 'POST',
    body: { email: normalizedEmail },
  });
}

export async function backupThisDevice(): Promise<string> {
  const session = await requireSession();
  const [payload, deviceId] = await Promise.all([exportLocalSnapshot(), getDeviceId()]);
  const now = new Date().toISOString();
  const row: BackupRow = {
    user_id: session.user.id,
    schema_version: CLOUD_SCHEMA_VERSION,
    payload,
    device_id: deviceId,
    client_updated_at: now,
  };

  const rows = await request<BackupRow[]>(
    `/rest/v1/${BACKUP_TABLE}?on_conflict=user_id`,
    {
      method: 'POST',
      token: session.access_token,
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: row,
    },
  );
  const savedAt = typeof rows[0]?.updated_at === 'string' ? rows[0].updated_at : now;
  await AsyncStorage.setItem(CLOUD_LAST_BACKUP_KEY, savedAt);
  return savedAt;
}

export async function restoreCloudBackup(): Promise<string> {
  const session = await requireSession();
  const rows = await remoteBackupRows(session, 'payload,schema_version,updated_at');
  const data = rows[0];
  if (!data) throw new Error('No cloud backup exists for this account yet.');
  if (typeof data.schema_version !== 'number') throw new Error('The cloud backup version is missing.');
  if (data.schema_version > CLOUD_SCHEMA_VERSION) {
    throw new Error('This backup was created by a newer Scripture Games version. Update the app before restoring it.');
  }
  if (!isBackupPayload(data.payload)) throw new Error('The cloud backup is not in a valid Scripture Games format.');

  const safetySnapshot = await exportLocalSnapshot();
  await AsyncStorage.setItem(CLOUD_RESTORE_SAFETY_KEY, JSON.stringify(safetySnapshot));

  const currentKeys = (await AsyncStorage.getAllKeys()).filter(
    (key) => key.startsWith(APP_KEY_PREFIX) && !LOCAL_ONLY_KEYS.has(key),
  );
  if (currentKeys.length) await AsyncStorage.multiRemove(currentKeys);

  const restoredPairs = Object.entries(data.payload);
  if (restoredPairs.length) await AsyncStorage.multiSet(restoredPairs);

  const restoredAt = new Date().toISOString();
  await AsyncStorage.setItem(CLOUD_LAST_RESTORE_KEY, restoredAt);
  return typeof data.updated_at === 'string' ? data.updated_at : restoredAt;
}

export async function deleteCloudAccount(): Promise<void> {
  const session = await requireSession();
  try {
    await request<unknown>('/functions/v1/delete-account', {
      method: 'POST',
      token: session.access_token,
      body: {},
    });
  } finally {
    await saveSession(null);
  }
  await AsyncStorage.multiRemove([CLOUD_LAST_BACKUP_KEY, CLOUD_LAST_RESTORE_KEY]);
}
