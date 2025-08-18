import React, { useState, useRef } from 'react';
import { useLogin, useLogout, useRefreshToken, useValidateToken } from '../hooks/useAuth';
import { useAuthTokens } from '../hooks/useAuth';
import { LoginRequest } from '../types';
import { apiClient } from '../lib/api';
import { 
  Shield, 
  LogIn, 
  LogOut, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Zap,
  TestTube,
  Send,
  FileText
} from 'lucide-react';

export const AuthTestField: React.FC = () => {
  const [loginData, setLoginData] = useState<LoginRequest>({
    userName: 'admin',
    password: 'password',
    expectedResult: 200
  });

  const [refreshToken, setRefreshToken] = useState<string>('');
  const [accessToken, setAccessToken] = useState<string>('');
  const [requestData, setRequestData] = useState<string>('');
  const [responseData, setResponseData] = useState<string>('');
  const isRequestInProgress = useRef(false);

  // TanStack Query hooks
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const refreshTokenMutation = useRefreshToken();
  const validateTokenQuery = useValidateToken(accessToken || null);
  const { data: authTokens } = useAuthTokens();

  const handleLogin = async () => {
    if (isRequestInProgress.current) return;
    
    isRequestInProgress.current = true;
    setRequestData(JSON.stringify(loginData, null, 2));
    setResponseData('Loading...');
    
    try {
      const result = await loginMutation.mutateAsync(loginData);
      setResponseData(JSON.stringify(result, null, 2));
      
      if (result.success && result.data) {
        setAccessToken(result.data.accessToken);
        setRefreshToken(result.data.refreshToken);
      }
    } catch (error: any) {
      setResponseData(JSON.stringify({ error: error.message || 'Unknown error' }, null, 2));
    } finally {
      isRequestInProgress.current = false;
    }
  };

  const handleLogout = async () => {
    if (!refreshToken || isRequestInProgress.current) return;
    
    isRequestInProgress.current = true;
    const request = { refreshToken };
    setRequestData(JSON.stringify(request, null, 2));
    setResponseData('Loading...');
    
    try {
      const result = await logoutMutation.mutateAsync(request);
      setResponseData(JSON.stringify(result, null, 2));
      
      if (result.success) {
        setAccessToken('');
        setRefreshToken('');
      }
    } catch (error: any) {
      setResponseData(JSON.stringify({ error: error.message || 'Unknown error' }, null, 2));
    } finally {
      isRequestInProgress.current = false;
    }
  };

  const handleRefreshToken = async () => {
    if (!refreshToken || isRequestInProgress.current) return;
    
    isRequestInProgress.current = true;
    const request = { refreshToken };
    setRequestData(JSON.stringify(request, null, 2));
    setResponseData('Loading...');
    
    try {
      const result = await refreshTokenMutation.mutateAsync(request);
      setResponseData(JSON.stringify(result, null, 2));
      
      if (result.success && result.data) {
        setAccessToken(result.data.accessToken);
        setRefreshToken(result.data.refreshToken);
      }
    } catch (error: any) {
      setResponseData(JSON.stringify({ error: error.message || 'Unknown error' }, null, 2));
    } finally {
      isRequestInProgress.current = false;
    }
  };

  const handleValidateToken = async () => {
    if (!accessToken || isRequestInProgress.current) return;
    
    isRequestInProgress.current = true;
    const request = { accessToken };
    setRequestData(JSON.stringify(request, null, 2));
    setResponseData('Loading...');
    
    try {
      const result = await validateTokenQuery.refetch();
      if (result.data) {
        setResponseData(JSON.stringify(result.data, null, 2));
      }
    } catch (error: any) {
      setResponseData(JSON.stringify({ error: error.message || 'Unknown error' }, null, 2));
    } finally {
      isRequestInProgress.current = false;
    }
  };

  const handleHealthCheck = async () => {
    if (isRequestInProgress.current) return;
    
    isRequestInProgress.current = true;
    setRequestData('GET /health');
    setResponseData('Loading...');
    
    try {
      const result = await apiClient.healthCheck();
      setResponseData(JSON.stringify(result, null, 2));
    } catch (error: any) {
      setResponseData(JSON.stringify({ error: error.message || 'Unknown error' }, null, 2));
    } finally {
      isRequestInProgress.current = false;
    }
  };

  const getStatusIcon = () => {
    if (loginMutation.isPending || logoutMutation.isPending || refreshTokenMutation.isPending) {
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Shield className="h-6 w-6 text-primary-600" />
        <h2 className="text-xl font-semibold text-gray-900">Authentication API Test Field</h2>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Zap size={12} className="mr-1" />
          TanStack Query
        </span>
      </div>

      {/* Simple Form */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          value={loginData.userName}
          onChange={(e) => setLoginData(prev => ({ ...prev, userName: e.target.value }))}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Username"
        />
        <input
          type="password"
          value={loginData.password}
          onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Password"
        />
        <select
          value={loginData.expectedResult}
          onChange={(e) => setLoginData(prev => ({ ...prev, expectedResult: parseInt(e.target.value) }))}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value={200}>200 - Success</option>
          <option value={400}>400 - Bad Request</option>
          <option value={401}>401 - Unauthorized</option>
          <option value={404}>404 - Not Found</option>
          <option value={500}>500 - Server Error</option>
        </select>
        <button
          onClick={handleLogin}
          disabled={loginMutation.isPending}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 flex items-center justify-center"
        >
          {loginMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
          Login
        </button>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <button
          onClick={handleRefreshToken}
          disabled={refreshTokenMutation.isPending || !refreshToken}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center"
        >
          {refreshTokenMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Refresh Token
        </button>
        <button
          onClick={handleValidateToken}
          disabled={validateTokenQuery.isFetching || !accessToken}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 flex items-center justify-center"
        >
          {validateTokenQuery.isFetching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
          Validate Token
        </button>
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending || !refreshToken}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 flex items-center justify-center"
        >
          {logoutMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogOut className="h-4 w-4 mr-2" />}
          Logout
        </button>
        <button
          onClick={handleHealthCheck}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-center"
        >
          <Zap className="h-4 w-4 mr-2" />
          Health Check
        </button>
      </div>

      {/* Request/Response Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 flex items-center mb-3">
            <FileText className="h-5 w-5 mr-2" />
            Request
          </h3>
          <pre className="bg-gray-50 rounded-md p-4 text-sm text-gray-700 font-mono overflow-auto max-h-64">
            {requestData || 'No request data yet'}
          </pre>
        </div>

        {/* Response */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 flex items-center mb-3">
            {getStatusIcon()}
            <span className="ml-2">Response</span>
          </h3>
          <pre className="bg-gray-50 rounded-md p-4 text-sm text-gray-700 font-mono overflow-auto max-h-64">
            {responseData || 'No response data yet'}
          </pre>
        </div>
      </div>

      {/* Token Display */}
      {(accessToken || refreshToken) && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Current Tokens:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accessToken && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Access Token</label>
                <div className="text-xs bg-white p-2 rounded border font-mono break-all">
                  {accessToken.substring(0, 50)}...
                </div>
              </div>
            )}
            {refreshToken && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Refresh Token</label>
                <div className="text-xs bg-white p-2 rounded border font-mono break-all">
                  {refreshToken.substring(0, 50)}...
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
