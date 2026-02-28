import { performDatabaseBackup } from '@/lib/cron/jobs/backup';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

function loadEnvFromFile(filePath: string) {
  if (!existsSync(filePath)) return;
  const raw = readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex <= 0) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    if (!key || process.env[key] !== undefined) continue;

    let value = trimmed.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

async function main() {
  const root = process.cwd();
  loadEnvFromFile(path.join(root, '.env.local'));
  loadEnvFromFile(path.join(root, '.env'));
  loadEnvFromFile(path.join(root, '.env.new'));

  const missingEnv: string[] = [];
  if (!process.env.DATABASE_URL) missingEnv.push('DATABASE_URL');
  if (!process.env.B2_APPLICATION_KEY_ID) missingEnv.push('B2_APPLICATION_KEY_ID');
  if (!process.env.B2_APPLICATION_KEY) missingEnv.push('B2_APPLICATION_KEY');
  if (!process.env.B2_BUCKET_NAME) missingEnv.push('B2_BUCKET_NAME');
  if (!process.env.B2_ENDPOINT) missingEnv.push('B2_ENDPOINT');

  if (missingEnv.length > 0) {
    throw new Error(`Missing env vars: ${missingEnv.join(', ')}`);
  }

  const result = await performDatabaseBackup();
  console.log(JSON.stringify({ ok: true, ...result }, null, 2));
}

main().catch(err => {
  console.error(JSON.stringify({ ok: false, error: err?.message || String(err) }, null, 2));
  process.exit(1);
});
