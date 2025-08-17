import React, { useState, useMemo } from 'react';
import { User, UserRole, PaginationParams } from '../types';
import { UserCard } from './UserCard';
import { UserForm } from './UserForm';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useGenerateUsers } from '../hooks/useUsers';
import { cn, debounce } from '../lib/utils';
import { 
  Search, 
  Filter, 
  Plus, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  Users,
  Sparkles,
  X
} from 'lucide-react';

interface UserListProps {
  className?: string;
}

export const UserList: React.FC<UserListProps> = ({ className }) => {
  const [paginationParams, setPaginationParams] = useState<PaginationParams>({
    page: 1,
    pageSize: 10
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [generateCount, setGenerateCount] = useState(5);

  // Queries and mutations
  const { data: usersData, isLoading, error, refetch } = useUsers({
    ...paginationParams,
    search: searchTerm || undefined,
    role: roleFilter || undefined,
    sortBy,
    sortOrder
  });

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const generateUsersMutation = useGenerateUsers();

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      setSearchTerm(value);
      setPaginationParams(prev => ({ ...prev, page: 1 }));
    }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleRoleFilterChange = (role: UserRole | '') => {
    setRoleFilter(role);
    setPaginationParams(prev => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (page: number) => {
    setPaginationParams(prev => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPaginationParams(prev => ({ ...prev, page: 1, pageSize }));
  };

  const handleCreateUser = (userData: any) => {
    createUserMutation.mutate(userData, {
      onSuccess: () => {
        setShowForm(false);
      }
    });
  };

  const handleUpdateUser = (userData: any) => {
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, userData }, {
        onSuccess: () => {
          setEditingUser(null);
        }
      });
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleGenerateUsers = () => {
    generateUsersMutation.mutate({ count: generateCount }, {
      onSuccess: () => {
        setShowGenerateForm(false);
        setGenerateCount(5);
      }
    });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleViewUser = (user: User) => {
    // In a real app, this would navigate to a user detail page
    console.log('Viewing user:', user);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setSortBy('name');
    setSortOrder('asc');
    setPaginationParams({ page: 1, pageSize: 10 });
  };

  const roleOptions: { value: UserRole; label: string; icon: string }[] = [
    { value: 'user', label: 'User', icon: '👤' },
    { value: 'moderator', label: 'Moderator', icon: '🛡️' },
    { value: 'admin', label: 'Admin', icon: '👑' }
  ];

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'email', label: 'Email' },
    { value: 'role', label: 'Role' },
    { value: 'createdAt', label: 'Created Date' }
  ];

  if (error) {
    return (
      <div className={cn("text-center py-8", className)}>
        <div className="text-red-600 mb-4">Failed to load users</div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users size={24} className="text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          {usersData && (
            <span className="text-sm text-gray-500">
              ({usersData.pagination.total} total)
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowGenerateForm(true)}
            className="px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-md hover:bg-primary-100 flex items-center"
          >
            <Sparkles size={16} className="mr-2" />
            Generate
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 flex items-center"
          >
            <Plus size={16} className="mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => handleRoleFilterChange(e.target.value as UserRole | '')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Roles</option>
            {roleOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.icon} {option.label}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order as 'asc' | 'desc');
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {sortOptions.map(option => (
              <React.Fragment key={option.value}>
                <option value={`${option.value}-asc`}>{option.label} (A-Z)</option>
                <option value={`${option.value}-desc`}>{option.label} (Z-A)</option>
              </React.Fragment>
            ))}
          </select>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 flex items-center justify-center"
          >
            <Filter size={16} className="mr-2" />
            Clear
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading users...</p>
        </div>
      )}

      {/* Users Grid */}
      {usersData && !isLoading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {usersData.data?.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                onView={handleViewUser}
              />
            ))}
          </div>

          {/* Pagination */}
          {usersData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  Showing {((usersData.pagination.page - 1) * usersData.pagination.pageSize) + 1} to{' '}
                  {Math.min(usersData.pagination.page * usersData.pagination.pageSize, usersData.pagination.total)} of{' '}
                  {usersData.pagination.total} results
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(usersData.pagination.page - 1)}
                  disabled={!usersData.pagination.hasPrev}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>

                <span className="text-sm text-gray-700">
                  Page {usersData.pagination.page} of {usersData.pagination.totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(usersData.pagination.page + 1)}
                  disabled={!usersData.pagination.hasNext}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <select
                value={paginationParams.pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {usersData && usersData.data?.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || roleFilter ? 'Try adjusting your filters' : 'Get started by creating your first user'}
          </p>
          {!searchTerm && !roleFilter && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Add User
            </button>
          )}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <UserForm
            user={editingUser || undefined}
            onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
            onCancel={() => {
              setShowForm(false);
              setEditingUser(null);
            }}
            isLoading={createUserMutation.isPending || updateUserMutation.isPending}
          />
        </div>
      )}

      {/* Generate Users Modal */}
      {showGenerateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Sparkles size={20} className="mr-2" />
                Generate Users
              </h2>
              <button
                onClick={() => setShowGenerateForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="count" className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Users
                </label>
                <input
                  type="number"
                  id="count"
                  min="1"
                  max="50"
                  value={generateCount}
                  onChange={(e) => setGenerateCount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowGenerateForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateUsers}
                  disabled={generateUsersMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center"
                >
                  {generateUsersMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} className="mr-2" />
                      Generate
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
