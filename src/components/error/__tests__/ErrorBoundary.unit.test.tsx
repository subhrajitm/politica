/**
 * Unit tests for ErrorBoundary core functionality
 * Tests without UI dependencies
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppError, ErrorCategory, ErrorSeverity } from '@/lib/errors';

// Mock the ErrorLogger to avoid side effects
jest.mock('../ErrorLogger', () => ({
  ErrorLogger: {
    logError: jest.fn()
  }
}));

// Mock the ErrorFallback to avoid lucide-react dependency
jest.mock('../ErrorFallback', () => ({
  ErrorFallback: ({ error }: any) => (
    <div>
      <h2>Error Fallback</h2>
      <p>{error.userMessage}</p>
    </div>
  )
}));

// Import after mocking
import { ErrorBoundary } from '../ErrorBoundary';

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

// Simple component that throws an error
const ErrorThrowingComponent: React.FC<{ shouldThrow?: boolean; error?: Error }> = ({ 
  shouldThrow = false, 
  error = new Error('Test error') 
}) => {
  if (shouldThrow) {
    throw error;
  }
  return <div>No error occurred</div>;
};

// Simple fallback component for testing
const SimpleFallback: React.FC<any> = ({ error }) => (
  <div>
    <h2>Custom Error</h2>
    <p>{error.userMessage}</p>
  </div>
);

describe('ErrorBoundary Core Functionality', () => {
  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error occurred')).toBeInTheDocument();
  });

  it('should catch and display errors with default fallback', () => {
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error Fallback')).toBeInTheDocument();
  });

  it('should use custom fallback component', () => {
    render(
      <ErrorBoundary fallback={SimpleFallback}>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error')).toBeInTheDocument();
  });

  it('should call onError callback when error occurs', () => {
    const onError = jest.fn();

    render(
      <ErrorBoundary onError={onError} fallback={SimpleFallback}>
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

  it('should handle AppError correctly', () => {
    const appError = new AppError(
      'Test app error',
      'TEST_ERROR',
      ErrorSeverity.HIGH,
      ErrorCategory.NETWORK,
      {},
      { userMessage: 'Custom user message' }
    );

    render(
      <ErrorBoundary fallback={SimpleFallback}>
        <ErrorThrowingComponent shouldThrow={true} error={appError} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    expect(screen.getByText('Custom user message')).toBeInTheDocument();
  });

  it('should convert generic errors to AppError', () => {
    const genericError = new Error('Generic error message');

    render(
      <ErrorBoundary fallback={SimpleFallback}>
        <ErrorThrowingComponent shouldThrow={true} error={genericError} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    // Should show default user message for converted errors
    expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
  });

  it('should include boundary context in error', () => {
    const onError = jest.fn();
    const boundaryName = 'TestBoundary';

    render(
      <ErrorBoundary 
        name={boundaryName} 
        level="section" 
        onError={onError}
        fallback={SimpleFallback}
      >
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
    
    // Get the actual error that was passed
    const [actualError] = onError.mock.calls[0];
    
    expect(actualError).toBeInstanceOf(AppError);
    expect(actualError.context.component).toBe(`${boundaryName}`);
    expect(actualError.context.metadata.level).toBe('section');
    expect(actualError.context.metadata.errorBoundary).toBe(boundaryName);
  });
});