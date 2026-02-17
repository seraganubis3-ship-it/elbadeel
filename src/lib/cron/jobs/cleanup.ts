// File cleanup background job
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Clean up old temporary files ONLY
 * Does NOT delete from database or payment receipts
 */
export async function cleanupOldFiles() {
  const now = Date.now();
  const maxAgeMs = 7 * 24 * 60 * 60 * 1000; // 7 days for temp files only

  let deletedCount = 0;
  let totalSize = 0;

  try {
    // Clean ONLY temporary uploads (not permanent files)
    const tempDir = path.join(process.cwd(), 'public', 'uploads', 'temp');

    try {
      const files = await fs.readdir(tempDir);

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);

        // Delete files older than 7 days from temp folder only
        if (now - stats.mtimeMs > maxAgeMs) {
          await fs.unlink(filePath);
          deletedCount++;
          totalSize += stats.size;
        }
      }
    } catch (error) {
      // Directory might not exist
      // eslint-disable-next-line no-console
      console.log('Temp directory not found, skipping...');
    }

    // eslint-disable-next-line no-console
    console.log(
      `🧹 Cleanup complete: Deleted ${deletedCount} temporary files (${(totalSize / 1024 / 1024).toFixed(2)} MB)`
    );

    return {
      deletedCount,
      totalSize,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Cleanup job error:', error);
    throw error;
  }
}

/**
 * Clean up old session data from Redis
 */
export async function cleanupOldSessions() {
  // TODO: Implement Redis session cleanup if needed
  // eslint-disable-next-line no-console
  console.log('🧹 Session cleanup not yet implemented');
}
