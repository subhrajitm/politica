// Infrastructure configuration based on environment
export interface InfrastructureConfig {
  cache: {
    enabled: boolean;
    maxSize: number;
    defaultTTL: number;
    cleanupInterval: number;
  };
  monitoring: {
    errorLogging: boolean;
    performanceTracking: boolean;
    consoleLogging: boolean;
    maxLogEntries: number;
  };
  analytics: {
    enabled: boolean;
    batchSize: number;
    flushInterval: number;
    enableLocalStorage: boolean;
  };
}

const developmentConfig: InfrastructureConfig = {
  cache: {
    enabled: true,
    maxSize: 1000,
    defaultTTL: 1000 * 60 * 15, // 15 minutes
    cleanupInterval: 1000 * 60 * 10, // 10 minutes
  },
  monitoring: {
    errorLogging: true,
    performanceTracking: true,
    consoleLogging: true,
    maxLogEntries: 1000,
  },
  analytics: {
    enabled: true,
    batchSize: 10, // Smaller batches for development
    flushInterval: 10000, // 10 seconds
    enableLocalStorage: true,
  },
};

const productionConfig: InfrastructureConfig = {
  cache: {
    enabled: true,
    maxSize: 2000,
    defaultTTL: 1000 * 60 * 30, // 30 minutes
    cleanupInterval: 1000 * 60 * 15, // 15 minutes
  },
  monitoring: {
    errorLogging: true,
    performanceTracking: true,
    consoleLogging: false,
    maxLogEntries: 500,
  },
  analytics: {
    enabled: true,
    batchSize: 50,
    flushInterval: 30000, // 30 seconds
    enableLocalStorage: true,
  },
};

const testConfig: InfrastructureConfig = {
  cache: {
    enabled: false, // Disable caching in tests
    maxSize: 100,
    defaultTTL: 1000 * 60, // 1 minute
    cleanupInterval: 1000 * 60, // 1 minute
  },
  monitoring: {
    errorLogging: true,
    performanceTracking: false,
    consoleLogging: false,
    maxLogEntries: 100,
  },
  analytics: {
    enabled: false, // Disable analytics in tests
    batchSize: 5,
    flushInterval: 1000, // 1 second
    enableLocalStorage: false,
  },
};

export function getInfrastructureConfig(): InfrastructureConfig {
  const env = process.env.NODE_ENV;
  
  switch (env) {
    case 'development':
      return developmentConfig;
    case 'production':
      return productionConfig;
    case 'test':
      return testConfig;
    default:
      return developmentConfig;
  }
}

export const infraConfig = getInfrastructureConfig();