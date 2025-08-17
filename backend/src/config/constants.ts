export const API_CONSTANTS = {
  PORT: process.env.PORT || 3001,
  HOST: process.env.HOST || 'localhost',
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  API_VERSION: process.env.API_VERSION || 'v1',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  REQUEST_TIMEOUT_MS: parseInt(process.env.REQUEST_TIMEOUT_MS || '30000'), // 30 seconds
  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
} as const;

export const EVENT_TYPES = {
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  DATA_FETCHED: 'data.fetched',
  ERROR_OCCURRED: 'error.occurred',
  API_REQUEST: 'api.request',
  API_RESPONSE: 'api.response'
} as const;

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

export const ERROR_MESSAGES = {
  INVALID_INPUT: 'Invalid input provided',
  RESOURCE_NOT_FOUND: 'Resource not found',
  INTERNAL_ERROR: 'Internal server error',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  VALIDATION_ERROR: 'Validation error'
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE_SIZE: parseInt(process.env.DEFAULT_PAGE_SIZE || '10'),
  MAX_PAGE_SIZE: parseInt(process.env.MAX_PAGE_SIZE || '100'),
  DEFAULT_PAGE: parseInt(process.env.DEFAULT_PAGE || '1')
} as const;
