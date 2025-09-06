// Database Configuration mit Prisma
import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';

// Prisma Client mit Logging
export const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

// Logging für Prisma Events
prisma.$on('query', (e) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Prisma Query', {
      query: e.query,
      params: e.params,
      duration: e.duration,
    });
  }
});

prisma.$on('error', (e) => {
  logger.error('Prisma Error', {
    message: e.message,
    target: e.target,
  });
});

prisma.$on('info', (e) => {
  logger.info('Prisma Info', {
    message: e.message,
    target: e.target,
  });
});

prisma.$on('warn', (e) => {
  logger.warn('Prisma Warning', {
    message: e.message,
    target: e.target,
  });
});

// Database Health Check
export async function checkDatabaseHealth(): Promise<{
  ok: boolean;
  latency: number;
  error?: string;
}> {
  const start = Date.now();
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;
    
    return {
      ok: true,
      latency,
    };
  } catch (error) {
    const latency = Date.now() - start;
    logger.error('Database health check failed', { error });
    
    return {
      ok: false,
      latency,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Graceful Shutdown
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from database', { error });
  }
}

// Database Connection Event Handlers
process.on('beforeExit', async () => {
  await disconnectDatabase();
});

process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});
