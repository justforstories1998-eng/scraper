/**
 * FilterBar.jsx
 *
 * A reusable component for filtering content by type, source, and sorting options.
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Filter, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const FilterBar = ({
  filters,
  updateFilters,
  clearFilters,
  availableContentTypes = ['news', 'job', 'blog', 'article', 'documentation', 'tutorial', 'video', 'other'],
  availableSources = [], // dynamic list of sources from backend stats
  showTypeFilter = true,
  showSourceFilter = true,
  showSortFilter = true,
  showClearFilter = true,
}) => {
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update URL search parameters when filters change
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    let changed = false;

    // Helper to update param
    const updateParam = (key, value) => {
      if (value) {
        if (params.get(key) !== String(value)) {
          params.set(key, value);
          changed = true;
        }
      } else {
        if (params.has(key)) {
          params.delete(key);
          changed = true;
        }
      }
    };

    updateParam('type', filters.type);
    updateParam('source', filters.source);
    updateParam('sort', filters.sort);
    updateParam('order', filters.order);

    if (changed) {
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }
  }, [filters, location.search, location.pathname, navigate]);


  const handleFilterChange = (filterName, value) => {
    updateFilters({ [filterName]: value === '' ? null : value });
  };

  const handleSortChange = (value) => {
    const [sortField, sortOrder] = value.split(':');
    updateFilters({ sort: sortField, order: parseInt(sortOrder) });
  };

  const handleClearAllFilters = () => {
    clearFilters();
    navigate(location.pathname, { replace: true }); // Clear all URL params
  };

  const sortOptions = [
    { value: 'publishedAt:-1', label: 'Newest First' },
    { value: 'publishedAt:1', label: 'Oldest First' },
    { value: 'relevanceScore:-1', label: 'Highest Relevance' },
    { value: 'relevanceScore:1', label: 'Lowest Relevance' },
  ];

  const currentSortValue = `${filters.sort}:${filters.order}`;

  // Check if any filter (excluding search, which is handled by SearchBar) is active
  const isAnyFilterActive = filters.type || filters.source || (filters.sort !== 'publishedAt' || filters.order !== -1);

  return (
    <div className="flex items-center space-x-2 sm:space-x-4 mb-6 relative">
      {(showTypeFilter || showSourceFilter || showSortFilter) && (
        <div className="relative" ref={filterDropdownRef}>
          <button
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg shadow-sm hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-300 text-sm"
            aria-haspopup="true"
            aria-expanded={isFilterDropdownOpen}
          >
            <Filter size={16} className="mr-2" />
            <span>Filters & Sort</span>
            <ChevronDown size={16} className={`ml-2 transform ${isFilterDropdownOpen ? 'rotate-180' : 'rotate-0'} transition-transform duration-200`} />
          </button>

          {isFilterDropdownOpen && (
            <div className="absolute left-0 mt-2 w-64 md:w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 z-50 p-4 transform origin-top-left">
              {showTypeFilter && (
                <div className="mb-4">
                  <label htmlFor="type-filter" className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">Content Type</label>
                  <select
                    id="type-filter"
                    value={filters.type || ''}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-gray-100"
                  >
                    <option value="">All Types</option>
                    {availableContentTypes.map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>
              )}

              {showSourceFilter && availableSources.length > 0 && (
                <div className="mb-4">
                  <label htmlFor="source-filter" className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">Source</label>
                  <select
                    id="source-filter"
                    value={filters.source || ''}
                    onChange={(e) => handleFilterChange('source', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-gray-100"
                  >
                    <option value="">All Sources</option>
                    {availableSources.map(source => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
              )}

              {showSortFilter && (
                <div className="mb-4">
                  <label htmlFor="sort-filter" className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">Sort By</label>
                  <select
                    id="sort-filter"
                    value={currentSortValue}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-gray-100"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {showClearFilter && (isAnyFilterActive || filters.search) && (
                <button
                  onClick={handleClearAllFilters}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <X size={16} className="mr-2" />
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {showClearFilter && (isAnyFilterActive || filters.search) && (
        <button
          onClick={handleClearAllFilters}
          className="hidden sm:flex items-center px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg shadow-sm hover:bg-red-200 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300 text-sm"
        >
          <X size={16} className="mr-2" />
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default FilterBar;