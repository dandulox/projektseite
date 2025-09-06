// Admin Controller - HTTP Request/Response Handler für Admin-Funktionen
import { Request, Response } from 'express';
import { AdminService } from '@/services/admin.service';
import { 
  ApiResponseFactory, 
  ApiErrorFactory 
} from '@shared/contracts/error';
import { logger } from '@/utils/logger';
import { stringUtils } from '@shared/utils';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  // GET /api/admin/health - System health check
  getSystemHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      const health = await this.adminService.getSystemHealth();

      const response = ApiResponseFactory.success(health, {
        requestId: stringUtils.generateRequestId(),
      });

      res.json(response);
    } catch (error) {
      logger.error('AdminController getSystemHealth error', { error });
      throw error;
    }
  };

  // GET /api/admin/db/status - Database status
  getDatabaseStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const dbStatus = await this.adminService.getDatabaseStatus();

      const response = ApiResponseFactory.success(dbStatus, {
        requestId: stringUtils.generateRequestId(),
      });

      res.json(response);
    } catch (error) {
      logger.error('AdminController getDatabaseStatus error', { error });
      throw error;
    }
  };

  // GET /api/admin/db/tables - List database tables
  getDatabaseTables = async (req: Request, res: Response): Promise<void> => {
    try {
      const tables = await this.adminService.getDatabaseTables();

      const response = ApiResponseFactory.success(tables, {
        requestId: stringUtils.generateRequestId(),
      });

      res.json(response);
    } catch (error) {
      logger.error('AdminController getDatabaseTables error', { error });
      throw error;
    }
  };

  // GET /api/admin/db/tables/:tableName - Get table info
  getTableInfo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { tableName } = req.params;
      const tableInfo = await this.adminService.getTableInfo(tableName);

      const response = ApiResponseFactory.success(tableInfo, {
        requestId: stringUtils.generateRequestId(),
      });

      res.json(response);
    } catch (error) {
      logger.error('AdminController getTableInfo error', { error, tableName: req.params.tableName });
      throw error;
    }
  };

  // POST /api/admin/api-debug - API debugging
  performApiDebug = async (req: Request, res: Response): Promise<void> => {
    try {
      const { method, path, headers, body } = req.body;
      const result = await this.adminService.performApiDebug(method, path, headers, body);

      const response = ApiResponseFactory.success(result, {
        requestId: stringUtils.generateRequestId(),
      });

      res.json(response);
    } catch (error) {
      logger.error('AdminController performApiDebug error', { error, input: req.body });
      throw error;
    }
  };

  // GET /api/admin/stats - System statistics
  getSystemStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.adminService.getSystemStats();

      const response = ApiResponseFactory.success(stats, {
        requestId: stringUtils.generateRequestId(),
      });

      res.json(response);
    } catch (error) {
      logger.error('AdminController getSystemStats error', { error });
      throw error;
    }
  };

  // GET /api/admin/users - List all users
  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 20, search, role, isActive } = req.query;
      
      const result = await this.adminService.getAllUsers({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        role: role as string,
        isActive: isActive ? isActive === 'true' : undefined,
      });

      const response = ApiResponseFactory.paginated(
        result.data,
        result.pagination,
        {
          requestId: stringUtils.generateRequestId(),
        }
      );

      res.json(response);
    } catch (error) {
      logger.error('AdminController getAllUsers error', { error, query: req.query });
      throw error;
    }
  };

  // PATCH /api/admin/users/:id/status - Update user status
  updateUserStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const user = await this.adminService.updateUserStatus(id, isActive);

      const response = ApiResponseFactory.success(user, {
        requestId: stringUtils.generateRequestId(),
      });

      res.json(response);
    } catch (error) {
      logger.error('AdminController updateUserStatus error', { error, id: req.params.id, body: req.body });
      throw error;
    }
  };

  // GET /api/admin/logs - Get system logs
  getSystemLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const { level, limit = 100, since } = req.query;
      
      const logs = await this.adminService.getSystemLogs({
        level: level as string,
        limit: parseInt(limit as string),
        since: since ? new Date(since as string) : undefined,
      });

      const response = ApiResponseFactory.success(logs, {
        requestId: stringUtils.generateRequestId(),
      });

      res.json(response);
    } catch (error) {
      logger.error('AdminController getSystemLogs error', { error, query: req.query });
      throw error;
    }
  };

  // POST /api/admin/cleanup - System cleanup
  performSystemCleanup = async (req: Request, res: Response): Promise<void> => {
    try {
      const { type } = req.body;
      
      const result = await this.adminService.performSystemCleanup(type);

      const response = ApiResponseFactory.success(result, {
        requestId: stringUtils.generateRequestId(),
      });

      res.json(response);
    } catch (error) {
      logger.error('AdminController performSystemCleanup error', { error, body: req.body });
      throw error;
    }
  };
}

// Export controller instance
export const adminController = new AdminController();
