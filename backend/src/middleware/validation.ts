import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError, ApiError } from '../types';
import { ERROR_MESSAGES, HTTP_STATUS_CODES } from '../config/constants';
import { logger } from '../services/logger';

export interface ValidationSchema {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}

export class ValidationMiddleware {
  private static schemas: Map<string, ValidationSchema> = new Map();

  public static registerSchema(route: string, schema: ValidationSchema): void {
    this.schemas.set(route, schema);
  }

  public static validate(route: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const schema = this.schemas.get(route);
      
      if (!schema) {
        next();
        return;
      }

      const validationErrors: ValidationError[] = [];

      // Validate body
      if (schema.body) {
        const bodyResult = schema.body.validate(req.body, { abortEarly: false });
        if (bodyResult.error) {
          bodyResult.error.details.forEach(detail => {
            validationErrors.push({
              field: detail.path.join('.'),
              message: detail.message,
              value: detail.context?.value
            });
          });
        }
      }

      // Validate query
      if (schema.query) {
        const queryResult = schema.query.validate(req.query, { abortEarly: false });
        if (queryResult.error) {
          queryResult.error.details.forEach(detail => {
            validationErrors.push({
              field: `query.${detail.path.join('.')}`,
              message: detail.message,
              value: detail.context?.value
            });
          });
        }
      }

      // Validate params
      if (schema.params) {
        const paramsResult = schema.params.validate(req.params, { abortEarly: false });
        if (paramsResult.error) {
          paramsResult.error.details.forEach(detail => {
            validationErrors.push({
              field: `params.${detail.path.join('.')}`,
              message: detail.message,
              value: detail.context?.value
            });
          });
        }
      }

      if (validationErrors.length > 0) {
        const error = new Error(ERROR_MESSAGES.VALIDATION_ERROR) as ApiError;
        error.statusCode = HTTP_STATUS_CODES.BAD_REQUEST;
        error.details = validationErrors;
        
        logger.error('Validation failed', {
          requestId: 'system',
          route,
          errors: validationErrors,
          operation: 'validation'
        });

        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          success: false,
          error: ERROR_MESSAGES.VALIDATION_ERROR,
          details: validationErrors,
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown'
        });
        return;
      }

      next();
    };
  }

  public static createUserSchema(): ValidationSchema {
    return {
      body: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        email: Joi.string().email().required(),
        role: Joi.string().valid('admin', 'user', 'moderator').optional()
      })
    };
  }

  public static updateUserSchema(): ValidationSchema {
    return {
      params: Joi.object({
        id: Joi.string().required()
      }),
      body: Joi.object({
        name: Joi.string().min(2).max(100).optional(),
        email: Joi.string().email().optional(),
        role: Joi.string().valid('admin', 'user', 'moderator').optional()
      }).min(1)
    };
  }

  public static getUserSchema(): ValidationSchema {
    return {
      params: Joi.object({
        id: Joi.string().required()
      })
    };
  }

  public static getUsersSchema(): ValidationSchema {
    return {
      query: Joi.object({
        page: Joi.number().integer().min(1).optional(),
        pageSize: Joi.number().integer().min(1).max(100).optional(),
        search: Joi.string().min(1).optional(),
        role: Joi.string().valid('admin', 'user', 'moderator').optional(),
        sortBy: Joi.string().valid('name', 'email', 'role', 'createdAt').optional(),
        sortOrder: Joi.string().valid('asc', 'desc').optional()
      })
    };
  }

  public static deleteUserSchema(): ValidationSchema {
    return {
      params: Joi.object({
        id: Joi.string().required()
      })
    };
  }

  public static generateUsersSchema(): ValidationSchema {
    return {
      body: Joi.object({
        count: Joi.number().integer().min(1).max(50).required()
      })
    };
  }

  public static updateProfileSchema(): ValidationSchema {
    return {
      body: Joi.object({
        placeHolder: Joi.string().required(),
        dummyData: Joi.array().items(Joi.string()).required(),
        numericValue: Joi.number().required(),
        objectValue: Joi.object({
          firstString: Joi.string().required(),
          secondString: Joi.string().required()
        }).required()
      })
    };
  }

  public static getBookListSchema(): ValidationSchema {
    return {
      query: Joi.object({
        page: Joi.number().integer().min(1).optional(),
        pageSize: Joi.number().integer().min(1).max(100).optional(),
        searchKey: Joi.string().min(1).optional(),
        sortBy: Joi.string().valid('bookName', 'author', 'price', 'stock', 'category', 'isbn').optional(),
        sortOrder: Joi.string().valid('asc', 'desc').optional()
      })
    };
  }
}
