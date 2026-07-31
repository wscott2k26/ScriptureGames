import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';

const APP_KEY_PREFIX = 'scripture_games_';
const CLOUD_DEVICE_KEY = 'scripture_games_cloud_device_id';
const CLOUD_LAST_BACKUP_KEY = 'scripture_games_cloud_last_backup_at';
const CLOUD_LAST_RESTORE_KEY = 'scripture_games_cloud_last_restore_at';
const CLOUD_RESTORE_SAFETY_KEY = 'scripture_games_cloud_restore_safety_snapshot';
const CLOUD_SCHEMA_VERSION = 1;
const BACKUP_TABLE = 'scripture_game_backups';

const LOCAL_ONLY_KEYS = new Set([
  CLOUD_DEVICE_KEY,
  CLOUD_LAST_BACKUP_KEY,
  CLOUD_LAST_RESTORE_KEY,
  CLOUD_RESTORE_SAFETY_KEY,
]);

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';

export const cloudBackupConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const cloudClient: SupabaseClient | null = cloudBackupConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export type CloudBackupState = {
  configured: boolean;
  session: Session | null;
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
  updated_at: string;
};

function requireClient(): SupabaseClient {
  if (!cloudClient) {
    throw new Error('Cloud backup is not connected yet. The Supabase URL and anonymous key are missing.');
  }
  return cloudClient;
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

async function authenticatedUserId(): Promise<string> {
  const client = requireClient();
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('Sign in before using cloud backup.');
  return data.user.id;
}

export async function getCloudBackupState(): Promise<CloudBackupState> {
  if (!cloudClient) {
    return {
      configured: false,
      session: null,
      email: null,
      lastBackupAt: await AsyncStorage.getItem(CLOUD_LAST_BACKUP_KEY),
      lastRestoreAt: await AsyncStorage.getItem(CLOUD_LAST_RESTORE_KEY),
      remoteUpdatedAt: null,
    };
  }

  const [{ data: sessionData }, lastBackupAt, lastRestoreAt] = await Promise.all([
    cloudClient.auth.getSession(),
    AsyncStorage.getItem(CLOUD_LAST_BACKUP_KEY),
    AsyncStorage.getItem(CLOUD_LAST_RESTORE_KEY),
  ]);

  let remoteUpdatedAt: string | null = null;
  const session = sessionData.session;
  if (session?.user) {
    const { data } = await cloudClient
      .from(BACKUP_TABLE)
      .select('updated_at')
      .eq('user_id', session.user.id)
      .maybeSingle();
    remoteUpdatedAt = typeof data?.updated_at === 'string' ? data.updated_at : null;
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

export async function createCloudAccount(email: string, password: string): Promise<Session | null> {
  const client = requireClient();
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) throw new Error('Enter an email address.');
  if (password.length < 8) throw new Error('Use at least eight characters for the password.');

  const { data, error } = await client.auth.signUp({ email: normalizedEmail, password });
  if (error) throw error;
  return data.session;
}

export async function signInToCloud(email: string, password: string): Promise<Session> {
  const client = requireClient();
  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;
  if (!data.session) throw new Error('The cloud session could not be created.');
  return data.session;
}

export async function signOutOfCloud(): Promise<void> {
  const client = requireClient();
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export async function sendCloudPasswordReset(email: string): Promise<void> {
  const client = requireClient();
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) throw new Error('Enter the account email first.');
  const { error } = await client.auth.resetPasswordForEmail(normalizedEmail);
  if (error) throw error;
}

export async function backupThisDevice(): Promise<string> {
  const client = requireClient();
  const userId = await authenticatedUserId();
  const [payload, deviceId] = await Promise.all([exportLocalSnapshot(), getDeviceId()]);
  const now = new Date().toISOString();

  const row: Omit<BackupRow, 'updated_at'> = {
    user_id: userId,
    schema_version: CLOUD_SCHEMA_VERSION,
    payload,
    device_id: deviceId,
    client_updated_at: now,
  };

  const { data, error } = await client
    .from(BACKUP_TABLE)
    .upsert(row, { onConflict: 'user_id' })
    .select('updated_at')
    .single();
  if (error) throw error;

  const savedAt = typeof data?.updated_at === 'string' ? data.updated_at : now;
  await AsyncStorage.setItem(CLOUD_LAST_BACKUP_KEY, savedAt);
  return savedAt;
}

export async function restoreCloudBackup(): Promise<string> {
  const client = requireClient();
  const userId = await authenticatedUserId();
  const { data, error } = await client
    .from(BACKUP_TABLE)
    .select('payload, schema_version, updated_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('No cloud backup exists for this account yet.');
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
  const client = requireClient();
  await authenticatedUserId();
  const { error } = await client.functions.invoke('delete-account', { body: {} });
  if (error) throw error;
  await client.auth.signOut({ scope: 'local' });
  await AsyncStorage.multiRemove([CLOUD_LAST_BACKUP_KEY, CLOUD_LAST_RESTORE_KEY]);
}
