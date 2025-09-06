// Auth Controller - HTTP Request/Response Handler für Authentication
import { Request, Response } from 'express';
import { AuthService } from '@/services/auth.service';
import { 
  ApiResponseFactory, 
  ApiErrorFactory 
} from '@shared/contracts/error';
import { 
  LoginInput, 
  CreateUserInput 
} from '@shared/contracts/validation';
import { logger } from '@/utils/logger';
import { stringUtils } from '@shared/utils';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // POST /api/auth/login
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const input: LoginInput = req.body;

      const result = await this.authService.login(input);

      const response = ApiResponseFactory.success(result, {
        requestId: stringUtils.generateRequestId(),
      });

      res.json(response);
    } catch (error) {
      logger.error('AuthController login error', { error, input: req.body });
      throw error;
    }
  };

  // POST /api/auth/register
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const input: CreateUserInput = req.body;

      const result = await this.authService.register(input);

      const response = ApiResponseFactory.success(result, {
        requestId: stringUtils.generateRequestId(),
      });

      res.status(201).json(response);
    } catch (error) {
      logger.error('AuthController register error', { error, input: req.body });
      throw error;
    }
  };

  // POST /api/auth/refresh
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      const result = await this.authService.refreshToken(refreshToken);

      const response = ApiResponseFactory.success(result, {
        requestId: stringUtils.generateRequestId(),
      });

      res.json(response);
    } catch (error) {
      logger.error('AuthController refreshToken error', { error });
      throw error;
    }
  };

  // POST /api/auth/logout
  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;

      await this.authService.logout(userId);

      const response = ApiResponseFactory.success(null, {
        requestId: stringUtils.generateRequestId(),
      });

      res.json(response);
    } catch (error) {
      logger.error('AuthController logout error', { error, userId: req.user?.id });
      throw error;
    }
  };

  // GET /api/auth/me
  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;

      const user = await this.authService.getCurrentUser(userId);

      const response = ApiResponseFactory.success(user, {
        requestId: stringUtils.generateRequestId(),
      });

      res.json(response);
    } catch (error) {
      logger.error('AuthController getCurrentUser error', { error, userId: req.user?.id });
      throw error;
    }
  };

  // PATCH /api/auth/change-password
  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword } = req.body;

      await this.authService.changePassword(userId, currentPassword, newPassword);

      const response = ApiResponseFactory.success(null, {
        requestId: stringUtils.generateRequestId(),
      });

      res.json(response);
    } catch (error) {
      logger.error('AuthController changePassword error', { error, userId: req.user?.id });
      throw error;
    }
  };

  // POST /api/auth/forgot-password
  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      await this.authService.forgotPassword(email);

      const response = ApiResponseFactory.success(
        { message: 'Password reset email sent' },
        {
          requestId: stringUtils.generateRequestId(),
        }
      );

      res.json(response);
    } catch (error) {
      logger.error('AuthController forgotPassword error', { error, email: req.body.email });
      throw error;
    }
  };

  // POST /api/auth/reset-password
  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, newPassword } = req.body;

      await this.authService.resetPassword(token, newPassword);

      const response = ApiResponseFactory.success(
        { message: 'Password reset successfully' },
        {
          requestId: stringUtils.generateRequestId(),
        }
      );

      res.json(response);
    } catch (error) {
      logger.error('AuthController resetPassword error', { error });
      throw error;
    }
  };
}

// Export controller instance
export const authController = new AuthController();
