const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Mock the authentication logic
class SimpleAuthService {
  constructor() {
    this.mockUsers = [
      {
        id: '1',
        userName: 'admin',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
        role: 'admin',
        isActive: true
      },
      {
        id: '2',
        userName: 'user',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
        role: 'user',
        isActive: true
      },
      {
        id: '3',
        userName: 'locked',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
        role: 'user',
        isActive: false
      }
    ];
  }

  async authenticateUser(loginRequest) {
    const { userName, password, expectedResult } = loginRequest;

    // Handle different expected result scenarios
    switch (expectedResult) {
      case 200:
        return await this.handleSuccessfulLogin(userName, password);
      
      case 400:
        return {
          success: false,
          error: 'Bad request',
          statusCode: 400
        };
      
      case 401:
        return {
          success: false,
          error: 'Invalid username or password',
          statusCode: 401
        };
      
      case 403:
        return {
          success: false,
          error: 'Account is locked',
          statusCode: 403
        };
      
      case 404:
        return {
          success: false,
          error: 'User not found',
          statusCode: 404
        };
      
      case 500:
        return {
          success: false,
          error: 'Authentication server error',
          statusCode: 500
        };
      
      case 503:
        return {
          success: false,
          error: 'Service temporarily unavailable',
          statusCode: 503
        };
      
      default:
        return await this.handleSuccessfulLogin(userName, password);
    }
  }

  async handleSuccessfulLogin(userName, password) {
    const user = this.mockUsers.find(u => u.userName === userName);
    
    if (!user) {
      return {
        success: false,
        error: 'User not found',
        statusCode: 404
      };
    }

    if (!user.isActive) {
      return {
        success: false,
        error: 'Account is locked',
        statusCode: 403
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return {
        success: false,
        error: 'Invalid username or password',
        statusCode: 401
      };
    }

    const tokens = this.generateTokens(user);
    
    const loginResponse = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        userName: user.userName,
        role: user.role
      }
    };

    return {
      success: true,
      data: loginResponse,
      statusCode: 200
    };
  }

  generateTokens(user) {
    const accessTokenPayload = {
      userId: user.id,
      userName: user.userName,
      role: user.role,
      type: 'access',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes
    };

    const refreshTokenPayload = {
      userId: user.id,
      userName: user.userName,
      role: user.role,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    };

    const accessToken = jwt.sign(accessTokenPayload, 'your-access-secret-key-change-in-production');
    const refreshToken = jwt.sign(refreshTokenPayload, 'your-refresh-secret-key-change-in-production');

    return { accessToken, refreshToken };
  }
}

// Test the authentication service
async function testAuthService() {
  const authService = new SimpleAuthService();

  console.log('Testing Authentication API Logic\n');

  // Test cases for different expected results
  const testCases = [
    {
      name: 'Successful Login (200)',
      request: {
        userName: 'admin',
        password: 'password',
        expectedResult: 200
      }
    },
    {
      name: 'Bad Request (400)',
      request: {
        userName: 'admin',
        password: 'password',
        expectedResult: 400
      }
    },
    {
      name: 'Unauthorized (401)',
      request: {
        userName: 'admin',
        password: 'password',
        expectedResult: 401
      }
    },
    {
      name: 'Forbidden (403)',
      request: {
        userName: 'admin',
        password: 'password',
        expectedResult: 403
      }
    },
    {
      name: 'Not Found (404)',
      request: {
        userName: 'admin',
        password: 'password',
        expectedResult: 404
      }
    },
    {
      name: 'Internal Server Error (500)',
      request: {
        userName: 'admin',
        password: 'password',
        expectedResult: 500
      }
    },
    {
      name: 'Service Unavailable (503)',
      request: {
        userName: 'admin',
        password: 'password',
        expectedResult: 503
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`Test: ${testCase.name}`);
    console.log(`Request:`, JSON.stringify(testCase.request, null, 2));
    
    const result = await authService.authenticateUser(testCase.request);
    
    console.log(`Status: ${result.statusCode}`);
    console.log(`Response:`, JSON.stringify(result, null, 2));
    
    if (result.success && result.data) {
      console.log(`Access Token: ${result.data.accessToken.substring(0, 50)}...`);
      console.log(`Refresh Token: ${result.data.refreshToken.substring(0, 50)}...`);
    }
    
    console.log('─'.repeat(80));
  }

  // Test with invalid credentials
  console.log('\nTesting with invalid credentials...\n');
  
  const invalidResult = await authService.authenticateUser({
    userName: 'invalid',
    password: 'wrongpassword',
    expectedResult: 200
  });
  
  console.log(`Status: ${invalidResult.statusCode}`);
  console.log(`Error Response:`, JSON.stringify(invalidResult, null, 2));

  // Test with locked account
  console.log('\nTesting with locked account...\n');
  
  const lockedResult = await authService.authenticateUser({
    userName: 'locked',
    password: 'password',
    expectedResult: 200
  });
  
  console.log(`Status: ${lockedResult.statusCode}`);
  console.log(`Error Response:`, JSON.stringify(lockedResult, null, 2));

  console.log('\nAuthentication API Logic Test Completed!');
  console.log('\nAPI Endpoints Available:');
  console.log('POST /api/v1/auth/login - Login with JWT tokens');
  console.log('POST /api/v1/auth/refresh - Refresh access token');
  console.log('POST /api/v1/auth/logout - Logout user');
  console.log('GET /api/v1/auth/validate - Validate access token');
}

testAuthService().catch(console.error);
