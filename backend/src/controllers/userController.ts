import { Request, Response } from 'express';
import { User, CreateUserRequest, UpdateUserRequest, UpdateProfileRequest, UpdateProfileResponse, Book } from '../types';
import { ApiResponse, PaginatedResponse } from '../types';
import { HTTP_STATUS_CODES, ERROR_MESSAGES } from '../config/constants';
import { dummyDataService } from '../data/dummyData';
import { eventBus } from '../services/eventBus';
import { logger } from '../services/logger';

export class UserController {
  public static async getUsers(req: Request, res: Response): Promise<void> {
    const requestId = req.context?.requestId || 'unknown';
    
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const pageSize = parseInt(req.query['pageSize'] as string) || 10;
      const search = req.query['search'] as string;
      const role = req.query['role'] as string;
      const sortBy = req.query['sortBy'] as string;
      const sortOrder = (req.query['sortOrder'] as 'asc' | 'desc') || 'asc';

      let users: User[];

      // Get users based on filters
      if (search) {
        users = dummyDataService.searchUsers(search);
      } else if (role) {
        if (role === 'admin' || role === 'user' || role === 'moderator') {
          users = dummyDataService.getUsersByRole(role);
        } else {
          users = [];
        }
      } else {
        users = dummyDataService.getAllUsers();
      }

      // Apply sorting
      if (sortBy) {
        users = UserController.sortUsers(users, sortBy, sortOrder);
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
        requestId,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };

      res.status(HTTP_STATUS_CODES.OK).json(response);
    } catch (error) {
      logger.error('Failed to get users', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'get_users'
      });

