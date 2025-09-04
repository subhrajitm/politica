/**
 * Circuit Breaker pattern implementation
 * Prevents cascading failures by temporarily disabling failing services
 */

import { AppError, ErrorCategory, ErrorSeverity } from './AppError';

export enum CircuitState {
  CLOSED = 'closed',     // Normal operation
  OPEN = 'open',         // Circuit is open, requests fail fast
  HALF_OPEN = 'half_open' // Testing if service has recovered
}

export interface CircuitBreakerConfig {
  failureThreshold: number;      // Number of failures before opening
  recoveryTimeout: number;       // Time to wait before trying again (ms)
  monitoringPeriod: number;      // Time window for failure counting (ms)
  halfOpenMaxCalls: number;      // Max calls allowed in half-open state
  expectedErrorRate: number;     // Expected error rate (0-1)
  minimumThroughput: number;     // Minimum calls before circuit can open
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  totalCalls: number;
  lastFailureTime?: Date;
  lastSuccessTime?: Date;
  errorRate: number;
  uptime: number;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private totalCalls: number = 0;
  private lastFailureTime?: Date;
  private lastSuccessTime?: Date;
  private nextAttemptTime?: Date;
  private halfOpenCalls: number = 0;
  private readonly createdAt: Date = new Date();

  private static readonly DEFAULT_CONFIG: CircuitBreakerConfig = {
    failureThreshold: 5,
    recoveryTimeout: 60000, // 1 minute
    monitoringPeriod: 300000, // 5 minutes
    halfOpenMaxCalls: 3,
    expectedErrorRate: 0.1, // 10%
    minimumThroughput: 10
  };

  constructor(
    private readonly name: string,
    private readonly config: Partial<CircuitBreakerConfig> = {}
  ) {
    this.config = { ...CircuitBreaker.DEFAULT_CONFIG, ...config };
  }

  /**
   * Execute an operation through the circuit breaker
   */
  public async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Check if circuit should transition states
    this.updateState();

    // Fast fail if circuit is open
    if (this.state === CircuitState.OPEN) {
      throw new AppError(
        `Circuit breaker '${this.name}' is OPEN`,
        'CIRCUIT_BREAKER_OPEN',
        ErrorSeverity.HIGH,
        ErrorCategory.SYSTEM,
        {
          metadata: {
            circuitName: this.name,
            state: this.state,
            failureCount: this.failureCount,
            nextAttemptTime: this.nextAttemptTime
          }
        },
        {
          recoverable: true,
          userMessage: 'Service temporarily unavailable. Please try again later.'
        }
      );
    }

    // Limit calls in half-open state
    if (this.state === CircuitState.HALF_OPEN && this.halfOpenCalls >= this.config.halfOpenMaxCalls!) {
      throw new AppError(
        `Circuit breaker '${this.name}' is testing recovery`,
        'CIRCUIT_BREAKER_HALF_OPEN_LIMIT',
        ErrorSeverity.MEDIUM,
        ErrorCategory.SYSTEM,
        {
          metadata: {
            circuitName: this.name,
            state: this.state,
            halfOpenCalls: this.halfOpenCalls
          }
        },
        {
          recoverable: true,
          userMessage: 'Service is recovering. Please try again in a moment.'
        }
      );
    }

    // Execute the operation
    this.totalCalls++;
    if (this.state === CircuitState.HALF_OPEN) {
      this.halfOpenCalls++;
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get current circuit breaker statistics
   */
  public getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      totalCalls: this.totalCalls,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      errorRate: this.totalCalls > 0 ? this.failureCount / this.totalCalls : 0,
      uptime: Date.now() - this.createdAt.getTime()
    };
  }

  /**
   * Manually reset the circuit breaker
   */
  public reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.totalCalls = 0;
    this.halfOpenCalls = 0;
    this.nextAttemptTime = undefined;
    this.lastFailureTime = undefined;
    this.lastSuccessTime = undefined;
  }

  /**
   * Force the circuit breaker to open
   */
  public forceOpen(): void {
    this.state = CircuitState.OPEN;
    this.nextAttemptTime = new Date(Date.now() + this.config.recoveryTimeout!);
  }

  private onSuccess(): void {
    this.successCount++;
    this.lastSuccessTime = new Date();

    if (this.state === CircuitState.HALF_OPEN) {
      // If we've had enough successful calls, close the circuit
      if (this.halfOpenCalls >= this.config.halfOpenMaxCalls!) {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.halfOpenCalls = 0;
      }
    }
  }

  private onFailure(error: Error): void {
    this.failureCount++;
    this.lastFailureTime = new Date();

    // If in half-open state, any failure opens the circuit
    if (this.state === CircuitState.HALF_OPEN) {
      this.openCircuit();
      return;
    }

    // Check if we should open the circuit
    if (this.shouldOpenCircuit()) {
      this.openCircuit();
    }
  }

  private shouldOpenCircuit(): boolean {
    // Need minimum throughput before considering opening
    if (this.totalCalls < this.config.minimumThroughput!) {
      return false;
    }

    // Check failure threshold
    if (this.failureCount >= this.config.failureThreshold!) {
      return true;
    }

    // Check error rate
    const errorRate = this.failureCount / this.totalCalls;
    return errorRate > this.config.expectedErrorRate!;
  }

  private openCircuit(): void {
    this.state = CircuitState.OPEN;
    this.nextAttemptTime = new Date(Date.now() + this.config.recoveryTimeout!);
    this.halfOpenCalls = 0;
  }

  private updateState(): void {
    if (this.state === CircuitState.OPEN && this.nextAttemptTime && Date.now() >= this.nextAttemptTime.getTime()) {
      this.state = CircuitState.HALF_OPEN;
      this.halfOpenCalls = 0;
    }

    // Reset counters if monitoring period has passed
    const monitoringCutoff = Date.now() - this.config.monitoringPeriod!;
    if (this.lastFailureTime && this.lastFailureTime.getTime() < monitoringCutoff) {
      this.failureCount = 0;
    }
  }
}

/**
 * Circuit Breaker Manager for handling multiple circuit breakers
 */
export class CircuitBreakerManager {
  private static instance: CircuitBreakerManager;
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();

  public static getInstance(): CircuitBreakerManager {
    if (!CircuitBreakerManager.instance) {
      CircuitBreakerManager.instance = new CircuitBreakerManager();
    }
    return CircuitBreakerManager.instance;
  }

  public getCircuitBreaker(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!this.circuitBreakers.has(name)) {
      this.circuitBreakers.set(name, new CircuitBreaker(name, config));
    }
    return this.circuitBreakers.get(name)!;
  }

  public getAllStats(): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {};
    for (const [name, breaker] of this.circuitBreakers) {
      stats[name] = breaker.getStats();
    }
    return stats;
  }

  public resetAll(): void {
    for (const breaker of this.circuitBreakers.values()) {
      breaker.reset();
    }
  }
}

// Convenience function for creating circuit breaker protected operations
export const withCircuitBreaker = <T>(
  name: string,
  operation: () => Promise<T>,
  config?: Partial<CircuitBreakerConfig>
): Promise<T> => {
  const manager = CircuitBreakerManager.getInstance();
  const circuitBreaker = manager.getCircuitBreaker(name, config);
  return circuitBreaker.execute(operation);
};