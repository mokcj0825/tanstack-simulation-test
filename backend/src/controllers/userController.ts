import { Request, Response } from 'express';
import { User, CreateUserRequest, UpdateUserRequest, PaginationParams } from '../types';
import { ApiResponse, PaginatedResponse } from '../types';
import { HTTP_STATUS_CODES, ERROR_MESSAGES, PAGINATION_DEFAULTS } from '../config/constants';
import { dummyDataService } from '../data/dummyData';
import { eventBus } from '../services/eventBus';
import { logger } from '../services/logger';

export class UserController {
  public static async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || PAGINATION_DEFAULTS.DEFAULT_PAGE;
      const pageSize = parseInt(req.query.pageSize as string) || PAGINATION_DEFAULTS.PAGE_SIZE;
      const search = req.query.search as string;
      const role = req.query.role as string;
      const sortBy = req.query.sortBy as string;
      const sortOrder = req.query.sortOrder as 'asc' | 'desc';

      let users: User[];

      // Use switch for non-boolean logic as per user rules
      switch (true) {
        case !!search:
          users = dummyDataService.searchUsers(search);
          break;
        case !!role:
          users = dummyDataService.getUsersByRole(role as any);
          break;
        default:
          users = dummyDataService.getAllUsers();
      }

      // Apply sorting
      if (sortBy) {
        users = this.sortUsers(users, sortBy, sortOrder);
      }

      // Apply pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedUsers = users.slice(startIndex, endIndex);
      const total = users.length;
      const totalPages = Math.ceil(total / pageSize);

      const response: PaginatedResponse<User> = {
        success: true,
        data: paginatedUsers,
        timestamp: new Date().toISOString(),
        requestId: req.context.requestId,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };

      // Emit data fetched event
      eventBus.emitDataFetched('users', paginatedUsers.length, req.context);

      res.status(HTTP_STATUS_CODES.OK).json(response);
    } catch (error) {
      logger.error('Failed to get users', {
        requestId: req.context.requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'get_users'
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

  public static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = dummyDataService.getUserById(id);

      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: ERROR_MESSAGES.RESOURCE_NOT_FOUND,
          timestamp: new Date().toISOString(),
          requestId: req.context.requestId
        };

        res.status(HTTP_STATUS_CODES.NOT_FOUND).json(response);
        return;
      }

      const response: ApiResponse<User> = {
        success: true,
        data: user,
        timestamp: new Date().toISOString(),
        requestId: req.context.requestId
      };

      // Emit data fetched event
      eventBus.emitDataFetched('user', 1, req.context);

      res.status(HTTP_STATUS_CODES.OK).json(response);
    } catch (error) {
      logger.error('Failed to get user by ID', {
        requestId: req.context.requestId,
        userId: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'get_user_by_id'
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

  public static async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserRequest = req.body;
      const newUser = dummyDataService.createUser(userData);

      const response: ApiResponse<User> = {
        success: true,
        data: newUser,
        message: 'User created successfully',
        timestamp: new Date().toISOString(),
        requestId: req.context.requestId
      };

      // Emit user created event
      eventBus.emitUserCreated(newUser, req.context);

      res.status(HTTP_STATUS_CODES.CREATED).json(response);
    } catch (error) {
      logger.error('Failed to create user', {
        requestId: req.context.requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'create_user'
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

  public static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateUserRequest = req.body;
      
      const updatedUser = dummyDataService.updateUser(id, updateData);

      if (!updatedUser) {
        const response: ApiResponse = {
          success: false,
          error: ERROR_MESSAGES.RESOURCE_NOT_FOUND,
          timestamp: new Date().toISOString(),
          requestId: req.context.requestId
        };

        res.status(HTTP_STATUS_CODES.NOT_FOUND).json(response);
        return;
      }

      const response: ApiResponse<User> = {
        success: true,
        data: updatedUser,
        message: 'User updated successfully',
        timestamp: new Date().toISOString(),
        requestId: req.context.requestId
      };

      // Emit user updated event
      eventBus.emitUserUpdated(updatedUser, req.context);

      res.status(HTTP_STATUS_CODES.OK).json(response);
    } catch (error) {
      logger.error('Failed to update user', {
        requestId: req.context.requestId,
        userId: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'update_user'
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

  public static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = dummyDataService.deleteUser(id);

      if (!deleted) {
        const response: ApiResponse = {
          success: false,
          error: ERROR_MESSAGES.RESOURCE_NOT_FOUND,
          timestamp: new Date().toISOString(),
          requestId: req.context.requestId
        };

        res.status(HTTP_STATUS_CODES.NOT_FOUND).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'User deleted successfully',
        timestamp: new Date().toISOString(),
        requestId: req.context.requestId
      };

      // Emit user deleted event
      eventBus.emitUserDeleted(id, req.context);

      res.status(HTTP_STATUS_CODES.NO_CONTENT).json(response);
    } catch (error) {
      logger.error('Failed to delete user', {
        requestId: req.context.requestId,
        userId: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'delete_user'
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

  public static async generateUsers(req: Request, res: Response): Promise<void> {
    try {
      const { count } = req.body;
      const newUsers = dummyDataService.generateRandomUsers(count);

      const response: ApiResponse<User[]> = {
        success: true,
        data: newUsers,
        message: `${count} users generated successfully`,
        timestamp: new Date().toISOString(),
        requestId: req.context.requestId
      };

      // Emit multiple user created events
      newUsers.forEach(user => {
        eventBus.emitUserCreated(user, req.context);
      });

      res.status(HTTP_STATUS_CODES.CREATED).json(response);
    } catch (error) {
      logger.error('Failed to generate users', {
        requestId: req.context.requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'generate_users'
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

  public static async getUsersStats(req: Request, res: Response): Promise<void> {
    try {
      const totalUsers = dummyDataService.getUsersCount();
      const adminCount = dummyDataService.getUsersCountByRole('admin');
      const userCount = dummyDataService.getUsersCountByRole('user');
      const moderatorCount = dummyDataService.getUsersCountByRole('moderator');

      const stats = {
        total: totalUsers,
        byRole: {
          admin: adminCount,
          user: userCount,
          moderator: moderatorCount
        }
      };

      const response: ApiResponse<typeof stats> = {
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
        requestId: req.context.requestId
      };

      res.status(HTTP_STATUS_CODES.OK).json(response);
    } catch (error) {
      logger.error('Failed to get users stats', {
        requestId: req.context.requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'get_users_stats'
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

  private static sortUsers(users: User[], sortBy: string, sortOrder: 'asc' | 'desc' = 'asc'): User[] {
    return [...users].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'role':
          aValue = a.role.toLowerCase();
          bValue = b.role.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
}
