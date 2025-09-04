/**
 * Error tracking and monitoring system
 * Provides centralized error collection, analysis, and alerting
 */

import { AppError, ErrorSeverity, ErrorCategory } from '@/lib/errors';
import { ErrorLogEntry } from '@/components/error/ErrorLogger';

export interface ErrorMetrics {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  errorsByComponent: Record<string, number>;
  errorRate: number;
  averageErrorsPerHour: number;
  topErrors: Array<{
    code: string;
    message: string;
    count: number;
    lastOccurrence: Date;
  }>;
}

export interface ErrorAlert {
  id: string;
  type: 'threshold' | 'spike' | 'critical' | 'new_error';
  severity: ErrorSeverity;
  message: string;
  timestamp: Date;
  errorCount: number;
  timeWindow: string;
  acknowledged: boolean;
  resolvedAt?: Date;
}

export interface ErrorTrackingConfig {
  enableRealTimeAlerts: boolean;
  errorThreshold: number; // Errors per minute before alert
  spikeThreshold: number; // Percentage increase for spike detection
  criticalErrorsAlert: boolean;
  newErrorAlert: boolean;
  alertCooldown: number; // Minutes between similar alerts
  retentionDays: number; // Days to keep error logs
}

class ErrorTrackingService {
  private config: ErrorTrackingConfig;
  private errorBuffer: ErrorLogEntry[] = [];
  private alerts: ErrorAlert[] = [];
  private metrics: ErrorMetrics | null = null;
  private lastMetricsUpdate: Date | null = null;
  private alertCooldowns: Map<string, Date> = new Map();

  constructor(config: Partial<ErrorTrackingConfig> = {}) {
    this.config = {
      enableRealTimeAlerts: true,
      errorThreshold: 10, // 10 errors per minute
      spikeThreshold: 200, // 200% increase
      criticalErrorsAlert: true,
      newErrorAlert: true,
      alertCooldown: 15, // 15 minutes
      retentionDays: 30,
      ...config
    };

    this.initializeTracking();
  }

  private initializeTracking() {
    // Set up periodic metrics calculation
    setInterval(() => {
      this.updateMetrics();
    }, 60000); // Update every minute

    // Set up alert processing
    setInterval(() => {
      this.processAlerts();
    }, 30000); // Check every 30 seconds

    // Set up cleanup
    setInterval(() => {
      this.cleanup();
    }, 3600000); // Cleanup every hour
  }

  public trackError(errorLog: ErrorLogEntry): void {
    // Add to buffer
    this.errorBuffer.push(errorLog);

    // Keep buffer size manageable
    if (this.errorBuffer.length > 1000) {
      this.errorBuffer = this.errorBuffer.slice(-500);
    }

    // Store in database if available
    this.storeErrorInDatabase(errorLog);

    // Check for immediate alerts
    if (this.config.enableRealTimeAlerts) {
      this.checkForImmediateAlerts(errorLog);
    }

    // Invalidate metrics cache
    this.metrics = null;
  }

