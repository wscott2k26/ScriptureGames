import fs from 'node:fs';
import path from 'node:path';

const frontendRoot = process.cwd();
const repositoryRoot = path.resolve(frontendRoot, '..');

const files = {
  client: path.join(frontendRoot, 'src/cloud-backup.ts'),
  account: path.join(frontendRoot, 'app/cloud-account.tsx'),
  entry: path.join(frontendRoot, 'app/index.tsx'),
  settings: path.join(frontendRoot, 'app/settings.tsx'),
  env: path.join(frontendRoot, '.env.example'),
  migration: path.join(repositoryRoot, 'supabase/migrations/20260731150000_scripture_game_cloud_backups.sql'),
  deletion: path.join(repositoryRoot, 'supabase/functions/delete-account/index.ts'),
};

for (const [label, filename] of Object.entries(files)) {
  if (!fs.existsSync(filename)) throw new Error(`Missing cloud backup ${label} file: ${filename}`);
}

const read = (filename) => fs.readFileSync(filename, 'utf8');
const client = read(files.client);
const account = read(files.account);
const entry = read(files.entry);
const settings = read(files.settings);
const env = read(files.env);
const migration = read(files.migration);
const deletion = read(files.deletion);
const mobileSource = [client, account, entry, settings, env].join('\n');

function requireText(source, text, label) {
  if (!source.includes(text)) throw new Error(`Cloud backup audit failed: ${label}`);
}

requireText(entry, 'Continue on This Device', 'guest entry path is missing');
requireText(entry, 'Restore Cloud Backup', 'cloud restore entry path is missing');
requireText(account, 'Guest play always stays available', 'guest-mode explanation is missing');
requireText(account, 'Delete Cloud Account', 'in-app account deletion control is missing');
requireText(settings, 'Manage Cloud Backup', 'Settings cloud backup entry is missing');
requireText(client, "const CLOUD_SESSION_KEY = 'scripture_games_cloud_session'", 'cloud session storage key is missing');
requireText(client, 'LOCAL_ONLY_KEYS', 'cloud credentials are not excluded from backups');
requireText(client, "'/functions/v1/delete-account'", 'delete-account function is not called');
requireText(migration, 'enable row level security', 'row-level security is not enabled');
requireText(migration, 'auth.uid() = user_id', 'backup ownership policies are missing');
requireText(deletion, 'auth.admin.deleteUser', 'the deletion function does not remove the auth account');
requireText(env, 'Never place the Supabase service-role key', 'service-role warning is missing');

if (/EXPO_PUBLIC_SUPABASE_SERVICE_ROLE/i.test(mobileSource)) {
  throw new Error('Cloud backup audit failed: a service-role environment variable appears in mobile files.');
}
if (/SUPABASE_SERVICE_ROLE_KEY\s*=/.test(mobileSource)) {
  throw new Error('Cloud backup audit failed: a service-role key assignment appears in mobile files.');
}
if (!client.includes("key.startsWith(APP_KEY_PREFIX) && !LOCAL_ONLY_KEYS.has(key)")) {
  throw new Error('Cloud backup audit failed: backup export is not restricted to Scripture Games local data.');
}

console.log('Cloud backup audit passed: guest access, RLS, account deletion, scoped snapshots, and secret boundaries are present.');
