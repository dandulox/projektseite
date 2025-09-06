// Auth Service - Business Logic für Authentication
import { 
  User, 
  LoginInput, 
  CreateUserInput 
} from '@shared/types';
import { UserRepository } from '@/repositories/user.repository';
import { 
  NotFoundError, 
  ForbiddenError, 
  ValidationError,
  UnauthorizedError,
  ConflictError 
} from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { generateToken, verifyToken } from '@/middleware/auth';
import bcrypt from 'bcryptjs';
import { stringUtils } from '@shared/utils';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  // Login user
  async login(input: LoginInput): Promise<{
    user: Omit<User, 'password'>;
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      const { username, password } = input;

      // Find user by username or email
      const user = await this.userRepository.findByUsername(username) ||
                   await this.userRepository.findByEmail(username);

      if (!user) {
        throw new UnauthorizedError('Ungültige Anmeldedaten');
      }

      if (!user.isActive) {
        throw new ForbiddenError('Benutzer ist deaktiviert');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedError('Ungültige Anmeldedaten');
      }

      // Update last login
      await this.userRepository.updateLastLogin(user.id);

      // Generate tokens
      const accessToken = generateToken(user.id);
      const refreshToken = generateToken(user.id, '7d'); // 7 days for refresh token

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      logger.info('User logged in', {
        userId: user.id,
        username: user.username,
        role: user.role,
      });

      return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('Auth login error', { username: input.username, error });
      throw error;
    }
  }

  // Register new user
  async register(input: CreateUserInput): Promise<{
    user: Omit<User, 'password'>;
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      const { username, email, password, role } = input;

      // Check if username already exists
      const usernameExists = await this.userRepository.usernameExists(username);
      if (usernameExists) {
        throw new ConflictError('Benutzername bereits vergeben');
      }

      // Check if email already exists
      const emailExists = await this.userRepository.emailExists(email);
      if (emailExists) {
        throw new ConflictError('E-Mail-Adresse bereits vergeben');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const userData = {
        username,
        email,
        password: hashedPassword,
        role: role || 'USER',
        isActive: true,
      };

      const user = await this.userRepository.create(userData);

      // Generate tokens
      const accessToken = generateToken(user.id);
      const refreshToken = generateToken(user.id, '7d');

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      logger.info('User registered', {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      });

      return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('Auth register error', { input, error });
      throw error;
    }
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      // Verify refresh token
      const decoded = verifyToken(refreshToken);
      
      // Get user
      const user = await this.userRepository.findById(decoded.userId);
      if (!user) {
        throw new UnauthorizedError('Benutzer nicht gefunden');
      }

      if (!user.isActive) {
        throw new ForbiddenError('Benutzer ist deaktiviert');
      }

      // Generate new tokens
      const newAccessToken = generateToken(user.id);
      const newRefreshToken = generateToken(user.id, '7d');

      logger.info('Token refreshed', {
        userId: user.id,
        username: user.username,
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      logger.error('Auth refreshToken error', { error });
      throw error;
    }
  }

  // Logout user
  async logout(userId: string): Promise<void> {
    try {
      // In a real application, you might want to:
      // 1. Add token to blacklist
      // 2. Clear refresh tokens from database
      // 3. Log the logout event

      logger.info('User logged out', {
        userId,
      });
    } catch (error) {
      logger.error('Auth logout error', { userId, error });
      throw error;
    }
  }

  // Get current user
  async getCurrentUser(userId: string): Promise<Omit<User, 'password'>> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundError('Benutzer', userId);
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      return userWithoutPassword;
    } catch (error) {
      logger.error('Auth getCurrentUser error', { userId, error });
      throw error;
    }
  }

  // Change password
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundError('Benutzer', userId);
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new ValidationError('Aktuelles Passwort ist falsch');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await this.userRepository.update(userId, { password: hashedNewPassword });

      logger.info('Password changed', {
        userId,
        username: user.username,
      });
    } catch (error) {
      logger.error('Auth changePassword error', { userId, error });
      throw error;
    }
  }

  // Forgot password
  async forgotPassword(email: string): Promise<void> {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not
        logger.warn('Password reset requested for non-existent email', { email });
        return;
      }

      // In a real application, you would:
      // 1. Generate a secure reset token
      // 2. Store it in database with expiration
      // 3. Send email with reset link

      const resetToken = stringUtils.generateId(32);
      
      // For now, just log the token (in production, send email)
      logger.info('Password reset token generated', {
        userId: user.id,
        email: user.email,
        resetToken, // In production, this would be sent via email
      });

      // TODO: Implement email sending
      // await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    } catch (error) {
      logger.error('Auth forgotPassword error', { email, error });
      throw error;
    }
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // In a real application, you would:
      // 1. Verify the reset token
      // 2. Check if it's not expired
      // 3. Find the associated user
      // 4. Update the password
      // 5. Invalidate the token

      // For now, this is a placeholder implementation
      logger.info('Password reset attempted', {
        token: token.substring(0, 8) + '...',
      });

      throw new ValidationError('Password reset not implemented yet');
    } catch (error) {
      logger.error('Auth resetPassword error', { error });
      throw error;
    }
  }

  // Verify token
  async verifyToken(token: string): Promise<{ userId: string }> {
    try {
      return verifyToken(token);
    } catch (error) {
      logger.error('Auth verifyToken error', { error });
      throw error;
    }
  }
}
