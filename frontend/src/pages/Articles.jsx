/**
 * Articles.jsx
 *
 * Page component to display general articles and blog posts related to webMethods.
 * Integrates search, filters, and a list of content cards.
 */

import React from 'react';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import ContentList from '../components/ContentList';
import useContent from '../hooks/useContent';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Articles = () => {
  const { contentStats } = useAppContext();
  const location = useLocation();

  // Extract initial search term and filters from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';
  const initialType = queryParams.get('type') || null;
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
    type: initialType || null,
    initialSearch,
    initialSource,
    initialSort,
    initialOrder,
    initialPage,
    initialLimit,
  });

  // Extract unique blog/article sources from overall content statistics for the filter bar
  const articleSources = contentStats?.bySource
    ?.filter(s => s.type === 'blog' || s.type === 'article' || true)
    .map(s => s.source)
    .sort() || [];

  const articleContentTypes = ['blog', 'article', 'documentation', 'tutorial', 'video', 'other'];

  return (
    <div className="articles-page min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 dark:from-indigo-600/10 dark:to-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/15 to-blue-400/15 dark:from-cyan-600/10 dark:to-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 right-1/3 w-72 h-72 bg-gradient-to-tl from-violet-400/10 to-fuchsia-400/10 dark:from-violet-600/5 dark:to-fuchsia-600/5 rounded-full blur-3xl" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        
        {/* Hero Header Section */}
        <header className="mb-10 sm:mb-14">
          {/* Breadcrumb / Category Tag */}
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-400/20 dark:to-purple-400/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-500/30 backdrop-blur-sm">
              <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
              Knowledge Hub
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-800 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
              webMethods
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400 bg-clip-text text-transparent">
              Articles & Blogs
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Discover insights, tutorials, and best practices from the webMethods community. 
            Stay updated with the latest trends and expert knowledge.
          </p>

          {/* Stats Bar */}
          {contentStats && (
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6 pt-6 border-t border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {pagination?.totalItems?.toLocaleString() || '—'}
                </span>
                <span>articles available</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-slate-300 dark:bg-slate-600" />
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Updated regularly</span>
              </div>
            </div>
          )}
        </header>

        {/* Search and Filter Section */}
        <section className="mb-10 sm:mb-12">
          <div className="relative">
            {/* Glassmorphism Container */}
            <div className="relative backdrop-blur-xl bg-white/70 dark:bg-slate-800/70 rounded-2xl sm:rounded-3xl border border-white/50 dark:border-slate-700/50 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 p-4 sm:p-6 lg:p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-200/30 dark:hover:shadow-indigo-900/20">
              
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    Search & Filter
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Find exactly what you're looking for
                  </p>
                </div>
              </div>

              {/* Search and Filter Controls */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-6">
                {/* Search Bar Container */}
                <div className="flex-1 min-w-0">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition-all duration-300" />
                    <div className="relative">
                      <SearchBar 
                        onSearch={setSearch} 
                        initialSearchTerm={filters.search}
                      />
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden lg:block w-px self-stretch bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

                {/* Filter Bar Container */}
                <div className="flex-shrink-0">
                  <FilterBar
                    filters={filters}
                    updateFilters={updateFilters}
                    clearFilters={clearFilters}
                    showTypeFilter={true}
                    availableContentTypes={articleContentTypes}
                    availableSources={articleSources}
                  />
                </div>
              </div>

              {/* Active Filters Display */}
              {(filters.search || filters.type || filters.source) && (
                <div className="mt-5 pt-5 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Active filters:
                    </span>
                    {filters.search && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/50 transition-all duration-200 hover:bg-indigo-200 dark:hover:bg-indigo-900/60">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        "{filters.search}"
                      </span>
                    )}
                    {filters.type && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700/50">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {filters.type}
                      </span>
                    )}
                    {filters.source && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-700/50">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        {filters.source}
                      </span>
                    )}
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear all
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Decorative gradient line */}
            <div className="absolute -bottom-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          </div>
        </section>

        {/* Content List Section */}
        <section className="relative">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
                  Latest Articles and Blog Posts
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {loading ? 'Loading...' : `Showing ${content?.length || 0} of ${pagination?.totalItems?.toLocaleString() || 0} results`}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-200 backdrop-blur-sm shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                Sort
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-200 backdrop-blur-sm shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Grid
              </button>
            </div>
          </div>

          {/* Content List Container */}
          <div className="relative backdrop-blur-sm bg-white/40 dark:bg-slate-800/40 rounded-2xl sm:rounded-3xl border border-white/60 dark:border-slate-700/40 shadow-xl shadow-slate-200/30 dark:shadow-slate-900/30 overflow-hidden transition-all duration-300">
            {/* Top gradient accent */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500" />
            
            {/* Content */}
            <div className="p-4 sm:p-6 lg:p-8">
              <ContentList
                content={content}
                loading={loading}
                error={error}
                pagination={pagination}
                goToPage={goToPage}
                nextPage={nextPage}
                prevPage={prevPage}
                setPageSize={setPageSize}
                title=""
                emptyMessage="No articles or blog posts found for webMethods. Try adjusting your filters or search terms."
              />
            </div>

            {/* Bottom gradient accent */}
            <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />
          </div>

          {/* Decorative corner elements */}
          <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-indigo-400/40 dark:border-indigo-500/30 rounded-tl-lg" />
          <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-purple-400/40 dark:border-purple-500/30 rounded-tr-lg" />
          <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400/40 dark:border-cyan-500/30 rounded-bl-lg" />
          <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-violet-400/40 dark:border-violet-500/30 rounded-br-lg" />
        </section>

        {/* Footer CTA Section */}
        <section className="mt-16 mb-8">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 p-8 sm:p-10 lg:p-12 shadow-2xl shadow-indigo-500/30">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                    <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            
            {/* Glowing orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-300/20 rounded-full blur-3xl" />

            <div className="relative z-10 text-center">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Can't find what you're looking for?
              </h3>
              <p className="text-indigo-100/90 text-lg mb-6 max-w-xl mx-auto">
                Explore our complete documentation or reach out to the community for help.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg shadow-black/20 transition-all duration-200 hover:scale-105 hover:-translate-y-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Browse Documentation
                </button>
                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-white/10 text-white border border-white/30 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:-translate-y-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                  Join Community
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Articles;