import App from './app';
import { logger } from './services/logger';

const app = new App();

// Graceful shutdown handling
const gracefulShutdown = (signal: string): void => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`, {
    requestId: 'system',
    signal,
    operation: 'graceful_shutdown'
  });

  process.exit(0);
};

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error.message);
  console.error('Stack trace:', error.stack);
  
  logger.error('Uncaught Exception', {
    requestId: 'system',
    error: error.message,
    stack: error.stack,
    operation: 'uncaught_exception'
  });

  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  console.error('Unhandled Rejection:', reason);
  console.error('Promise:', promise);
  
  logger.error('Unhandled Rejection', {
    requestId: 'system',
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
    requestId: 'system',
    error: error instanceof Error ? error.message : 'Unknown error',
    operation: 'server_startup'
  });

  process.exit(1);
}
