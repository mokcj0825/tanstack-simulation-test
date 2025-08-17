import App from './app';
import { logger } from './services/logger';
import { API_CONSTANTS } from './config/constants';

const app = new App();

// Graceful shutdown handling
const gracefulShutdown = (signal: string): void => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`, {
    signal,
    operation: 'graceful_shutdown'
  });

  process.exit(0);
};

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
    operation: 'uncaught_exception'
  });

  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error('Unhandled Rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
    promise: promise.toString(),
    operation: 'unhandled_rejection'
  });

  process.exit(1);
});

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
try {
  app.listen();
} catch (error) {
  logger.error('Failed to start server', {
    error: error instanceof Error ? error.message : 'Unknown error',
    operation: 'server_startup'
  });

  process.exit(1);
}
