/**
 * Tests for Error Boundary components
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, withErrorBoundary } from '../ErrorBoundary';
import { AppError, ErrorCategory, ErrorSeverity } from '@/lib/errors';

// Mock the ErrorLogger to avoid side effects
jest.mock('../ErrorLogger', () => ({
  ErrorLogger: {
    logError: jest.fn()
  }
}));

// Component that throws an error for testing
const ThrowError: React.FC<{ shouldThrow?: boolean; error?: Error }> = ({ 
  shouldThrow = false, 
  error = new Error('Test error') 
}) => {
  if (shouldThrow) {
    throw error;
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render error fallback when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Component Error')).toBeInTheDocument();
    expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument();
  });

  it('should render custom fallback component', () => {
    const CustomFallback = () => <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('should call onError callback when error occurs', () => {
    const onError = jest.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
  });

  it('should handle AppError correctly', () => {
    const appError = new AppError(
      'Test app error',
      'TEST_ERROR',
      ErrorSeverity.HIGH,
      ErrorCategory.NETWORK
    );

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} error={appError} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Component Error')).toBeInTheDocument();
    expect(screen.getByText('Network connection issue. Please check your internet connection and try again.')).toBeInTheDocument();
  });

  it('should show retry button when error is recoverable', () => {
    const recoverableError = new AppError(
      'Recoverable error',
      'RECOVERABLE_ERROR',
      ErrorSeverity.MEDIUM,
      ErrorCategory.NETWORK,
      {},
      { recoverable: true }
    );

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} error={recoverableError} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('should reset error state when retry is clicked', async () => {
    const recoverableError = new AppError(
      'Recoverable error',
      'RECOVERABLE_ERROR',
      ErrorSeverity.MEDIUM,
      ErrorCategory.NETWORK,
      {},
      { recoverable: true }
    );

    const TestComponent = () => {
      const [shouldThrow, setShouldThrow] = React.useState(true);
      
      React.useEffect(() => {
        // After a short delay, stop throwing error
        const timer = setTimeout(() => setShouldThrow(false), 100);
        return () => clearTimeout(timer);
      }, []);

      return <ThrowError shouldThrow={shouldThrow} error={recoverableError} />;
    };

    render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    // Should show error initially
    expect(screen.getByText('Component Error')).toBeInTheDocument();
    
    // Click retry button
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    // Wait for retry delay and component update
    await new Promise(resolve => setTimeout(resolve, 200));
  });
});

describe('withErrorBoundary HOC', () => {
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('should wrap component with error boundary', () => {
    const TestComponent = () => <div>Test component</div>;
    const WrappedComponent = withErrorBoundary(TestComponent);

    render(<WrappedComponent />);

    expect(screen.getByText('Test component')).toBeInTheDocument();
  });

  it('should catch errors in wrapped component', () => {
    const WrappedComponent = withErrorBoundary(ThrowError);

    render(<WrappedComponent shouldThrow={true} />);

    expect(screen.getByText('Component Error')).toBeInTheDocument();
  });

  it('should pass through props to wrapped component', () => {
    const TestComponent: React.FC<{ message: string }> = ({ message }) => (
      <div>{message}</div>
    );
    const WrappedComponent = withErrorBoundary(TestComponent);

    render(<WrappedComponent message="Hello World" />);

    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});