import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { 
  LoginRequest, 
  RefreshTokenRequest, 
  LogoutRequest, 
} from '../types';

// Query keys for authentication
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  tokens: () => [...authKeys.all, 'tokens'] as const,
  validation: () => [...authKeys.all, 'validation'] as const,
} as const;

// Hook for login
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (loginRequest: LoginRequest) => apiClient.login(loginRequest),
    onSuccess: (data) => {
      if (data.success && data.data) {
        // Store tokens in cache
        queryClient.setQueryData(authKeys.tokens(), {
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken
        });
        
        // Store user info in cache
        queryClient.setQueryData(authKeys.user(), data.data.user);
        
        // Set authorization header for future requests
        apiClient.setAuthToken(data.data.accessToken);
      }
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
    // Use a stable mutation key to prevent duplicate mutations
    mutationKey: authKeys.all,
    // Add retry configuration to prevent unnecessary retries
    retry: false,
    // Add network mode to ensure proper deduplication
    networkMode: 'online',
  });
}

// Hook for token refresh
export function useRefreshToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (refreshRequest: RefreshTokenRequest) => apiClient.refreshToken(refreshRequest),
    onSuccess: (data) => {
      if (data.success && data.data) {
        // Update tokens in cache
        queryClient.setQueryData(authKeys.tokens(), data.data);
        
        // Update authorization header
        apiClient.setAuthToken(data.data.accessToken);
      }
    },
    onError: (error) => {
      console.error('Token refresh failed:', error);
      // Clear auth data on refresh failure
      queryClient.removeQueries({ queryKey: authKeys.all });
      apiClient.clearAuthToken();
    },
  });
}

// Hook for logout
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (logoutRequest: LogoutRequest) => apiClient.logout(logoutRequest),
    onSuccess: () => {
      // Clear all auth data from cache
      queryClient.removeQueries({ queryKey: authKeys.all });
      apiClient.clearAuthToken();
      apiClient.clearPendingRequests();
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      // Clear auth data even if logout fails
      queryClient.removeQueries({ queryKey: authKeys.all });
      apiClient.clearAuthToken();
      apiClient.clearPendingRequests();
    },
  });
}

// Hook for token validation
export function useValidateToken(accessToken: string | null) {
  return useQuery({
    queryKey: authKeys.validation(),
    queryFn: () => apiClient.validateToken({ accessToken: accessToken! }),
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401/403 errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Hook for getting current user
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => {
      // This would typically fetch user data from the stored token
      // For now, we'll return the cached user data
      return null;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Hook for getting stored tokens
export function useAuthTokens() {
  return useQuery({
    queryKey: authKeys.tokens(),
    queryFn: () => {
      // This would typically get tokens from secure storage
      // For now, we'll return null
      return null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
