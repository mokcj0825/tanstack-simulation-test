import winston from 'winston';
import { API_CONSTANTS } from '../config/constants';
import { LoggerContext } from '../types';

class LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: API_CONSTANTS.LOG_LEVEL,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'api' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        })
      ]
    });

    if (API_CONSTANTS.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.simple()
      }));
    }
  }

  private formatMessage(message: string, context?: LoggerContext): string {
    if (context) {
      return `[${context.requestId}] ${context.operation}: ${message}`;
    }
    return message;
  }

  private formatMeta(context?: LoggerContext, additionalMeta?: Record<string, unknown>): Record<string, unknown> {
    const baseMeta: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      environment: API_CONSTANTS.NODE_ENV
    };

    if (context) {
      baseMeta.requestId = context.requestId;
      baseMeta.operation = context.operation;
      if (context.userId) {
        baseMeta.userId = context.userId;
      }
      if (context.duration) {
        baseMeta.duration = context.duration;
      }
    }

    return { ...baseMeta, ...additionalMeta };
  }

  public info(message: string, context?: LoggerContext, meta?: Record<string, unknown>): void {
    this.logger.info(this.formatMessage(message, context), this.formatMeta(context, meta));
  }

  public error(message: string, context?: LoggerContext, meta?: Record<string, unknown>): void {
    this.logger.error(this.formatMessage(message, context), this.formatMeta(context, meta));
  }

  public warn(message: string, context?: LoggerContext, meta?: Record<string, unknown>): void {
    this.logger.warn(this.formatMessage(message, context), this.formatMeta(context, meta));
  }

  public debug(message: string, context?: LoggerContext, meta?: Record<string, unknown>): void {
    this.logger.debug(this.formatMessage(message, context), this.formatMeta(context, meta));
  }

  public log(level: string, message: string, context?: LoggerContext, meta?: Record<string, unknown>): void {
    this.logger.log(level, this.formatMessage(message, context), this.formatMeta(context, meta));
  }

  public createChildLogger(requestId: string, userId?: string): {
    info: (message: string, operation: string, meta?: Record<string, unknown>) => void;
    error: (message: string, operation: string, meta?: Record<string, unknown>) => void;
    warn: (message: string, operation: string, meta?: Record<string, unknown>) => void;
    debug: (message: string, operation: string, meta?: Record<string, unknown>) => void;
  } {
    return {
      info: (message: string, operation: string, meta?: Record<string, unknown>) => {
        this.info(message, { requestId, userId, operation }, meta);
      },
      error: (message: string, operation: string, meta?: Record<string, unknown>) => {
        this.error(message, { requestId, userId, operation }, meta);
      },
      warn: (message: string, operation: string, meta?: Record<string, unknown>) => {
        this.warn(message, { requestId, userId, operation }, meta);
      },
      debug: (message: string, operation: string, meta?: Record<string, unknown>) => {
        this.debug(message, { requestId, userId, operation }, meta);
      }
    };
  }
}

export const logger = new LoggerService();
