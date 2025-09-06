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
    
    // Use the same database as development for tests
    const dbUrl = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/projektseite';
    process.env.DATABASE_URL = dbUrl;

    console.log('📦 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Test database connection with retry logic
    console.log('🔌 Testing database connection...');
    let connected = false;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!connected && attempts < maxAttempts) {
      try {
        await prisma.$connect();
        await prisma.$queryRaw`SELECT 1`;
        connected = true;
        console.log('✅ Database connection successful');
      } catch (error) {
        attempts++;
        console.log(`⚠️ Database connection attempt ${attempts}/${maxAttempts} failed, retrying in 2 seconds...`);
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          throw error;
        }
      }
    }

    // Run database migrations only if needed
    console.log('🗄️ Running database migrations...');
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    } catch (migrationError) {
      console.log('⚠️ Migration failed, trying to reset database...');
      execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
    }

    console.log('✅ Global test setup completed successfully');
  } catch (error) {
    console.error('❌ Global test setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
