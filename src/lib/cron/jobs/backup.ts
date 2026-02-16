// Database backup background job
import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import path from 'path';
import { uploadToBackblaze } from '@/lib/s3';

const execAsync = promisify(exec);

/**
 * Perform database backup and upload to B2
 */
export async function performDatabaseBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `backup-${timestamp}.sql`;
  const backupPath = path.join(process.cwd(), 'backups', backupFileName);

  try {
    // Ensure backups directory exists
    await fs.mkdir(path.join(process.cwd(), 'backups'), { recursive: true });

    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL not found in environment');
    }

    // Parse database URL
    const dbUrl = new URL(databaseUrl);
    const dbName = dbUrl.pathname.slice(1);
    const dbHost = dbUrl.hostname;
    const dbPort = dbUrl.port || '5432';
    const dbUser = dbUrl.username;
    const dbPassword = dbUrl.password;

    // Create pg_dump command
    const command = `PGPASSWORD="${dbPassword}" pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -F c -f "${backupPath}"`;

    // eslint-disable-next-line no-console
    console.log('💾 Creating database backup...');
    await execAsync(command);

    // Get file stats
    const stats = await fs.stat(backupPath);
    // eslint-disable-next-line no-console
    console.log(`✅ Backup created: ${backupFileName} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

    // Upload to Backblaze B2
    // eslint-disable-next-line no-console
    console.log('☁️ Uploading backup to B2...');
    const fileBuffer = await fs.readFile(backupPath);
    const file = new File([new Uint8Array(fileBuffer)], backupFileName, {
      type: 'application/octet-stream',
    });

    const fileKey = await uploadToBackblaze(file, 'backups');
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
    console.error('Backup job error:', error);
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
      if (!file.endsWith('.sql')) continue;

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
