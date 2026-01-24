export type LogLevel = 'info' | 'error' | 'warn' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown> | undefined;
  error?: string | undefined;
}

class Logger {
  private format(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: unknown
  ): string {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: context ?? undefined,
      error: error instanceof Error ? error.message : error ? String(error) : undefined,
    };
    return JSON.stringify(entry);
  }

  info(message: string, context?: Record<string, unknown>) {
    console.log(this.format('info', message, context));
  }

  error(message: string, error?: unknown, context?: Record<string, unknown>) {
    console.error(this.format('error', message, context, error));
  }

  warn(message: string, context?: Record<string, unknown>) {
    console.warn(this.format('warn', message, context));
  }

  debug(message: string, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.format('debug', message, context));
    }
  }
}

export const logger = new Logger();
