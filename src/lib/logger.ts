/**
 * Production-safe logger utility.
 *
 * In DEVELOPMENT: logs to the browser console as normal.
 * In PRODUCTION:  silently reports to Sentry — nothing appears in DevTools.
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.error('Upload failed', error);
 *   logger.warn('Missing config');
 */
import * as Sentry from '@sentry/react';

const isDev = import.meta.env.DEV;

export const logger = {
  /**
   * Log an error. In production, sends to Sentry. In dev, uses console.error.
   */
  error(message: string, error?: unknown, context?: Record<string, unknown>) {
    if (isDev) {
      console.error(`[DEV] ${message}`, error, context);
    } else {
      Sentry.captureException(
        error instanceof Error ? error : new Error(message),
        { extra: { message, ...context } }
      );
    }
  },

  /**
   * Log a warning. In production, nothing is shown. In dev, uses console.warn.
   */
  warn(message: string, context?: Record<string, unknown>) {
    if (isDev) {
      console.warn(`[DEV] ${message}`, context);
    }
    // In production: silent. Warnings are not critical enough for Sentry.
  },

  /**
   * Log info. Dev-only.
   */
  info(message: string, context?: Record<string, unknown>) {
    if (isDev) {
      console.log(`[DEV] ${message}`, context);
    }
  },
};
