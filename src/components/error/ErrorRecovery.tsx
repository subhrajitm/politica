/**
 * Error recovery mechanisms and strategies
 * Provides automated and manual recovery options for different error types
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppError, ErrorCategory, RetryMechanism, withCircuitBreaker } from '@/lib/errors';
import { ErrorLogger } from './ErrorLogger';

export interface ErrorRecoveryStrategy {
  canRecover: boolean;
  recoveryAction?: () => Promise<void>;
  fallbackData?: any;
  userMessage: string;
  autoRetry?: boolean;
  retryDelay?: number;
}

export interface RecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  fallbackData?: any;
  onRecovery?: (success: boolean) => void;
}

// Hook for automatic error recovery
export const useErrorRecovery = (
  operation: () => Promise<any>,
  options: RecoveryOptions = {}
) => {
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);
  const [lastError, setLastError] = useState<AppError | null>(null);
  const [data, setData] = useState(options.fallbackData);

  const {
    maxRetries = 3,
    retryDelay = 1000,
    fallbackData,
    onRecovery
  } = options;

  const executeWithRecovery = useCallback(async () => {
    setIsRecovering(true);
    setLastError(null);

    try {
      const result = await RetryMechanism.retry(operation, {
        maxAttempts: maxRetries,
        baseDelay: retryDelay,
        backoffStrategy: 'exponential',
        onRetry: (attempt, error) => {
          setRecoveryAttempts(attempt);
          ErrorLogger.addBreadcrumb(
            'recovery',
            `Recovery attempt ${attempt}`,
            'warning',
            { error: error.message }
          );
        }
      });

      setData(result);
      setRecoveryAttempts(0);
      onRecovery?.(true);
      return result;
    } catch (error) {
      const appError = error instanceof AppError ? error : AppError.fromError(error as Error);
      setLastError(appError);
      
      // Use fallback data if available
      if (fallbackData !== undefined) {
        setData(fallbackData);
        ErrorLogger.addBreadcrumb(
          'recovery',
          'Using fallback data',
          'warning',
          { error: appError.message }
        );
      }

      onRecovery?.(false);
      throw appError;
    } finally {
      setIsRecovering(false);
    }
  }, [operation, maxRetries, retryDelay, fallbackData, onRecovery]);

  return {
    executeWithRecovery,
    isRecovering,
    recoveryAttempts,
    lastError,
    data,
    canRetry: recoveryAttempts < maxRetries
  };
};

// Component for handling async operations with recovery
export const AsyncErrorRecovery: React.FC<{
  children: (state: {
    execute: () => Promise<any>;
    isLoading: boolean;
    error: AppError | null;
    data: any;
    retry: () => void;
    canRetry: boolean;
  }) => React.ReactNode;
  operation: () => Promise<any>;
  options?: RecoveryOptions;
}> = ({ children, operation, options = {} }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [data, setData] = useState(options.fallbackData);
  const [retryCount, setRetryCount] = useState(0);

  const { maxRetries = 3 } = options;

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await operation();
      setData(result);
      setRetryCount(0);
      return result;
    } catch (err) {
      const appError = err instanceof AppError ? err : AppError.fromError(err as Error);
      setError(appError);
      
      // Use fallback data if available
      if (options.fallbackData !== undefined) {
        setData(options.fallbackData);
      }
      
      throw appError;
    } finally {
      setIsLoading(false);
    }
  }, [operation, options.fallbackData]);

  const retry = useCallback(async () => {
    if (retryCount >= maxRetries) return;
    
    setRetryCount(prev => prev + 1);
    await execute();
  }, [execute, retryCount, maxRetries]);

  return (
    <>
      {children({
        execute,
        isLoading,
        error,
        data,
        retry,
        canRetry: retryCount < maxRetries
      })}
    </>
  );
};

// Recovery strategies for different error types
export const createRecoveryStrategy = (error: AppError): ErrorRecoveryStrategy => {
  switch (error.category) {
    case ErrorCategory.NETWORK:
      return {
        canRecover: true,
        userMessage: 'Connection issue detected. Retrying automatically...',
        autoRetry: true,
        retryDelay: 2000,
        recoveryAction: async () => {
          // Wait for network to be available
          if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
            while (!navigator.onLine) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }
      };

    case ErrorCategory.DATABASE:
      return {
        canRecover: true,
        userMessage: 'Data access issue. Retrying with cached data...',
        autoRetry: true,
        retryDelay: 1000,
        recoveryAction: async () => {
          // Could implement cache warming or connection retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      };

    case ErrorCategory.EXTERNAL_API:
      return {
        canRecover: true,
        userMessage: 'External service temporarily unavailable. Retrying...',
        autoRetry: true,
        retryDelay: 5000,
        recoveryAction: async () => {
          // Could implement service health check
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      };

    case ErrorCategory.AUTHENTICATION:
      return {
        canRecover: true,
        userMessage: 'Authentication expired. Please sign in again.',
        autoRetry: false,
        recoveryAction: async () => {
          // Redirect to login or refresh token
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
      };

    case ErrorCategory.AUTHORIZATION:
      return {
        canRecover: false,
        userMessage: 'You do not have permission to access this resource.',
        autoRetry: false
      };

    case ErrorCategory.VALIDATION:
      return {
        canRecover: false,
        userMessage: 'Please correct the input errors and try again.',
        autoRetry: false
      };

    default:
      return {
        canRecover: true,
        userMessage: 'An error occurred. Retrying...',
        autoRetry: true,
        retryDelay: 1000
      };
  }
};

// Component for displaying recovery status
export const RecoveryStatus: React.FC<{
  isRecovering: boolean;
  recoveryAttempts: number;
  maxRetries: number;
  error?: AppError | null;
}> = ({ isRecovering, recoveryAttempts, maxRetries, error }) => {
  if (!isRecovering && recoveryAttempts === 0) return null;

  const strategy = error ? createRecoveryStrategy(error) : null;

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded p-2">
      {isRecovering && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
      )}
      <span>
        {isRecovering
          ? strategy?.userMessage || 'Recovering...'
          : `Recovery attempt ${recoveryAttempts} of ${maxRetries}`
        }
      </span>
    </div>
  );
};

// Higher-order component for adding recovery to any component
export const withErrorRecovery = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  recoveryOptions: RecoveryOptions = {}
) => {
  return React.forwardRef<any, P>((props, ref) => {
    const [error, setError] = useState<AppError | null>(null);
    const [isRecovering, setIsRecovering] = useState(false);

    const handleError = useCallback((error: Error) => {
      const appError = error instanceof AppError ? error : AppError.fromError(error);
      setError(appError);
      
      const strategy = createRecoveryStrategy(appError);
      
      if (strategy.canRecover && strategy.autoRetry) {
        setIsRecovering(true);
        
        setTimeout(async () => {
          try {
            if (strategy.recoveryAction) {
              await strategy.recoveryAction();
            }
            setError(null);
            recoveryOptions.onRecovery?.(true);
          } catch (recoveryError) {
            recoveryOptions.onRecovery?.(false);
          } finally {
            setIsRecovering(false);
          }
        }, strategy.retryDelay || 1000);
      }
    }, [recoveryOptions]);

    if (error && !isRecovering) {
      const strategy = createRecoveryStrategy(error);
      
      if (!strategy.canRecover) {
        throw error; // Let error boundary handle it
      }
    }

    return (
      <>
        {isRecovering && (
          <RecoveryStatus
            isRecovering={isRecovering}
            recoveryAttempts={1}
            maxRetries={1}
            error={error}
          />
        )}
        <WrappedComponent
          {...props}
          ref={ref}
          onError={handleError}
        />
      </>
    );
  });
};