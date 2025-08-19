import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  PaginatedResponse, 
  User, 
  CreateUserRequest, 
  UpdateUserRequest, 
  UserStats, 
  PaginationParams,
  GenerateUsersRequest,
  LoginRequest,
  LoginResponse,
  AuthTokens,
  RefreshTokenRequest,
  LogoutRequest,
  ValidateTokenRequest,
  UpdateProfileRequest,
  UpdateProfileResponse,
  Book,
  BookListParams
} from '../types';

// API constants to avoid magic values
const API_CONFIG = {
  BASE_URL: (import.meta as any).env?.VITE_API_URL || '/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
} as const;

class ApiClient {
  private client: AxiosInstance;
  private authToken: string | null = null;
  private pendingRequests: Map<string, Promise<any>> = new Map();

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
        
        // Add authorization header if token exists
        if (this.authToken) {
          config.headers['Authorization'] = `Bearer ${this.authToken}`;
        }
        
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

  // Auth token management
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  clearAuthToken(): void {
    this.authToken = null;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  // Clear pending requests (useful for cleanup)
  clearPendingRequests(): void {
    this.pendingRequests.clear();
  }

  // Users API methods
  async getUsers(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    const response = await this.client.get<PaginatedResponse<User>>('/v1/users', { params });
    return response.data;
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    const response = await this.client.get<ApiResponse<User>>(`/v1/users/${id}`);
    return response.data;
  }

  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    const response = await this.client.post<ApiResponse<User>>('/v1/users', userData);
    return response.data;
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<ApiResponse<User>> {
    const response = await this.client.put<ApiResponse<User>>(`/v1/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete<ApiResponse<void>>(`/v1/users/${id}`);
    return response.data;
  }

  async generateUsers(request: GenerateUsersRequest): Promise<ApiResponse<User[]>> {
    const response = await this.client.post<ApiResponse<User[]>>('/v1/users/generate', request);
    return response.data;
  }

  async getUsersStats(): Promise<ApiResponse<UserStats>> {
    const response = await this.client.get<ApiResponse<UserStats>>('/v1/users/stats');
    return response.data;
  }

  // Authentication API methods
  async login(loginRequest: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.client.post<ApiResponse<LoginResponse>>('/v1/auth/login', loginRequest);
    return response.data;
  }

  async refreshToken(refreshRequest: RefreshTokenRequest): Promise<ApiResponse<AuthTokens>> {
    const response = await this.client.post<ApiResponse<AuthTokens>>('/v1/auth/refresh', refreshRequest);
    return response.data;
  }

  async logout(logoutRequest: LogoutRequest): Promise<ApiResponse<void>> {
    const response = await this.client.post<ApiResponse<void>>('/v1/auth/logout', logoutRequest);
    // Clear pending requests on logout
    this.clearPendingRequests();
    return response.data;
  }

  async validateToken(validateRequest: ValidateTokenRequest): Promise<ApiResponse<{ valid: boolean; user: any }>> {
    const response = await this.client.get<ApiResponse<{ valid: boolean; user: any }>>('/v1/auth/validate', {
      headers: {
        'Authorization': `Bearer ${validateRequest.accessToken}`
      }
    });
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; uptime: number; environment: string; version: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }

  // Profile API methods
  async updateProfile(profileData: UpdateProfileRequest): Promise<ApiResponse<UpdateProfileResponse>> {
    const response = await this.client.post<ApiResponse<UpdateProfileResponse>>('/v1/users/updateProfile', profileData);
    return response.data;
  }

  // Book API methods
  async getBookList(params?: BookListParams): Promise<PaginatedResponse<Book>> {
    const response = await this.client.get<PaginatedResponse<Book>>('/v1/users/bookList', { params });
    return response.data;
  }

  // Generic request method
  async request<T = any>(config: {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    url: string;
    data?: any;
    params?: any;
    headers?: any;
  }): Promise<T> {
    const response = await this.client.request<T>({
      method: config.method,
      url: config.url,
      data: config.data,
      params: config.params,
      headers: config.headers,
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
