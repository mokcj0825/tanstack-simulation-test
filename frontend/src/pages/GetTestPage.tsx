import React from 'react';
import { useGetOperation } from '../hooks/useGet';
import { Loader2, CheckCircle, AlertCircle, Database, Users, BookOpen } from 'lucide-react';

export const GetTestPage: React.FC = () => {
  // Auto-fetch users data
  const usersQuery = useGetOperation('users', { 
    page: 1, 
    pageSize: 5, 
    sortBy: 'name', 
    sortOrder: 'asc' 
  }, {
    endpoint: '/v1/users',
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: true // Auto-fetch enabled
  });

  // Auto-fetch book list data
  const bookListQuery = useGetOperation('bookList', { 
    page: 1, 
    pageSize: 3, 
    sortBy: 'price', 
    sortOrder: 'desc' 
  }, {
    endpoint: '/v1/users/bookList',
    staleTime: 3 * 60 * 1000, // 3 minutes
    enabled: true // Auto-fetch enabled
  });

  const getStatusIcon = (isLoading: boolean, error: any, data: any) => {
    if (isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
    
    if (error) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    
    if (data) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    return <Database className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">GET Test Page</h1>
          <p className="mt-2 text-gray-600">
            Auto-fetching data using the generic useGet hook
          </p>
        </div>

        {/* Two JSON Spaces */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Users JSON Space */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Users Data</h2>
              </div>
              {getStatusIcon(usersQuery.isLoading, usersQuery.error, usersQuery.data)}
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">
                <strong>Endpoint:</strong> /v1/users
              </div>
              <div className="text-sm text-gray-600 mb-2">
                <strong>Parameters:</strong> page=1, pageSize=5, sortBy=name, sortOrder=asc
              </div>
              <div className="text-sm text-gray-600">
                <strong>Stale Time:</strong> 2 minutes
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response JSON
              </label>
              <pre className="text-xs text-gray-800 overflow-auto max-h-96 whitespace-pre-wrap">
                {usersQuery.isLoading 
                  ? 'Loading users data...' 
                  : usersQuery.error 
                    ? JSON.stringify({ error: usersQuery.error.message }, null, 2)
                    : JSON.stringify(usersQuery.data, null, 2)
                }
              </pre>
            </div>

            {/* Query Status */}
            <div className="mt-4 text-xs text-gray-500 space-y-1">
              <div>Status: {usersQuery.isLoading ? 'Loading' : usersQuery.error ? 'Error' : 'Success'}</div>
              <div>Fetch Count: {usersQuery.fetchStatus}</div>
              <div>Data Updated: {usersQuery.dataUpdatedAt ? new Date(usersQuery.dataUpdatedAt).toLocaleTimeString() : 'Never'}</div>
            </div>
          </div>

          {/* Book List JSON Space */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">Book List Data</h2>
              </div>
              {getStatusIcon(bookListQuery.isLoading, bookListQuery.error, bookListQuery.data)}
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">
                <strong>Endpoint:</strong> /v1/users/bookList
              </div>
              <div className="text-sm text-gray-600 mb-2">
                <strong>Parameters:</strong> page=1, pageSize=3, sortBy=price, sortOrder=desc
              </div>
              <div className="text-sm text-gray-600">
                <strong>Stale Time:</strong> 3 minutes
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response JSON
              </label>
              <pre className="text-xs text-gray-800 overflow-auto max-h-96 whitespace-pre-wrap">
                {bookListQuery.isLoading 
                  ? 'Loading book list data...' 
                  : bookListQuery.error 
                    ? JSON.stringify({ error: bookListQuery.error.message }, null, 2)
                    : JSON.stringify(bookListQuery.data, null, 2)
                }
              </pre>
            </div>

            {/* Query Status */}
            <div className="mt-4 text-xs text-gray-500 space-y-1">
              <div>Status: {bookListQuery.isLoading ? 'Loading' : bookListQuery.error ? 'Error' : 'Success'}</div>
              <div>Fetch Count: {bookListQuery.fetchStatus}</div>
              <div>Data Updated: {bookListQuery.dataUpdatedAt ? new Date(bookListQuery.dataUpdatedAt).toLocaleTimeString() : 'Never'}</div>
            </div>
          </div>
        </div>

        {/* Information Panel */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Generic useGet Hook Features</h3>
          <div className="text-xs text-blue-800 space-y-1">
            <p>• <strong>Auto-fetching:</strong> Data loads automatically when component mounts</p>
            <p>• <strong>Intelligent caching:</strong> Data cached based on stale time configuration</p>
            <p>• <strong>Background refetching:</strong> Data refreshes in background when stale</p>
            <p>• <strong>Error handling:</strong> Automatic retry with exponential backoff</p>
            <p>• <strong>Request deduplication:</strong> Multiple components requesting same data share one request</p>
            <p>• <strong>Type safety:</strong> Full TypeScript support with generic types</p>
            <p>• <strong>Completely generic:</strong> No hardcoded knowledge of specific APIs</p>
          </div>
        </div>
      </div>
    </div>
  );
};
