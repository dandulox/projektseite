// Global Jest Setup - Wird vor allen Tests ausgeführt
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

const prisma = new PrismaClient();

export default async function globalSetup() {
  console.log('🚀 Starting global test setup...');

  try {
    // Set test environment
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/projektseite_test';

    // Generate Prisma client for test database
    console.log('📦 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Run database migrations
    console.log('🗄️ Running database migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });

    // Test database connection
    console.log('🔌 Testing database connection...');
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;

    console.log('✅ Global test setup completed successfully');
  } catch (error) {
    console.error('❌ Global test setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
