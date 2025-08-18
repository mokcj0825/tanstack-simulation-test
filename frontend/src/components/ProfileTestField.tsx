import React, { useState, useRef } from 'react';
import { useUpdateProfile } from '../hooks/useProfile';
import { UpdateProfileRequest } from '../types';
import { Loader2, CheckCircle, AlertCircle, TestTube } from 'lucide-react';

export const ProfileTestField: React.FC = () => {
  const [requestData, setRequestData] = useState<string>('');
  const [responseData, setResponseData] = useState<string>('');
  const isRequestInProgress = useRef(false);

  const updateProfileMutation = useUpdateProfile();

  const handleUpdateProfile = async () => {
    if (isRequestInProgress.current) return;
    
    isRequestInProgress.current = true;
    
    // Create dummy request data
    const dummyRequest: UpdateProfileRequest = {
      placeHolder: "Sample Profile Data",
      dummyData: ["Item 1", "Item 2", "Item 3", "Item 4"],
      numericValue: 42,
      objectValue: {
        firstString: "Header Text",
        secondString: "Footer Text"
      }
    };
    
    setRequestData(JSON.stringify(dummyRequest, null, 2));
    setResponseData('Loading...');
    
    try {
      const result = await updateProfileMutation.mutateAsync(dummyRequest);
      setResponseData(JSON.stringify(result, null, 2));
    } catch (error: any) {
      setResponseData(JSON.stringify({ error: error.message || 'Unknown error' }, null, 2));
    } finally {
      isRequestInProgress.current = false;
    }
  };

  const getStatusIcon = () => {
    if (updateProfileMutation.isPending) {
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Update Profile API Test</h3>
          <p className="text-sm text-gray-600">Test the POST /v1/users/updateProfile endpoint</p>
        </div>
        {getStatusIcon()}
      </div>

      <div className="space-y-4">
        <div>
          <button
            onClick={handleUpdateProfile}
            disabled={updateProfileMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {updateProfileMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sending Request...</span>
              </>
            ) : (
              <span>Send Update Profile Request</span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Request Data
            </label>
            <pre className="bg-gray-50 border border-gray-200 rounded-md p-3 text-sm text-gray-800 overflow-auto max-h-64">
              {requestData || 'Click the button to send a request'}
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
          <p><strong>Endpoint:</strong> POST /v1/users/updateProfile</p>
          <p><strong>Request Mapping:</strong> placeHolder → response, dummyData → dataList, numericValue → amount, objectValue.firstString → tooltip.header, objectValue.secondString → tooltip.footer</p>
        </div>
      </div>
    </div>
  );
};
