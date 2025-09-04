/**
 * Unit tests for CircuitBreaker class
 */

import { CircuitBreaker, CircuitState, CircuitBreakerManager, withCircuitBreaker } from '../CircuitBreaker';
import { AppError, ErrorCategory } from '../AppError';

// Mock Date for consistent testing
const mockDate = new Date('2024-01-01T00:00:00Z');
jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

describe('CircuitBreaker', () => {
  let circuitBreaker: CircuitBreaker;

  beforeEach(() => {
    circuitBreaker = new CircuitBreaker('test-circuit', {
      failureThreshold: 3,
      recoveryTimeout: 60000,
      monitoringPeriod: 300000,
      halfOpenMaxCalls: 2,
      expectedErrorRate: 0.5,
      minimumThroughput: 5
    });
  });

  describe('constructor', () => {
    it('should create circuit breaker with default config', () => {
      const cb = new CircuitBreaker('test');
      const stats = cb.getStats();

      expect(stats.state).toBe(CircuitState.CLOSED);
      expect(stats.failureCount).toBe(0);
      expect(stats.successCount).toBe(0);
      expect(stats.totalCalls).toBe(0);
    });

    it('should create circuit breaker with custom config', () => {
      const cb = new CircuitBreaker('test', { failureThreshold: 10 });
      expect(cb).toBeDefined();
    });
  });

  describe('execute - CLOSED state', () => {
    it('should execute operation successfully', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      const result = await circuitBreaker.execute(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);

      const stats = circuitBreaker.getStats();
      expect(stats.state).toBe(CircuitState.CLOSED);
      expect(stats.successCount).toBe(1);
      expect(stats.totalCalls).toBe(1);
    });

    it('should handle operation failure', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Operation failed'));

      await expect(circuitBreaker.execute(operation)).rejects.toThrow('Operation failed');

      const stats = circuitBreaker.getStats();
      expect(stats.state).toBe(CircuitState.CLOSED);
      expect(stats.failureCount).toBe(1);
      expect(stats.totalCalls).toBe(1);
    });

    it('should open circuit after failure threshold', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Operation failed'));

      // Execute enough calls to meet minimum throughput
      for (let i = 0; i < 5; i++) {
        try {
          await circuitBreaker.execute(operation);
        } catch (e) {
          // Expected to fail
        }
      }

      const stats = circuitBreaker.getStats();
      expect(stats.state).toBe(CircuitState.OPEN);
      expect(stats.failureCount).toBe(5);
    });

    it('should not open circuit below minimum throughput', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Operation failed'));

      // Execute fewer calls than minimum throughput
      for (let i = 0; i < 2; i++) {
        try {
          await circuitBreaker.execute(operation);
        } catch (e) {
          // Expected to fail
        }
      }

      const stats = circuitBreaker.getStats();
      expect(stats.state).toBe(CircuitState.CLOSED);
    });
  });

  describe('execute - OPEN state', () => {
    beforeEach(async () => {
      // Force circuit to open
      const operation = jest.fn().mockRejectedValue(new Error('Operation failed'));
      
      for (let i = 0; i < 5; i++) {
        try {
          await circuitBreaker.execute(operation);
        } catch (e) {
          // Expected to fail
        }
      }
    });

    it('should fail fast when circuit is open', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      await expect(circuitBreaker.execute(operation)).rejects.toThrow('Circuit breaker \'test-circuit\' is OPEN');

      expect(operation).not.toHaveBeenCalled();
    });

    it('should transition to half-open after recovery timeout', async () => {
      // Mock Date.now to simulate time passing
      const originalNow = Date.now;
      Date.now = jest.fn().mockReturnValue(mockDate.getTime() + 61000); // 61 seconds later

      const operation = jest.fn().mockResolvedValue('success');

      const result = await circuitBreaker.execute(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);

      const stats = circuitBreaker.getStats();
      expect(stats.state).toBe(CircuitState.HALF_OPEN);

      // Restore Date.now
      Date.now = originalNow;
    });
  });

  describe('execute - HALF_OPEN state', () => {
    beforeEach(async () => {
      // Force circuit to open then transition to half-open
      circuitBreaker.forceOpen();
      
      const originalNow = Date.now;
      Date.now = jest.fn().mockReturnValue(mockDate.getTime() + 61000);
      
      // Execute one successful operation to get into half-open state
      const operation = jest.fn().mockResolvedValue('success');
      await circuitBreaker.execute(operation);
      
      Date.now = originalNow;
    });

    it('should limit calls in half-open state', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      // First call should succeed (we already made one in beforeEach)
      await circuitBreaker.execute(operation);

      // Third call should be rejected (limit is 2)
      await expect(circuitBreaker.execute(operation)).rejects.toThrow('Circuit breaker \'test-circuit\' is testing recovery');
    });

    it('should close circuit after successful calls', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      // Execute one more successful call (we already made one in beforeEach)
      await circuitBreaker.execute(operation);

      const stats = circuitBreaker.getStats();
      expect(stats.state).toBe(CircuitState.CLOSED);
    });

    it('should open circuit on failure', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Operation failed'));

      await expect(circuitBreaker.execute(operation)).rejects.toThrow('Operation failed');

      const stats = circuitBreaker.getStats();
      expect(stats.state).toBe(CircuitState.OPEN);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', async () => {
      const successOperation = jest.fn().mockResolvedValue('success');
      const failOperation = jest.fn().mockRejectedValue(new Error('failed'));

      await circuitBreaker.execute(successOperation);
      
      try {
        await circuitBreaker.execute(failOperation);
      } catch (e) {
        // Expected
      }

      const stats = circuitBreaker.getStats();

      expect(stats.state).toBe(CircuitState.CLOSED);
      expect(stats.successCount).toBe(1);
      expect(stats.failureCount).toBe(1);
      expect(stats.totalCalls).toBe(2);
      expect(stats.errorRate).toBe(0.5);
      expect(stats.uptime).toBeGreaterThan(0);
      expect(stats.lastSuccessTime).toBeInstanceOf(Date);
      expect(stats.lastFailureTime).toBeInstanceOf(Date);
    });
  });

  describe('reset', () => {
    it('should reset circuit breaker state', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('failed'));

      try {
        await circuitBreaker.execute(operation);
      } catch (e) {
        // Expected
      }

      circuitBreaker.reset();

      const stats = circuitBreaker.getStats();
      expect(stats.state).toBe(CircuitState.CLOSED);
      expect(stats.failureCount).toBe(0);
      expect(stats.successCount).toBe(0);
      expect(stats.totalCalls).toBe(0);
    });
  });

  describe('forceOpen', () => {
    it('should force circuit to open', () => {
      circuitBreaker.forceOpen();

      const stats = circuitBreaker.getStats();
      expect(stats.state).toBe(CircuitState.OPEN);
    });
  });
});

