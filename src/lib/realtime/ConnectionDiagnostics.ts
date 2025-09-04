/**
 * WebSocket Connection Diagnostics
 * Provides detailed diagnostics and monitoring for WebSocket connections
 */

import { ConnectionHealth } from './WebSocketManager';
import { PoolStats } from './ConnectionPool';

export interface DiagnosticTest {
  name: string;
  description: string;
  run: () => Promise<DiagnosticResult>;
}

export interface DiagnosticResult {
  success: boolean;
  message: string;
  details?: any;
  duration: number;
  timestamp: number;
}

export interface NetworkDiagnostics {
  latency: number;
  bandwidth: number;
  packetLoss: number;
  jitter: number;
  connectionType: string;
}

export interface ConnectionDiagnostics {
  health: ConnectionHealth;
  network: NetworkDiagnostics;
  performance: PerformanceDiagnostics;
  errors: ErrorDiagnostics;
}

export interface PerformanceDiagnostics {
  messagesSent: number;
  messagesReceived: number;
  bytesTransferred: number;
  averageMessageSize: number;
  throughput: number;
}

export interface ErrorDiagnostics {
  connectionErrors: number;
  messageErrors: number;
  timeoutErrors: number;
  lastError?: {
    type: string;
    message: string;
    timestamp: number;
  };
}

export class ConnectionDiagnostics {
  private performanceMetrics: PerformanceDiagnostics = {
    messagesSent: 0,
    messagesReceived: 0,
    bytesTransferred: 0,
    averageMessageSize: 0,
    throughput: 0,
  };

  private errorMetrics: ErrorDiagnostics = {
    connectionErrors: 0,
    messageErrors: 0,
    timeoutErrors: 0,
  };

  private startTime = Date.now();
  private lastThroughputCheck = Date.now();
  private lastBytesTransferred = 0;

