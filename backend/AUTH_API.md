# Authentication API Documentation

This document describes the authentication endpoints available in the backend API.

## Base URL
```
http://localhost:3001/api/v1/auth
```

## Endpoints

### 1. Login
**POST** `/login`

Authenticates a user and returns JWT tokens.

#### Request Body
```json
{
  "userName": "string",
  "password": "string", 
  "expectedResult": "number"
}
```

#### Parameters
- `userName` (string, required): Username for authentication
- `password` (string, required): Password for authentication
- `expectedResult` (number, required): Expected HTTP status code (200-599)

#### Response Examples

**Successful Login (200)**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1",
      "userName": "admin",
      "role": "admin"
    }
  },
  "message": "Login successful",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_1705312200000_abc123"
}
```

**Bad Request (400)**
```json
{
  "success": false,
  "error": "Bad request",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_1705312200000_abc123"
}
```

**Unauthorized (401)**
```json
{
  "success": false,
  "error": "Invalid username or password",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_1705312200000_abc123"
}
```

**Forbidden (403)**
```json
{
  "success": false,
  "error": "Account is locked",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_1705312200000_abc123"
}
```

**Not Found (404)**
```json
{
  "success": false,
  "error": "User not found",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_1705312200000_abc123"
}
```

**Internal Server Error (500)**
```json
{
  "success": false,
  "error": "Authentication server error",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_1705312200000_abc123"
}
```

**Service Unavailable (503)**
```json
{
  "success": false,
  "error": "Service temporarily unavailable",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_1705312200000_abc123"
}
```

### 2. Refresh Token
**POST** `/refresh`

Refreshes the access token using a valid refresh token.

#### Request Body
```json
{
  "refreshToken": "string"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Tokens refreshed successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_1705312200000_abc123"
}
```

### 3. Logout
**POST** `/logout`

Logs out the current user (in a real application, this would invalidate the refresh token).

#### Response
```json
{
  "success": true,
  "message": "Logout successful",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_1705312200000_abc123"
}
```

### 4. Validate Token
**GET** `/validate`

Validates an access token and returns user information.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Response
```json
{
  "success": true,
  "data": {
    "valid": true,
    "user": {
      "id": "1",
      "userName": "admin",
      "role": "admin"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_1705312200000_abc123"
}
```

## Mock Users

The system includes the following mock users for testing:

| Username | Password | Role    | Status  |
|----------|----------|---------|---------|
| admin    | password | admin   | Active  |
| user     | password | user    | Active  |
| locked   | password | user    | Locked  |

## JWT Token Details

### Access Token
- **Expiry**: 15 minutes
- **Payload**: Contains user ID, username, role, and token type
- **Usage**: For API authentication

### Refresh Token
- **Expiry**: 7 days
- **Payload**: Contains user ID, username, role, and token type
- **Usage**: For refreshing access tokens

## Testing

Run the test script to see all scenarios in action:

```bash
cd backend
node test-auth.js
```

## Environment Variables

Configure the following environment variables for production:

```env
JWT_ACCESS_SECRET=your-secure-access-secret-key
JWT_REFRESH_SECRET=your-secure-refresh-secret-key
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
SALT_ROUNDS=10
```

## Security Features

- **Password Hashing**: Passwords are hashed using bcrypt
- **JWT Tokens**: Secure token-based authentication
- **Token Validation**: Automatic token validation and refresh
- **Event Logging**: All authentication events are logged
- **Request Tracking**: Each request has a unique correlation ID
- **Input Validation**: All inputs are validated using Joi schemas
- **Error Handling**: Comprehensive error handling with proper HTTP status codes

## Event System

The authentication system emits the following events:

- `auth.login`: When a user successfully logs in
- `auth.logout`: When a user logs out
- `auth.attempt`: When a login attempt is made
- `auth.token_refresh`: When tokens are refreshed
- `auth.token_validate`: When a token is validated

All events include correlation IDs for tracking and debugging.
