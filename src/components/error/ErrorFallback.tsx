/**
 * Error Fallback UI components for different error scenarios
 * Provides user-friendly error messages and recovery options
 */

'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AppError, ErrorSeverity, ErrorCategory } from '@/lib/errors';
import { ErrorFallbackProps } from './ErrorBoundary';

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  retry,
  canRetry,
  retryCount,
  level
}) => {
  const getErrorIcon = () => {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        return <AlertTriangle className="h-8 w-8 text-red-500" />;
      case ErrorSeverity.HIGH:
        return <AlertTriangle className="h-8 w-8 text-orange-500" />;
      case ErrorSeverity.MEDIUM:
        return <AlertTriangle className="h-8 w-8 text-yellow-500" />;
      default:
        return <Bug className="h-8 w-8 text-blue-500" />;
    }
  };

  const getErrorTitle = () => {
    switch (level) {
      case 'page':
        return 'Page Error';
      case 'section':
        return 'Section Error';
      default:
        return 'Component Error';
    }
  };

  const getErrorDescription = () => {
    if (error.userMessage) {
      return error.userMessage;
    }

    switch (error.category) {
      case ErrorCategory.NETWORK:
        return 'A network error occurred. Please check your connection and try again.';
      case ErrorCategory.DATABASE:
        return 'A data access error occurred. Please try again in a moment.';
      case ErrorCategory.AUTHENTICATION:
        return 'Authentication is required. Please sign in to continue.';
      case ErrorCategory.AUTHORIZATION:
        return 'You do not have permission to access this resource.';
      case ErrorCategory.VALIDATION:
        return 'Invalid data was provided. Please check your input.';
      case ErrorCategory.EXTERNAL_API:
        return 'An external service is temporarily unavailable. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  const handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  const showDetailedError = process.env.NODE_ENV === 'development';

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getErrorIcon()}
          </div>
          <CardTitle className="text-xl font-semibold">
            {getErrorTitle()}
          </CardTitle>
          <CardDescription>
            {getErrorDescription()}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error.recoveryStrategy?.fallbackData && (
            <Alert>
              <AlertDescription>
                Showing cached data. Some information may be outdated.
              </AlertDescription>
            </Alert>
          )}

          {retryCount > 0 && (
            <Alert>
              <AlertDescription>
                Retry attempt {retryCount} of 3
              </AlertDescription>
            </Alert>
          )}

          {showDetailedError && (
            <details className="text-sm text-gray-600">
              <summary className="cursor-pointer font-medium">
                Technical Details
              </summary>
              <div className="mt-2 p-3 bg-gray-50 rounded border">
                <p><strong>Error:</strong> {error.message}</p>
                <p><strong>Code:</strong> {error.code}</p>
                <p><strong>Category:</strong> {error.category}</p>
                <p><strong>Severity:</strong> {error.severity}</p>
                {error.context.component && (
                  <p><strong>Component:</strong> {error.context.component}</p>
                )}
                {error.context.action && (
                  <p><strong>Action:</strong> {error.context.action}</p>
                )}
              </div>
            </details>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <div className="flex space-x-2 w-full">
            {canRetry && (
              <Button 
                onClick={retry} 
                className="flex-1"
                variant="default"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            
            {level === 'page' ? (
              <Button 
                onClick={handleGoHome} 
                variant="outline"
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            ) : (
              <Button 
                onClick={handleGoBack} 
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            )}
          </div>

          {error.category === ErrorCategory.AUTHENTICATION && (
            <Button 
              onClick={() => window.location.href = '/auth/login'} 
              className="w-full"
              variant="secondary"
            >
              Sign In
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

// Specialized fallback components for different scenarios
export const NetworkErrorFallback: React.FC<ErrorFallbackProps> = (props) => (
  <div className="flex items-center justify-center min-h-[200px] p-4">
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
        <CardTitle>Connection Issue</CardTitle>
        <CardDescription>
          Unable to connect to the server. Please check your internet connection.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        {props.canRetry && (
          <Button onClick={props.retry} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Connection
          </Button>
        )}
      </CardFooter>
    </Card>
  </div>
);

export const LoadingErrorFallback: React.FC<ErrorFallbackProps> = (props) => (
  <div className="flex items-center justify-center min-h-[200px] p-4">
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <Bug className="h-8 w-8 text-blue-500 mx-auto mb-2" />
        <CardTitle>Loading Failed</CardTitle>
        <CardDescription>
          Failed to load content. This might be a temporary issue.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        {props.canRetry && (
          <Button onClick={props.retry} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardFooter>
    </Card>
  </div>
);

export const MinimalErrorFallback: React.FC<ErrorFallbackProps> = ({ error, retry, canRetry }) => (
  <div className="flex items-center justify-center p-4 border border-red-200 bg-red-50 rounded">
    <div className="text-center">
      <p className="text-red-800 mb-2">{error.userMessage}</p>
      {canRetry && (
        <Button onClick={retry} size="sm" variant="outline">
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      )}
    </div>
  </div>
);