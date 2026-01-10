/**
 * api.js
 *
 * Centralized API service for making HTTP requests to the backend.
 * Uses Axios for HTTP client functionality.
 */

import axios from 'axios';

// ===========================================
// Axios Instance Configuration
// ===========================================

// Get the backend URL from environment variables, default to relative path for proxy
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '';

// Create an Axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===========================================
// Request Interceptor
// ===========================================

axiosInstance.interceptors.request.use(
  (config) => {
    // You can add authentication tokens here if needed
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.params || config.data || '');
    }

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// ===========================================
// Response Interceptor
// ===========================================

axiosInstance.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }

    // Return the data directly for convenience
    return response.data;
  },
  (error) => {
    // Handle common error scenarios
    const errorResponse = {
      success: false,
      error: {
        message: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
        status: 500,
      },
    };

    if (error.response) {
      // Server responded with an error status
      errorResponse.error = {
        message: error.response.data?.error?.message || error.response.statusText,
        code: error.response.data?.error?.code || 'SERVER_ERROR',
        status: error.response.status,
        details: error.response.data?.error?.details,
      };

      // Handle specific status codes
      switch (error.response.status) {
        case 401:
          console.warn('[API] Unauthorized - redirect to login or refresh token');
          break;
        case 403:
          console.warn('[API] Forbidden - insufficient permissions');
          break;
        case 404:
          console.warn('[API] Resource not found');
          break;
        case 429:
          console.warn('[API] Rate limit exceeded');
          break;
        case 500:
          console.error('[API] Server error');
          break;
        default:
          break;
      }
    } else if (error.request) {
      // Request was made but no response received
      errorResponse.error = {
        message: 'No response from server. Please check your connection.',
        code: 'NETWORK_ERROR',
        status: 0,
      };
    } else {
      // Something happened in setting up the request
      errorResponse.error = {
        message: error.message,
        code: 'REQUEST_ERROR',
        status: 0,
      };
    }

    console.error('[API Error]', errorResponse.error);

    // Return a consistent error format
    return Promise.reject(errorResponse);
  }
);

// ===========================================
// Content API Functions
// ===========================================

const api = {
  // =========================================
  // Content Endpoints
  // =========================================

  /**
   * Get all content with optional filtering and pagination
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Content data with pagination
   */
  getContent: (params = {}) => {
    return axiosInstance.get('/content', { params });
  },

  /**
   * Get content by type
   * @param {string} type - Content type (news, job, blog, article)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Content data with pagination
   */
  getContentByType: (type, params = {}) => {
    return axiosInstance.get(`/content/type/${type}`, { params });
  },

  /**
   * Get a single content item by ID
   * @param {string} id - Content ID
   * @returns {Promise<Object>} Content item
   */
  getContentById: (id) => {
    return axiosInstance.get(`/content/${id}`);
  },

  /**
   * Search content
   * @param {string} query - Search query
   * @param {Object} params - Additional query parameters
   * @returns {Promise<Object>} Search results with pagination
   */
  searchContent: (query, params = {}) => {
    return axiosInstance.get('/content', {
      params: { search: query, ...params },
    });
  },

  /**
   * Get content statistics
   * @returns {Promise<Object>} Content statistics
   */
  getContentStats: () => {
    return axiosInstance.get('/content/stats/overview');
  },

  /**
   * Delete content by ID
   * @param {string} id - Content ID
   * @returns {Promise<Object>} Deletion result
   */
  deleteContent: (id) => {
    return axiosInstance.delete(`/content/${id}`);
  },

  /**
   * Update content status
   * @param {string} id - Content ID
   * @param {string} status - New status (active, archived, deleted, flagged)
   * @returns {Promise<Object>} Updated content
   */
  updateContentStatus: (id, status) => {
    return axiosInstance.patch(`/content/${id}/status`, { status });
  },

  /**
   * Trigger content cleanup
   * @returns {Promise<Object>} Cleanup result
   */
  triggerContentCleanup: () => {
    return axiosInstance.post('/content/cleanup');
  },

  // =========================================
  // Scraper Endpoints
  // =========================================

  /**
   * Get scraping status
   * @returns {Promise<Object>} Current scraping status
   */
  getScrapingStatus: () => {
    return axiosInstance.get('/scraper/status');
  },

  /**
   * Get available scraper types
   * @returns {Promise<Object>} List of available scrapers
   */
  getAvailableScrapers: () => {
    return axiosInstance.get('/scraper/types');
  },

  /**
   * Start all scrapers
   * @param {string} triggeredBy - Source of the trigger
   * @returns {Promise<Object>} Scraping initiation result
   */
  startAllScrapers: (triggeredBy = 'manual') => {
    return axiosInstance.post('/scraper/start', { triggeredBy });
  },

  /**
   * Start a specific scraper
   * @param {string} type - Scraper type (news, job, blog)
   * @param {string} triggeredBy - Source of the trigger
   * @returns {Promise<Object>} Scraping initiation result
   */
  startSpecificScraper: (type, triggeredBy = 'manual') => {
    return axiosInstance.post(`/scraper/start/${type}`, { triggeredBy });
  },

  /**
   * Stop all scrapers
   * @returns {Promise<Object>} Stop result
   */
  stopAllScrapers: () => {
    return axiosInstance.post('/scraper/stop');
  },

  /**
   * Get scraping logs
   * @param {Object} params - Query parameters (page, limit, scraperName, status, etc.)
   * @returns {Promise<Object>} Scraping logs with pagination
   */
  getScrapingLogs: (params = {}) => {
    return axiosInstance.get('/scraper/logs', { params });
  },

  /**
   * Get a specific scraping log by ID
   * @param {string} id - Log ID
   * @returns {Promise<Object>} Scraping log details
   */
  getScrapingLogById: (id) => {
    return axiosInstance.get(`/scraper/logs/${id}`);
  },

  /**
   * Get scraping statistics
   * @param {number} days - Number of days to analyze
   * @returns {Promise<Object>} Scraping statistics
   */
  getScrapingStats: (days = 7) => {
    return axiosInstance.get('/scraper/stats', { params: { days } });
  },

  /**
   * Get file logs content
   * @param {string} filename - Log filename (e.g., 'error.log', 'combined.log')
   * @param {number} maxLines - Maximum number of lines to retrieve
   * @returns {Promise<Object>} Log file content
   */
  getFileLogs: (filename, maxLines = 500) => {
    return axiosInstance.get(`/scraper/file-logs/${filename}`, {
      params: { maxLines },
    });
  },

  // =========================================
  // Health Check
  // =========================================

  /**
   * Check backend health
   * @returns {Promise<Object>} Health status
   */
  healthCheck: () => {
    // Use base URL without /api prefix for health check
    return axios.get(`${API_BASE_URL}/health`);
  },
};

// ===========================================
// Export
// ===========================================

export default api;
export { axiosInstance };