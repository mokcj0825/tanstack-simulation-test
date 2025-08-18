import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

// Generic POST operation configuration
export interface PostOperationConfig<TData = any, TResponse = any> {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  onSuccess?: (data: TResponse, variables: TData) => void;
  onError?: (error: any, variables: TData) => void;
  retry?: boolean | number | ((failureCount: number, error: any) => boolean);
  networkMode?: 'online' | 'always' | 'offlineFirst';
}

// Generic POST request data type
export type PostRequestData<TData = any> = {
  type: string;
  data: TData;
  config?: PostOperationConfig<TData>;
};

// Query keys for different operations
export const postKeys = {
  all: ['post'] as const,
  operation: (type: string) => [...postKeys.all, type] as const,
} as const;

// Generic POST hook
export function usePost() {
  return useMutation({
    mutationFn: async (request: PostRequestData) => {
      const { type, data, config } = request;
      const endpoint = config?.endpoint || `/${type}`;
      const method = config?.method || 'POST';
      
      return apiClient.request({
        method,
        url: endpoint,
        data
      });
    },
    onSuccess: (data, variables) => {
      const { type, data: requestData, config } = variables;
      
      if (config?.onSuccess) {
        config.onSuccess(data, requestData);
      }
      
      console.log(`${type} operation completed successfully:`, data);
    },
    onError: (error, variables) => {
      const { type, data: requestData, config } = variables;
      
      if (config?.onError) {
        config.onError(error, requestData);
      }
      
      console.error(`${type} operation failed:`, error);
    },
    mutationKey: postKeys.all,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
    networkMode: 'online',
  });
}