describe('CircuitBreakerManager', () => {
  let manager: CircuitBreakerManager;

  beforeEach(() => {
    manager = CircuitBreakerManager.getInstance();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const manager1 = CircuitBreakerManager.getInstance();
      const manager2 = CircuitBreakerManager.getInstance();

      expect(manager1).toBe(manager2);
    });
  });

  describe('getCircuitBreaker', () => {
    it('should create new circuit breaker', () => {
      const cb = manager.getCircuitBreaker('test-circuit');

      expect(cb).toBeInstanceOf(CircuitBreaker);
    });

    it('should return existing circuit breaker', () => {
      const cb1 = manager.getCircuitBreaker('test-circuit');
      const cb2 = manager.getCircuitBreaker('test-circuit');

      expect(cb1).toBe(cb2);
    });

    it('should create circuit breaker with custom config', () => {
      const cb = manager.getCircuitBreaker('test-circuit', { failureThreshold: 10 });

      expect(cb).toBeInstanceOf(CircuitBreaker);
    });
  });

  describe('getAllStats', () => {
    it('should return stats for all circuit breakers', async () => {
      const cb1 = manager.getCircuitBreaker('circuit-1');
      const cb2 = manager.getCircuitBreaker('circuit-2');

      const operation = jest.fn().mockResolvedValue('success');
      await cb1.execute(operation);
      await cb2.execute(operation);

      const allStats = manager.getAllStats();

      expect(allStats).toHaveProperty('circuit-1');
      expect(allStats).toHaveProperty('circuit-2');
      expect(allStats['circuit-1'].successCount).toBe(1);
      expect(allStats['circuit-2'].successCount).toBe(1);
    });
  });

  describe('resetAll', () => {
    it('should reset all circuit breakers', async () => {
      const cb1 = manager.getCircuitBreaker('circuit-1');
      const cb2 = manager.getCircuitBreaker('circuit-2');

      const operation = jest.fn().mockResolvedValue('success');
      await cb1.execute(operation);
      await cb2.execute(operation);

      manager.resetAll();

      const allStats = manager.getAllStats();
      expect(allStats['circuit-1'].successCount).toBe(0);
      expect(allStats['circuit-2'].successCount).toBe(0);
    });
  });
});

describe('withCircuitBreaker', () => {
  it('should execute operation with circuit breaker protection', async () => {
    const operation = jest.fn().mockResolvedValue('success');

    const result = await withCircuitBreaker('test-circuit', operation);

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should use custom config', async () => {
    const operation = jest.fn().mockResolvedValue('success');

    const result = await withCircuitBreaker('test-circuit', operation, { failureThreshold: 10 });

    expect(result).toBe('success');
  });

  it('should handle failures', async () => {
    const operation = jest.fn().mockRejectedValue(new Error('Operation failed'));

    await expect(withCircuitBreaker('test-circuit', operation)).rejects.toThrow('Operation failed');
  });
});