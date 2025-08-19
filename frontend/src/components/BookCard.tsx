import React from 'react';
import { Book } from '../types';
import { BookOpen, User, Tag, DollarSign, Package, Hash } from 'lucide-react';

interface BookCardProps {
  book: Book;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {book.bookName.en}
          </h3>
        </div>
        <div className="flex items-center space-x-1">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="text-lg font-bold text-green-600">
            ${book.price.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Multilingual Book Names */}
      <div className="mb-4 space-y-1">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Myanmar:</span> {book.bookName.my}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Chinese:</span> {book.bookName.zh}
        </div>
      </div>

      {/* Author Information */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <User className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-gray-900">{book.author}</span>
        </div>
        <div className="text-sm text-gray-600 ml-6">
          <div><span className="font-medium">Myanmar:</span> {book.authorDescription.my}</div>
          <div><span className="font-medium">English:</span> {book.authorDescription.en}</div>
          <div><span className="font-medium">Chinese:</span> {book.authorDescription.zh}</div>
        </div>
      </div>

      {/* Book Description */}
      <div className="mb-4">
        <div className="text-sm text-gray-700 mb-2">
          <span className="font-medium">Description:</span>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <div><span className="font-medium">Myanmar:</span> {book.bookDescription.my}</div>
          <div><span className="font-medium">English:</span> {book.bookDescription.en}</div>
          <div><span className="font-medium">Chinese:</span> {book.bookDescription.zh}</div>
        </div>
      </div>

      {/* Book Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Hash className="h-4 w-4 text-gray-500" />
          <div>
            <div className="text-xs text-gray-500">ISBN</div>
            <div className="text-sm font-medium text-gray-900">{book.isbn}</div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4 text-gray-500" />
          <div>
            <div className="text-xs text-gray-500">Stock</div>
            <div className={`text-sm font-medium ${book.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {book.stock} available
            </div>
          </div>
        </div>
      </div>

      {/* Category */}
      <div className="flex items-center space-x-2">
        <Tag className="h-4 w-4 text-gray-500" />
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {book.category}
        </span>
      </div>
    </div>
  );
};
