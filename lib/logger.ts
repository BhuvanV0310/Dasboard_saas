/**
 * Centralized error logger with Sentry integration (optional)
 */

let Sentry: any = null;

// Lazy load Sentry only if configured
if (process.env.SENTRY_DSN && typeof window === 'undefined') {
  try {
    // Use a runtime require via eval to prevent the bundler from
    // trying to resolve an optional dev dependency at build time.
    // If you prefer to install Sentry, simply `npm install @sentry/nextjs`.
    const req: any = eval('require');
    Sentry = req('@sentry/nextjs');
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    });
  } catch (e) {
    console.warn('Sentry not available:', e);
  }
}

export interface LogContext {
  userId?: string;
  endpoint?: string;
  action?: string;
  [key: string]: any;
}

/**
 * Log error with context and optional Sentry capture
 */
export function logError(error: Error | string, context?: LogContext) {
  const errorObj = typeof error === 'string' ? new Error(error) : error;
  
  console.error('[ERROR]', {
    message: errorObj.message,
    stack: errorObj.stack,
    ...context,
    timestamp: new Date().toISOString(),
  });

  if (Sentry) {
    Sentry.captureException(errorObj, {
      tags: context,
      level: 'error',
    });
  }
}

/**
 * Log warning with context
 */
export function logWarning(message: string, context?: LogContext) {
  console.warn('[WARNING]', {
    message,
    ...context,
    timestamp: new Date().toISOString(),
  });

  if (Sentry) {
    Sentry.captureMessage(message, {
      tags: context,
      level: 'warning',
    });
  }
}

/**
 * Log info message
 */
export function logInfo(message: string, context?: LogContext) {
  console.log('[INFO]', {
    message,
    ...context,
    timestamp: new Date().toISOString(),
  });
}
