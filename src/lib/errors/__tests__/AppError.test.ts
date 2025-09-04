/**
 * Unit tests for AppError class and related error types
 */

import { 
  AppError, 
  ErrorSeverity, 
  ErrorCategory,
  NetworkError,
  DatabaseError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  ExternalAPIError
} from '../AppError';

describe('AppError', () => {
  describe('constructor', () => {
    it('should create an AppError with required parameters', () => {
      const error = new AppError(
        'Test error message',
        'TEST_ERROR',
        ErrorSeverity.HIGH,
        ErrorCategory.SYSTEM
      );

      expect(error.message).toBe('Test error message');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.category).toBe(ErrorCategory.SYSTEM);
      expect(error.recoverable).toBe(false);
      expect(error.context.timestamp).toBeInstanceOf(Date);
    });

    it('should create an AppError with default values', () => {
      const error = new AppError('Test error', 'TEST_ERROR');

      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.category).toBe(ErrorCategory.SYSTEM);
      expect(error.recoverable).toBe(false);
      expect(error.userMessage).toBe('An unexpected error occurred. Please try again.');
    });

    it('should create an AppError with custom context', () => {
      const context = {
        userId: 'user123',
        component: 'TestComponent',
        metadata: { key: 'value' }
      };

      const error = new AppError(
        'Test error',
        'TEST_ERROR',
        ErrorSeverity.LOW,
        ErrorCategory.VALIDATION,
        context
      );

      expect(error.context.userId).toBe('user123');
      expect(error.context.component).toBe('TestComponent');
      expect(error.context.metadata).toEqual({ key: 'value' });
    });

    it('should create an AppError with recovery strategy', () => {
      const recoveryStrategy = {
        canRecover: true,
        userMessage: 'Custom recovery message',
        fallbackData: { data: 'fallback' }
      };

      const error = new AppError(
        'Test error',
        'TEST_ERROR',
        ErrorSeverity.MEDIUM,
        ErrorCategory.NETWORK,
        {},
        { recoveryStrategy }
      );

      expect(error.recoveryStrategy).toEqual(recoveryStrategy);
    });
  });

  describe('getDefaultUserMessage', () => {
    it('should return appropriate message for network errors', () => {
      const error = new AppError('Network error', 'NET_ERROR', ErrorSeverity.MEDIUM, ErrorCategory.NETWORK);
      expect(error.userMessage).toBe('Network connection issue. Please check your internet connection and try again.');
    });

    it('should return appropriate message for database errors', () => {
      const error = new AppError('DB error', 'DB_ERROR', ErrorSeverity.HIGH, ErrorCategory.DATABASE);
      expect(error.userMessage).toBe('Data access issue. Please try again in a moment.');
    });

    it('should return appropriate message for authentication errors', () => {
      const error = new AppError('Auth error', 'AUTH_ERROR', ErrorSeverity.HIGH, ErrorCategory.AUTHENTICATION);
      expect(error.userMessage).toBe('Authentication required. Please sign in to continue.');
    });

    it('should return appropriate message for authorization errors', () => {
      const error = new AppError('Authz error', 'AUTHZ_ERROR', ErrorSeverity.HIGH, ErrorCategory.AUTHORIZATION);
      expect(error.userMessage).toBe('You do not have permission to perform this action.');
    });

    it('should return appropriate message for validation errors', () => {
      const error = new AppError('Validation error', 'VAL_ERROR', ErrorSeverity.LOW, ErrorCategory.VALIDATION);
      expect(error.userMessage).toBe('Please check your input and try again.');
    });

    it('should return appropriate message for external API errors', () => {
      const error = new AppError('API error', 'API_ERROR', ErrorSeverity.MEDIUM, ErrorCategory.EXTERNAL_API);
      expect(error.userMessage).toBe('External service temporarily unavailable. Please try again later.');
    });
  });

  describe('toJSON', () => {
    it('should serialize error to JSON', () => {
      const error = new AppError(
        'Test error',
        'TEST_ERROR',
        ErrorSeverity.HIGH,
        ErrorCategory.SYSTEM,
        { userId: 'user123' }
      );

      const json = error.toJSON();

      expect(json.name).toBe('AppError');
      expect(json.message).toBe('Test error');
      expect(json.code).toBe('TEST_ERROR');
      expect(json.severity).toBe(ErrorSeverity.HIGH);
      expect(json.category).toBe(ErrorCategory.SYSTEM);
      expect(json.context.userId).toBe('user123');
      expect(json.recoverable).toBe(false);
      expect(json.stack).toBeDefined();
    });
  });

  describe('fromError', () => {
    it('should return the same AppError if input is already AppError', () => {
      const originalError = new AppError('Original', 'ORIG_ERROR');
      const result = AppError.fromError(originalError);

      expect(result).toBe(originalError);
    });

    it('should convert generic Error to AppError', () => {
      const genericError = new Error('Generic error message');
      const appError = AppError.fromError(genericError, { userId: 'user123' });

      expect(appError).toBeInstanceOf(AppError);
      expect(appError.message).toBe('Generic error message');
      expect(appError.code).toBe('UNKNOWN_ERROR');
      expect(appError.category).toBe(ErrorCategory.SYSTEM);
      expect(appError.context.userId).toBe('user123');
      expect(appError.originalError).toBe(genericError);
    });

    it('should detect network errors from message', () => {
      const networkError = new Error('fetch failed due to network issue');
      const appError = AppError.fromError(networkError);

      expect(appError.category).toBe(ErrorCategory.NETWORK);
    });

    it('should detect authentication errors from message', () => {
      const authError = new Error('unauthorized access');
      const appError = AppError.fromError(authError);

      expect(appError.category).toBe(ErrorCategory.AUTHENTICATION);
      expect(appError.severity).toBe(ErrorSeverity.HIGH);
    });

    it('should detect authorization errors from message', () => {
      const authzError = new Error('forbidden resource');
      const appError = AppError.fromError(authzError);

      expect(appError.category).toBe(ErrorCategory.AUTHORIZATION);
      expect(appError.severity).toBe(ErrorSeverity.HIGH);
    });
  });
});

