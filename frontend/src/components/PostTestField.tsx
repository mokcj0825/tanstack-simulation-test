import React, { useState, useRef } from 'react';
import { usePost, PostOperationConfig } from '../hooks/usePost';
import { Loader2, CheckCircle, AlertCircle, TestTube, Send } from 'lucide-react';

export const PostTestField: React.FC = () => {
  const [requestData, setRequestData] = useState<string>('');
  const [responseData, setResponseData] = useState<string>('');
  const [operationType, setOperationType] = useState<string>('');
  const isRequestInProgress = useRef(false);

  const postMutation = usePost();

  const handleOperation = async (type: string, data: any) => {
    if (isRequestInProgress.current) return;
    
    isRequestInProgress.current = true;
    setOperationType(type);
    setRequestData(JSON.stringify(data, null, 2));
    setResponseData('Loading...');
    
    try {
      // Define operation configurations
      const operationConfigs: Record<string, PostOperationConfig> = {
                 login: {
           endpoint: '/v1/auth/login',
           method: 'POST',
           onSuccess: (response) => {
             console.log('Login successful:', response);
           },
           onError: (error) => {
             console.error('Login failed:', error);
           }
         },
                 updateProfile: {
           endpoint: '/v1/users/updateProfile',
           method: 'POST',
           onSuccess: (response) => {
             console.log('Profile updated successfully:', response);
           },
           onError: (error) => {
             console.error('Profile update failed:', error);
           }
         },
                 validateToken: {
           endpoint: '/v1/auth/validate',
           method: 'GET',
           onSuccess: (response) => {
             console.log('Token validated successfully:', response);
           },
           onError: (error) => {
             console.error('Token validation failed:', error);
           }
         },
                 refreshToken: {
           endpoint: '/v1/auth/refresh',
           method: 'POST',
           onSuccess: (response) => {
             console.log('Token refreshed successfully:', response);
           },
           onError: (error) => {
             console.error('Token refresh failed:', error);
           }
         },
                 logout: {
           endpoint: '/v1/auth/logout',
           method: 'POST',
           onSuccess: (response) => {
             console.log('Logout successful:', response);
           },
           onError: (error) => {
             console.error('Logout failed:', error);
           }
         }
      };

      const config = operationConfigs[type];
      if (!config) {
        throw new Error(`Unknown operation type: ${type}`);
      }

      const result = await postMutation.mutateAsync({
        type,
        data,
        config
      });
      
      setResponseData(JSON.stringify(result, null, 2));
    } catch (error: any) {
      setResponseData(JSON.stringify({ error: error.message || 'Unknown error' }, null, 2));
    } finally {
      isRequestInProgress.current = false;
    }
  };

  const getStatusIcon = () => {
    if (postMutation.isPending) {
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

  const isAnyPending = postMutation.isPending;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Generic POST Hook Test</h3>
          <p className="text-sm text-gray-600">Test the unified usePost hook for different operations</p>
        </div>
        {getStatusIcon()}
      </div>

      <div className="space-y-4">
        {/* Operation Buttons */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          <button
            onClick={() => handleOperation('login', {
              userName: "testuser",
              password: "testpass",
              expectedResult: 1
            })}
            disabled={isAnyPending}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center space-x-1"
          >
            <Send size={14} />
            <span>Login</span>
          </button>

          <button
            onClick={() => handleOperation('updateProfile', {
              placeHolder: "Test Profile",
              dummyData: ["Item 1", "Item 2", "Item 3"],
              numericValue: 42,
              objectValue: {
                firstString: "Header Text",
                secondString: "Footer Text"
              }
            })}
            disabled={isAnyPending}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center space-x-1"
          >
            <Send size={14} />
            <span>Profile</span>
          </button>

          <button
            onClick={() => handleOperation('validateToken', {
              accessToken: "dummy-token"
            })}
            disabled={isAnyPending}
            className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center space-x-1"
          >
            <Send size={14} />
            <span>Validate</span>
          </button>

          <button
            onClick={() => handleOperation('refreshToken', {
              refreshToken: "dummy-refresh-token"
            })}
            disabled={isAnyPending}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center space-x-1"
          >
            <Send size={14} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => handleOperation('logout', {
              refreshToken: "dummy-refresh-token"
            })}
            disabled={isAnyPending}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center space-x-1"
          >
            <Send size={14} />
            <span>Logout</span>
          </button>
        </div>

        {/* Request/Response Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Request Data ({operationType})
            </label>
            <pre className="bg-gray-50 border border-gray-200 rounded-md p-3 text-sm text-gray-800 overflow-auto max-h-64">
              {requestData || 'Click a button to send a request'}
            </pre>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Response Data
            </label>
            <pre className="bg-gray-50 border border-gray-200 rounded-md p-3 text-sm text-gray-800 overflow-auto max-h-64">
              {responseData || 'Response will appear here'}
            </pre>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          <p><strong>Unified Hook:</strong> usePost() - Single hook for all POST operations</p>
          <p><strong>Convenience Hooks:</strong> usePostLogin(), usePostUpdateProfile(), etc.</p>
          <p><strong>Benefits:</strong> Consistent error handling, caching, and state management</p>
        </div>
      </div>
    </div>
  );
};
