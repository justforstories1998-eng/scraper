/**
 * News.jsx
 *
 * Page component to display news articles related to webMethods.
 * Integrates search, filters, and a list of content cards.
 */

import React, { useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import ContentList from '../components/ContentList';
import useContent from '../hooks/useContent';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const News = () => {
  const { contentStats } = useAppContext();
  const location = useLocation();

  // Extract initial search term and filters from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';
  const initialSource = queryParams.get('source') || null;
  const initialSort = queryParams.get('sort') || 'publishedAt';
  const initialOrder = parseInt(queryParams.get('order')) || -1;
  const initialPage = parseInt(queryParams.get('page')) || 1;
  const initialLimit = parseInt(queryParams.get('limit')) || 20;

  // Use the custom hook for content management
  const {
    content,
    loading,
    error,
    pagination,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
    filters,
    updateFilters,
    setSearch,
    clearFilters,
  } = useContent({
    type: 'news',
    initialSearch,
    initialSource,
    initialSort,
    initialOrder,
    initialPage,
    initialLimit,
  });

  // Extract unique news sources from overall content statistics for the filter bar
  const newsSources = contentStats?.bySource
    ?.filter(s => s.type === 'news' || true)
    .map(s => s.source)
    .sort() || [];

  return (
    <div className="news-page min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-200/20 to-cyan-200/20 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-10 sm:mb-14">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 dark:shadow-indigo-500/15">
              <svg 
                className="w-6 h-6 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" 
                />
              </svg>
            </div>
            <span className="px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full">
              News Hub
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
            <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
              webMethods
            </span>
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent ml-2">
              News
            </span>
          </h1>
          
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Stay informed with the latest updates, announcements, and industry insights.
          </p>
        </header>

        {/* Search and Filter Section */}
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200/50 dark:border-slate-700/50" />
          
          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Search Bar Container */}
              <div className="flex-1 max-w-xl">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">
                  Search Articles
                </label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300" />
                  <div className="relative">
                    <SearchBar onSearch={setSearch} initialSearchTerm={filters.search} />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden lg:block w-px h-16 bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

              {/* Filter Bar Container */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">
                  Filter & Sort
                </label>
                <FilterBar
                  filters={filters}
                  updateFilters={updateFilters}
                  clearFilters={clearFilters}
                  showTypeFilter={false}
                  availableSources={newsSources}
                />
              </div>
            </div>

            {/* Active Filters Indicator */}
            {(filters.search || filters.source) && (
              <div className="mt-6 pt-6 border-t border-slate-200/70 dark:border-slate-700/70">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Active filters:</span>
                  {filters.search && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-sm font-medium rounded-full">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      "{filters.search}"
                    </span>
                  )}
                  {filters.source && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-sm font-medium rounded-full">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      {filters.source}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <section className="relative">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
                Latest News Articles
              </h2>
            </div>
            
            {pagination?.total > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800/80 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {pagination.total} article{pagination.total !== 1 ? 's' : ''} found
                </span>
              </div>
            )}
          </div>

          {/* Content List with Enhanced Container */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-white/80 dark:from-slate-800/40 dark:to-slate-800/80 backdrop-blur-sm rounded-3xl -m-4 p-4" />
            <div className="relative">
              <ContentList
                content={content}
                loading={loading}
                error={error}
                pagination={pagination}
                goToPage={goToPage}
                nextPage={nextPage}
                prevPage={prevPage}
                setPageSize={setPageSize}
                title="Latest News Articles"
                emptyMessage="No news articles found for webMethods. Try adjusting your filters or search terms."
              />
            </div>
          </div>
        </section>

        {/* Footer Accent */}
        <div className="mt-16 flex justify-center">
          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent rounded-full" />
        </div>
      </div>

      {/* Custom Styles for Enhanced Animations */}
      <style jsx>{`
        .news-page {
          position: relative;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .news-page :global(.search-input),
        .news-page :global(.filter-select) {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .news-page :global(.search-input:focus),
        .news-page :global(.filter-select:focus) {
          transform: translateY(-1px);
          box-shadow: 0 10px 40px -10px rgba(99, 102, 241, 0.3);
        }
        
        .news-page :global(.content-card) {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .news-page :global(.content-card:hover) {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.1);
        }
        
        @media (prefers-reduced-motion: reduce) {
          .news-page :global(*) {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default News;