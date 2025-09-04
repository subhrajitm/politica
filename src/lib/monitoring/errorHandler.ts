export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  timestamp: Date;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly severity: ErrorSeverity;
  public readonly context: ErrorContext;
  public readonly recoverable: boolean;
  public readonly userMessage: string;

  constructor(
    message: string,
    code: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context: Partial<ErrorContext> = {},
    recoverable: boolean = true,
    userMessage?: string
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.severity = severity;
    this.recoverable = recoverable;
    this.userMessage = userMessage || this.getDefaultUserMessage();
    this.context = {
      timestamp: new Date(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      ...context,
    };

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  private getDefaultUserMessage(): string {
    switch (this.severity) {
      case ErrorSeverity.LOW:
        return 'A minor issue occurred. Please try again.';
      case ErrorSeverity.MEDIUM:
        return 'Something went wrong. Please try again or contact support if the issue persists.';
      case ErrorSeverity.HIGH:
        return 'An error occurred. Please refresh the page and try again.';
      case ErrorSeverity.CRITICAL:
        return 'A critical error occurred. Please contact support immediately.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      recoverable: this.recoverable,
      userMessage: this.userMessage,
      context: this.context,
      stack: this.stack,
    };
  }
}

export interface ErrorLogEntry {
  id: string;
  error: AppError | Error;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  notes?: string;
}

export class ErrorLogger {
  private logs: ErrorLogEntry[] = [];
  private maxLogs = 1000;

  log(error: Error | AppError, context?: Partial<ErrorContext>): string {
    const id = this.generateId();
    const appError = error instanceof AppError 
      ? error 
      : new AppError(error.message, 'UNKNOWN_ERROR', ErrorSeverity.MEDIUM, context);

    const logEntry: ErrorLogEntry = {
      id,
      error: appError,
      timestamp: new Date(),
      resolved: false,
    };

    this.logs.unshift(logEntry);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Console logging based on severity
    this.consoleLog(appError);

    // Store in browser storage for persistence
    this.persistLog(logEntry);

    return id;
  }

  private consoleLog(error: AppError): void {
    const logData = {
      code: error.code,
      message: error.message,
      severity: error.severity,
      context: error.context,
      stack: error.stack,
    };

    switch (error.severity) {
      case ErrorSeverity.LOW:
        console.info('🔵 Low severity error:', logData);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn('🟡 Medium severity error:', logData);
        break;
      case ErrorSeverity.HIGH:
        console.error('🟠 High severity error:', logData);
        break;
      case ErrorSeverity.CRITICAL:
        console.error('🔴 CRITICAL ERROR:', logData);
        break;
    }
  }

  private persistLog(logEntry: ErrorLogEntry): void {
    if (typeof window === 'undefined') return;

    try {
      const existingLogs = JSON.parse(
        localStorage.getItem('pf_error_logs') || '[]'
      );
      existingLogs.unshift(logEntry);
      
      // Keep only the last 100 logs in storage
      const logsToStore = existingLogs.slice(0, 100);
      localStorage.setItem('pf_error_logs', JSON.stringify(logsToStore));
    } catch (error) {
      console.warn('Failed to persist error log:', error);
    }
  }

  private generateId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getLogs(severity?: ErrorSeverity): ErrorLogEntry[] {
    if (severity) {
      return this.logs.filter(log => 
        log.error instanceof AppError && log.error.severity === severity
      );
    }
    return [...this.logs];
  }

  getUnresolvedLogs(): ErrorLogEntry[] {
    return this.logs.filter(log => !log.resolved);
  }

  resolveError(id: string, notes?: string): boolean {
    const logEntry = this.logs.find(log => log.id === id);
    if (logEntry) {
      logEntry.resolved = true;
      logEntry.resolvedAt = new Date();
      logEntry.notes = notes;
      return true;
    }
    return false;
  }

  clearLogs(): void {
    this.logs = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pf_error_logs');
    }
  }

  getStats() {
    const total = this.logs.length;
    const resolved = this.logs.filter(log => log.resolved).length;
    const bySeverity = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    this.logs.forEach(log => {
      if (log.error instanceof AppError) {
        bySeverity[log.error.severity]++;
      }
    });

    return {
      total,
      resolved,
      unresolved: total - resolved,
      bySeverity,
    };
  }
}

// Global error logger instance
export const errorLogger = new ErrorLogger();

// Global error handler for unhandled errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorLogger.log(
      new AppError(
        event.error?.message || 'Unhandled error',
        'UNHANDLED_ERROR',
        ErrorSeverity.HIGH,
        {
          component: 'Global',
          action: 'unhandled_error',
          metadata: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        }
      )
    );
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorLogger.log(
      new AppError(
        event.reason?.message || 'Unhandled promise rejection',
        'UNHANDLED_REJECTION',
        ErrorSeverity.HIGH,
        {
          component: 'Global',
          action: 'unhandled_rejection',
          metadata: {
            reason: event.reason,
          },
        }
      )
    );
  });
}