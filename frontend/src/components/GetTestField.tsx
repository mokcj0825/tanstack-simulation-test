import React, { useState } from 'react';
import { useGetOperation } from '../hooks/useGet';
import { Loader2, CheckCircle, AlertCircle, TestTube, Download } from 'lucide-react';

export const GetTestField: React.FC = () => {
  const [selectedOperation, setSelectedOperation] = useState<string>('');
  const [responseData, setResponseData] = useState<string>('');

  // Example configurations for different GET operations
  const operationConfigs = {
    users: {
      params: { page: 1, pageSize: 3, sortBy: 'name', sortOrder: 'asc' },
      staleTime: 2 * 60 * 1000, // 2 minutes
    },
    bookList: {
      params: { page: 1, pageSize: 2, sortBy: 'price', sortOrder: 'desc' },
      staleTime: 3 * 60 * 1000, // 3 minutes
    },
    userStats: {
      staleTime: 1 * 60 * 1000, // 1 minute
    }
  };

  // Using the generic useGetOperation hook
  const usersQuery = useGetOperation('users', operationConfigs.users.params, {
    staleTime: operationConfigs.users.staleTime,
    enabled: selectedOperation === 'users'
  });

  const bookListQuery = useGetOperation('bookList', operationConfigs.bookList.params, {
    staleTime: operationConfigs.bookList.staleTime,
    enabled: selectedOperation === 'bookList'
  });

  const userStatsQuery = useGetOperation('userStats', undefined, {
    staleTime: operationConfigs.userStats.staleTime,
    enabled: selectedOperation === 'userStats'
  });

  const handleOperation = (operation: string) => {
    setSelectedOperation(operation);
    setResponseData('Loading...');
  };

  // Update response data when queries complete
  React.useEffect(() => {
    if (usersQuery.data && selectedOperation === 'users') {
      setResponseData(JSON.stringify(usersQuery.data, null, 2));
    }
  }, [usersQuery.data, selectedOperation]);

  React.useEffect(() => {
    if (bookListQuery.data && selectedOperation === 'bookList') {
      setResponseData(JSON.stringify(bookListQuery.data, null, 2));
    }
  }, [bookListQuery.data, selectedOperation]);

  React.useEffect(() => {
    if (userStatsQuery.data && selectedOperation === 'userStats') {
      setResponseData(JSON.stringify(userStatsQuery.data, null, 2));
    }
  }, [userStatsQuery.data, selectedOperation]);

  // Handle errors
  React.useEffect(() => {
    if (usersQuery.error && selectedOperation === 'users') {
      setResponseData(JSON.stringify({ error: usersQuery.error.message }, null, 2));
    }
  }, [usersQuery.error, selectedOperation]);

  React.useEffect(() => {
    if (bookListQuery.error && selectedOperation === 'bookList') {
      setResponseData(JSON.stringify({ error: bookListQuery.error.message }, null, 2));
    }
  }, [bookListQuery.error, selectedOperation]);

  React.useEffect(() => {
    if (userStatsQuery.error && selectedOperation === 'userStats') {
      setResponseData(JSON.stringify({ error: userStatsQuery.error.message }, null, 2));
    }
  }, [userStatsQuery.error, selectedOperation]);

  const getStatusIcon = () => {
    const isAnyLoading = usersQuery.isLoading || bookListQuery.isLoading || userStatsQuery.isLoading;
    
    if (isAnyLoading) {
      return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    }
    
    if (responseData.includes('"success":true')) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    
    if (responseData.includes('"error"') || responseData.includes('"success":false')) {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
    
    return <TestTube className="h-5 w-5 text-gray-500" />;
  };

  const isAnyLoading = usersQuery.isLoading || bookListQuery.isLoading || userStatsQuery.isLoading;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Generic GET Hook Test</h3>
          <p className="text-sm text-gray-600">Test the truly generic useGet hook for different GET operations</p>
        </div>
        {getStatusIcon()}
      </div>

      <div className="space-y-4">
        {/* Operation Buttons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
          <button
            onClick={() => handleOperation('users')}
            disabled={isAnyLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center space-x-1"
          >
            <Download size={14} />
            <span>Get Users</span>
          </button>

          <button
            onClick={() => handleOperation('bookList')}
            disabled={isAnyLoading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center space-x-1"
          >
            <Download size={14} />
            <span>Get Book List</span>
          </button>

          <button
            onClick={() => handleOperation('userStats')}
            disabled={isAnyLoading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center space-x-1"
          >
            <Download size={14} />
            <span>Get User Stats</span>
          </button>
        </div>

        {/* Response Display */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Response Data ({selectedOperation})
          </label>
          <pre className="bg-gray-50 border border-gray-200 rounded-md p-3 text-sm text-gray-800 overflow-auto max-h-96">
            {responseData || 'Click a button to fetch data'}
          </pre>
        </div>

        <div className="text-xs text-gray-500">
          <p><strong>Generic Hook:</strong> useGetOperation() - Completely generic, no knowledge of specific APIs</p>
          <p><strong>Benefits:</strong> Consistent caching, error handling, and state management</p>
          <p><strong>Features:</strong> Automatic retry, request deduplication, background refetching</p>
          <p><strong>Truly Generic:</strong> No hardcoded endpoints, operations, or response types</p>
        </div>
      </div>
    </div>
  );
};
