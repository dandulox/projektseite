// Admin Service - Business Logic für Admin-Funktionen
import { 
  NotFoundError, 
  ForbiddenError, 
  ValidationError 
} from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { prisma } from '@/config/database';
import { UserRepository } from '@/repositories/user.repository';
import { stringUtils } from '@shared/utils';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export class AdminService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  // Get system health
  async getSystemHealth(): Promise<{
    status: string;
    timestamp: string;
    version: string;
    environment: string;
    uptime: number;
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    database: {
      ok: boolean;
      latency: number;
      error?: string;
    };
    services: {
      database: boolean;
      storage: boolean;
      email: boolean;
    };
  }> {
    try {
      const start = Date.now();
      
      // Check database health
      const dbHealth = await this.getDatabaseStatus();
      
      // Get memory usage
      const memoryUsage = process.memoryUsage();
      const totalMemory = require('os').totalmem();
      const usedMemory = memoryUsage.heapUsed;
      const memoryPercentage = Math.round((usedMemory / totalMemory) * 100);

      // Check services
      const services = {
        database: dbHealth.ok,
        storage: await this.checkStorageHealth(),
        email: await this.checkEmailHealth(),
      };

      const health = {
        status: services.database ? 'OK' : 'ERROR',
        timestamp: new Date().toISOString(),
        version: '3.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: {
          used: Math.round(usedMemory / 1024 / 1024), // MB
          total: Math.round(totalMemory / 1024 / 1024), // MB
          percentage: memoryPercentage,
        },
        database: {
          ok: dbHealth.ok,
          latency: dbHealth.latency,
          error: dbHealth.error,
        },
        services,
      };

      logger.debug('System health checked', { health });
      return health;
    } catch (error) {
      logger.error('System health check failed', { error });
      throw error;
    }
  }

  // Get database status
  async getDatabaseStatus(): Promise<{
    ok: boolean;
    latency: number;
    error?: string;
    connectionCount?: number;
    version?: string;
  }> {
    try {
      const start = Date.now();
      
      // Test basic connection
      await prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;

      // Get connection info
      const connectionInfo = await prisma.$queryRaw`
        SELECT 
          count(*) as connection_count,
          version() as version
      ` as any[];

      const result = {
        ok: true,
        latency,
        connectionCount: parseInt(connectionInfo[0]?.connection_count || '0'),
        version: connectionInfo[0]?.version || 'Unknown',
      };

      logger.debug('Database status checked', { result });
      return result;
    } catch (error) {
      const latency = Date.now() - Date.now();
      logger.error('Database status check failed', { error });
      
      return {
        ok: false,
        latency,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Get database tables
  async getDatabaseTables(): Promise<{
    tables: Array<{
      name: string;
      rowCount: number;
      size: string;
    }>;
  }> {
    try {
      const tables = await prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename as name,
          n_tup_ins + n_tup_upd + n_tup_del as row_count,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
        FROM pg_stat_user_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename
      ` as any[];

      const result = {
        tables: tables.map(table => ({
          name: table.name,
          rowCount: parseInt(table.row_count || '0'),
          size: table.size || '0 bytes',
        })),
      };

      logger.debug('Database tables listed', { tableCount: result.tables.length });
      return result;
    } catch (error) {
      logger.error('Failed to list database tables', { error });
      throw error;
    }
  }

  // Get table info
  async getTableInfo(tableName: string): Promise<{
    name: string;
    columns: Array<{
      name: string;
      type: string;
      nullable: boolean;
      defaultValue: string | null;
    }>;
    indexes: Array<{
      name: string;
      columns: string[];
      unique: boolean;
    }>;
    constraints: Array<{
      name: string;
      type: string;
      columns: string[];
    }>;
  }> {
    try {
      // Get column information
      const columns = await prisma.$queryRaw`
        SELECT 
          column_name as name,
          data_type as type,
          is_nullable = 'YES' as nullable,
          column_default as default_value
        FROM information_schema.columns 
        WHERE table_name = ${tableName} AND table_schema = 'public'
        ORDER BY ordinal_position
      ` as any[];

      // Get index information
      const indexes = await prisma.$queryRaw`
        SELECT 
          indexname as name,
          indexdef as definition
        FROM pg_indexes 
        WHERE tablename = ${tableName} AND schemaname = 'public'
      ` as any[];

      // Get constraint information
      const constraints = await prisma.$queryRaw`
        SELECT 
          conname as name,
          contype as type,
          pg_get_constraintdef(oid) as definition
        FROM pg_constraint 
        WHERE conrelid = ${tableName}::regclass
      ` as any[];

      const result = {
        name: tableName,
        columns: columns.map(col => ({
          name: col.name,
          type: col.type,
          nullable: col.nullable,
          defaultValue: col.default_value,
        })),
        indexes: indexes.map(idx => ({
          name: idx.name,
          columns: this.extractColumnsFromIndexDefinition(idx.definition),
          unique: idx.definition.includes('UNIQUE'),
        })),
        constraints: constraints.map(con => ({
          name: con.name,
          type: this.getConstraintType(con.type),
          columns: this.extractColumnsFromConstraintDefinition(con.definition),
        })),
      };

      logger.debug('Table info retrieved', { tableName, columnCount: result.columns.length });
      return result;
    } catch (error) {
      logger.error('Failed to get table info', { error, tableName });
      throw error;
    }
  }

  // Perform API debug
  async performApiDebug(
    method: string,
    path: string,
    headers: Record<string, string> = {},
    body: any = null
  ): Promise<{
    method: string;
    path: string;
    headers: Record<string, string>;
    body: any;
    timestamp: string;
    result: string;
  }> {
    try {
      // Security: Only allow relative paths
      if (path.startsWith('http://') || path.startsWith('https://')) {
        throw new ValidationError('Absolute URLs sind nicht erlaubt');
      }

      // Security: Limit path length
      if (path.length > 500) {
        throw new ValidationError('Pfad ist zu lang');
      }

      // Security: Limit body size
      if (body && JSON.stringify(body).length > 10000) {
        throw new ValidationError('Body ist zu groß');
      }

      // Simulate API call (in real implementation, you would make actual HTTP request)
      const result = {
        method,
        path,
        headers,
        body,
        timestamp: new Date().toISOString(),
        result: `API Debug für ${method} ${path} erfolgreich`,
      };

      logger.info('API debug performed', { method, path, userId: 'admin' });
      return result;
    } catch (error) {
      logger.error('API debug failed', { error, method, path });
      throw error;
    }
  }

  // Get system statistics
  async getSystemStats(): Promise<{
    users: {
      total: number;
      active: number;
      inactive: number;
      byRole: Record<string, number>;
    };
    projects: {
      total: number;
      active: number;
      completed: number;
    };
    tasks: {
      total: number;
      completed: number;
      overdue: number;
    };
    system: {
      uptime: number;
      memoryUsage: number;
      cpuUsage: number;
    };
  }> {
    try {
      // Get user statistics
      const userStats = await prisma.user.groupBy({
        by: ['role', 'isActive'],
        _count: true,
      });

      const users = {
        total: await prisma.user.count(),
        active: await prisma.user.count({ where: { isActive: true } }),
        inactive: await prisma.user.count({ where: { isActive: false } }),
        byRole: userStats.reduce((acc, stat) => {
          acc[stat.role] = (acc[stat.role] || 0) + stat._count;
          return acc;
        }, {} as Record<string, number>),
      };

      // Get project statistics
      const projects = {
        total: await prisma.project.count(),
        active: await prisma.project.count({ where: { status: 'ACTIVE' } }),
        completed: await prisma.project.count({ where: { status: 'COMPLETED' } }),
      };

      // Get task statistics
      const tasks = {
        total: await prisma.task.count(),
        completed: await prisma.task.count({ where: { status: 'COMPLETED' } }),
        overdue: await prisma.task.count({
          where: {
            dueDate: { lt: new Date() },
            status: { not: 'COMPLETED' },
          },
        }),
      };

      // Get system statistics
      const memoryUsage = process.memoryUsage();
      const system = {
        uptime: process.uptime(),
        memoryUsage: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        cpuUsage: 0, // Would need additional library to get real CPU usage
      };

      const stats = {
        users,
        projects,
        tasks,
        system,
      };

      logger.debug('System stats retrieved', { stats });
      return stats;
    } catch (error) {
      logger.error('Failed to get system stats', { error });
      throw error;
    }
  }

  // Get all users
  async getAllUsers(options: {
    page: number;
    limit: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  }): Promise<{
    data: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    try {
      const result = await this.userRepository.findWithFilters({
        page: options.page,
        limit: options.limit,
        search: options.search,
        role: options.role as any,
        isActive: options.isActive,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      logger.debug('All users retrieved', { 
        count: result.data.length, 
        total: result.pagination.total 
      });
      return result;
    } catch (error) {
      logger.error('Failed to get all users', { error, options });
      throw error;
    }
  }

  // Update user status
  async updateUserStatus(userId: string, isActive: boolean): Promise<any> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundError('Benutzer', userId);
      }

      const updatedUser = await this.userRepository.update(userId, { isActive });

      logger.info('User status updated', {
        userId,
        isActive,
        updatedBy: 'admin',
      });

      return updatedUser;
    } catch (error) {
      logger.error('Failed to update user status', { error, userId, isActive });
      throw error;
    }
  }

  // Get system logs
  async getSystemLogs(options: {
    level?: string;
    limit?: number;
    since?: Date;
  }): Promise<{
    logs: Array<{
      timestamp: string;
      level: string;
      message: string;
      meta?: any;
    }>;
  }> {
    try {
      // In a real implementation, you would read from log files
      // For now, return mock data
      const logs = [
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'System health check completed',
          meta: { uptime: process.uptime() },
        },
        {
          timestamp: new Date(Date.now() - 60000).toISOString(),
          level: 'debug',
          message: 'Database connection established',
          meta: { latency: 15 },
        },
      ];

      const result = {
        logs: logs.slice(0, options.limit || 100),
      };

      logger.debug('System logs retrieved', { logCount: result.logs.length });
      return result;
    } catch (error) {
      logger.error('Failed to get system logs', { error, options });
      throw error;
    }
  }

  // Perform system cleanup
  async performSystemCleanup(type: string): Promise<{
    type: string;
    cleaned: number;
    timestamp: string;
  }> {
    try {
      let cleaned = 0;

      switch (type) {
        case 'expired_tokens':
          // Clean up expired tokens (if implemented)
          cleaned = 0;
          break;
        case 'old_logs':
          // Clean up old log files
          cleaned = await this.cleanupOldLogs();
          break;
        case 'temp_files':
          // Clean up temporary files
          cleaned = await this.cleanupTempFiles();
          break;
        default:
          throw new ValidationError('Unbekannter Cleanup-Typ');
      }

      const result = {
        type,
        cleaned,
        timestamp: new Date().toISOString(),
      };

      logger.info('System cleanup performed', { result });
      return result;
    } catch (error) {
      logger.error('System cleanup failed', { error, type });
      throw error;
    }
  }

  // Private helper methods
  private async checkStorageHealth(): Promise<boolean> {
    try {
      // Check if upload directory exists and is writable
      const uploadPath = process.env.UPLOAD_PATH || './uploads';
      await fs.access(uploadPath, fs.constants.W_OK);
      return true;
    } catch {
      return false;
    }
  }

  private async checkEmailHealth(): Promise<boolean> {
    try {
      // Check if email configuration is available
      return !!(process.env.SMTP_HOST && process.env.SMTP_USER);
    } catch {
      return false;
    }
  }

  private extractColumnsFromIndexDefinition(definition: string): string[] {
    // Simple extraction - in real implementation, use proper SQL parser
    const match = definition.match(/\(([^)]+)\)/);
    return match ? match[1].split(',').map(col => col.trim()) : [];
  }

  private getConstraintType(type: string): string {
    const types: Record<string, string> = {
      'p': 'PRIMARY KEY',
      'f': 'FOREIGN KEY',
      'u': 'UNIQUE',
      'c': 'CHECK',
    };
    return types[type] || 'UNKNOWN';
  }

  private extractColumnsFromConstraintDefinition(definition: string): string[] {
    // Simple extraction - in real implementation, use proper SQL parser
    const match = definition.match(/\(([^)]+)\)/);
    return match ? match[1].split(',').map(col => col.trim()) : [];
  }

  private async cleanupOldLogs(): Promise<number> {
    try {
      const logPath = path.join(process.cwd(), 'logs');
      const files = await fs.readdir(logPath);
      let cleaned = 0;

      for (const file of files) {
        if (file.endsWith('.log')) {
          const filePath = path.join(logPath, file);
          const stats = await fs.stat(filePath);
          const daysSinceModified = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
          
          if (daysSinceModified > 30) { // Delete logs older than 30 days
            await fs.unlink(filePath);
            cleaned++;
          }
        }
      }

      return cleaned;
    } catch {
      return 0;
    }
  }

  private async cleanupTempFiles(): Promise<number> {
    try {
      const tempPath = path.join(process.cwd(), 'temp');
      const files = await fs.readdir(tempPath);
      let cleaned = 0;

      for (const file of files) {
        const filePath = path.join(tempPath, file);
        await fs.unlink(filePath);
        cleaned++;
      }

      return cleaned;
    } catch {
      return 0;
    }
  }
}
