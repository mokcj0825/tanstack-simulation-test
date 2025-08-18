import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { API_CONSTANTS } from './config/constants';
import { ContextMiddleware } from './middleware/context';
import { logger } from './services/logger';
import { eventBus } from './services/eventBus';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';

// Load environment variables
dotenv.config();

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeEventListeners();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS configuration
    this.app.use(cors({
      origin: API_CONSTANTS.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-User-ID']
    }));

    // Request parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Context and performance middleware
    this.app.use((req, res, next) => ContextMiddleware.addContext(req, res, next));
    this.app.use((req, res, next) => ContextMiddleware.addResponseTime(req, res, next));
    this.app.use((req, res, next) => ContextMiddleware.addUserContext(req, res, next));
    this.app.use((req, res, next) => ContextMiddleware.addPerformanceHeaders(req, res, next));

    // Logging middleware
    this.app.use(morgan('combined', {
      stream: {
        write: (message: string) => {
          logger.info(message.trim(), { requestId: 'morgan', operation: 'http_request' });
        }
      }
    }));
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (_req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: API_CONSTANTS.NODE_ENV,
        version: '1.0.0'
      });
    });

    // API routes
    this.app.use(`/api/${API_CONSTANTS.API_VERSION}/auth`, authRoutes);
    this.app.use(`/api/${API_CONSTANTS.API_VERSION}/users`, userRoutes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Route not found',
        timestamp: new Date().toISOString(),
        requestId: req.context?.requestId || 'unknown'
      });
    });
  }

  private initializeErrorHandling(): void {
    // Global error handler
    this.app.use((error: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
      const statusCode = (error as any).statusCode || 500;
      const message = error.message || 'Internal Server Error';

      logger.error('Unhandled error', {
        requestId: req.context?.requestId || 'unknown',
        error: message,
        stack: error.stack,
        operation: 'unhandled_error'
      });

      res.status(statusCode).json({
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
        requestId: req.context?.requestId || 'unknown'
      });
    });
  }

  private initializeEventListeners(): void {
    // Subscribe to events for monitoring and logging
    eventBus.subscribeToEvent('user.created', (payload) => {
      logger.info('User created event received', {
        requestId: 'system',
        eventType: payload.type,
        userId: (payload.data as any)?.id,
        operation: 'event_handling'
      });
    });

    eventBus.subscribeToEvent('user.updated', (payload) => {
      logger.info('User updated event received', {
        requestId: 'system',
        eventType: payload.type,
        userId: (payload.data as any)?.id,
        operation: 'event_handling'
      });
    });

    eventBus.subscribeToEvent('user.deleted', (payload) => {
      logger.info('User deleted event received', {
        requestId: 'system',
        eventType: payload.type,
        userId: (payload.data as any)?.userId,
        operation: 'event_handling'
      });
    });

    eventBus.subscribeToEvent('data.fetched', (payload) => {
      logger.info('Data fetched event received', {
        requestId: 'system',
        eventType: payload.type,
        dataType: (payload.data as any)?.dataType,
        count: (payload.data as any)?.count,
        operation: 'event_handling'
      });
    });

    eventBus.subscribeToEvent('error.occurred', (payload) => {
      logger.error('Error event received', {
        requestId: 'system',
        eventType: payload.type,
        error: (payload.data as any)?.message,
        operation: 'event_handling'
      });
    });
  }

  public listen(): void {
    this.app.listen(API_CONSTANTS.PORT, () => {
      logger.info(`Server is running on port ${API_CONSTANTS.PORT}`, {
        requestId: 'system',
        port: API_CONSTANTS.PORT,
        environment: API_CONSTANTS.NODE_ENV,
        operation: 'server_startup'
      });

      console.log(`🚀 Server running on http://${API_CONSTANTS.HOST}:${API_CONSTANTS.PORT}`);
      console.log(`📊 Health check: http://${API_CONSTANTS.HOST}:${API_CONSTANTS.PORT}/health`);
      console.log(`👥 Users API: http://${API_CONSTANTS.HOST}:${API_CONSTANTS.PORT}/api/${API_CONSTANTS.API_VERSION}/users`);
    });
  }
}

export default App;
