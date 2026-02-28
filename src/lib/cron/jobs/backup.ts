// Database backup background job
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { uploadLocalFileToBackblaze } from '@/lib/s3';

const waitForChildProcess = (child: ReturnType<typeof spawn>) =>
  new Promise<void>((resolve, reject) => {
    let stderr = '';

    if (child.stderr) {
      child.stderr.on('data', chunk => {
        stderr += chunk.toString();
      });
    }

    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(stderr || `Process exited with code ${code}`));
    });
  });

/**
 * Perform database backup and upload to B2
 */
export async function performDatabaseBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `backup-${timestamp}.dump`;
  const backupPath = path.join(process.cwd(), 'backups', backupFileName);

  try {
    // Ensure backups directory exists
    await fs.mkdir(path.join(process.cwd(), 'backups'), { recursive: true });

    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL not found in environment');
    }

    // eslint-disable-next-line no-console
    console.log('💾 Creating database backup...');

    const dbUrl = new URL(databaseUrl);
    const dbName = dbUrl.pathname.slice(1);
    const dbPort = dbUrl.port || '5432';
    const dbUser = decodeURIComponent(dbUrl.username);
    const dbPassword = decodeURIComponent(dbUrl.password);
    const sslmode = dbUrl.searchParams.get('sslmode') || undefined;
    const allowDirectNeon = process.env.NEON_BACKUP_USE_DIRECT !== 'false';
    const dbHost =
      allowDirectNeon && dbUrl.hostname.includes('-pooler')
        ? dbUrl.hostname.replace('-pooler', '')
        : dbUrl.hostname;
    const pgDumpPath = process.env.PG_DUMP_PATH || 'pg_dump';

    const child = spawn(
      pgDumpPath,
      ['-h', dbHost, '-p', dbPort, '-U', dbUser, '-d', dbName, '-F', 'c', '-f', backupPath],
      {
        env: {
          ...process.env,
          PGPASSWORD: dbPassword,
          ...(sslmode ? { PGSSLMODE: sslmode } : {}),
        },
        windowsHide: true,
      }
    );
    await waitForChildProcess(child);

    // Get file stats
    const stats = await fs.stat(backupPath);
    // eslint-disable-next-line no-console
    console.log(
      `✅ Backup created: ${backupFileName} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`
    );

    // eslint-disable-next-line no-console
    console.log('☁️ Uploading backup to B2...');
    const fileKey = await uploadLocalFileToBackblaze(backupPath, 'backups');
    // eslint-disable-next-line no-console
    console.log(`✅ Backup uploaded to B2: ${fileKey}`);

    // Clean up old local backups (keep last 7 days)
    await cleanupOldBackups();

    return {
      fileName: backupFileName,
      size: stats.size,
      fileKey,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Backup job error:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Clean up old local backup files
 */
async function cleanupOldBackups() {
  const backupsDir = path.join(process.cwd(), 'backups');
  const maxAgeMs = 7 * 24 * 60 * 60 * 1000; // 7 days
  const now = Date.now();

  try {
    const files = await fs.readdir(backupsDir);

    for (const file of files) {
      if (!file.endsWith('.dump')) continue;

      const filePath = path.join(backupsDir, file);
      const stats = await fs.stat(filePath);

      if (now - stats.mtimeMs > maxAgeMs) {
        await fs.unlink(filePath);
        // eslint-disable-next-line no-console
        console.log(`🗑️ Deleted old backup: ${file}`);
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error cleaning old backups:', error);
  }
}
