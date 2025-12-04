/**
 * Structured logging system for UNIKCANDLE
 *
 * Usage:
 * - logger.debug() - Development only, for debugging
 * - logger.info() - General information
 * - logger.warn() - Warning messages
 * - logger.error() - Error messages (also sent to error tracking)
 *
 * Security: Never log sensitive data (passwords, tokens, full credit cards, PII)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Format log message with timestamp and context
   */
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (context && Object.keys(context).length > 0) {
      return `${prefix} ${message} ${JSON.stringify(context)}`;
    }

    return `${prefix} ${message}`;
  }

  /**
   * Sanitize sensitive data from context
   */
  private sanitizeContext(context?: LogContext): LogContext | undefined {
    if (!context) return undefined;

    const sanitized = { ...context };
    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'apiKey',
      'creditCard',
      'ssn',
      'email', // Consider sanitizing emails in production
    ];

    for (const key of Object.keys(sanitized)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Send error to external monitoring service (e.g., Sentry)
   */
  private sendToErrorTracking() {
    // TODO: Integrate with Sentry, LogRocket, or other error tracking service
    // Example:
    // if (this.isProduction && typeof Sentry !== 'undefined') {
    //   Sentry.captureException(error, {
    //     extra: context,
    //     tags: { message }
    //   });
    // }
  }

  /**
   * Debug logging - only in development
   */
  debug(message: string, context?: LogContext) {
    if (!this.isDevelopment) return;

    const sanitized = this.sanitizeContext(context);
    console.log(this.formatMessage('debug', message, sanitized));
  }

  /**
   * Info logging - general information
   */
  info(message: string, context?: LogContext) {
    const sanitized = this.sanitizeContext(context);
    console.info(this.formatMessage('info', message, sanitized));
  }

  /**
   * Warning logging - potential issues
   */
  warn(message: string, context?: LogContext) {
    const sanitized = this.sanitizeContext(context);
    console.warn(this.formatMessage('warn', message, sanitized));
  }

  /**
   * Error logging - errors and exceptions
   */
  error(message: string, error?: Error | unknown, context?: LogContext) {
    const sanitized = this.sanitizeContext(context);

    console.error(this.formatMessage('error', message, sanitized));

    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      });
    } else if (error) {
      console.error('Error details:', error);
    }

    // Send to error tracking in production
    if (this.isProduction) {
      this.sendToErrorTracking();
    }
  }

  /**
   * API request logging helper
   */
  apiRequest(method: string, path: string, context?: LogContext) {
    this.info(`API ${method} ${path}`, context);
  }

  /**
   * API response logging helper
   */
  apiResponse(method: string, path: string, status: number, duration?: number) {
    const context = duration ? { status, duration: `${duration}ms` } : { status };
    this.info(`API ${method} ${path} - ${status}`, context);
  }

  /**
   * Database query logging helper (development only)
   */
  dbQuery(query: string, duration?: number) {
    if (!this.isDevelopment) return;

    const context = duration ? { duration: `${duration}ms` } : undefined;
    this.debug(`DB Query: ${query}`, context);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for external use
export type { LogLevel, LogContext };
