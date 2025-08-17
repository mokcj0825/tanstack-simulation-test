import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  PaginatedResponse, 
  User, 
  CreateUserRequest, 
  UpdateUserRequest, 
  UserStats, 
  PaginationParams,
  GenerateUsersRequest 
} from '../types';

// API constants to avoid magic values
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || '/api/v1',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
} as const;

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Retry logic for network errors
        if (error.code === 'ECONNABORTED' && !originalRequest._retry) {
          originalRequest._retry = true;
          
          for (let attempt = 1; attempt <= API_CONFIG.RETRY_ATTEMPTS; attempt++) {
            try {
              await this.delay(API_CONFIG.RETRY_DELAY * attempt);
              return await this.client(originalRequest);
            } catch (retryError) {
              if (attempt === API_CONFIG.RETRY_ATTEMPTS) {
                return Promise.reject(retryError);
              }
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Users API methods
  async getUsers(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    const response = await this.client.get<PaginatedResponse<User>>('/users', { params });
    return response.data;
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    const response = await this.client.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  }

  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    const response = await this.client.post<ApiResponse<User>>('/users', userData);
    return response.data;
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<ApiResponse<User>> {
    const response = await this.client.put<ApiResponse<User>>(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete<ApiResponse<void>>(`/users/${id}`);
    return response.data;
  }

  async generateUsers(request: GenerateUsersRequest): Promise<ApiResponse<User[]>> {
    const response = await this.client.post<ApiResponse<User[]>>('/users/generate', request);
    return response.data;
  }

  async getUsersStats(): Promise<ApiResponse<UserStats>> {
    const response = await this.client.get<ApiResponse<UserStats>>('/users/stats');
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; uptime: number; environment: string; version: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export const apiClient = new ApiClient();
