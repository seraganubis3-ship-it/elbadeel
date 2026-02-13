// Structured logging with Pino
import pino from 'pino';

// Simple logger configuration (no worker threads to avoid Next.js conflicts)
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: {
    env: process.env.NODE_ENV || 'development',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Log levels:
 * - trace: Very detailed debugging
 * - debug: Debugging information
 * - info: General information
 * - warn: Warning messages
 * - error: Error messages
 * - fatal: Fatal errors
 */

export const log = {
  trace: (message: string, data?: any) => logger.trace(data, message),
  debug: (message: string, data?: any) => logger.debug(data, message),
  info: (message: string, data?: any) => logger.info(data, message),
  warn: (message: string, data?: any) => logger.warn(data, message),
  error: (message: string, error?: Error | any) => {
    if (error instanceof Error) {
      logger.error({ err: error, stack: error.stack }, message);
    } else {
      logger.error(error, message);
    }
  },
  fatal: (message: string, error?: Error | any) => {
    if (error instanceof Error) {
      logger.fatal({ err: error, stack: error.stack }, message);
    } else {
      logger.fatal(error, message);
    }
  },
};

// Helper functions for common log patterns
export function logHttpRequest(req: { method?: string; url?: string; statusCode?: number }) {
  log.info('HTTP Request', {
    method: req.method,
    url: req.url,
    status: req.statusCode,
  });
}

export function logDatabaseQuery(query: string, duration?: number) {
  log.debug('Database Query', {
    query,
    duration: duration ? `${duration}ms` : undefined,
  });
}

export function logJobExecution(jobName: string, status: 'started' | 'completed' | 'failed', error?: Error) {
  if (status === 'failed' && error) {
    log.error(`Job ${jobName} failed`, error);
  } else {
    log.info(`Job ${jobName} ${status}`);
  }
}