  /**
   * Run comprehensive connection diagnostics
   */
  async runDiagnostics(url: string): Promise<DiagnosticResult[]> {
    const tests: DiagnosticTest[] = [
      {
        name: 'WebSocket Connectivity',
        description: 'Test basic WebSocket connection',
        run: () => this.testWebSocketConnectivity(url),
      },
      {
        name: 'Latency Test',
        description: 'Measure round-trip latency',
        run: () => this.testLatency(url),
      },
      {
        name: 'Throughput Test',
        description: 'Test message throughput capacity',
        run: () => this.testThroughput(url),
      },
      {
        name: 'Connection Stability',
        description: 'Test connection stability over time',
        run: () => this.testConnectionStability(url),
      },
      {
        name: 'Network Quality',
        description: 'Assess network connection quality',
        run: () => this.testNetworkQuality(),
      },
    ];

    const results: DiagnosticResult[] = [];

    for (const test of tests) {
      try {
        const result = await test.run();
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          duration: 0,
          timestamp: Date.now(),
        });
      }
    }

    return results;
  }

  /**
   * Test basic WebSocket connectivity
   */
  private async testWebSocketConnectivity(url: string): Promise<DiagnosticResult> {
    const startTime = Date.now();

    return new Promise((resolve) => {
      const ws = new WebSocket(url);
      let resolved = false;

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          ws.close();
          resolve({
            success: false,
            message: 'Connection timeout',
            duration: Date.now() - startTime,
            timestamp: Date.now(),
          });
        }
      }, 10000);

      ws.onopen = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          ws.close();
          resolve({
            success: true,
            message: 'WebSocket connection successful',
            duration: Date.now() - startTime,
            timestamp: Date.now(),
          });
        }
      };

      ws.onerror = (error) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve({
            success: false,
            message: 'WebSocket connection failed',
            details: error,
            duration: Date.now() - startTime,
            timestamp: Date.now(),
          });
        }
      };
    });
  }

  /**
   * Test round-trip latency
   */
  private async testLatency(url: string): Promise<DiagnosticResult> {
    const startTime = Date.now();

    return new Promise((resolve) => {
      const ws = new WebSocket(url);
      let pingTime = 0;
      let resolved = false;

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          ws.close();
          resolve({
            success: false,
            message: 'Latency test timeout',
            duration: Date.now() - startTime,
            timestamp: Date.now(),
          });
        }
      }, 15000);

      ws.onopen = () => {
        pingTime = Date.now();
        ws.send(JSON.stringify({ type: 'ping', timestamp: pingTime }));
      };

      ws.onmessage = (event) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          const latency = Date.now() - pingTime;
          ws.close();
          
          resolve({
            success: true,
            message: `Latency: ${latency}ms`,
            details: { latency },
            duration: Date.now() - startTime,
            timestamp: Date.now(),
          });
        }
      };

      ws.onerror = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve({
            success: false,
            message: 'Latency test failed',
            duration: Date.now() - startTime,
            timestamp: Date.now(),
          });
        }
      };
    });
  }

  /**
   * Test message throughput
   */
  private async testThroughput(url: string): Promise<DiagnosticResult> {
    const startTime = Date.now();
    const testDuration = 5000; // 5 seconds
    let messagesSent = 0;
    let messagesReceived = 0;

    return new Promise((resolve) => {
      const ws = new WebSocket(url);
      let resolved = false;

      ws.onopen = () => {
        const interval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ 
              type: 'throughput_test', 
              data: 'x'.repeat(100), // 100 byte message
              id: messagesSent 
            }));
            messagesSent++;
          }
        }, 10); // Send every 10ms

        setTimeout(() => {
          clearInterval(interval);
          if (!resolved) {
            resolved = true;
            ws.close();
            
            const duration = Date.now() - startTime;
            const throughput = (messagesReceived / (duration / 1000)).toFixed(2);
            
            resolve({
              success: messagesReceived > 0,
              message: `Throughput: ${throughput} messages/sec`,
              details: { 
                messagesSent, 
                messagesReceived, 
                throughput: parseFloat(throughput) 
              },
              duration,
              timestamp: Date.now(),
            });
          }
        }, testDuration);
      };

      ws.onmessage = () => {
        messagesReceived++;
      };

      ws.onerror = () => {
        if (!resolved) {
          resolved = true;
          resolve({
            success: false,
            message: 'Throughput test failed',
            duration: Date.now() - startTime,
            timestamp: Date.now(),
          });
        }
      };
    });
  }

  /**
   * Test connection stability
   */
  private async testConnectionStability(url: string): Promise<DiagnosticResult> {
    const startTime = Date.now();
    const testDuration = 10000; // 10 seconds
    let disconnections = 0;
    let reconnections = 0;

    return new Promise((resolve) => {
      const ws = new WebSocket(url);
      let resolved = false;

      ws.onopen = () => {
        reconnections++;
      };

      ws.onclose = () => {
        disconnections++;
        // Attempt reconnection
        if (!resolved) {
          setTimeout(() => {
            if (!resolved) {
              const newWs = new WebSocket(url);
              newWs.onopen = () => reconnections++;
              newWs.onclose = () => disconnections++;
            }
          }, 1000);
        }
      };

      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          ws.close();
          
          const stability = disconnections === 0 ? 'Excellent' : 
                          disconnections <= 2 ? 'Good' : 'Poor';
          
          resolve({
            success: disconnections <= 2,
            message: `Connection stability: ${stability}`,
            details: { disconnections, reconnections, stability },
            duration: Date.now() - startTime,
            timestamp: Date.now(),
          });
        }
      }, testDuration);
    });
  }

  /**
   * Test network quality using browser APIs
   */
  private async testNetworkQuality(): Promise<DiagnosticResult> {
    const startTime = Date.now();

    try {
      // Use Navigator Connection API if available
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;

      let networkInfo = {
        effectiveType: 'unknown',
        downlink: 0,
        rtt: 0,
        saveData: false,
      };

      if (connection) {
        networkInfo = {
          effectiveType: connection.effectiveType || 'unknown',
          downlink: connection.downlink || 0,
          rtt: connection.rtt || 0,
          saveData: connection.saveData || false,
        };
      }

      // Perform a simple bandwidth test
      const testStartTime = Date.now();
      const response = await fetch('/api/test-connection', {
        method: 'GET',
        cache: 'no-cache',
      });
      const testEndTime = Date.now();
      const responseTime = testEndTime - testStartTime;

      const quality = responseTime < 100 ? 'Excellent' :
                     responseTime < 300 ? 'Good' :
                     responseTime < 1000 ? 'Fair' : 'Poor';

      return {
        success: true,
        message: `Network quality: ${quality}`,
        details: {
          ...networkInfo,
          responseTime,
          quality,
        },
        duration: Date.now() - startTime,
        timestamp: Date.now(),
      };

    } catch (error) {
      return {
        success: false,
        message: 'Network quality test failed',
        details: error,
        duration: Date.now() - startTime,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Record performance metrics
   */
  recordMessageSent(size: number): void {
    this.performanceMetrics.messagesSent++;
    this.performanceMetrics.bytesTransferred += size;
    this.updateThroughput();
  }

  recordMessageReceived(size: number): void {
    this.performanceMetrics.messagesReceived++;
    this.performanceMetrics.bytesTransferred += size;
    this.updateThroughput();
  }

  recordError(type: 'connection' | 'message' | 'timeout', error: Error): void {
    switch (type) {
      case 'connection':
        this.errorMetrics.connectionErrors++;
        break;
      case 'message':
        this.errorMetrics.messageErrors++;
        break;
      case 'timeout':
        this.errorMetrics.timeoutErrors++;
        break;
    }

    this.errorMetrics.lastError = {
      type,
      message: error.message,
      timestamp: Date.now(),
    };
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): PerformanceDiagnostics {
    const totalMessages = this.performanceMetrics.messagesSent + this.performanceMetrics.messagesReceived;
    this.performanceMetrics.averageMessageSize = totalMessages > 0 
      ? this.performanceMetrics.bytesTransferred / totalMessages 
      : 0;

    return { ...this.performanceMetrics };
  }

  /**
   * Get error metrics
   */
  getErrorMetrics(): ErrorDiagnostics {
    return { ...this.errorMetrics };
  }

  /**
   * Update throughput calculation
   */
  private updateThroughput(): void {
    const now = Date.now();
    const timeDiff = now - this.lastThroughputCheck;
    
    if (timeDiff >= 1000) { // Update every second
      const bytesDiff = this.performanceMetrics.bytesTransferred - this.lastBytesTransferred;
      this.performanceMetrics.throughput = (bytesDiff / (timeDiff / 1000)); // bytes per second
      
      this.lastThroughputCheck = now;
      this.lastBytesTransferred = this.performanceMetrics.bytesTransferred;
    }
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.performanceMetrics = {
      messagesSent: 0,
      messagesReceived: 0,
      bytesTransferred: 0,
      averageMessageSize: 0,
      throughput: 0,
    };

    this.errorMetrics = {
      connectionErrors: 0,
      messageErrors: 0,
      timeoutErrors: 0,
    };

    this.startTime = Date.now();
    this.lastThroughputCheck = Date.now();
    this.lastBytesTransferred = 0;
  }
}