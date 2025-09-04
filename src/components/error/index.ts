/**
 * Error handling components and utilities
 * Provides React error boundaries, fallback UI, logging, and recovery mechanisms
 */

// Error Boundary components
export {
  ErrorBoundary,
  PageErrorBoundary,
  SectionErrorBoundary,
  ComponentErrorBoundary,
  withErrorBoundary,
  type ErrorFallbackProps
} from './ErrorBoundary';

// Error Fallback UI components
export {
  ErrorFallback,
  NetworkErrorFallback,
  LoadingErrorFallback,
  MinimalErrorFallback
} from './ErrorFallback';

// Error logging utilities
export {
  ErrorLogger,
  useErrorLogger,
  type ErrorLogEntry,
  type ErrorBreadcrumb
} from './ErrorLogger';

// Error recovery mechanisms
export {
  useErrorRecovery,
  AsyncErrorRecovery,
  RecoveryStatus,
  withErrorRecovery,
  createRecoveryStrategy,
  type ErrorRecoveryStrategy,
  type RecoveryOptions
} from './ErrorRecovery';