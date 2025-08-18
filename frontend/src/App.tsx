import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { UserList } from './components/UserList';
import { StatsCard } from './components/StatsCard';
import { AuthTestField } from './components/AuthTestField';
import { UserListPage } from './pages/UserListPage';
import { useUserStats } from './hooks/useUsers';
import { Activity, Database, Zap, Users, Shield } from 'lucide-react';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Database size={24} className="text-primary-600" />
                    <h1 className="text-xl font-bold text-gray-900">User Management System</h1>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Zap size={12} className="mr-1" />
                    Event-Driven
                  </span>
                </div>
                
                <nav className="flex items-center space-x-4">
                  <Link
                    to="/"
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
                  >
                    <Shield size={16} />
                    <span>Auth Test</span>
                  </Link>
                  <Link
                    to="/user-list"
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
                  >
                    <Users size={16} />
                    <span>User List</span>
                  </Link>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Activity size={16} />
                    <span>Scalable Architecture</span>
                  </div>
                </nav>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/user-list" element={<UserListPage />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center text-sm text-gray-500">
                <p>Built with React, TypeScript, TanStack Query, and Express</p>
                <p className="mt-1">Event-driven architecture with scalable design patterns</p>
              </div>
            </div>
          </footer>
        </div>
        
        {/* React Query DevTools */}
        <ReactQueryDevtools initialIsOpen={false} />
      </Router>
    </QueryClientProvider>
  );
}

// Home Page Component
function HomePage() {
  return (
    <div className="space-y-8">
      {/* Authentication Test Field */}
      <AuthTestField />
      
      {/* Stats Section */}
      <StatsSection />
      
      {/* Users Section */}
      <UserList />
    </div>
  );
}

// Stats Section Component
function StatsSection() {
  const { data: statsData, isLoading, error } = useUserStats();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !statsData?.data) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <Activity size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Failed to load statistics</p>
        </div>
      </div>
    );
  }

  return <StatsCard stats={statsData.data} />;
}

export default App;
