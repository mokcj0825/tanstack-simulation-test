const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api/v1';

// Test cases for different expected results
const testCases = [
  {
    name: 'Successful Login (200)',
    request: {
      userName: 'admin',
      password: 'password',
      expectedResult: 200
    },
    expectedStatus: 200
  },
  {
    name: 'Bad Request (400)',
    request: {
      userName: 'admin',
      password: 'password',
      expectedResult: 400
    },
    expectedStatus: 400
  },
  {
    name: 'Unauthorized (401)',
    request: {
      userName: 'admin',
      password: 'password',
      expectedResult: 401
    },
    expectedStatus: 401
  },
  {
    name: 'Forbidden (403)',
    request: {
      userName: 'admin',
      password: 'password',
      expectedResult: 403
    },
    expectedStatus: 403
  },
  {
    name: 'Not Found (404)',
    request: {
      userName: 'admin',
      password: 'password',
      expectedResult: 404
    },
    expectedStatus: 404
  },
  {
    name: 'Internal Server Error (500)',
    request: {
      userName: 'admin',
      password: 'password',
      expectedResult: 500
    },
    expectedStatus: 500
  },
  {
    name: 'Service Unavailable (503)',
    request: {
      userName: 'admin',
      password: 'password',
      expectedResult: 503
    },
    expectedStatus: 503
  }
];

async function testLoginAPI() {
  console.log('Testing Login API with different expected results...\n');

  for (const testCase of testCases) {
    try {
      console.log(`Test: ${testCase.name}`);
      console.log(`Request:`, JSON.stringify(testCase.request, null, 2));
      
      const response = await axios.post(`${API_BASE_URL}/auth/login`, testCase.request);
      
      console.log(`Status: ${response.status} (Expected: ${testCase.expectedStatus})`);
      console.log(`Response:`, JSON.stringify(response.data, null, 2));
      
      if (response.status === 200 && response.data.success) {
        console.log(`Access Token: ${response.data.data.accessToken.substring(0, 50)}...`);
        console.log(`Refresh Token: ${response.data.data.refreshToken.substring(0, 50)}...`);
      }
      
    } catch (error) {
      console.log(`Status: ${error.response?.status} (Expected: ${testCase.expectedStatus})`);
      console.log(`Error Response:`, JSON.stringify(error.response?.data, null, 2));
    }
    
    console.log('─'.repeat(80));
  }
}

// Test with invalid credentials
async function testInvalidCredentials() {
  console.log('\nTesting with invalid credentials...\n');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      userName: 'invalid',
      password: 'wrongpassword',
      expectedResult: 200
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log(`Status: ${error.response?.status}`);
    console.log(`Error Response:`, JSON.stringify(error.response?.data, null, 2));
  }
}

// Test with locked account
async function testLockedAccount() {
  console.log('\nTesting with locked account...\n');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      userName: 'locked',
      password: 'password',
      expectedResult: 200
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log(`Status: ${error.response?.status}`);
    console.log(`Error Response:`, JSON.stringify(error.response?.data, null, 2));
  }
}

// Run all tests
async function runAllTests() {
  try {
    await testLoginAPI();
    await testInvalidCredentials();
    await testLockedAccount();
    
    console.log('\nAll tests completed!');
  } catch (error) {
          console.error('Test failed:', error.message);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${API_BASE_URL.replace('/api/v1', '')}/health`);
    console.log('Server is running');
    return true;
  } catch (error) {
    console.log('Server is not running. Please start the server first:');
    console.log('   npm run dev');
    return false;
  }
}

// Main execution
async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runAllTests();
  }
}

main();
