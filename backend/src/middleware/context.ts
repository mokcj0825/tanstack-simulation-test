import { Request, Response, NextFunction } from 'express';
import { RequestContext } from '../types';
import { eventBus } from '../services/eventBus';
import { logger } from '../services/logger';

declare global {
  namespace Express {
    interface Request {
      context: RequestContext;
      startTime: number;
    }
  }
}

export class ContextMiddleware {
  public static addContext(req: Request, res: Response, next: NextFunction): void {
    const requestId = req.headers['x-request-id'] as string || this.generateRequestId();
    const startTime = Date.now();

    const context: RequestContext = {
      requestId,
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress || 'unknown'
    };

    req.context = context;
    req.startTime = startTime;

    // Add request ID to response headers
    res.setHeader('X-Request-ID', requestId);

    // Log request start
    logger.info('Request started', {
      requestId,
      method: req.method,
      path: req.path,
      operation: 'request_start'
    });

    // Emit API request event
    eventBus.emitApiRequest(context, req.method, req.path);

    next();
  }

  public static addResponseTime(req: Request, res: Response, next: NextFunction): void {
    const originalSend = res.send;

    res.send = function(body: any): Response {
      const duration = Date.now() - req.startTime;
      
      // Log response
      logger.info('Request completed', {
        requestId: req.context.requestId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        operation: 'request_complete'
      });

      // Emit API response event
      eventBus.emitApiResponse(req.context, res.statusCode, duration);

      // Add response time header
      res.setHeader('X-Response-Time', `${duration}ms`);

      return originalSend.call(this, body);
    };

    next();
  }

  public static addErrorContext(error: Error, req: Request, res: Response, next: NextFunction): void {
    const duration = Date.now() - req.startTime;

    // Log error with context
    logger.error('Request failed', {
      requestId: req.context.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      error: error.message,
      stack: error.stack,
      operation: 'request_error'
    });

    // Emit error event
    eventBus.emitError(error, req.context);

    next(error);
  }

  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public static addUserContext(req: Request, _res: Response, next: NextFunction): void {
    // In a real application, this would extract user info from JWT or session
    const userId = req.headers['x-user-id'] as string;
    
    if (userId) {
      req.context.userId = userId;
    }

    next();
  }

  public static addPerformanceHeaders(_req: Request, res: Response, next: NextFunction): void {
    // Add performance monitoring headers
    res.setHeader('X-API-Version', '1.0.0');
    res.setHeader('X-Server-Time', new Date().toISOString());
    
    next();
  }
}
