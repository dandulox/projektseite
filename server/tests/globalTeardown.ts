// Global Jest Teardown - Wird nach allen Tests ausgeführt
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

export default async function globalTeardown() {
  console.log('🧹 Starting global test teardown...');

  try {
    // Clean up test database
    console.log('🗑️ Cleaning up test database...');
    await prisma.$connect();
    
    // Delete all test data
    await prisma.taskAttachment.deleteMany();
    await prisma.taskComment.deleteMany();
    await prisma.taskActivity.deleteMany();
    await prisma.moduleActivity.deleteMany();
    await prisma.task.deleteMany();
    await prisma.module.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.activityLog.deleteMany();
    await prisma.teamMembership.deleteMany();
    await prisma.team.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    // Reset database (optional - uncomment if needed)
    // console.log('🔄 Resetting test database...');
    // execSync('npx prisma migrate reset --force', { stdio: 'inherit' });

    console.log('✅ Global test teardown completed successfully');
  } catch (error) {
    console.error('❌ Global test teardown failed:', error);
    // Don't throw error to avoid masking test failures
  } finally {
    await prisma.$disconnect();
  }
}