      const response: ApiResponse = {
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR,
        timestamp: new Date().toISOString(),
        requestId
      };

      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  public static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: ERROR_MESSAGES.BAD_REQUEST,
          timestamp: new Date().toISOString(),
          requestId: req.context.requestId
        };
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json(response);
        return;
      }
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
        userId: req.params['id'] || 'unknown',
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
      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: ERROR_MESSAGES.BAD_REQUEST,
          timestamp: new Date().toISOString(),
          requestId: req.context.requestId
        };
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json(response);
        return;
      }
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
        userId: req.params['id'] || 'unknown',
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
      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: ERROR_MESSAGES.BAD_REQUEST,
          timestamp: new Date().toISOString(),
          requestId: req.context.requestId
        };
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json(response);
        return;
      }
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
        userId: req.params['id'] || 'unknown',
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
      let aValue: string;
      let bValue: string;
      
      if (sortBy.toLowerCase() === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else if (sortBy.toLowerCase() === 'email') {
        aValue = a.email.toLowerCase();
        bValue = b.email.toLowerCase();
      } else if (sortBy.toLowerCase() === 'role') {
        aValue = a.role.toLowerCase();
        bValue = b.role.toLowerCase();
      } else {
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

  public static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const requestData: UpdateProfileRequest = req.body;
      
      // Transform the request data according to the specified mapping
      const responseData: UpdateProfileResponse = {
        response: requestData.placeHolder,
        dataList: requestData.dummyData,
        amount: requestData.numericValue,
        tooltip: {
          header: requestData.objectValue.firstString,
          footer: requestData.objectValue.secondString
        }
      };

      const response: ApiResponse<UpdateProfileResponse> = {
        success: true,
        data: responseData,
        timestamp: new Date().toISOString(),
        requestId: req.context.requestId
      };

      // Emit profile update event
      eventBus.emit('profile:updated', {
        type: 'profile:updated',
        data: responseData,
        timestamp: new Date().toISOString(),
        source: 'user_controller',
        correlationId: req.context.requestId
      });

      res.status(HTTP_STATUS_CODES.OK).json(response);
    } catch (error) {
      logger.error('Failed to update profile', {
        requestId: req.context.requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'update_profile'
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

  public static async getBookList(req: Request, res: Response): Promise<void> {
    const requestId = req.context?.requestId || 'unknown';
    
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const pageSize = parseInt(req.query['pageSize'] as string) || 10;
      const searchKey = req.query['searchKey'] as string;
      const sortBy = req.query['sortBy'] as string;
      const sortOrder = (req.query['sortOrder'] as 'asc' | 'desc') || 'asc';

      // Generate dummy book data
      const dummyBooks: Book[] = [
        {
          id: 'book-001',
          bookName: { my: 'အင်္ဂလိပ်စာ သင်ခန်းစာ', en: 'English Learning Guide', zh: '英语学习指南' },
          isbn: '978-0-123456-47-2',
          author: 'John Smith',
          authorDescription: { 
            my: 'အင်္ဂလိပ်စာ ပညာရှင်', 
            en: 'English Language Expert', 
            zh: '英语语言专家' 
          },
          bookDescription: { 
            my: 'အင်္ဂလိပ်စာ သင်ယူရန် လမ်းညွှန်ချက်', 
            en: 'Comprehensive guide for learning English', 
            zh: '英语学习综合指南' 
          },
          price: 29.99,
          stock: 50,
          category: 'Education'
        },
        {
          id: 'book-002',
          bookName: { my: 'ပရိုဂရမ်မင်း အနုပညာ', en: 'The Art of Programming', zh: '编程艺术' },
          isbn: '978-0-987654-32-1',
          author: 'Jane Doe',
          authorDescription: { 
            my: 'ဆော့ဖ်ဝဲ အင်ဂျင်နီယာ', 
            en: 'Software Engineer', 
            zh: '软件工程师' 
          },
          bookDescription: { 
            my: 'ပရိုဂရမ်မင်း နည်းပညာ လမ်းညွှန်', 
            en: 'Advanced programming techniques and best practices', 
            zh: '高级编程技术和最佳实践' 
          },
          price: 49.99,
          stock: 25,
          category: 'Technology'
        },
        {
          id: 'book-003',
          bookName: { my: 'စီးပွားရေး စီမံခန့်ခွဲမှု', en: 'Business Management', zh: '商业管理' },
          isbn: '978-0-555555-55-5',
          author: 'Robert Johnson',
          authorDescription: { 
            my: 'စီးပွားရေး အတိုင်ပင်ခံ', 
            en: 'Business Consultant', 
            zh: '商业顾问' 
          },
          bookDescription: { 
            my: 'စီးပွားရေး စီမံခန့်ခွဲမှု နည်းလမ်းများ', 
            en: 'Modern business management strategies', 
            zh: '现代商业管理策略' 
          },
          price: 39.99,
          stock: 30,
          category: 'Business'
        },
        {
          id: 'book-004',
          bookName: { my: 'သိပ္ပံ နည်းပညာ', en: 'Science & Technology', zh: '科学技术' },
          isbn: '978-0-777777-77-7',
          author: 'Dr. Emily Chen',
          authorDescription: { 
            my: 'သိပ္ပံပညာရှင်', 
            en: 'Research Scientist', 
            zh: '研究科学家' 
          },
          bookDescription: { 
            my: 'ခေတ်မီ သိပ္ပံ နည်းပညာ ဖွံ့ဖြိုးမှု', 
            en: 'Latest developments in science and technology', 
            zh: '科学技术最新发展' 
          },
          price: 59.99,
          stock: 15,
          category: 'Science'
        },
        {
          id: 'book-005',
          bookName: { my: 'စာပေ သမိုင်း', en: 'Literary History', zh: '文学史' },
          isbn: '978-0-999999-99-9',
          author: 'Prof. Michael Brown',
          authorDescription: { 
            my: 'စာပေ ပညာရှင်', 
            en: 'Literature Professor', 
            zh: '文学教授' 
          },
          bookDescription: { 
            my: 'ကမ္ဘာ့ စာပေ သမိုင်း လေ့လာချက်', 
            en: 'Comprehensive study of world literature', 
            zh: '世界文学综合研究' 
          },
          price: 34.99,
          stock: 40,
          category: 'Literature'
        }
      ];

      let books: Book[] = [...dummyBooks];

      // Apply search filter if searchKey is provided
      if (searchKey) {
        books = books.filter(book => 
          book.bookName.en.toLowerCase().includes(searchKey.toLowerCase()) ||
          book.bookName.my.toLowerCase().includes(searchKey.toLowerCase()) ||
          book.bookName.zh.toLowerCase().includes(searchKey.toLowerCase()) ||
          book.author.toLowerCase().includes(searchKey.toLowerCase()) ||
          book.isbn.toLowerCase().includes(searchKey.toLowerCase()) ||
          book.category.toLowerCase().includes(searchKey.toLowerCase())
        );
      }

      // Apply sorting if sortBy is provided
      if (sortBy) {
        books = UserController.sortBooks(books, sortBy, sortOrder);
      }

      // Apply pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedBooks = books.slice(startIndex, endIndex);
      const total = books.length;
      const totalPages = Math.ceil(total / pageSize);

      const response: PaginatedResponse<Book> = {
        success: true,
        data: paginatedBooks,
        timestamp: new Date().toISOString(),
        requestId,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };

      res.status(HTTP_STATUS_CODES.OK).json(response);
    } catch (error) {
      logger.error('Failed to get book list', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'get_book_list'
      });

      const response: ApiResponse = {
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR,
        timestamp: new Date().toISOString(),
        requestId
      };

      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  private static sortBooks(books: Book[], sortBy: string, sortOrder: 'asc' | 'desc' = 'asc'): Book[] {
    return [...books].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (sortBy.toLowerCase()) {
        case 'bookname':
          aValue = a.bookName.en.toLowerCase();
          bValue = b.bookName.en.toLowerCase();
          break;
        case 'author':
          aValue = a.author.toLowerCase();
          bValue = b.author.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'stock':
          aValue = a.stock;
          bValue = b.stock;
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        case 'isbn':
          aValue = a.isbn.toLowerCase();
          bValue = b.isbn.toLowerCase();
          break;
        default:
          aValue = a.bookName.en.toLowerCase();
          bValue = b.bookName.en.toLowerCase();
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
