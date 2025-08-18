export const API_CONSTANTS = {
  PORT: process.env['PORT'] || 3001,
  HOST: process.env['HOST'] || 'localhost',
  NODE_ENV: process.env['NODE_ENV'] || 'development',
  CORS_ORIGIN: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
  API_VERSION: process.env['API_VERSION'] || 'v1',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'),
  REQUEST_TIMEOUT_MS: parseInt(process.env['REQUEST_TIMEOUT_MS'] || '30000'), // 30 seconds
  LOG_LEVEL: process.env['LOG_LEVEL'] || 'info'
} as const;

export const EVENT_TYPES = {
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  DATA_FETCHED: 'data.fetched',
  ERROR_OCCURRED: 'error.occurred',
  API_REQUEST: 'api.request',
  API_RESPONSE: 'api.response',
  AUTH_LOGIN: 'auth.login',
  AUTH_LOGOUT: 'auth.logout',
  AUTH_ATTEMPT: 'auth.attempt',
  AUTH_TOKEN_REFRESH: 'auth.token_refresh',
  AUTH_TOKEN_VALIDATE: 'auth.token_validate'
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
  VALIDATION_ERROR: 'Validation error',
  BAD_REQUEST: 'Bad request'
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE_SIZE: parseInt(process.env['DEFAULT_PAGE_SIZE'] || '10'),
  MAX_PAGE_SIZE: parseInt(process.env['MAX_PAGE_SIZE'] || '100'),
  DEFAULT_PAGE: parseInt(process.env['DEFAULT_PAGE'] || '1')
} as const;

export const AUTH_CONSTANTS = {
  JWT_ACCESS_SECRET: process.env['JWT_ACCESS_SECRET'] || 'your-access-secret-key-change-in-production',
  JWT_REFRESH_SECRET: process.env['JWT_REFRESH_SECRET'] || 'your-refresh-secret-key-change-in-production',
  ACCESS_TOKEN_EXPIRY: process.env['ACCESS_TOKEN_EXPIRY'] || '15m',
  REFRESH_TOKEN_EXPIRY: process.env['REFRESH_TOKEN_EXPIRY'] || '7d',
  SALT_ROUNDS: parseInt(process.env['SALT_ROUNDS'] || '10')
} as const;

export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid username or password',
  USER_NOT_FOUND: 'User not found',
  ACCOUNT_LOCKED: 'Account is locked',
  TOO_MANY_ATTEMPTS: 'Too many login attempts',
  SERVER_ERROR: 'Authentication server error',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  BAD_REQUEST: 'Bad request'
} as const;
