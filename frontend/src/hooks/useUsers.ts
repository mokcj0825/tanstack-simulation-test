import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest, 
  PaginationParams,
  GenerateUsersRequest 
} from '../types';

// Query keys for consistent caching
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  stats: () => [...userKeys.all, 'stats'] as const,
} as const;

// Hook for fetching users with pagination
export function useUsers(params?: PaginationParams) {
  return useQuery({
    queryKey: userKeys.list(params || {}),
    queryFn: () => apiClient.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for fetching a single user
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => apiClient.getUserById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for fetching user stats
export function useUserStats() {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: () => apiClient.getUsersStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for creating a user
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserRequest) => apiClient.createUser(userData),
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
    },
    onError: (error) => {
      console.error('Failed to create user:', error);
    },
  });
}

// Hook for updating a user
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: UpdateUserRequest }) =>
      apiClient.updateUser(id, userData),
    onSuccess: (data, variables) => {
      // Update the specific user in cache
      queryClient.setQueryData(userKeys.detail(variables.id), data);
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
    },
    onError: (error) => {
      console.error('Failed to update user:', error);
    },
  });
}

// Hook for deleting a user
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteUser(id),
    onSuccess: (_, deletedId) => {
      // Remove the user from cache
      queryClient.removeQueries({ queryKey: userKeys.detail(deletedId) });
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
    },
    onError: (error) => {
      console.error('Failed to delete user:', error);
    },
  });
}

// Hook for generating users
export function useGenerateUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: GenerateUsersRequest) => apiClient.generateUsers(request),
    onSuccess: () => {
      // Invalidate and refetch users list and stats
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
    },
    onError: (error) => {
      console.error('Failed to generate users:', error);
    },
  });
}

// Hook for prefetching user data
export function usePrefetchUser(id: string) {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: userKeys.detail(id),
      queryFn: () => apiClient.getUserById(id),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };
}
