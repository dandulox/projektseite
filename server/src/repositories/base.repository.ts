// Base Repository - Abstrakte Basisklasse für alle Repositories
import { PrismaClient } from '@prisma/client';
import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';

export abstract class BaseRepository<T> {
  protected prisma: PrismaClient;
  protected modelName: string;

  constructor(modelName: string) {
    this.prisma = prisma;
    this.modelName = modelName;
  }

  // Generic CRUD Operations
  async findById(id: string): Promise<T | null> {
    try {
      const result = await (this.prisma as any)[this.modelName].findUnique({
        where: { id },
      });
      
      logger.debug(`${this.modelName} findById`, { id, found: !!result });
      return result;
    } catch (error) {
      logger.error(`${this.modelName} findById error`, { id, error });
      throw error;
    }
  }

  async findMany(options: {
    where?: any;
    orderBy?: any;
    skip?: number;
    take?: number;
    include?: any;
  } = {}): Promise<T[]> {
    try {
      const result = await (this.prisma as any)[this.modelName].findMany(options);
      
      logger.debug(`${this.modelName} findMany`, { 
        count: result.length,
        options: Object.keys(options)
      });
      return result;
    } catch (error) {
      logger.error(`${this.modelName} findMany error`, { options, error });
      throw error;
    }
  }

  async count(where?: any): Promise<number> {
    try {
      const result = await (this.prisma as any)[this.modelName].count({ where });
      
      logger.debug(`${this.modelName} count`, { count: result, where });
      return result;
    } catch (error) {
      logger.error(`${this.modelName} count error`, { where, error });
      throw error;
    }
  }

  async create(data: any): Promise<T> {
    try {
      const result = await (this.prisma as any)[this.modelName].create({ data });
      
      logger.info(`${this.modelName} created`, { id: result.id });
      return result;
    } catch (error) {
      logger.error(`${this.modelName} create error`, { data, error });
      throw error;
    }
  }

  async update(id: string, data: any): Promise<T> {
    try {
      const result = await (this.prisma as any)[this.modelName].update({
        where: { id },
        data,
      });
      
      logger.info(`${this.modelName} updated`, { id });
      return result;
    } catch (error) {
      logger.error(`${this.modelName} update error`, { id, data, error });
      throw error;
    }
  }

  async delete(id: string): Promise<T> {
    try {
      const result = await (this.prisma as any)[this.modelName].delete({
        where: { id },
      });
      
      logger.info(`${this.modelName} deleted`, { id });
      return result;
    } catch (error) {
      logger.error(`${this.modelName} delete error`, { id, error });
      throw error;
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const count = await (this.prisma as any)[this.modelName].count({
        where: { id },
      });
      
      return count > 0;
    } catch (error) {
      logger.error(`${this.modelName} exists error`, { id, error });
      throw error;
    }
  }

  // Pagination Helper
  async paginate(options: {
    where?: any;
    orderBy?: any;
    page: number;
    limit: number;
    include?: any;
  }): Promise<{
    data: T[];
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
      const { page, limit, where, orderBy, include } = options;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        (this.prisma as any)[this.modelName].findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include,
        }),
        (this.prisma as any)[this.modelName].count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      logger.debug(`${this.modelName} paginate`, {
        page,
        limit,
        total,
        totalPages,
        dataCount: data.length,
      });

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      logger.error(`${this.modelName} paginate error`, { options, error });
      throw error;
    }
  }

  // Transaction Helper
  async transaction<R>(fn: (tx: PrismaClient) => Promise<R>): Promise<R> {
    try {
      return await this.prisma.$transaction(fn);
    } catch (error) {
      logger.error(`${this.modelName} transaction error`, { error });
      throw error;
    }
  }
}
