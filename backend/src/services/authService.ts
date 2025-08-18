import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { 
  LoginRequest, 
  LoginResponse, 
  AuthTokens, 
  JwtPayload 
} from '../types';
import { 
  AUTH_CONSTANTS, 
  AUTH_ERROR_MESSAGES,
  HTTP_STATUS_CODES 
} from '../config/constants';
import { eventBus } from './eventBus';
import { logger } from './logger';
import { RequestContext } from '../types';

// Mock user database for demonstration
const MOCK_USERS = [
  {
    id: '1',
    userName: 'admin',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
    role: 'admin',
    isActive: true
  },
  {
    id: '2',
    userName: 'user',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
    role: 'user',
    isActive: true
  },
  {
    id: '3',
    userName: 'locked',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
    role: 'user',
    isActive: false
  }
];

class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async authenticateUser(
    loginRequest: LoginRequest, 
    context: RequestContext
  ): Promise<{ success: boolean; data?: LoginResponse; error?: string; statusCode: number }> {
    try {
      const { userName, password, expectedResult } = loginRequest;

      // Handle different expected result scenarios
      switch (expectedResult) {
        case HTTP_STATUS_CODES.OK:
          return await this.handleSuccessfulLogin(userName, password, context);
        
        case HTTP_STATUS_CODES.BAD_REQUEST:
          return {
            success: false,
            error: AUTH_ERROR_MESSAGES.BAD_REQUEST,
            statusCode: HTTP_STATUS_CODES.BAD_REQUEST
          };
        
        case HTTP_STATUS_CODES.UNAUTHORIZED:
          return {
            success: false,
            error: AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS,
            statusCode: HTTP_STATUS_CODES.UNAUTHORIZED
          };
        
        case HTTP_STATUS_CODES.FORBIDDEN:
          return {
            success: false,
            error: AUTH_ERROR_MESSAGES.ACCOUNT_LOCKED,
            statusCode: HTTP_STATUS_CODES.FORBIDDEN
          };
        
        case HTTP_STATUS_CODES.NOT_FOUND:
          return {
            success: false,
            error: AUTH_ERROR_MESSAGES.USER_NOT_FOUND,
            statusCode: HTTP_STATUS_CODES.NOT_FOUND
          };
        
        case HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR:
          return {
            success: false,
            error: AUTH_ERROR_MESSAGES.SERVER_ERROR,
            statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
          };
        
        case HTTP_STATUS_CODES.SERVICE_UNAVAILABLE:
          return {
            success: false,
            error: 'Service temporarily unavailable',
            statusCode: HTTP_STATUS_CODES.SERVICE_UNAVAILABLE
          };
        
        default:
          // For any other status code, attempt normal authentication
          return await this.handleSuccessfulLogin(userName, password, context);
      }
    } catch (error) {
      logger.error('Authentication error', {
        requestId: context.requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'authentication'
      });

      return {
        success: false,
        error: AUTH_ERROR_MESSAGES.SERVER_ERROR,
        statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
      };
    }
  }

  private async handleSuccessfulLogin(
    userName: string, 
    password: string, 
    context: RequestContext
  ): Promise<{ success: boolean; data?: LoginResponse; error?: string; statusCode: number }> {
    // Find user by username
    const user = MOCK_USERS.find(u => u.userName === userName);
    
    if (!user) {
      return {
        success: false,
        error: AUTH_ERROR_MESSAGES.USER_NOT_FOUND,
        statusCode: HTTP_STATUS_CODES.NOT_FOUND
      };
    }

    // Check if account is active
    if (!user.isActive) {
      return {
        success: false,
        error: AUTH_ERROR_MESSAGES.ACCOUNT_LOCKED,
        statusCode: HTTP_STATUS_CODES.FORBIDDEN
      };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return {
        success: false,
        error: AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS,
        statusCode: HTTP_STATUS_CODES.UNAUTHORIZED
      };
    }

    // Generate tokens
    const tokens = this.generateTokens(user);
    
    const loginResponse: LoginResponse = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        userName: user.userName,
        role: user.role
      }
    };

    // Emit login event
    eventBus.emitEvent('auth.login', {
      userId: user.id,
      userName: user.userName,
      role: user.role
    }, context);

    logger.info('User logged in successfully', {
      requestId: context.requestId,
      userId: user.id,
      userName: user.userName,
      operation: 'login_success'
    });

    return {
      success: true,
      data: loginResponse,
      statusCode: HTTP_STATUS_CODES.OK
    };
  }

  private generateTokens(user: { id: string; userName: string; role: string }): AuthTokens {
    const accessTokenPayload: JwtPayload = {
      userId: user.id,
      userName: user.userName,
      role: user.role,
      type: 'access',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes
    };

    const refreshTokenPayload: JwtPayload = {
      userId: user.id,
      userName: user.userName,
      role: user.role,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    };

    const accessToken = jwt.sign(accessTokenPayload, AUTH_CONSTANTS.JWT_ACCESS_SECRET);

    const refreshToken = jwt.sign(refreshTokenPayload, AUTH_CONSTANTS.JWT_REFRESH_SECRET);

    return { accessToken, refreshToken };
  }

  public verifyAccessToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, AUTH_CONSTANTS.JWT_ACCESS_SECRET) as JwtPayload;
      return decoded.type === 'access' ? decoded : null;
    } catch (error) {
      return null;
    }
  }

  public verifyRefreshToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, AUTH_CONSTANTS.JWT_REFRESH_SECRET) as JwtPayload;
      return decoded.type === 'refresh' ? decoded : null;
    } catch (error) {
      return null;
    }
  }

  public async refreshTokens(refreshToken: string, _context: RequestContext): Promise<AuthTokens | null> {
    const payload = this.verifyRefreshToken(refreshToken);
    
    if (!payload) {
      return null;
    }

    const user = MOCK_USERS.find(u => u.id === payload.userId);
    
    if (!user || !user.isActive) {
      return null;
    }

    return this.generateTokens(user);
  }

  public async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, AUTH_CONSTANTS.SALT_ROUNDS);
  }

  public async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}

export const authService = AuthService.getInstance();