  private async storeErrorInDatabase(errorLog: ErrorLogEntry): Promise<void> {
    try {
      // Store in Supabase or local database
      const response = await fetch('/api/errors/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: errorLog.id,
          timestamp: errorLog.timestamp.toISOString(),
          error_code: errorLog.error.code,
          error_message: errorLog.error.message,
          error_category: errorLog.error.category,
          error_severity: errorLog.error.severity,
          component: errorLog.error.context.component,
          user_id: errorLog.userId,
          session_id: errorLog.sessionId,
          url: errorLog.url,
          user_agent: errorLog.userAgent,
          stack_trace: errorLog.stackTrace,
          context: JSON.stringify(errorLog.error.context),
          breadcrumbs: JSON.stringify(errorLog.breadcrumbs || [])
        })
      });

      if (!response.ok) {
        console.warn('Failed to store error in database:', response.statusText);
      }
    } catch (error) {
      console.warn('Error storing error log:', error);
    }
  }

  private checkForImmediateAlerts(errorLog: ErrorLogEntry): void {
    const { error } = errorLog;

    // Critical error alert
    if (this.config.criticalErrorsAlert && error.severity === ErrorSeverity.CRITICAL) {
      this.createAlert({
        type: 'critical',
        severity: ErrorSeverity.CRITICAL,
        message: `Critical error occurred: ${error.message}`,
        errorCount: 1,
        timeWindow: 'immediate'
      });
    }

    // New error type alert
    if (this.config.newErrorAlert && this.isNewErrorType(error.code)) {
      this.createAlert({
        type: 'new_error',
        severity: error.severity,
        message: `New error type detected: ${error.code}`,
        errorCount: 1,
        timeWindow: 'immediate'
      });
    }
  }

  private isNewErrorType(errorCode: string): boolean {
    // Check if this error code has been seen before
    const recentErrors = this.errorBuffer.slice(-100);
    return !recentErrors.some(log => log.error.code === errorCode);
  }

  private processAlerts(): void {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    const recentErrors = this.errorBuffer.filter(log => log.timestamp >= oneMinuteAgo);

    // Threshold alert
    if (recentErrors.length >= this.config.errorThreshold) {
      const alertKey = 'threshold_alert';
      if (!this.isInCooldown(alertKey)) {
        this.createAlert({
          type: 'threshold',
          severity: ErrorSeverity.HIGH,
          message: `Error threshold exceeded: ${recentErrors.length} errors in the last minute`,
          errorCount: recentErrors.length,
          timeWindow: '1 minute'
        });
        this.setCooldown(alertKey);
      }
    }

    // Spike detection
    const twoMinutesAgo = new Date(now.getTime() - 120000);
    const previousMinuteErrors = this.errorBuffer.filter(
      log => log.timestamp >= twoMinutesAgo && log.timestamp < oneMinuteAgo
    );

    if (previousMinuteErrors.length > 0) {
      const increasePercentage = ((recentErrors.length - previousMinuteErrors.length) / previousMinuteErrors.length) * 100;
      
      if (increasePercentage >= this.config.spikeThreshold) {
        const alertKey = 'spike_alert';
        if (!this.isInCooldown(alertKey)) {
          this.createAlert({
            type: 'spike',
            severity: ErrorSeverity.HIGH,
            message: `Error spike detected: ${increasePercentage.toFixed(1)}% increase`,
            errorCount: recentErrors.length,
            timeWindow: '1 minute'
          });
          this.setCooldown(alertKey);
        }
      }
    }
  }

  private createAlert(alertData: Omit<ErrorAlert, 'id' | 'timestamp' | 'acknowledged'>): void {
    const alert: ErrorAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      acknowledged: false,
      ...alertData
    };

    this.alerts.push(alert);

    // Keep only recent alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-50);
    }

    // Send alert notification
    this.sendAlertNotification(alert);

    // Store alert in database
    this.storeAlertInDatabase(alert);
  }

  private async sendAlertNotification(alert: ErrorAlert): Promise<void> {
    try {
      // Send to notification system (email, Slack, etc.)
      await fetch('/api/alerts/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alert)
      });
    } catch (error) {
      console.warn('Failed to send alert notification:', error);
    }
  }

  private async storeAlertInDatabase(alert: ErrorAlert): Promise<void> {
    try {
      await fetch('/api/alerts/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...alert,
          timestamp: alert.timestamp.toISOString(),
          resolved_at: alert.resolvedAt?.toISOString()
        })
      });
    } catch (error) {
      console.warn('Failed to store alert in database:', error);
    }
  }

  private isInCooldown(alertKey: string): boolean {
    const lastAlert = this.alertCooldowns.get(alertKey);
    if (!lastAlert) return false;

    const cooldownEnd = new Date(lastAlert.getTime() + (this.config.alertCooldown * 60000));
    return new Date() < cooldownEnd;
  }

  private setCooldown(alertKey: string): void {
    this.alertCooldowns.set(alertKey, new Date());
  }

  private updateMetrics(): void {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);
    const recentErrors = this.errorBuffer.filter(log => log.timestamp >= oneHourAgo);

    // Calculate metrics
    const totalErrors = recentErrors.length;
    
    const errorsByCategory = Object.values(ErrorCategory).reduce((acc, category) => {
      acc[category] = recentErrors.filter(log => log.error.category === category).length;
      return acc;
    }, {} as Record<ErrorCategory, number>);

    const errorsBySeverity = Object.values(ErrorSeverity).reduce((acc, severity) => {
      acc[severity] = recentErrors.filter(log => log.error.severity === severity).length;
      return acc;
    }, {} as Record<ErrorSeverity, number>);

    const errorsByComponent: Record<string, number> = {};
    recentErrors.forEach(log => {
      const component = log.error.context.component || 'unknown';
      errorsByComponent[component] = (errorsByComponent[component] || 0) + 1;
    });

    // Calculate error rate (errors per minute)
    const errorRate = totalErrors / 60;

    // Calculate top errors
    const errorCounts: Record<string, { count: number; lastOccurrence: Date; message: string }> = {};
    recentErrors.forEach(log => {
      const key = log.error.code;
      if (!errorCounts[key]) {
        errorCounts[key] = { count: 0, lastOccurrence: log.timestamp, message: log.error.message };
      }
      errorCounts[key].count++;
      if (log.timestamp > errorCounts[key].lastOccurrence) {
        errorCounts[key].lastOccurrence = log.timestamp;
      }
    });

    const topErrors = Object.entries(errorCounts)
      .map(([code, data]) => ({ code, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    this.metrics = {
      totalErrors,
      errorsByCategory,
      errorsBySeverity,
      errorsByComponent,
      errorRate,
      averageErrorsPerHour: totalErrors,
      topErrors
    };

    this.lastMetricsUpdate = now;
  }

  private cleanup(): void {
    const cutoffDate = new Date(Date.now() - (this.config.retentionDays * 24 * 60 * 60 * 1000));
    
    // Clean up old errors from buffer
    this.errorBuffer = this.errorBuffer.filter(log => log.timestamp >= cutoffDate);
    
    // Clean up old alerts
    this.alerts = this.alerts.filter(alert => alert.timestamp >= cutoffDate);
    
    // Clean up old cooldowns
    for (const [key, date] of this.alertCooldowns.entries()) {
      if (date < cutoffDate) {
        this.alertCooldowns.delete(key);
      }
    }
  }

  // Public API methods
  public getMetrics(): ErrorMetrics {
    if (!this.metrics || !this.lastMetricsUpdate || 
        (Date.now() - this.lastMetricsUpdate.getTime()) > 60000) {
      this.updateMetrics();
    }
    return this.metrics!;
  }

  public getAlerts(unacknowledgedOnly: boolean = false): ErrorAlert[] {
    return unacknowledgedOnly 
      ? this.alerts.filter(alert => !alert.acknowledged)
      : [...this.alerts];
  }

  public acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  public resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.resolvedAt = new Date();
      return true;
    }
    return false;
  }

  public getRecentErrors(limit: number = 50): ErrorLogEntry[] {
    return this.errorBuffer.slice(-limit);
  }

  public updateConfig(newConfig: Partial<ErrorTrackingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): ErrorTrackingConfig {
    return { ...this.config };
  }
}

// Singleton instance
export const ErrorTracker = new ErrorTrackingService();

// React hook for error tracking
export const useErrorTracking = () => {
  const trackError = (errorLog: ErrorLogEntry) => {
    ErrorTracker.trackError(errorLog);
  };

  return {
    trackError,
    getMetrics: () => ErrorTracker.getMetrics(),
    getAlerts: (unacknowledgedOnly?: boolean) => ErrorTracker.getAlerts(unacknowledgedOnly),
    acknowledgeAlert: (alertId: string) => ErrorTracker.acknowledgeAlert(alertId),
    resolveAlert: (alertId: string) => ErrorTracker.resolveAlert(alertId),
    getRecentErrors: (limit?: number) => ErrorTracker.getRecentErrors(limit)
  };
};