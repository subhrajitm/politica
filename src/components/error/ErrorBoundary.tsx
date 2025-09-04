/**
 * React Error Boundary component for graceful error handling
 * Provides fallback UI and error recovery mechanisms
 */

'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AppError, ErrorSeverity, ErrorCategory, createErrorContext } from '@/lib/errors';
import { ErrorFallback } from './ErrorFallback';
import { ErrorLogger } from './ErrorLogger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: AppError, errorInfo: ErrorInfo) => void;
  isolate?: boolean; // If true, only catches errors from direct children
  level?: 'page' | 'section' | 'component'; // Error boundary level for context
  name?: string; // Custom name for the boundary
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: AppError | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export interface ErrorFallbackProps {
  error: AppError;
  errorInfo: ErrorInfo | null;
  retry: () => void;
  canRetry: boolean;
  retryCount: number;
  level: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second

  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error: error instanceof AppError ? error : AppError.fromError(error),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, level = 'component', name } = this.props;
    
    // Create enhanced error with boundary context
    const context = createErrorContext(
      name || `ErrorBoundary-${level}`,
      'componentDidCatch',
      undefined,
      {
        level,
        componentStack: errorInfo.componentStack,
        errorBoundary: name || 'unnamed'
      }
    );

    // Always create a new AppError with boundary context
    const appError = AppError.fromError(error, context);

    // Update state with error info
    this.setState({
      error: appError,
      errorInfo
    });

    // Log the error
    ErrorLogger.logError(appError, errorInfo);

    // Call custom error handler if provided
    if (onError) {
      onError(appError, errorInfo);
    }

    // Report to external error tracking if available
    this.reportError(appError, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps, prevState: ErrorBoundaryState) {
    const { hasError } = this.state;
    const { children } = this.props;

    // If children change and we had an error, try to recover
    if (hasError && prevProps.children !== children) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: 0
      });
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private reportError = (error: AppError, errorInfo: ErrorInfo) => {
    // Report to external error tracking service
    // This could be integrated with services like Sentry, LogRocket, etc.
    if (typeof window !== 'undefined' && (window as any).errorTracker) {
      (window as any).errorTracker.captureException(error, {
        extra: {
          componentStack: errorInfo.componentStack,
          errorBoundary: this.props.name || 'unnamed',
          level: this.props.level || 'component'
        }
      });
    }
  };

  private handleRetry = () => {
    const { retryCount } = this.state;
    
    if (retryCount >= this.maxRetries) {
      return;
    }

    this.setState(prevState => ({
      retryCount: prevState.retryCount + 1
    }));

    // Add delay before retry to prevent rapid retries
    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null
      });
    }, this.retryDelay * (retryCount + 1)); // Exponential backoff
  };

  private canRetry = (): boolean => {
    const { error, retryCount } = this.state;
    
    if (retryCount >= this.maxRetries) {
      return false;
    }

    // Don't retry certain types of errors
    if (error) {
      if (error.category === ErrorCategory.AUTHORIZATION) {
        return false;
      }
      
      if (error.severity === ErrorSeverity.CRITICAL) {
        return false;
      }
    }

    return true;
  };

  render() {
    const { hasError, error, errorInfo, retryCount } = this.state;
    const { children, fallback: FallbackComponent = ErrorFallback, level = 'component' } = this.props;

    if (hasError && error) {
      return (
        <FallbackComponent
          error={error}
          errorInfo={errorInfo}
          retry={this.handleRetry}
          canRetry={this.canRetry()}
          retryCount={retryCount}
          level={level}
        />
      );
    }

    return children;
  }
}

// Higher-order component for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WithErrorBoundaryComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithErrorBoundaryComponent;
}

// Specialized error boundaries for different levels
export const PageErrorBoundary: React.FC<Omit<ErrorBoundaryProps, 'level'>> = (props) => (
  <ErrorBoundary {...props} level="page" />
);

export const SectionErrorBoundary: React.FC<Omit<ErrorBoundaryProps, 'level'>> = (props) => (
  <ErrorBoundary {...props} level="section" />
);

export const ComponentErrorBoundary: React.FC<Omit<ErrorBoundaryProps, 'level'>> = (props) => (
  <ErrorBoundary {...props} level="component" />
);