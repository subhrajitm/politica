/**
 * Enhanced error handling system for PolitiFind
 * Provides structured error classification and context
 */

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  NETWORK = 'network',
  DATABASE = 'database',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  EXTERNAL_API = 'external_api',
  SYSTEM = 'system',
  USER_INPUT = 'user_input'
}

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  userAgent?: string;
  url?: string;
}

export interface ErrorRecoveryStrategy {
  canRecover: boolean;
  recoveryAction?: () => Promise<void>;
  fallbackData?: any;
  userMessage: string;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly context: ErrorContext;
  public readonly recoverable: boolean;
  public readonly userMessage: string;
  public readonly originalError?: Error;
  public readonly recoveryStrategy?: ErrorRecoveryStrategy;

  constructor(
    message: string,
    code: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    category: ErrorCategory = ErrorCategory.SYSTEM,
    context: Partial<ErrorContext> = {},
    options: {
      recoverable?: boolean;
      userMessage?: string;
      originalError?: Error;
      recoveryStrategy?: ErrorRecoveryStrategy;
    } = {}
  ) {
    super(message);
    
    this.name = 'AppError';
    this.code = code;
    this.severity = severity;
    this.category = category;
    this.context = {
      timestamp: new Date(),
      ...context
    };
    this.recoverable = options.recoverable ?? false;
    this.userMessage = options.userMessage ?? this.getDefaultUserMessage();
    this.originalError = options.originalError;
    this.recoveryStrategy = options.recoveryStrategy;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  private getDefaultUserMessage(): string {
    switch (this.category) {
      case ErrorCategory.NETWORK:
        return 'Network connection issue. Please check your internet connection and try again.';
      case ErrorCategory.DATABASE:
        return 'Data access issue. Please try again in a moment.';
      case ErrorCategory.AUTHENTICATION:
        return 'Authentication required. Please sign in to continue.';
      case ErrorCategory.AUTHORIZATION:
        return 'You do not have permission to perform this action.';
      case ErrorCategory.VALIDATION:
        return 'Please check your input and try again.';
      case ErrorCategory.EXTERNAL_API:
        return 'External service temporarily unavailable. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      category: this.category,
      context: this.context,
      recoverable: this.recoverable,
      userMessage: this.userMessage,
      stack: this.stack,
      originalError: this.originalError?.message
    };
  }

  public static fromError(error: Error, context: Partial<ErrorContext> = {}): AppError {
    if (error instanceof AppError) {
      return error;
    }

    // Map common error types to categories
    let category = ErrorCategory.SYSTEM;
    let severity = ErrorSeverity.MEDIUM;

    if (error.message.includes('fetch') || error.message.includes('network')) {
      category = ErrorCategory.NETWORK;
    } else if (error.message.includes('unauthorized') || error.message.includes('auth')) {
      category = ErrorCategory.AUTHENTICATION;
      severity = ErrorSeverity.HIGH;
    } else if (error.message.includes('forbidden')) {
      category = ErrorCategory.AUTHORIZATION;
      severity = ErrorSeverity.HIGH;
    }

    return new AppError(
      error.message,
      'UNKNOWN_ERROR',
      severity,
      category,
      context,
      { originalError: error }
    );
  }
}

// Predefined error types for common scenarios
export class NetworkError extends AppError {
  constructor(message: string, context: Partial<ErrorContext> = {}) {
    super(
      message,
      'NETWORK_ERROR',
      ErrorSeverity.MEDIUM,
      ErrorCategory.NETWORK,
      context,
      { 
        recoverable: true,
        userMessage: 'Network connection issue. Please check your internet connection and try again.'
      }
    );
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, context: Partial<ErrorContext> = {}) {
    super(
      message,
      'DATABASE_ERROR',
      ErrorSeverity.HIGH,
      ErrorCategory.DATABASE,
      context,
      { 
        recoverable: true,
        userMessage: 'Data access issue. Please try again in a moment.'
      }
    );
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string, context: Partial<ErrorContext> = {}) {
    super(
      message,
      'VALIDATION_ERROR',
      ErrorSeverity.LOW,
      ErrorCategory.VALIDATION,
      { ...context, metadata: { field, ...context.metadata } },
      { 
        recoverable: true,
        userMessage: message
      }
    );
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, context: Partial<ErrorContext> = {}) {
    super(
      message,
      'AUTHENTICATION_ERROR',
      ErrorSeverity.HIGH,
      ErrorCategory.AUTHENTICATION,
      context,
      { 
        recoverable: true,
        userMessage: 'Authentication required. Please sign in to continue.'
      }
    );
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string, context: Partial<ErrorContext> = {}) {
    super(
      message,
      'AUTHORIZATION_ERROR',
      ErrorSeverity.HIGH,
      ErrorCategory.AUTHORIZATION,
      context,
      { 
        recoverable: false,
        userMessage: 'You do not have permission to perform this action.'
      }
    );
  }
}

export class ExternalAPIError extends AppError {
  constructor(message: string, apiName: string, context: Partial<ErrorContext> = {}) {
    super(
      message,
      'EXTERNAL_API_ERROR',
      ErrorSeverity.MEDIUM,
      ErrorCategory.EXTERNAL_API,
      { ...context, metadata: { apiName, ...context.metadata } },
      { 
        recoverable: true,
        userMessage: 'External service temporarily unavailable. Please try again later.'
      }
    );
  }
}