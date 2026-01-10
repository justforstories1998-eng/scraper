/**
 * ContentList.jsx
 *
 * Displays a list of ContentCard components along with pagination controls.
 */

import React from 'react';
import ContentCard from './ContentCard';
import LoadingSpinner from './LoadingSpinner';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ContentList = ({
  content,
  loading,
  error,
  pagination,
  goToPage,
  nextPage,
  prevPage,
  setPageSize,
  title = "Scraped Content",
  emptyMessage = "No content found for the current filters.",
}) => {

  const totalPages = pagination.pages || 1;
  const currentPage = pagination.page || 1;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <LoadingSpinner size="lg" />
        <p className="ml-3 text-lg text-gray-700 dark:text-gray-300">Loading content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600 dark:text-red-400">
        <h2 className="text-2xl font-bold mb-2">Error Loading Content</h2>
        <p className="text-lg">{error}</p>
        <p className="mt-4">Please try refreshing the page or check your backend server.</p>
      </div>
    );
  }

  if (content.length === 0) {
    return (
      <div className="text-center py-10 text-gray-600 dark:text-gray-400">
        <h2 className="text-2xl font-semibold mb-2">No Content Available</h2>
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="content-list-container">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">{title}</h2>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.map((item) => (
          <ContentCard key={item._id} content={item} />
        ))}
      </div>

      {/* Pagination Controls */}
      {pagination.total > 0 && (
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          {/* Page Size Selector */}
          <div className="flex items-center space-x-2">
            <label htmlFor="pageSize" className="text-gray-700 dark:text-gray-300 text-sm">Items per page:</label>
            <select
              id="pageSize"
              value={pagination.limit}
              onChange={(e) => setPageSize(parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-gray-100"
            >
              {[10, 20, 50, 100].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={prevPage}
              disabled={!pagination.hasPrev}
              className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              aria-label="Previous page"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-gray-700 dark:text-gray-300 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={nextPage}
              disabled={!pagination.hasNext}
              className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              aria-label="Next page"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Total Items */}
          <div className="text-gray-700 dark:text-gray-300 text-sm">
            Total Items: {pagination.total}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentList;