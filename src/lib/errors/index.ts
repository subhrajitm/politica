/**
 * Error handling utilities for PolitiFind
 * Comprehensive error management with retry mechanisms and circuit breakers
 */

// Core error types and classes
export {
  AppError,
  ErrorSeverity,
  ErrorCategory,
  ErrorContext,
  ErrorRecoveryStrategy,
  NetworkError,
  DatabaseError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  ExternalAPIError
} from './AppError';

// Retry mechanism
export {
  RetryMechanism,
  RetryOptions,
  RetryResult,
  retryNetworkOperation,
  retryDatabaseOperation,
  retryExternalAPI
} from './RetryMechanism';

// Circuit breaker pattern
export {
  CircuitBreaker,
  CircuitState,
  CircuitBreakerConfig,
  CircuitBreakerStats,
  CircuitBreakerManager,
  withCircuitBreaker
} from './CircuitBreaker';

// Utility functions for common error handling scenarios
export const createErrorContext = (
  component?: string,
  action?: string,
  userId?: string,
  metadata?: Record<string, any>
): Partial<ErrorContext> => ({
  component,
  action,
  userId,
  metadata,
  timestamp: new Date(),
  url: typeof window !== 'undefined' ? window.location.href : undefined,
  userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
});

// Import the classes for use in factory functions
import { AppError, NetworkError, DatabaseError, ValidationError } from './AppError';

// Error handler factory for consistent error handling across the application
export const createErrorHandler = (component: string) => {
  return {
    handleError: (error: Error, action?: string, metadata?: Record<string, any>) => {
      const context = createErrorContext(component, action, undefined, metadata);
      return AppError.fromError(error, context);
    },
    
    handleNetworkError: (error: Error, action?: string) => {
      const context = createErrorContext(component, action);
      return new NetworkError(error.message, context);
    },
    
    handleDatabaseError: (error: Error, action?: string) => {
      const context = createErrorContext(component, action);
      return new DatabaseError(error.message, context);
    },
    
    handleValidationError: (message: string, field?: string, action?: string) => {
      const context = createErrorContext(component, action);
      return new ValidationError(message, field, context);
    }
  };
};