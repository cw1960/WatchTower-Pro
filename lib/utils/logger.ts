import * as Sentry from "@sentry/nextjs";

export enum LogLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
}

interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
  timestamp: Date;
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;
  private enableConsoleLogging: boolean;
  private enableSentryLogging: boolean;

  private constructor() {
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO;
    this.enableConsoleLogging = process.env.NODE_ENV === "development";
    this.enableSentryLogging = process.env.NODE_ENV === "production";
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [
      LogLevel.ERROR,
      LogLevel.WARN,
      LogLevel.INFO,
      LogLevel.DEBUG,
    ];
    return levels.indexOf(level) <= levels.indexOf(this.logLevel);
  }

  private formatMessage(entry: LogEntry): string {
    const { level, message, context, timestamp } = entry;
    const contextStr = context ? JSON.stringify(context, null, 2) : "";
    return `[${timestamp.toISOString()}] [${level.toUpperCase()}] ${message}${contextStr ? `\nContext: ${contextStr}` : ""}`;
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.enableConsoleLogging || !this.shouldLog(entry.level)) {
      return;
    }

    const message = this.formatMessage(entry);

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(message, entry.error);
        break;
      case LogLevel.WARN:
        console.warn(message);
        break;
      case LogLevel.INFO:
        console.info(message);
        break;
      case LogLevel.DEBUG:
        console.debug(message);
        break;
    }
  }

  private logToSentry(entry: LogEntry): void {
    if (!this.enableSentryLogging || !this.shouldLog(entry.level)) {
      return;
    }

    const { level, message, context, error } = entry;

    // Set user context if available
    if (context?.userId) {
      Sentry.setUser({ id: context.userId });
    }

    // Set tags
    const tags: Record<string, string> = {};
    if (context?.component) tags.component = context.component;
    if (context?.action) tags.action = context.action;
    if (context?.sessionId) tags.sessionId = context.sessionId;
    if (context?.requestId) tags.requestId = context.requestId;

    // Set extra context
    const extra: Record<string, any> = {};
    if (context?.metadata) extra.metadata = context.metadata;

    if (error) {
      // Log errors to Sentry
      Sentry.captureException(error, {
        level: level as any,
        tags,
        extra: { ...extra, message },
      });
    } else {
      // Log messages to Sentry
      Sentry.captureMessage(message, {
        level: level as any,
        tags,
        extra,
      });
    }
  }

  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error,
  ): void {
    const entry: LogEntry = {
      level,
      message,
      context,
      error,
      timestamp: new Date(),
    };

    this.logToConsole(entry);
    this.logToSentry(entry);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  // Specialized logging methods
  apiRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context?: LogContext,
  ): void {
    this.info(`API ${method} ${url} - ${statusCode} (${duration}ms)`, {
      ...context,
      component: "api",
      action: "request",
      metadata: {
        method,
        url,
        statusCode,
        duration,
      },
    });
  }

  apiError(
    method: string,
    url: string,
    error: Error,
    context?: LogContext,
  ): void {
    this.error(`API ${method} ${url} - Error: ${error.message}`, error, {
      ...context,
      component: "api",
      action: "error",
      metadata: {
        method,
        url,
      },
    });
  }

  databaseQuery(query: string, duration: number, context?: LogContext): void {
    this.debug(`Database query executed (${duration}ms)`, {
      ...context,
      component: "database",
      action: "query",
      metadata: {
        query: query.substring(0, 200), // Truncate long queries
        duration,
      },
    });
  }

  databaseError(query: string, error: Error, context?: LogContext): void {
    this.error(`Database query failed: ${error.message}`, error, {
      ...context,
      component: "database",
      action: "error",
      metadata: {
        query: query.substring(0, 200),
      },
    });
  }

  monitoringCheck(
    monitorId: string,
    url: string,
    status: "success" | "failure",
    duration: number,
    context?: LogContext,
  ): void {
    const level = status === "success" ? LogLevel.INFO : LogLevel.ERROR;
    this.log(level, `Monitor check ${status} for ${url} (${duration}ms)`, {
      ...context,
      component: "monitoring",
      action: "check",
      metadata: {
        monitorId,
        url,
        status,
        duration,
      },
    });
  }

  userAction(action: string, userId: string, context?: LogContext): void {
    this.info(`User action: ${action}`, {
      ...context,
      userId,
      component: "user",
      action,
    });
  }

  securityEvent(
    event: string,
    severity: "low" | "medium" | "high",
    context?: LogContext,
  ): void {
    const level =
      severity === "high"
        ? LogLevel.ERROR
        : severity === "medium"
          ? LogLevel.WARN
          : LogLevel.INFO;
    this.log(level, `Security event: ${event}`, {
      ...context,
      component: "security",
      action: "event",
      metadata: {
        event,
        severity,
      },
    });
  }

  performance(operation: string, duration: number, context?: LogContext): void {
    const level = duration > 1000 ? LogLevel.WARN : LogLevel.INFO;
    this.log(level, `Performance: ${operation} took ${duration}ms`, {
      ...context,
      component: "performance",
      action: "measurement",
      metadata: {
        operation,
        duration,
      },
    });
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Export utility functions
export function createRequestLogger(requestId: string) {
  return {
    info: (message: string, context?: Omit<LogContext, "requestId">) =>
      logger.info(message, { ...context, requestId }),
    warn: (message: string, context?: Omit<LogContext, "requestId">) =>
      logger.warn(message, { ...context, requestId }),
    error: (
      message: string,
      error?: Error,
      context?: Omit<LogContext, "requestId">,
    ) => logger.error(message, error, { ...context, requestId }),
    debug: (message: string, context?: Omit<LogContext, "requestId">) =>
      logger.debug(message, { ...context, requestId }),
  };
}

export function createComponentLogger(component: string) {
  return {
    info: (message: string, context?: Omit<LogContext, "component">) =>
      logger.info(message, { ...context, component }),
    warn: (message: string, context?: Omit<LogContext, "component">) =>
      logger.warn(message, { ...context, component }),
    error: (
      message: string,
      error?: Error,
      context?: Omit<LogContext, "component">,
    ) => logger.error(message, error, { ...context, component }),
    debug: (message: string, context?: Omit<LogContext, "component">) =>
      logger.debug(message, { ...context, component }),
  };
}

// React hook for component-specific logging
export function useLogger(component: string) {
  return createComponentLogger(component);
}
