/**
 * useContent.js
 *
 * Custom React hook for fetching and managing content data.
 * Provides pagination, filtering, searching, and sorting capabilities.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import { useAppContext } from '../context/AppContext';

// Default values from environment or fallbacks
const DEFAULT_PAGE_LIMIT = parseInt(import.meta.env.VITE_DEFAULT_PAGE_LIMIT) || 20;
const DEBOUNCE_DELAY = parseInt(import.meta.env.VITE_UI_DEBOUNCE_DELAY) || 300;

/**
 * Custom hook for fetching and managing content
 * @param {Object} initialOptions - Initial options for content fetching
 * @returns {Object} Content state and control functions
 */
const useContent = (initialOptions = {}) => {
  const { addNotification } = useAppContext();

  // =========================================
  // Initial Options
  // =========================================
  const {
    type = null, // Content type filter (news, job, blog, article)
    initialPage = 1,
    initialLimit = DEFAULT_PAGE_LIMIT,
    initialSort = 'publishedAt',
    initialOrder = -1, // -1 for descending, 1 for ascending
    initialSearch = '',
    initialSource = null,
    initialTags = null,
    autoFetch = true, // Automatically fetch on mount
  } = initialOptions;

  // =========================================
  // State
  // =========================================
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Filter and sort state
  const [filters, setFilters] = useState({
    type,
    source: initialSource,
    tags: initialTags,
    search: initialSearch,
    sort: initialSort,
    order: initialOrder,
    minRelevance: null,
    maxAgeDays: null,
  });

  // Selected content item (for detail view)
  const [selectedContent, setSelectedContent] = useState(null);
  const [selectedContentLoading, setSelectedContentLoading] = useState(false);

  // =========================================
  // Fetch Content
  // =========================================
  const fetchContent = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: options.page || pagination.page,
        limit: options.limit || pagination.limit,
        sort: options.sort || filters.sort,
        order: options.order || filters.order,
        status: 'active',
      };

      // Add optional filters
      if (options.type || filters.type) {
        params.type = options.type || filters.type;
      }
      if (options.source || filters.source) {
        params.source = options.source || filters.source;
      }
      if (options.tags || filters.tags) {
        params.tags = options.tags || filters.tags;
      }
      if (options.search || filters.search) {
        params.search = options.search || filters.search;
      }
      if (options.minRelevance || filters.minRelevance) {
        params.minRelevance = options.minRelevance || filters.minRelevance;
      }
      if (options.maxAgeDays || filters.maxAgeDays) {
        params.maxAgeDays = options.maxAgeDays || filters.maxAgeDays;
      }

      const response = await api.getContent(params);

      if (response.success) {
        setContent(response.data);
        setPagination(response.pagination);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch content');
      }
    } catch (err) {
      const errorMessage = err.error?.message || err.message || 'Failed to fetch content';
      setError(errorMessage);
      console.error('Error fetching content:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  // =========================================
  // Fetch Single Content by ID
  // =========================================
  const fetchContentById = useCallback(async (id) => {
    setSelectedContentLoading(true);
    setError(null);

    try {
      const response = await api.getContentById(id);

      if (response.success) {
        setSelectedContent(response.data);
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Failed to fetch content');
      }
    } catch (err) {
      const errorMessage = err.error?.message || err.message || 'Failed to fetch content';
      setError(errorMessage);
      console.error('Error fetching content by ID:', err);
      return null;
    } finally {
      setSelectedContentLoading(false);
    }
  }, []);

  // =========================================
  // Pagination Controls
  // =========================================
  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= pagination.pages) {
      setPagination((prev) => ({ ...prev, page }));
      fetchContent({ page });
    }
  }, [pagination.pages, fetchContent]);

  const nextPage = useCallback(() => {
    if (pagination.hasNext) {
      goToPage(pagination.page + 1);
    }
  }, [pagination.hasNext, pagination.page, goToPage]);

  const prevPage = useCallback(() => {
    if (pagination.hasPrev) {
      goToPage(pagination.page - 1);
    }
  }, [pagination.hasPrev, pagination.page, goToPage]);

  const setPageSize = useCallback((limit) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
    fetchContent({ limit, page: 1 });
  }, [fetchContent]);

  // =========================================
  // Filter Controls
  // =========================================
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page when filters change
  }, []);

  const setType = useCallback((type) => {
    updateFilters({ type });
  }, [updateFilters]);

  const setSource = useCallback((source) => {
    updateFilters({ source });
  }, [updateFilters]);

  const setTags = useCallback((tags) => {
    updateFilters({ tags });
  }, [updateFilters]);

  const setSearch = useCallback((search) => {
    updateFilters({ search });
  }, [updateFilters]);

  const setSort = useCallback((sort, order = -1) => {
    updateFilters({ sort, order });
  }, [updateFilters]);

  const clearFilters = useCallback(() => {
    setFilters({
      type: initialOptions.type || null,
      source: null,
      tags: null,
      search: '',
      sort: 'publishedAt',
      order: -1,
      minRelevance: null,
      maxAgeDays: null,
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [initialOptions.type]);

  // =========================================
  // Content Actions
  // =========================================
  const deleteContentItem = useCallback(async (id) => {
    try {
      const response = await api.deleteContent(id);

      if (response.success) {
        // Remove from local state
        setContent((prev) => prev.filter((item) => item._id !== id));
        setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
        addNotification({
          type: 'success',
          title: 'Content Deleted',
          message: 'The content has been successfully deleted.',
        });
        return true;
      } else {
        throw new Error(response.error?.message || 'Failed to delete content');
      }
    } catch (err) {
      const errorMessage = err.error?.message || err.message || 'Failed to delete content';
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: errorMessage,
      });
      return false;
    }
  }, [addNotification]);

  const archiveContentItem = useCallback(async (id) => {
    try {
      const response = await api.updateContentStatus(id, 'archived');

      if (response.success) {
        // Remove from local state (since we're viewing active content)
        setContent((prev) => prev.filter((item) => item._id !== id));
        setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
        addNotification({
          type: 'success',
          title: 'Content Archived',
          message: 'The content has been archived.',
        });
        return true;
      } else {
        throw new Error(response.error?.message || 'Failed to archive content');
      }
    } catch (err) {
      const errorMessage = err.error?.message || err.message || 'Failed to archive content';
      addNotification({
        type: 'error',
        title: 'Archive Failed',
        message: errorMessage,
      });
      return false;
    }
  }, [addNotification]);

  const flagContentItem = useCallback(async (id) => {
    try {
      const response = await api.updateContentStatus(id, 'flagged');

      if (response.success) {
        // Update local state
        setContent((prev) =>
          prev.map((item) =>
            item._id === id ? { ...item, status: 'flagged' } : item
          )
        );
        addNotification({
          type: 'warning',
          title: 'Content Flagged',
          message: 'The content has been flagged for review.',
        });
        return true;
      } else {
        throw new Error(response.error?.message || 'Failed to flag content');
      }
    } catch (err) {
      const errorMessage = err.error?.message || err.message || 'Failed to flag content';
      addNotification({
        type: 'error',
        title: 'Flag Failed',
        message: errorMessage,
      });
      return false;
    }
  }, [addNotification]);

  // =========================================
  // Debounced Search
  // =========================================
  useEffect(() => {
    const handler = setTimeout(() => {
      if (filters.search !== initialSearch || Object.values(filters).some((v) => v !== null)) {
        fetchContent({ search: filters.search, page: 1 });
      }
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(handler);
    };
  }, [filters.search]); // Only debounce search

  // =========================================
  // Fetch on Filter Changes (except search which is debounced)
  // =========================================
  useEffect(() => {
    fetchContent({
      type: filters.type,
      source: filters.source,
      tags: filters.tags,
      sort: filters.sort,
      order: filters.order,
      minRelevance: filters.minRelevance,
      maxAgeDays: filters.maxAgeDays,
      page: 1,
    });
  }, [filters.type, filters.source, filters.tags, filters.sort, filters.order, filters.minRelevance, filters.maxAgeDays]);

  // =========================================
  // Initial Fetch
  // =========================================
  useEffect(() => {
    if (autoFetch) {
      fetchContent();
    }
  }, []); // Only on mount

  // =========================================
  // Computed Values
  // =========================================
  const hasContent = useMemo(() => content.length > 0, [content]);
  const isEmpty = useMemo(() => !loading && content.length === 0, [loading, content]);
  const isFiltered = useMemo(() => {
    return filters.search || filters.source || filters.tags || filters.minRelevance || filters.maxAgeDays;
  }, [filters]);

  // =========================================
  // Return Values
  // =========================================
  return {
    // Content data
    content,
    loading,
    error,
    hasContent,
    isEmpty,
    isFiltered,

    // Pagination
    pagination,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,

    // Filters
    filters,
    updateFilters,
    setType,
    setSource,
    setTags,
    setSearch,
    setSort,
    clearFilters,

    // Actions
    fetchContent,
    fetchContentById,
    deleteContentItem,
    archiveContentItem,
    flagContentItem,

    // Selected content
    selectedContent,
    selectedContentLoading,
    setSelectedContent,

    // Refresh
    refresh: () => fetchContent(),
  };
};

export default useContent;