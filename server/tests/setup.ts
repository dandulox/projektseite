// Jest Setup - Globale Test-Konfiguration
import { config } from 'dotenv';

// Extend global types for test helpers
declare global {
  var testHelpers: {
    randomString: (length?: number) => string;
    randomEmail: () => string;
    randomUsername: () => string;
    createTestUser: (overrides?: any) => any;
    createTestProject: (overrides?: any) => any;
    createTestTask: (overrides?: any) => any;
    cleanupTestData: () => Promise<void>;
  };
}

// Load test environment variables
config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://dev:dev_password@localhost:5433/projektseite_dev';

// Global test timeout
jest.setTimeout(30000);

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  // Uncomment to suppress console.log in tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidDate(): R;
      toBeValidCuid(): R;
      toBeValidApiResponse(): R;
    }
  }
}

// Custom Jest Matchers
expect.extend({
  toBeValidDate(received: any) {
    const pass = received instanceof Date && !isNaN(received.getTime());
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid date`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid date`,
        pass: false,
      };
    }
  },

  toBeValidCuid(received: any) {
    const cuidRegex = /^c[0-9a-z]{24}$/;
    const pass = typeof received === 'string' && cuidRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid CUID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid CUID`,
        pass: false,
      };
    }
  },

  toBeValidApiResponse(received: any) {
    const pass = 
      received &&
      typeof received === 'object' &&
      typeof received.success === 'boolean' &&
      received.meta &&
      typeof received.meta.timestamp === 'string' &&
      typeof received.meta.requestId === 'string';
    
    if (pass) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to be a valid API response`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to be a valid API response`,
        pass: false,
      };
    }
  },
});

// Global test helpers
global.testHelpers = {
  // Generate random string
  randomString: (length: number = 10) => {
    return Math.random().toString(36).substring(2, 2 + length);
  },

  // Generate random email
  randomEmail: () => {
    return `test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}@example.com`;
  },

  // Generate random username
  randomUsername: () => {
    return `testuser_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  },

  // Wait for async operation
  wait: (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Create test date
  testDate: (daysFromNow: number = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date;
  },
};

// Mock external services
jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    colorize: jest.fn(),
    printf: jest.fn(),
    simple: jest.fn(),
    json: jest.fn(),
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn(),
  },
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn((password: string) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn((password: string, hash: string) => 
    Promise.resolve(hash === `hashed_${password}`)
  ),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn((payload: any, secret: string, options: any) => {
    return `mock_token_${payload.userId}`;
  }),
  verify: jest.fn((token: string, secret: string) => {
    if (token.startsWith('mock_token_')) {
      return { userId: token.replace('mock_token_', '') };
    }
    throw new Error('Invalid token');
  }),
}));

// Global test cleanup
afterEach(() => {
  // Clear all mocks after each test
  jest.clearAllMocks();
});

// Global test teardown
afterAll(() => {
  // Cleanup after all tests
  jest.restoreAllMocks();
});
