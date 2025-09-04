/**
 * Tests for ErrorTracker functionality
 */

import { ErrorTracker } from '../ErrorTracker';
import { AppError, ErrorSeverity, ErrorCategory } from '@/lib/errors';
import { ErrorLogEntry } from '@/components/error/ErrorLogger';

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
) as jest.Mock;

describe('ErrorTracker', () => {
  let tracker: any;

  beforeEach(() => {
    // Create a new instance for each test
    tracker = new (ErrorTracker.constructor as any)({
      enableRealTimeAlerts: true,
      errorThreshold: 5,
      spikeThreshold: 100,
      criticalErrorsAlert: true,
      newErrorAlert: true,
      alertCooldown: 1, // 1 minute for testing
      retentionDays: 1
    });

    // Clear fetch mock
    (fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('trackError', () => {
    it('should track error and update metrics', () => {
      const error = new AppError(
        'Test error',
        'TEST_ERROR',
        ErrorSeverity.MEDIUM,
        ErrorCategory.SYSTEM
      );

      const errorLog: ErrorLogEntry = {
        id: 'test-error-1',
        timestamp: new Date(),
        error,
        userAgent: 'test-agent',
        url: 'http://test.com',
        sessionId: 'test-session',
        stackTrace: 'test stack trace',
        breadcrumbs: []
      };

      tracker.trackError(errorLog);

      const metrics = tracker.getMetrics();
      expect(metrics.totalErrors).toBe(1);
      expect(metrics.errorsByCategory[ErrorCategory.SYSTEM]).toBe(1);
      expect(metrics.errorsBySeverity[ErrorSeverity.MEDIUM]).toBe(1);
    });

    it('should create critical error alert', () => {
      const criticalError = new AppError(
        'Critical error',
        'CRITICAL_ERROR',
        ErrorSeverity.CRITICAL,
        ErrorCategory.SYSTEM
      );

      const errorLog: ErrorLogEntry = {
        id: 'critical-error-1',
        timestamp: new Date(),
        error: criticalError,
        userAgent: 'test-agent',
        url: 'http://test.com',
        sessionId: 'test-session',
        stackTrace: 'test stack trace',
        breadcrumbs: []
      };

      tracker.trackError(errorLog);

      const alerts = tracker.getAlerts();
      expect(alerts.length).toBe(1);
      expect(alerts[0].type).toBe('critical');
      expect(alerts[0].severity).toBe(ErrorSeverity.CRITICAL);
    });

    it('should create new error type alert', () => {
      const newError = new AppError(
        'New error type',
        'NEW_ERROR_TYPE',
        ErrorSeverity.HIGH,
        ErrorCategory.NETWORK
      );

      const errorLog: ErrorLogEntry = {
        id: 'new-error-1',
        timestamp: new Date(),
        error: newError,
        userAgent: 'test-agent',
        url: 'http://test.com',
        sessionId: 'test-session',
        stackTrace: 'test stack trace',
        breadcrumbs: []
      };

      tracker.trackError(errorLog);

      const alerts = tracker.getAlerts();
      expect(alerts.length).toBe(1);
      expect(alerts[0].type).toBe('new_error');
    });
  });

  describe('getMetrics', () => {
    it('should return correct metrics', () => {
      // Add multiple errors
      const errors = [
        { category: ErrorCategory.NETWORK, severity: ErrorSeverity.HIGH },
        { category: ErrorCategory.DATABASE, severity: ErrorSeverity.MEDIUM },
        { category: ErrorCategory.NETWORK, severity: ErrorSeverity.LOW }
      ];

      errors.forEach((errorData, index) => {
        const error = new AppError(
          `Test error ${index}`,
          `TEST_ERROR_${index}`,
          errorData.severity,
          errorData.category
        );

        const errorLog: ErrorLogEntry = {
          id: `test-error-${index}`,
          timestamp: new Date(),
          error,
          userAgent: 'test-agent',
          url: 'http://test.com',
          sessionId: 'test-session',
          stackTrace: 'test stack trace',
          breadcrumbs: []
        };

        tracker.trackError(errorLog);
      });

      const metrics = tracker.getMetrics();
      
      expect(metrics.totalErrors).toBe(3);
      expect(metrics.errorsByCategory[ErrorCategory.NETWORK]).toBe(2);
      expect(metrics.errorsByCategory[ErrorCategory.DATABASE]).toBe(1);
      expect(metrics.errorsBySeverity[ErrorSeverity.HIGH]).toBe(1);
      expect(metrics.errorsBySeverity[ErrorSeverity.MEDIUM]).toBe(1);
      expect(metrics.errorsBySeverity[ErrorSeverity.LOW]).toBe(1);
    });
  });

  describe('alert management', () => {
    it('should acknowledge alerts', () => {
      const error = new AppError(
        'Critical error',
        'CRITICAL_ERROR',
        ErrorSeverity.CRITICAL,
        ErrorCategory.SYSTEM
      );

      const errorLog: ErrorLogEntry = {
        id: 'critical-error-1',
        timestamp: new Date(),
        error,
        userAgent: 'test-agent',
        url: 'http://test.com',
        sessionId: 'test-session',
        stackTrace: 'test stack trace',
        breadcrumbs: []
      };

      tracker.trackError(errorLog);

      const alerts = tracker.getAlerts();
      const alertId = alerts[0].id;

      expect(alerts[0].acknowledged).toBe(false);

      const acknowledged = tracker.acknowledgeAlert(alertId);
      expect(acknowledged).toBe(true);

      const updatedAlerts = tracker.getAlerts();
      expect(updatedAlerts[0].acknowledged).toBe(true);
    });

    it('should resolve alerts', () => {
      const error = new AppError(
        'Critical error',
        'CRITICAL_ERROR',
        ErrorSeverity.CRITICAL,
        ErrorCategory.SYSTEM
      );

      const errorLog: ErrorLogEntry = {
        id: 'critical-error-1',
        timestamp: new Date(),
        error,
        userAgent: 'test-agent',
        url: 'http://test.com',
        sessionId: 'test-session',
        stackTrace: 'test stack trace',
        breadcrumbs: []
      };

      tracker.trackError(errorLog);

      const alerts = tracker.getAlerts();
      const alertId = alerts[0].id;

      const resolved = tracker.resolveAlert(alertId);
      expect(resolved).toBe(true);

      const updatedAlerts = tracker.getAlerts();
      expect(updatedAlerts[0].acknowledged).toBe(true);
      expect(updatedAlerts[0].resolvedAt).toBeInstanceOf(Date);
    });

    it('should filter unacknowledged alerts', () => {
      // Create multiple alerts
      const errors = [
        new AppError('Error 1', 'ERROR_1', ErrorSeverity.CRITICAL, ErrorCategory.SYSTEM),
        new AppError('Error 2', 'ERROR_2', ErrorSeverity.CRITICAL, ErrorCategory.NETWORK)
      ];

      errors.forEach((error, index) => {
        const errorLog: ErrorLogEntry = {
          id: `error-${index}`,
          timestamp: new Date(),
          error,
          userAgent: 'test-agent',
          url: 'http://test.com',
          sessionId: 'test-session',
          stackTrace: 'test stack trace',
          breadcrumbs: []
        };

        tracker.trackError(errorLog);
      });

      const allAlerts = tracker.getAlerts();
      expect(allAlerts.length).toBe(2);

      // Acknowledge one alert
      tracker.acknowledgeAlert(allAlerts[0].id);

      const unacknowledgedAlerts = tracker.getAlerts(true);
      expect(unacknowledgedAlerts.length).toBe(1);
      expect(unacknowledgedAlerts[0].id).toBe(allAlerts[1].id);
    });
  });

  describe('getRecentErrors', () => {
    it('should return recent errors with limit', () => {
      // Add multiple errors
      for (let i = 0; i < 10; i++) {
        const error = new AppError(
          `Test error ${i}`,
          `TEST_ERROR_${i}`,
          ErrorSeverity.MEDIUM,
          ErrorCategory.SYSTEM
        );

        const errorLog: ErrorLogEntry = {
          id: `test-error-${i}`,
          timestamp: new Date(),
          error,
          userAgent: 'test-agent',
          url: 'http://test.com',
          sessionId: 'test-session',
          stackTrace: 'test stack trace',
          breadcrumbs: []
        };

        tracker.trackError(errorLog);
      }

      const recentErrors = tracker.getRecentErrors(5);
      expect(recentErrors.length).toBe(5);
      
      // Should return the most recent errors
      expect(recentErrors[0].id).toBe('test-error-9');
      expect(recentErrors[4].id).toBe('test-error-5');
    });
  });
});