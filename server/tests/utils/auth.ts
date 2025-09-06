// Test Auth Utilities
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

// Generate JWT token for testing
export function generateToken(userId: string, expiresIn: string = '24h'): string {
  const payload = { userId };
  const options: jwt.SignOptions = { expiresIn };
  return jwt.sign(payload, JWT_SECRET, options);
}

// Generate expired token for testing
export function generateExpiredToken(userId: string): string {
  const payload = { userId };
  const options: jwt.SignOptions = { expiresIn: '-1h' };
  return jwt.sign(payload, JWT_SECRET, options);
}

// Generate invalid token for testing
export function generateInvalidToken(): string {
  return 'invalid.token.here';
}

// Verify token (for testing)
export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

// Test user data
export const testUserData = {
  id: 'test-user-id',
  username: 'testuser',
  email: 'test@example.com',
  role: 'USER',
  isActive: true,
};

// Test admin user data
export const testAdminData = {
  id: 'test-admin-id',
  username: 'admin',
  email: 'admin@example.com',
  role: 'ADMIN',
  isActive: true,
};

// Generate test tokens
export const testTokens = {
  user: generateToken(testUserData.id),
  admin: generateToken(testAdminData.id),
  expired: generateExpiredToken(testUserData.id),
  invalid: generateInvalidToken(),
};

// Mock request with auth header
export function createAuthRequest(token: string) {
  return {
    headers: {
      authorization: `Bearer ${token}`,
    },
  };
}

// Mock request without auth header
export function createUnauthRequest() {
  return {
    headers: {},
  };
}
