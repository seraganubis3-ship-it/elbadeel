// Sentry error tracking and monitoring
import * as Sentry from '@sentry/nextjs';

/**
 * Initialize Sentry
 */
export function initSentry() {
  if (!process.env.SENTRY_DSN) {
    // eslint-disable-next-line no-console
    console.warn('⚠️ Sentry DSN not configured, error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',

    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Error filtering
    beforeSend(event: any, hint: any) {
      // Don't send errors in development
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Sentry Event:', event, hint);
        return null;
      }

      return event;
    },

    // Ignore specific errors
    ignoreErrors: ['ResizeObserver loop limit exceeded', 'Non-Error promise rejection captured'],
  });

  // eslint-disable-next-line no-console
  console.log('✅ Sentry initialized');
}

/**
 * Capture exception with context
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (context) {
    Sentry.setContext('additional', context);
  }

  Sentry.captureException(error);
}

/**
 * Capture message
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

/**
 * Set user context
 */
export function setUser(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser(user);
}

/**
 * Clear user context
 */
export function clearUser() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb
 */
export function addBreadcrumb(message: string, category?: string, level?: Sentry.SeverityLevel) {
  Sentry.addBreadcrumb({
    message,
    category: category || 'custom',
    level: level || 'info',
    timestamp: Date.now() / 1000,
  });
}

/**
 * Start performance span (Sentry v8+)
 */
export function startPerformanceSpan(name: string, op: string) {
  return Sentry.startSpan({ name, op }, span => span);
}
