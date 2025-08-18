import { Request, Response } from 'express';
import Joi from 'joi';
import { LoginRequest, LoginResponse } from '../types';
import { ApiResponse } from '../types';
import { HTTP_STATUS_CODES, ERROR_MESSAGES } from '../config/constants';
import { authService } from '../services/authService';
import { eventBus } from '../services/eventBus';
import { logger } from '../services/logger';

// Validation schema for login request
const loginSchema = Joi.object({
  userName: Joi.string().required().min(3).max(50).messages({
    'string.empty': 'Username is required',
    'string.min': 'Username must be at least 3 characters long',
    'string.max': 'Username must not exceed 50 characters'
  }),
  password: Joi.string().required().min(6).max(100).messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters long',
    'string.max': 'Password must not exceed 100 characters'
  }),
  expectedResult: Joi.number().integer().min(200).max(599).required().messages({
    'number.base': 'Expected result must be a number',
    'number.integer': 'Expected result must be an integer',
    'number.min': 'Expected result must be at least 200',
    'number.max': 'Expected result must not exceed 599'
  })
});

export class AuthController {
  public static async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const { error, value } = loginSchema.validate(req.body);
      
      if (error) {
        const response: ApiResponse = {
          success: false,
          error: error.details[0]?.message || 'Validation error',
          timestamp: new Date().toISOString(),
          requestId: req.context.requestId
        };

        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json(response);
        return;
      }

      const loginRequest: LoginRequest = value;

      // Authenticate user
      const authResult = await authService.authenticateUser(loginRequest, req.context);

      // Emit authentication event
      eventBus.emitEvent('auth.attempt', {
        userName: loginRequest.userName,
        expectedResult: loginRequest.expectedResult,
        success: authResult.success
      }, req.context);

      if (authResult.success && authResult.data) {
        const response: ApiResponse<LoginResponse> = {
          success: true,
          data: authResult.data,
          message: 'Login successful',
          timestamp: new Date().toISOString(),
          requestId: req.context.requestId
        };

        res.status(authResult.statusCode).json(response);
      } else {
        const response: ApiResponse = {
          success: false,
          error: authResult.error || ERROR_MESSAGES.INTERNAL_ERROR,
          timestamp: new Date().toISOString(),
          requestId: req.context.requestId
        };

        res.status(authResult.statusCode).json(response);
      }
    } catch (error) {
      logger.error('Login error', {
        requestId: req.context.requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'login'
      });

      const response: ApiResponse = {
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR,
        timestamp: new Date().toISOString(),
        requestId: req.context.requestId
      };

      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  public static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        const response: ApiResponse = {
          success: false,
          error: 'Refresh token is required',
          timestamp: new Date().toISOString(),
          requestId: req.context.requestId
        };

        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json(response);
        return;
      }

      const newTokens = await authService.refreshTokens(refreshToken, req.context);

      if (newTokens) {
        const response: ApiResponse<{ accessToken: string; refreshToken: string }> = {
          success: true,
          data: newTokens,
          message: 'Tokens refreshed successfully',
          timestamp: new Date().toISOString(),
          requestId: req.context.requestId
        };

        res.status(HTTP_STATUS_CODES.OK).json(response);
      } else {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid or expired refresh token',
          timestamp: new Date().toISOString(),
          requestId: req.context.requestId
        };

        res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json(response);
      }
    } catch (error) {
      logger.error('Token refresh error', {
        requestId: req.context.requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'token_refresh'
      });

      const response: ApiResponse = {
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR,
        timestamp: new Date().toISOString(),
        requestId: req.context.requestId
      };

      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  public static async logout(req: Request, res: Response): Promise<void> {
    try {
      // In a real application, you would invalidate the refresh token
      // For now, we'll just log the logout event
      
      eventBus.emitEvent('auth.logout', {
        userId: req.context.userId,
        timestamp: new Date().toISOString()
      }, req.context);

      const response: ApiResponse = {
        success: true,
        message: 'Logout successful',
        timestamp: new Date().toISOString(),
        requestId: req.context.requestId
      };

      res.status(HTTP_STATUS_CODES.OK).json(response);
    } catch (error) {
      logger.error('Logout error', {
        requestId: req.context.requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'logout'
      });

      const response: ApiResponse = {
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR,
        timestamp: new Date().toISOString(),
        requestId: req.context.requestId
      };

      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  public static async validateToken(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const response: ApiResponse = {
          success: false,
          error: 'Authorization header is required',
          timestamp: new Date().toISOString(),
          requestId: req.context.requestId
        };

        res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json(response);
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      const payload = authService.verifyAccessToken(token);

      if (payload) {
        const response: ApiResponse<{ valid: boolean; user: { id: string; userName: string; role: string } }> = {
          success: true,
          data: {
            valid: true,
            user: {
              id: payload.userId,
              userName: payload.userName,
              role: payload.role
            }
          },
          timestamp: new Date().toISOString(),
          requestId: req.context.requestId
        };

        res.status(HTTP_STATUS_CODES.OK).json(response);
      } else {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid or expired token',
          timestamp: new Date().toISOString(),
          requestId: req.context.requestId
        };

        res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json(response);
      }
    } catch (error) {
      logger.error('Token validation error', {
        requestId: req.context.requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'token_validation'
      });

      const response: ApiResponse = {
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR,
        timestamp: new Date().toISOString(),
        requestId: req.context.requestId
      };

      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(response);
    }
  }
}
