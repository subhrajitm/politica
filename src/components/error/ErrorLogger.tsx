/**
 * Error logging utility for client-side error tracking
 * Provides structured logging with context and stack traces
 */

'use client';

import { ErrorInfo } from 'react';
import { AppError, ErrorSeverity, ErrorCategory } from '@/lib/errors';

export interface ErrorLogEntry {
  id: string;
  timestamp: Date;
  error: AppError;
  errorInfo?: ErrorInfo;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
  stackTrace?: string;
  breadcrumbs?: ErrorBreadcrumb[];
}

export interface ErrorBreadcrumb {
  timestamp: Date;
  category: string;
  message: string;
  level: 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}

class ErrorLoggerService {
  private logs: ErrorLogEntry[] = [];
  private breadcrumbs: ErrorBreadcrumb[] = [];
  private maxLogs = 100;
  private maxBreadcrumbs = 50;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeBreadcrumbTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeBreadcrumbTracking() {
    if (typeof window === 'undefined') return;

    // Track navigation
    window.addEventListener('popstate', () => {
      this.addBreadcrumb('navigation', 'Page navigation', 'info', {
        url: window.location.href
      });
    });

    // Track clicks on important elements
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.getAttribute('role') === 'button') {
        this.addBreadcrumb('user', `Clicked ${target.tagName.toLowerCase()}`, 'info', {
          text: target.textContent?.slice(0, 50),
          id: target.id,
          className: target.className
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.addBreadcrumb('user', 'Form submitted', 'info', {
        action: form.action,
        method: form.method,
        id: form.id
      });
    });
  }

  public addBreadcrumb(
    category: string,
    message: string,
    level: 'info' | 'warning' | 'error' = 'info',
    data?: Record<string, any>
  ) {
    const breadcrumb: ErrorBreadcrumb = {
      timestamp: new Date(),
      category,
      message,
      level,
      data
    };

    this.breadcrumbs.push(breadcrumb);

    // Keep only the most recent breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }
  }

  public logError(error: AppError, errorInfo?: ErrorInfo): string {
    const logId = this.generateLogId();
    
    const logEntry: ErrorLogEntry = {
      id: logId,
      timestamp: new Date(),
      error,
      errorInfo,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userId: this.getCurrentUserId(),
      sessionId: this.sessionId,
      stackTrace: error.stack,
      breadcrumbs: [...this.breadcrumbs] // Copy current breadcrumbs
    };

    this.logs.push(logEntry);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Store in localStorage for persistence
    this.persistToLocalStorage(logEntry);

    // Send to server if configured
    this.sendToServer(logEntry);

    // Console logging for development
    this.logToConsole(logEntry);

    // Track error for monitoring and alerting
    this.trackErrorForMonitoring(logEntry);

    // Add breadcrumb for this error
    this.addBreadcrumb('error', `Error logged: ${error.code}`, 'error', {
      errorId: logId,
      severity: error.severity,
      category: error.category
    });

    return logId;
  }

  private trackErrorForMonitoring(logEntry: ErrorLogEntry): void {
    // Import ErrorTracker dynamically to avoid circular dependencies
    import('@/lib/monitoring/ErrorTracker').then(({ ErrorTracker }) => {
      ErrorTracker.trackError(logEntry);
    }).catch(error => {
      console.warn('Failed to track error for monitoring:', error);
    });
  }

  private generateLogId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentUserId(): string | undefined {
    // Try to get user ID from various sources
    if (typeof window === 'undefined') return undefined;

    // Check localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        return user.id;
      } catch (e) {
        // Ignore parsing errors
      }
    }

    // Check for user in global context (if available)
    if ((window as any).currentUser) {
      return (window as any).currentUser.id;
    }

    return undefined;
  }

  private persistToLocalStorage(logEntry: ErrorLogEntry) {
    if (typeof window === 'undefined') return;

    try {
      const existingLogs = localStorage.getItem('error_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      
      logs.push({
        ...logEntry,
        // Serialize dates
        timestamp: logEntry.timestamp.toISOString(),
        breadcrumbs: logEntry.breadcrumbs?.map(b => ({
          ...b,
          timestamp: b.timestamp.toISOString()
        }))
      });

      // Keep only the last 20 logs in localStorage
      const recentLogs = logs.slice(-20);
      localStorage.setItem('error_logs', JSON.stringify(recentLogs));
    } catch (e) {
      console.warn('Failed to persist error log to localStorage:', e);
    }
  }

  private async sendToServer(logEntry: ErrorLogEntry) {
    // Only send high severity errors to server to avoid spam
    if (logEntry.error.severity === ErrorSeverity.LOW) {
      return;
    }

    try {
      // Check if error reporting endpoint exists
      const response = await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...logEntry,
          // Serialize dates for JSON
          timestamp: logEntry.timestamp.toISOString(),
          breadcrumbs: logEntry.breadcrumbs?.map(b => ({
            ...b,
            timestamp: b.timestamp.toISOString()
          }))
        })
      });

      if (!response.ok) {
        console.warn('Failed to send error log to server:', response.statusText);
      }
    } catch (e) {
      // Silently fail - don't want error logging to cause more errors
      console.warn('Error sending log to server:', e);
    }
  }

  private logToConsole(logEntry: ErrorLogEntry) {
    if (process.env.NODE_ENV !== 'development') return;

    const { error, errorInfo } = logEntry;
    
    console.group(`🚨 Error Log [${logEntry.id}]`);
    console.error('Error:', error);
    console.log('Severity:', error.severity);
    console.log('Category:', error.category);
    console.log('Context:', error.context);
    
    if (errorInfo) {
      console.log('Component Stack:', errorInfo.componentStack);
    }
    
    if (logEntry.breadcrumbs && logEntry.breadcrumbs.length > 0) {
      console.log('Recent Activity:');
      logEntry.breadcrumbs.slice(-5).forEach(breadcrumb => {
        console.log(`  ${breadcrumb.timestamp.toISOString()} [${breadcrumb.category}] ${breadcrumb.message}`);
      });
    }
    
    console.groupEnd();
  }

  public getLogs(): ErrorLogEntry[] {
    return [...this.logs];
  }

  public getLogsFromStorage(): any[] {
    if (typeof window === 'undefined') return [];

    try {
      const storedLogs = localStorage.getItem('error_logs');
      return storedLogs ? JSON.parse(storedLogs) : [];
    } catch (e) {
      console.warn('Failed to retrieve error logs from localStorage:', e);
      return [];
    }
  }

  public clearLogs() {
    this.logs = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('error_logs');
    }
  }

  public exportLogs(): string {
    const allLogs = {
      sessionLogs: this.logs,
      storedLogs: this.getLogsFromStorage(),
      sessionId: this.sessionId,
      exportedAt: new Date().toISOString()
    };

    return JSON.stringify(allLogs, null, 2);
  }
}

// Singleton instance
export const ErrorLogger = new ErrorLoggerService();

// React hook for error logging
export const useErrorLogger = () => {
  const logError = (error: Error | AppError, context?: Record<string, any>) => {
    const appError = error instanceof AppError ? error : AppError.fromError(error, context);
    return ErrorLogger.logError(appError);
  };

  const addBreadcrumb = (category: string, message: string, level?: 'info' | 'warning' | 'error', data?: Record<string, any>) => {
    ErrorLogger.addBreadcrumb(category, message, level, data);
  };

  return {
    logError,
    addBreadcrumb,
    getLogs: () => ErrorLogger.getLogs(),
    clearLogs: () => ErrorLogger.clearLogs(),
    exportLogs: () => ErrorLogger.exportLogs()
  };
};