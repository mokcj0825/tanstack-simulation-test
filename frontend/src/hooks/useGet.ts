import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

// Generic GET operation configuration
export interface GetOperationConfig<TParams = any, TResponse = any> {
  endpoint: string;
  params?: TParams;
  staleTime?: number;
  gcTime?: number;
  retry?: boolean | number | ((failureCount: number, error: any) => boolean);
  networkMode?: 'online' | 'always' | 'offlineFirst';
  enabled?: boolean;
}

// Query keys for different operations
export const getKeys = {
  all: ['get'] as const,
  operation: (type: string, params?: any) => [...getKeys.all, type, params] as const,
} as const;

// Generic hook for any GET operation
export function useGetOperation<TParams = any, TResponse = any>(
  type: string,
  params?: TParams,
  config?: Omit<GetOperationConfig<TParams, TResponse>, 'endpoint' | 'params'> & { endpoint?: string }
) {
  const endpoint = config?.endpoint || `/${type}`;
  
  return useQuery({
    queryKey: getKeys.operation(type, params),
    queryFn: async (): Promise<TResponse> => {
      return apiClient.request({
        method: 'GET',
        url: endpoint,
        params
      });
    },
    staleTime: config?.staleTime || 5 * 60 * 1000, // 5 minutes default
    gcTime: config?.gcTime || 10 * 60 * 1000, // 10 minutes default
    retry: config?.retry || ((failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    }),
    networkMode: config?.networkMode || 'online',
    enabled: config?.enabled !== false,
  });
}
