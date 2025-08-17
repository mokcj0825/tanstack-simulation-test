export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'user' | 'moderator';

export interface CreateUserRequest {
  name: string;
  email: string;
  role?: UserRole;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface EventPayload {
  type: string;
  data: unknown;
  timestamp: string;
  source: string;
  correlationId?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ApiError extends Error {
  statusCode: number;
  code?: string;
  details?: ValidationError[];
}

export interface RequestContext {
  requestId: string;
  userId?: string;
  timestamp: string;
  method: string;
  path: string;
  userAgent?: string;
  ip?: string;
}

export interface LoggerContext {
  requestId: string;
  userId?: string;
  operation: string;
  duration?: number;
}
