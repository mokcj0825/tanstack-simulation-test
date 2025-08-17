import React from 'react';
import { User } from '../types';
import { formatDate, getRoleColor, getRoleIcon, cn } from '../lib/utils';
import { Edit, Trash2, Eye } from 'lucide-react';

interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
  onView?: (user: User) => void;
  className?: string;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onEdit,
  onDelete,
  onView,
  className
}) => {
  return (
    <div className={cn(
      "bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200",
      className
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {onView && (
            <button
              onClick={() => onView(user)}
              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors duration-200"
              title="View user"
            >
              <Eye size={16} />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(user)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
              title="Edit user"
            >
              <Edit size={16} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(user.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
              title="Delete user"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Role</span>
          <span className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
            getRoleColor(user.role)
          )}>
            <span className="mr-1">{getRoleIcon(user.role)}</span>
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Created</span>
          <span className="text-sm text-gray-500">{formatDate(user.createdAt)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Updated</span>
          <span className="text-sm text-gray-500">{formatDate(user.updatedAt)}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>ID: {user.id}</span>
          <span>Last updated: {formatDate(user.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
};
