# Event-Driven User Management System

A scalable, event-driven full-stack application built with React, TypeScript, TanStack Query, and Express. This project demonstrates modern architectural patterns for building scalable applications.

## Architecture Overview

### Backend (Express + TypeScript)
- **Event-Driven Architecture**: Uses EventEmitter2 for loose coupling between modules
- **Scalable Design**: Modular structure with clear separation of concerns
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Validation**: Joi schema validation for all API endpoints
- **Logging**: Structured logging with Winston and correlation IDs
- **Error Handling**: Comprehensive error handling with proper HTTP status codes

### Frontend (React + TypeScript + TanStack Query)
- **Modern React**: Built with React 18 and TypeScript
- **State Management**: TanStack Query for server state management
- **UI Framework**: Tailwind CSS with custom design system
- **Performance**: Optimized with code splitting and lazy loading
- **Developer Experience**: Hot reloading with Vite

## Features

### Backend Features
- RESTful API with proper HTTP methods
- Event-driven architecture with EventEmitter2
- Input validation with Joi schemas
- Structured logging with correlation IDs
- Error handling and proper HTTP status codes
- CORS configuration for frontend integration
- Health check endpoint
- Request/response tracking
- Performance monitoring headers

### Frontend Features
- Modern React with TypeScript
- TanStack Query for data fetching and caching
- Responsive design with Tailwind CSS
- Real-time user statistics
- Search, filter, and sort functionality
- Pagination support
- Create, read, update, delete operations
- Bulk user generation
- Loading states and error handling
- Optimistic updates

## Project Structure

```
tanstack-simulation-test/
├── backend/                 # Express API server
│   ├── src/
│   │   ├── config/         # Configuration and constants
│   │   ├── controllers/    # Request handlers
│   │   ├── data/          # Data layer (dummy data)
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic and utilities
│   │   ├── types/         # TypeScript type definitions
│   │   ├── app.ts         # Express app setup
│   │   └── index.ts       # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and API client
│   │   ├── types/         # TypeScript type definitions
│   │   ├── App.tsx        # Main app component
│   │   ├── main.tsx       # React entry point
│   │   └── index.css      # Global styles
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── package.json           # Root package.json (workspaces)
└── README.md
```

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Validation**: Joi
- **Logging**: Winston
- **Events**: EventEmitter2
- **Security**: Helmet, CORS

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **State Management**: TanStack Query
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tanstack-simulation-test
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

This will start both the backend (port 3001) and frontend (port 3000) in development mode.

### Manual Setup

If you prefer to run services separately:

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Users
- `GET /api/v1/users` - Get all users with pagination
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create new user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user
- `GET /api/v1/users/stats` - Get user statistics
- `POST /api/v1/users/generate` - Generate random users

### Health Check
- `GET /health` - Server health status

## Key Features

### Event-Driven Architecture
The backend uses an event-driven architecture where:
- All operations emit events
- Events are logged with correlation IDs
- Loose coupling between modules
- Easy to extend with new event handlers

### Scalable Design Patterns
- **Dependency Injection**: Services are injected where needed
- **Factory Pattern**: Event bus and logger are singletons
- **Strategy Pattern**: Different validation strategies
- **Observer Pattern**: Event-driven communication

### Frontend Optimizations
- **TanStack Query**: Automatic caching and background updates
- **Debounced Search**: Performance optimization for search
- **Optimistic Updates**: Immediate UI feedback
- **Error Boundaries**: Graceful error handling

## Configuration

### Environment Variables

Create `.env` files in both `backend/` and `frontend/` directories:

**Backend (.env):**
```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3001/api/v1
```

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Build for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## Deployment

### Backend Deployment
1. Build the TypeScript code: `npm run build`
2. Set production environment variables
3. Start with: `npm start`

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `dist/` folder to your hosting service
3. Configure API URL for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

---

Built with modern web technologies
