import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { BookListParams } from '../types';

export const bookKeys = {
  all: ['books'] as const,
  lists: () => [...bookKeys.all, 'list'] as const,
  list: (params: BookListParams) => [...bookKeys.lists(), params] as const,
} as const;

// Hook for fetching books with pagination, search, and sorting
export function useBooks(params?: BookListParams) {
  return useQuery({
    queryKey: bookKeys.list(params || {}),
    queryFn: () => apiClient.getBookList(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
