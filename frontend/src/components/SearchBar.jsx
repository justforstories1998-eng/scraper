/**
 * SearchBar.jsx
 *
 * Reusable search bar component for filtering content.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const SearchBar = ({ onSearch, initialSearchTerm = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const debounceTimeoutRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Update search term when initialSearchTerm prop changes (e.g., from URL query)
  useEffect(() => {
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    // Debounce the search input
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      onSearch(value);
    }, 300); // Debounce for 300ms
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    onSearch('');
    // Optionally remove search param from URL
    const params = new URLSearchParams(location.search);
    params.delete('search');
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    onSearch(searchTerm);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-lg mx-auto md:mx-0">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
        </div>
        <input
          type="search"
          id="search-input"
          className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 shadow-sm transition-all duration-200"
          placeholder="Search webMethods content..."
          value={searchTerm}
          onChange={handleInputChange}
          aria-label="Search content"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;