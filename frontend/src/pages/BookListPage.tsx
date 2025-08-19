import React from 'react';
import { BookList } from '../components/BookList';
import { BookOpen, Database } from 'lucide-react';

export const BookListPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <BookOpen size={24} className="text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Book Library</h1>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Database size={12} className="mr-1" />
            Multilingual
          </span>
        </div>
        <p className="mt-2 text-gray-600">
          Explore our collection of books with multilingual support. Search, sort, and browse through various categories.
        </p>
      </div>

      {/* Book List Component */}
      <BookList />
    </div>
  );
};
