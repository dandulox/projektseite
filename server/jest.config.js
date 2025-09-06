// Jest Configuration für Projektseite v3.0
module.exports = {
  // Test Environment
  testEnvironment: 'node',
  
  // Setup Files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // Test Match Patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/src/**/*.test.ts',
  ],
  
  // Coverage Configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/server.ts',
  ],
  
  // Coverage Thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Module Resolution
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/../shared/$1',
  },
  
  // Transform Configuration
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  
  // Module File Extensions
  moduleFileExtensions: ['ts', 'js', 'json'],
  
  // Test Timeout
  testTimeout: 30000,
  
  // Global Setup
  globalSetup: '<rootDir>/tests/globalSetup.ts',
  globalTeardown: '<rootDir>/tests/globalTeardown.ts',
  
  // Verbose Output
  verbose: true,
  
  // Clear Mocks
  clearMocks: true,
  restoreMocks: true,
  
  // Error Handling
  errorOnDeprecated: true,
  
  // Parallel Execution
  maxWorkers: '50%',
  
  // Test Results Processor
  testResultsProcessor: 'jest-sonar-reporter',
  
  // Custom Matchers
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};
