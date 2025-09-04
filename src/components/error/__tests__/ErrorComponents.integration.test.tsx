/**
 * Integration tests for error handling components
 * Tests core functionality without complex UI dependencies
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';
import { ErrorLogger, useErrorLogger } from '../ErrorLogger';
import { AppError, ErrorCategory, ErrorSeverity } from '@/lib/errors';

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

// Simple component that throws an error
const ErrorThrowingComponent: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new AppError(
      'Test error',
      'TEST_ERROR',
      ErrorSeverity.MEDIUM,
      ErrorCategory.SYSTEM
    );
  }
  return <div>No error occurred</div>;
};

// Simple fallback component for testing
const SimpleFallback: React.FC<any> = ({ error }) => (
  <div>
    <h2>Error Occurred</h2>
    <p>{error.userMessage}</p>
  </div>
);

describe('Error Components Integration', () => {
  beforeEach(() => {
    // Clear any existing logs
    ErrorLogger.clearLogs();
  });

  describe('ErrorBoundary', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary fallback={SimpleFallback}>
          <ErrorThrowingComponent shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error occurred')).toBeInTheDocument();
    });

    it('should catch and display errors', () => {
      render(
        <ErrorBoundary fallback={SimpleFallback}>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error Occurred')).toBeInTheDocument();
      expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
    });

    it('should call custom error handler', () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary fallback={SimpleFallback} onError={onError}>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(
        expect.any(AppError),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      );
    });

    it('should log errors automatically', () => {
      const logSpy = jest.spyOn(ErrorLogger, 'logError');

      render(
        <ErrorBoundary fallback={SimpleFallback}>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(logSpy).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith(
        expect.any(AppError),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      );
    });
  });

  describe('ErrorLogger', () => {
    it('should log errors with context', () => {
      const error = new AppError(
        'Test error',
        'TEST_ERROR',
        ErrorSeverity.HIGH,
        ErrorCategory.NETWORK,
        { component: 'TestComponent' }
      );

      const logId = ErrorLogger.logError(error);

      expect(logId).toBeDefined();
      expect(typeof logId).toBe('string');

      const logs = ErrorLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].error).toBe(error);
      expect(logs[0].id).toBe(logId);
    });

    it('should add breadcrumbs', () => {
      ErrorLogger.addBreadcrumb('test', 'Test breadcrumb', 'info', { key: 'value' });

      const error = new AppError('Test error', 'TEST_ERROR');
      ErrorLogger.logError(error);

      const logs = ErrorLogger.getLogs();
      expect(logs[0].breadcrumbs).toBeDefined();
      expect(logs[0].breadcrumbs!.length).toBeGreaterThan(0);
      
      const breadcrumb = logs[0].breadcrumbs!.find(b => b.message === 'Test breadcrumb');
      expect(breadcrumb).toBeDefined();
      expect(breadcrumb!.category).toBe('test');
      expect(breadcrumb!.data).toEqual({ key: 'value' });
    });

    it('should export logs as JSON', () => {
      const error = new AppError('Test error', 'TEST_ERROR');
      ErrorLogger.logError(error);

      const exportedLogs = ErrorLogger.exportLogs();
      expect(typeof exportedLogs).toBe('string');

      const parsed = JSON.parse(exportedLogs);
      expect(parsed.sessionLogs).toBeDefined();
      expect(parsed.sessionId).toBeDefined();
      expect(parsed.exportedAt).toBeDefined();
    });

    it('should clear logs', () => {
      const error = new AppError('Test error', 'TEST_ERROR');
      ErrorLogger.logError(error);

      expect(ErrorLogger.getLogs()).toHaveLength(1);

      ErrorLogger.clearLogs();

      expect(ErrorLogger.getLogs()).toHaveLength(0);
    });
  });

  describe('useErrorLogger hook', () => {
    const TestComponent: React.FC = () => {
      const { logError, addBreadcrumb, getLogs } = useErrorLogger();

      React.useEffect(() => {
        addBreadcrumb('test', 'Component mounted');
        logError(new Error('Test error from hook'));
      }, [logError, addBreadcrumb]);

      const logs = getLogs();

      return (
        <div>
          <span>Logs count: {logs.length}</span>
        </div>
      );
    };

    it('should provide error logging functionality', () => {
      render(<TestComponent />);

      expect(screen.getByText('Logs count: 1')).toBeInTheDocument();

      const logs = ErrorLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].error.message).toBe('Test error from hook');
    });
  });
});