describe('Predefined Error Types', () => {
  describe('NetworkError', () => {
    it('should create a network error with correct properties', () => {
      const error = new NetworkError('Connection failed', { userId: 'user123' });

      expect(error).toBeInstanceOf(AppError);
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.category).toBe(ErrorCategory.NETWORK);
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.recoverable).toBe(true);
      expect(error.userMessage).toBe('Network connection issue. Please check your internet connection and try again.');
    });
  });

  describe('DatabaseError', () => {
    it('should create a database error with correct properties', () => {
      const error = new DatabaseError('Query failed', { component: 'UserService' });

      expect(error).toBeInstanceOf(AppError);
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.category).toBe(ErrorCategory.DATABASE);
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.recoverable).toBe(true);
      expect(error.userMessage).toBe('Data access issue. Please try again in a moment.');
    });
  });

  describe('ValidationError', () => {
    it('should create a validation error with correct properties', () => {
      const error = new ValidationError('Invalid email format', 'email', { userId: 'user123' });

      expect(error).toBeInstanceOf(AppError);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.category).toBe(ErrorCategory.VALIDATION);
      expect(error.severity).toBe(ErrorSeverity.LOW);
      expect(error.recoverable).toBe(true);
      expect(error.userMessage).toBe('Invalid email format');
      expect(error.context.metadata?.field).toBe('email');
    });
  });

  describe('AuthenticationError', () => {
    it('should create an authentication error with correct properties', () => {
      const error = new AuthenticationError('Token expired');

      expect(error).toBeInstanceOf(AppError);
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.category).toBe(ErrorCategory.AUTHENTICATION);
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.recoverable).toBe(true);
      expect(error.userMessage).toBe('Authentication required. Please sign in to continue.');
    });
  });

  describe('AuthorizationError', () => {
    it('should create an authorization error with correct properties', () => {
      const error = new AuthorizationError('Insufficient permissions');

      expect(error).toBeInstanceOf(AppError);
      expect(error.code).toBe('AUTHORIZATION_ERROR');
      expect(error.category).toBe(ErrorCategory.AUTHORIZATION);
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.recoverable).toBe(false);
      expect(error.userMessage).toBe('You do not have permission to perform this action.');
    });
  });

  describe('ExternalAPIError', () => {
    it('should create an external API error with correct properties', () => {
      const error = new ExternalAPIError('API rate limit exceeded', 'GoogleAPI', { requestId: 'req123' });

      expect(error).toBeInstanceOf(AppError);
      expect(error.code).toBe('EXTERNAL_API_ERROR');
      expect(error.category).toBe(ErrorCategory.EXTERNAL_API);
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.recoverable).toBe(true);
      expect(error.userMessage).toBe('External service temporarily unavailable. Please try again later.');
      expect(error.context.metadata?.apiName).toBe('GoogleAPI');
    });
  });
});