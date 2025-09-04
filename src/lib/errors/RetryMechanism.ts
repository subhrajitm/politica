/**
 * Retry mechanism with exponential backoff
 * Provides configurable retry strategies for failed operations
 */

import { AppError, ErrorCategory } from './AppError';

export interface RetryOptions {
  maxAttempts: number;
  backoffStrategy: 'exponential' | 'linear' | 'fixed';
  baseDelay: number;
  maxDelay: number;
  jitter?: boolean;
  retryCondition?: (error: Error) => boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
}

export class RetryMechanism {
  private static readonly DEFAULT_OPTIONS: RetryOptions = {
    maxAttempts: 3,
    backoffStrategy: 'exponential',
    baseDelay: 1000,
    maxDelay: 30000,
    jitter: true,
    retryCondition: (error: Error) => {
      // Default: retry on network errors and temporary failures
      if (error instanceof AppError) {
        return error.category === ErrorCategory.NETWORK || 
               error.category === ErrorCategory.EXTERNAL_API ||
               error.recoverable;
      }
      return true;
    }
  };

  /**
   * Execute an operation with retry logic
   */
  public static async retry<T>(
    operation: () => Promise<T>,
    options: Partial<RetryOptions> = {}
  ): Promise<T> {
    const config = { ...this.DEFAULT_OPTIONS, ...options };
    const startTime = Date.now();
    let lastError: Error;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        const result = await operation();
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Check if we should retry this error
        if (!config.retryCondition!(lastError)) {
          throw lastError;
        }

        // Don't retry on the last attempt
        if (attempt === config.maxAttempts) {
          break;
        }

        // Calculate delay for next attempt
        const delay = this.calculateDelay(attempt, config);
        
        // Call retry callback if provided
        if (config.onRetry) {
          config.onRetry(attempt, lastError);
        }

        // Wait before next attempt
        await this.sleep(delay);
      }
    }

    // All attempts failed
    const totalTime = Date.now() - startTime;
    throw new AppError(
      `Operation failed after ${config.maxAttempts} attempts`,
      'RETRY_EXHAUSTED',
      lastError instanceof AppError ? lastError.severity : 'HIGH' as any,
      lastError instanceof AppError ? lastError.category : ErrorCategory.SYSTEM,
      {
        metadata: {
          attempts: config.maxAttempts,
          totalTime,
          lastError: lastError.message
        }
      },
      { originalError: lastError }
    );
  }

  /**
   * Execute an operation with retry logic and return detailed result
   */
  public static async retryWithResult<T>(
    operation: () => Promise<T>,
    options: Partial<RetryOptions> = {}
  ): Promise<RetryResult<T>> {
    const config = { ...this.DEFAULT_OPTIONS, ...options };
    const startTime = Date.now();
    let lastError: Error;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        const result = await operation();
        return {
          success: true,
          result,
          attempts: attempt,
          totalTime: Date.now() - startTime
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Check if we should retry this error
        if (!config.retryCondition!(lastError)) {
          return {
            success: false,
            error: lastError,
            attempts: attempt,
            totalTime: Date.now() - startTime
          };
        }

        // Don't retry on the last attempt
        if (attempt === config.maxAttempts) {
          break;
        }

        // Calculate delay for next attempt
        const delay = this.calculateDelay(attempt, config);
        
        // Call retry callback if provided
        if (config.onRetry) {
          config.onRetry(attempt, lastError);
        }

        // Wait before next attempt
        await this.sleep(delay);
      }
    }

    return {
      success: false,
      error: lastError!,
      attempts: config.maxAttempts,
      totalTime: Date.now() - startTime
    };
  }

  private static calculateDelay(attempt: number, options: RetryOptions): number {
    let delay: number;

    switch (options.backoffStrategy) {
      case 'exponential':
        delay = options.baseDelay * Math.pow(2, attempt - 1);
        break;
      case 'linear':
        delay = options.baseDelay * attempt;
        break;
      case 'fixed':
      default:
        delay = options.baseDelay;
        break;
    }

    // Apply maximum delay limit
    delay = Math.min(delay, options.maxDelay);

    // Add jitter to prevent thundering herd
    if (options.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    return Math.floor(delay);
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Convenience functions for common retry scenarios
export const retryNetworkOperation = <T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> => {
  return RetryMechanism.retry(operation, {
    maxAttempts,
    backoffStrategy: 'exponential',
    baseDelay: 1000,
    maxDelay: 10000,
    retryCondition: (error) => {
      if (error instanceof AppError) {
        return error.category === ErrorCategory.NETWORK;
      }
      return error.message.includes('fetch') || error.message.includes('network');
    }
  });
};

export const retryDatabaseOperation = <T>(
  operation: () => Promise<T>,
  maxAttempts: number = 2
): Promise<T> => {
  return RetryMechanism.retry(operation, {
    maxAttempts,
    backoffStrategy: 'exponential',
    baseDelay: 500,
    maxDelay: 5000,
    retryCondition: (error) => {
      if (error instanceof AppError) {
        return error.category === ErrorCategory.DATABASE;
      }
      return error.message.includes('database') || error.message.includes('connection');
    }
  });
};

export const retryExternalAPI = <T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> => {
  return RetryMechanism.retry(operation, {
    maxAttempts,
    backoffStrategy: 'exponential',
    baseDelay: 2000,
    maxDelay: 30000,
    retryCondition: (error) => {
      if (error instanceof AppError) {
        return error.category === ErrorCategory.EXTERNAL_API;
      }
      // Retry on 5xx errors and network issues
      return error.message.includes('5') || error.message.includes('timeout');
    }
  });
};