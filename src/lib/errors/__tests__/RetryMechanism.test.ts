/**
 * Unit tests for RetryMechanism class
 */

import { RetryMechanism, retryNetworkOperation, retryDatabaseOperation, retryExternalAPI } from '../RetryMechanism';
import { AppError, ErrorCategory, NetworkError, DatabaseError, ExternalAPIError } from '../AppError';

// Mock setTimeout for testing
jest.useFakeTimers();

describe('RetryMechanism', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
  });

  describe('retry', () => {
    it('should succeed on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      const result = await RetryMechanism.retry(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new NetworkError('Network failed'))
        .mockRejectedValueOnce(new NetworkError('Network failed again'))
        .mockResolvedValue('success');

      const promise = RetryMechanism.retry(operation, { maxAttempts: 3 });

      // Fast-forward through delays
      jest.runAllTimers();

      const result = await promise;

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should fail after max attempts', async () => {
      const operation = jest.fn().mockRejectedValue(new NetworkError('Persistent failure'));

      const promise = RetryMechanism.retry(operation, { maxAttempts: 2 });

      // Fast-forward through delays
      jest.runAllTimers();

      await expect(promise).rejects.toThrow('Operation failed after 2 attempts');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should not retry non-retryable errors', async () => {
      const nonRetryableError = new AppError(
        'Non-retryable error',
        'NON_RETRYABLE',
        'HIGH' as any,
        ErrorCategory.AUTHORIZATION,
        {},
        { recoverable: false }
      );

      const operation = jest.fn().mockRejectedValue(nonRetryableError);

      await expect(RetryMechanism.retry(operation)).rejects.toThrow('Non-retryable error');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should call onRetry callback', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new NetworkError('First failure'))
        .mockResolvedValue('success');

      const onRetry = jest.fn();

      const promise = RetryMechanism.retry(operation, { 
        maxAttempts: 2,
        onRetry 
      });

      // Fast-forward through delays
      jest.runAllTimers();

      await promise;

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(NetworkError));
    });

    it('should use custom retry condition', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Custom error'));

      const retryCondition = jest.fn().mockReturnValue(false);

      await expect(RetryMechanism.retry(operation, { retryCondition })).rejects.toThrow('Custom error');
      
      expect(retryCondition).toHaveBeenCalledWith(expect.any(Error));
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });

  describe('retryWithResult', () => {
    it('should return success result', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      const result = await RetryMechanism.retryWithResult(operation);

      expect(result.success).toBe(true);
      expect(result.result).toBe('success');
      expect(result.attempts).toBe(1);
      expect(result.totalTime).toBeGreaterThan(0);
    });

    it('should return failure result after retries', async () => {
      const operation = jest.fn().mockRejectedValue(new NetworkError('Persistent failure'));

      const promise = RetryMechanism.retryWithResult(operation, { maxAttempts: 2 });

      // Fast-forward through delays
      jest.runAllTimers();

      const result = await promise;

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(NetworkError);
      expect(result.attempts).toBe(2);
      expect(result.totalTime).toBeGreaterThan(0);
    });

    it('should return failure result for non-retryable error', async () => {
      const nonRetryableError = new AppError(
        'Non-retryable',
        'NON_RETRYABLE',
        'HIGH' as any,
        ErrorCategory.AUTHORIZATION,
        {},
        { recoverable: false }
      );

      const operation = jest.fn().mockRejectedValue(nonRetryableError);

      const result = await RetryMechanism.retryWithResult(operation);

      expect(result.success).toBe(false);
      expect(result.error).toBe(nonRetryableError);
      expect(result.attempts).toBe(1);
    });
  });

  describe('delay calculation', () => {
    it('should calculate exponential backoff delay', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new NetworkError('Failure 1'))
        .mockRejectedValueOnce(new NetworkError('Failure 2'))
        .mockResolvedValue('success');

      const promise = RetryMechanism.retry(operation, {
        maxAttempts: 3,
        backoffStrategy: 'exponential',
        baseDelay: 100,
        jitter: false
      });

      // Check that delays are exponential
      expect(setTimeout).toHaveBeenNthCalledWith(1, expect.any(Function), 100); // 100 * 2^0
      
      jest.advanceTimersByTime(100);
      
      expect(setTimeout).toHaveBeenNthCalledWith(2, expect.any(Function), 200); // 100 * 2^1

      jest.runAllTimers();

      await promise;
    });

    it('should calculate linear backoff delay', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new NetworkError('Failure 1'))
        .mockRejectedValueOnce(new NetworkError('Failure 2'))
        .mockResolvedValue('success');

      const promise = RetryMechanism.retry(operation, {
        maxAttempts: 3,
        backoffStrategy: 'linear',
        baseDelay: 100,
        jitter: false
      });

      expect(setTimeout).toHaveBeenNthCalledWith(1, expect.any(Function), 100); // 100 * 1
      
      jest.advanceTimersByTime(100);
      
      expect(setTimeout).toHaveBeenNthCalledWith(2, expect.any(Function), 200); // 100 * 2

      jest.runAllTimers();

      await promise;
    });

    it('should respect maximum delay', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new NetworkError('Failure'))
        .mockResolvedValue('success');

      const promise = RetryMechanism.retry(operation, {
        maxAttempts: 2,
        backoffStrategy: 'exponential',
        baseDelay: 1000,
        maxDelay: 500,
        jitter: false
      });

      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 500); // Capped at maxDelay

      jest.runAllTimers();

      await promise;
    });
  });
});

describe('Convenience functions', () => {
  describe('retryNetworkOperation', () => {
    it('should retry network operations', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new NetworkError('Network failed'))
        .mockResolvedValue('success');

      const promise = retryNetworkOperation(operation);

      jest.runAllTimers();

      const result = await promise;

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should not retry non-network errors', async () => {
      const operation = jest.fn().mockRejectedValue(new DatabaseError('DB failed'));

      await expect(retryNetworkOperation(operation)).rejects.toThrow('DB failed');
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });

  describe('retryDatabaseOperation', () => {
    it('should retry database operations', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new DatabaseError('DB connection failed'))
        .mockResolvedValue('success');

      const promise = retryDatabaseOperation(operation);

      jest.runAllTimers();

      const result = await promise;

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should not retry non-database errors', async () => {
      const operation = jest.fn().mockRejectedValue(new NetworkError('Network failed'));

      await expect(retryDatabaseOperation(operation)).rejects.toThrow('Network failed');
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });

  describe('retryExternalAPI', () => {
    it('should retry external API operations', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new ExternalAPIError('API timeout', 'TestAPI'))
        .mockResolvedValue('success');

      const promise = retryExternalAPI(operation);

      jest.runAllTimers();

      const result = await promise;

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should retry on 5xx errors', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('500 Internal Server Error'))
        .mockResolvedValue('success');

      const promise = retryExternalAPI(operation);

      jest.runAllTimers();

      const result = await promise;

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should not retry non-API errors', async () => {
      const operation = jest.fn().mockRejectedValue(new DatabaseError('DB failed'));

      await expect(retryExternalAPI(operation)).rejects.toThrow('DB failed');
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });
});