/**
 * Jobs.jsx
 *
 * Page component to display job postings related to webMethods.
 * Integrates search, filters, and a list of content cards.
 */

import React from 'react';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import ContentList from '../components/ContentList';
import useContent from '../hooks/useContent';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Jobs = () => {
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
    type: 'job',
    initialSearch,
    initialSource,
    initialSort,
    initialOrder,
    initialPage,
    initialLimit,
  });

  // Extract unique job sources from overall content statistics for the filter bar
  const jobSources = contentStats?.bySource
    ?.filter(s => s.type === 'job' || true)
    .map(s => s.source)
    .sort() || [];

  return (
    <div className="jobs-page min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 dark:from-slate-950 dark:via-emerald-950/20 dark:to-slate-950 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-200/40 to-teal-200/40 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-gradient-to-tr from-cyan-200/30 to-emerald-200/30 dark:from-cyan-900/15 dark:to-emerald-900/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-t from-teal-200/25 to-transparent dark:from-teal-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-10 sm:mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25 dark:shadow-emerald-500/15 transform transition-transform hover:scale-105">
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
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                />
              </svg>
            </div>
            <span className="px-3 py-1.5 text-xs font-semibold tracking-wider uppercase bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200/50 dark:border-emerald-700/50">
              Career Opportunities
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
              webMethods
            </span>
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent ml-2">
              Jobs
            </span>
          </h1>
          
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Discover exciting career opportunities and take the next step in your professional journey.
          </p>

          {/* Quick Stats Bar */}
          {pagination?.total > 0 && (
            <div className="mt-6 inline-flex items-center gap-6 px-5 py-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {pagination.total}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  active posting{pagination.total !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Updated regularly
              </div>
            </div>
          )}
        </header>

        {/* Search and Filter Section */}
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200/50 dark:border-slate-700/50" />
          
          <div className="relative p-6 sm:p-8">
            {/* Section Label */}
            <div className="flex items-center gap-2 mb-6">
              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Find Your Role
              </span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              {/* Search Bar Container */}
              <div className="flex-1 max-w-xl">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 ml-1">
                  Search by title, skills, or keywords
                </label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl opacity-0 group-hover:opacity-25 blur transition duration-300" />
                  <div className="relative">
                    <SearchBar onSearch={setSearch} initialSearchTerm={filters.search} />
                  </div>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="hidden lg:block w-px h-16 bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

              {/* Filter Bar Container */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 ml-1">
                  Filter by source & sorting
                </label>
                <FilterBar
                  filters={filters}
                  updateFilters={updateFilters}
                  clearFilters={clearFilters}
                  showTypeFilter={false}
                  availableSources={jobSources}
                />
              </div>
            </div>

            {/* Active Filters Display */}
            {(filters.search || filters.source) && (
              <div className="mt-6 pt-6 border-t border-slate-200/70 dark:border-slate-700/70">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Active filters:</span>
                  {filters.search && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/40 text-emerald-700 dark:text-emerald-300 text-sm font-medium rounded-full border border-emerald-200/50 dark:border-emerald-700/50 shadow-sm">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      "{filters.search}"
                    </span>
                  )}
                  {filters.source && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/40 dark:to-cyan-900/40 text-teal-700 dark:text-teal-300 text-sm font-medium rounded-full border border-teal-200/50 dark:border-teal-700/50 shadow-sm">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {filters.source}
                    </span>
                  )}
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear all
                  </button>
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
              <div className="h-8 w-1.5 bg-gradient-to-b from-emerald-500 via-teal-500 to-cyan-500 rounded-full" />
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
                  Latest Job Postings
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Sorted by most recent opportunities
                </p>
              </div>
            </div>
          </div>

          {/* Content List Container */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-white/80 dark:from-slate-800/50 dark:to-slate-800/80 backdrop-blur-sm rounded-3xl -m-4 p-4" />
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
                title="Latest Job Postings"
                emptyMessage="No job postings found for webMethods. Try adjusting your filters or search terms."
              />
            </div>
          </div>
        </section>

        {/* Footer CTA Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col items-center gap-3 px-8 py-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/30">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Can't find what you're looking for?
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              New opportunities are added frequently. Check back soon!
            </p>
          </div>
          
          {/* Decorative Footer Line */}
          <div className="mt-8 flex justify-center">
            <div className="h-1 w-24 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent rounded-full" />
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .jobs-page {
          position: relative;
        }
        
        .jobs-page :global(.search-input),
        .jobs-page :global(.filter-select) {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .jobs-page :global(.search-input:focus),
        .jobs-page :global(.filter-select:focus) {
          transform: translateY(-1px);
          box-shadow: 0 10px 40px -10px rgba(16, 185, 129, 0.3);
        }
        
        .jobs-page :global(.content-card) {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border-left: 3px solid transparent;
        }
        
        .jobs-page :global(.content-card:hover) {
          transform: translateY(-4px) translateX(4px);
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.1);
          border-left-color: #10b981;
        }
        
        .jobs-page :global(.pagination-btn) {
          transition: all 0.2s ease;
        }
        
        .jobs-page :global(.pagination-btn:hover) {
          transform: scale(1.05);
        }
        
        @media (prefers-reduced-motion: reduce) {
          .jobs-page :global(*) {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Jobs;