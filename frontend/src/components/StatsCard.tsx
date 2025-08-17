import React from 'react';
import { UserStats } from '../types';
import { cn } from '../lib/utils';
import { Users, Shield, Crown } from 'lucide-react';

interface StatsCardProps {
  stats: UserStats;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ stats, className }) => {
  const statItems = [
    {
      label: 'Total Users',
      value: stats.total,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      label: 'Admins',
      value: stats.byRole.admin,
      icon: Crown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      label: 'Moderators',
      value: stats.byRole.moderator,
      icon: Shield,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      label: 'Regular Users',
      value: stats.byRole.user,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  ];

  return (
    <div className={cn("bg-white rounded-lg shadow-sm border border-gray-200 p-6", className)}>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">User Statistics</h2>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={cn(
                "p-4 rounded-lg border transition-all duration-200 hover:shadow-md",
                item.bgColor,
                item.borderColor
              )}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{item.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                </div>
                <div className={cn("p-2 rounded-full", item.bgColor)}>
                  <Icon size={20} className={item.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
            Real-time data
          </span>
        </div>
      </div>
    </div>
  );
};
