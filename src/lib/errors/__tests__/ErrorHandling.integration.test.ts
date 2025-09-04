/**
 * Integration tests for error handling utilities
 * Focuses on core functionality without complex mocking
 */

import { 
  AppError, 
  ErrorSeverity, 
  ErrorCategory,
  NetworkError,
  DatabaseError,
  ValidationError,
  RetryMechanism,
  CircuitBreaker,
  CircuitState,
  createErrorHandler
} from '../index';

describe('Error Handling Integration', () => {
  describe('AppError', () => {
    it('should create and serialize errors correctly', () => {
      const error = new AppError(
        'Test error',
        'TEST_ERROR',
        ErrorSeverity.HIGH,
        ErrorCategory.NETWORK,
        { userId: 'user123' }
      );

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.category).toBe(ErrorCategory.NETWORK);
      expect(error.context.userId).toBe('user123');

      const json = error.toJSON();
      expect(json.name).toBe('AppError');
      expect(json.code).toBe('TEST_ERROR');
    });

    it('should convert generic errors to AppError', () => {
      const genericError = new Error('Generic error');
      const appError = AppError.fromError(genericError, { component: 'TestComponent' });

      expect(appError).toBeInstanceOf(AppError);
      expect(appError.message).toBe('Generic error');
      expect(appError.context.component).toBe('TestComponent');
    });
  });

  describe('Predefined Error Types', () => {
    it('should create NetworkError with correct properties', () => {
      const error = new NetworkError('Connection failed');

      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.category).toBe(ErrorCategory.NETWORK);
      expect(error.recoverable).toBe(true);
    });

    it('should create DatabaseError with correct properties', () => {
      const error = new DatabaseError('Query failed');

      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.category).toBe(ErrorCategory.DATABASE);
      expect(error.severity).toBe(ErrorSeverity.HIGH);
    });

    it('should create ValidationError with field information', () => {
      const error = new ValidationError('Invalid email', 'email');

      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.category).toBe(ErrorCategory.VALIDATION);
      expect(error.context.metadata?.field).toBe('email');
    });
  });

  describe('RetryMechanism', () => {
    it('should succeed on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      const result = await RetryMechanism.retry(operation, { maxAttempts: 1 });

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should not retry non-retryable errors', async () => {
      const nonRetryableError = new AppError(
        'Non-retryable',
        'NON_RETRYABLE',
        ErrorSeverity.HIGH,
        ErrorCategory.AUTHORIZATION,
        {},
        { recoverable: false }
      );

      const operation = jest.fn().mockRejectedValue(nonRetryableError);

      await expect(RetryMechanism.retry(operation, { maxAttempts: 3 }))
        .rejects.toThrow('Non-retryable');
      
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should return detailed result with retryWithResult', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      const result = await RetryMechanism.retryWithResult(operation);

      expect(result.success).toBe(true);
      expect(result.result).toBe('success');
      expect(result.attempts).toBe(1);
      expect(typeof result.totalTime).toBe('number');
    });
  });

  describe('CircuitBreaker', () => {
    it('should start in CLOSED state', () => {
      const cb = new CircuitBreaker('test');
      const stats = cb.getStats();

      expect(stats.state).toBe(CircuitState.CLOSED);
      expect(stats.failureCount).toBe(0);
      expect(stats.successCount).toBe(0);
    });

    it('should execute operations successfully', async () => {
      const cb = new CircuitBreaker('test');
      const operation = jest.fn().mockResolvedValue('success');

      const result = await cb.execute(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);

      const stats = cb.getStats();
      expect(stats.successCount).toBe(1);
      expect(stats.totalCalls).toBe(1);
    });

    it('should track failures', async () => {
      const cb = new CircuitBreaker('test');
      const operation = jest.fn().mockRejectedValue(new Error('Failed'));

      await expect(cb.execute(operation)).rejects.toThrow('Failed');

      const stats = cb.getStats();
      expect(stats.failureCount).toBe(1);
      expect(stats.totalCalls).toBe(1);
    });

    it('should reset state correctly', async () => {
      const cb = new CircuitBreaker('test');
      const operation = jest.fn().mockRejectedValue(new Error('Failed'));

      try {
        await cb.execute(operation);
      } catch (e) {
        // Expected
      }

      cb.reset();

      const stats = cb.getStats();
      expect(stats.state).toBe(CircuitState.CLOSED);
      expect(stats.failureCount).toBe(0);
      expect(stats.successCount).toBe(0);
      expect(stats.totalCalls).toBe(0);
    });
  });

  describe('Error Handler Factory', () => {
    it('should create component-specific error handlers', () => {
      const errorHandler = createErrorHandler('TestComponent');

      const error = new Error('Test error');
      const appError = errorHandler.handleError(error, 'testAction');

      expect(appError).toBeInstanceOf(AppError);
      expect(appError.context.component).toBe('TestComponent');
      expect(appError.context.action).toBe('testAction');
    });

    it('should create specific error types', () => {
      const errorHandler = createErrorHandler('TestComponent');

      const networkError = errorHandler.handleNetworkError(new Error('Network failed'));
      expect(networkError).toBeInstanceOf(NetworkError);
      expect(networkError.context.component).toBe('TestComponent');

      const dbError = errorHandler.handleDatabaseError(new Error('DB failed'));
      expect(dbError).toBeInstanceOf(DatabaseError);
      expect(dbError.context.component).toBe('TestComponent');

      const validationError = errorHandler.handleValidationError('Invalid input', 'email');
      expect(validationError).toBeInstanceOf(ValidationError);
      expect(validationError.context.component).toBe('TestComponent');
      expect(validationError.context.metadata?.field).toBe('email');
    });
  });

  describe('Error Context Creation', () => {
    it('should create error context with provided information', () => {
      const { createErrorContext } = require('../index');
      
      const context = createErrorContext(
        'TestComponent',
        'testAction',
        'user123',
        { key: 'value' }
      );

      expect(context.component).toBe('TestComponent');
      expect(context.action).toBe('testAction');
      expect(context.userId).toBe('user123');
      expect(context.metadata).toEqual({ key: 'value' });
      expect(context.timestamp).toBeInstanceOf(Date);
    });
  });
});