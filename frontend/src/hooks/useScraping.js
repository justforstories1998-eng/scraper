/**
 * useScraping.js
 *
 * Custom React hook for managing scraping operations and logs.
 * Provides functionality to start/stop scrapers, monitor status, and view logs.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import api from '../services/api';
import { useAppContext } from '../context/AppContext';

// Polling intervals
const ACTIVE_POLL_INTERVAL = 10000; // 10 seconds (increased from 5)
const IDLE_POLL_INTERVAL = 60000; // 60 seconds
const ERROR_RETRY_DELAY = 30000; // 30 seconds after error

/**
 * Custom hook for managing scraping operations
 */
const useScraping = (options = {}) => {
  const {
    autoFetchStatus = true,
    autoFetchLogs = false,
    pollWhileActive = true,
  } = options;

  const { addNotification } = useAppContext();

  // Use refs to track mounted state and prevent memory leaks
  const isMountedRef = useRef(true);
  const pollTimeoutRef = useRef(null);
  const hasErrorRef = useRef(false);

  // =========================================
  // Scraping Status State
  // =========================================
  const [status, setStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState(null);

  // =========================================
  // Available Scrapers State
  // =========================================
  const [availableScrapers, setAvailableScrapers] = useState([]);
  const [scrapersLoading, setScrapersLoading] = useState(false);

  // =========================================
  // Scraping Logs State
  // =========================================
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState(null);
  const [logsPagination, setLogsPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // =========================================
  // Scraping Statistics State
  // =========================================
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);

  // =========================================
  // Selected Log State
  // =========================================
  const [selectedLog, setSelectedLog] = useState(null);
  const [selectedLogLoading, setSelectedLogLoading] = useState(false);

  // =========================================
  // Operation State
  // =========================================
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  // =========================================
  // Cleanup on unmount
  // =========================================
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, []);

  // =========================================
  // Fetch Scraping Status
  // =========================================
  const fetchStatus = useCallback(async () => {
    // Don't fetch if component is unmounted or if there's a recent error
    if (!isMountedRef.current) return;
    
    // Clear any existing timeout
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }

    setStatusLoading(true);
    setStatusError(null);

    try {
      const response = await api.getScrapingStatus();

      if (!isMountedRef.current) return;

      if (response.success) {
        setStatus(response.data);
        hasErrorRef.current = false;
      } else {
        throw new Error(response.error?.message || 'Failed to fetch status');
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      
      const errorMessage = err.error?.message || err.message || 'Failed to fetch scraping status';
      setStatusError(errorMessage);
      hasErrorRef.current = true;
      
      // Don't log rate limit errors repeatedly
      if (!errorMessage.includes('Rate limit') && !errorMessage.includes('Too many requests')) {
        console.error('Error fetching scraping status:', err);
      }
    } finally {
      if (isMountedRef.current) {
        setStatusLoading(false);
      }
    }
  }, []);

  // =========================================
  // Fetch Available Scrapers
  // =========================================
  const fetchAvailableScrapers = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setScrapersLoading(true);

    try {
      const response = await api.getAvailableScrapers();

      if (!isMountedRef.current) return;

      if (response.success) {
        setAvailableScrapers(response.data);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error('Error fetching available scrapers:', err);
    } finally {
      if (isMountedRef.current) {
        setScrapersLoading(false);
      }
    }
  }, []);

  // =========================================
  // Fetch Scraping Logs
  // =========================================
  const fetchLogs = useCallback(async (params = {}) => {
    if (!isMountedRef.current) return;
    
    setLogsLoading(true);
    setLogsError(null);

    try {
      const queryParams = {
        page: params.page || logsPagination.page,
        limit: params.limit || logsPagination.limit,
        ...params,
      };

      const response = await api.getScrapingLogs(queryParams);

      if (!isMountedRef.current) return;

      if (response.success) {
        setLogs(response.data);
        setLogsPagination(response.pagination);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch logs');
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      
      const errorMessage = err.error?.message || err.message || 'Failed to fetch scraping logs';
      setLogsError(errorMessage);
      console.error('Error fetching scraping logs:', err);
    } finally {
      if (isMountedRef.current) {
        setLogsLoading(false);
      }
    }
  }, [logsPagination.page, logsPagination.limit]);

  // =========================================
  // Fetch Log by ID
  // =========================================
  const fetchLogById = useCallback(async (id) => {
    if (!isMountedRef.current) return null;
    
    setSelectedLogLoading(true);

    try {
      const response = await api.getScrapingLogById(id);

      if (!isMountedRef.current) return null;

      if (response.success) {
        setSelectedLog(response.data);
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Failed to fetch log');
      }
    } catch (err) {
      if (!isMountedRef.current) return null;
      
      console.error('Error fetching log by ID:', err);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch log details',
      });
      return null;
    } finally {
      if (isMountedRef.current) {
        setSelectedLogLoading(false);
      }
    }
  }, [addNotification]);

  // =========================================
  // Fetch Scraping Statistics
  // =========================================
  const fetchStats = useCallback(async (days = 7) => {
    if (!isMountedRef.current) return;
    
    setStatsLoading(true);
    setStatsError(null);

    try {
      const response = await api.getScrapingStats(days);

      if (!isMountedRef.current) return;

      if (response.success) {
        setStats(response.data);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch stats');
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      
      const errorMessage = err.error?.message || err.message || 'Failed to fetch scraping statistics';
      setStatsError(errorMessage);
      console.error('Error fetching scraping statistics:', err);
    } finally {
      if (isMountedRef.current) {
        setStatsLoading(false);
      }
    }
  }, []);

  // =========================================
  // Start Scraping
  // =========================================
  const startScraping = useCallback(async (type = null) => {
    setIsStarting(true);

    try {
      let response;

      if (type) {
        response = await api.startSpecificScraper(type);
        addNotification({
          type: 'success',
          title: 'Scraper Started',
          message: `${type.charAt(0).toUpperCase() + type.slice(1)} scraper has been initiated.`,
        });
      } else {
        response = await api.startAllScrapers();
        addNotification({
          type: 'success',
          title: 'All Scrapers Started',
          message: 'All scrapers have been initiated.',
        });
      }

      // Refresh status after a delay
      setTimeout(() => {
        if (isMountedRef.current) {
          fetchStatus();
        }
      }, 2000);

      return response;
    } catch (err) {
      const errorMessage = err.error?.message || err.message || 'Failed to start scraping';
      addNotification({
        type: 'error',
        title: 'Start Failed',
        message: errorMessage,
      });
      throw err;
    } finally {
      if (isMountedRef.current) {
        setIsStarting(false);
      }
    }
  }, [addNotification, fetchStatus]);

  // =========================================
  // Stop Scraping
  // =========================================
  const stopScraping = useCallback(async () => {
    setIsStopping(true);

    try {
      const response = await api.stopAllScrapers();

      addNotification({
        type: 'info',
        title: 'Scrapers Stopped',
        message: 'All scraping operations have been stopped.',
      });

      // Refresh status after a delay
      setTimeout(() => {
        if (isMountedRef.current) {
          fetchStatus();
        }
      }, 2000);

      return response;
    } catch (err) {
      const errorMessage = err.error?.message || err.message || 'Failed to stop scraping';
      addNotification({
        type: 'error',
        title: 'Stop Failed',
        message: errorMessage,
      });
      throw err;
    } finally {
      if (isMountedRef.current) {
        setIsStopping(false);
      }
    }
  }, [addNotification, fetchStatus]);

  // =========================================
  // Logs Pagination
  // =========================================
  const goToLogsPage = useCallback((page) => {
    if (page >= 1 && page <= logsPagination.pages) {
      fetchLogs({ page });
    }
  }, [logsPagination.pages, fetchLogs]);

  const nextLogsPage = useCallback(() => {
    if (logsPagination.hasNext) {
      goToLogsPage(logsPagination.page + 1);
    }
  }, [logsPagination.hasNext, logsPagination.page, goToLogsPage]);

  const prevLogsPage = useCallback(() => {
    if (logsPagination.hasPrev) {
      goToLogsPage(logsPagination.page - 1);
    }
  }, [logsPagination.hasPrev, logsPagination.page, goToLogsPage]);

  // =========================================
  // Filter Logs
  // =========================================
  const filterLogs = useCallback((filters = {}) => {
    fetchLogs({ ...filters, page: 1 });
  }, [fetchLogs]);

  // =========================================
  // Computed Values
  // =========================================
  const isRunning = useMemo(() => status?.isRunning || false, [status]);

  const activeScrapersList = useMemo(() => {
    if (!status?.activeScrapers) return [];
    return status.activeScrapers.filter(s => s.status === 'running');
  }, [status]);

  const completedScrapersList = useMemo(() => {
    if (!status?.activeScrapers) return [];
    return status.activeScrapers.filter(s => s.status === 'completed');
  }, [status]);

  const failedScrapersList = useMemo(() => {
    if (!status?.activeScrapers) return [];
    return status.activeScrapers.filter(s => s.status === 'failed');
  }, [status]);

  const overallProgress = useMemo(() => {
    if (!status?.overall) return null;
    return status.overall;
  }, [status]);

  const lastRunTime = useMemo(() => {
    if (!status?.lastRun) return null;
    return new Date(status.lastRun);
  }, [status]);

  // =========================================
  // Initial Fetch (only once on mount)
  // =========================================
  useEffect(() => {
    if (autoFetchStatus) {
      fetchStatus();
      fetchAvailableScrapers();
    }
    if (autoFetchLogs) {
      fetchLogs();
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================================
  // Polling for Status Updates
  // =========================================
  useEffect(() => {
    if (!pollWhileActive || !autoFetchStatus) return;

    const schedulePoll = () => {
      // Clear any existing timeout
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }

      // Determine poll interval
      let interval;
      if (hasErrorRef.current) {
        interval = ERROR_RETRY_DELAY;
      } else if (isRunning) {
        interval = ACTIVE_POLL_INTERVAL;
      } else {
        interval = IDLE_POLL_INTERVAL;
      }

      pollTimeoutRef.current = setTimeout(async () => {
        if (isMountedRef.current) {
          await fetchStatus();
          schedulePoll(); // Schedule next poll
        }
      }, interval);
    };

    // Start polling
    schedulePoll();

    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [pollWhileActive, autoFetchStatus, isRunning, fetchStatus]);

  // =========================================
  // Refresh All Data
  // =========================================
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchStatus(),
      fetchAvailableScrapers(),
      fetchLogs(),
      fetchStats(),
    ]);
  }, [fetchStatus, fetchAvailableScrapers, fetchLogs, fetchStats]);

  // =========================================
  // Return Values
  // =========================================
  return {
    // Status
    status,
    statusLoading,
    statusError,
    fetchStatus,
    isRunning,
    activeScrapersList,
    completedScrapersList,
    failedScrapersList,
    overallProgress,
    lastRunTime,

    // Available Scrapers
    availableScrapers,
    scrapersLoading,
    fetchAvailableScrapers,

    // Logs
    logs,
    logsLoading,
    logsError,
    logsPagination,
    fetchLogs,
    fetchLogById,
    goToLogsPage,
    nextLogsPage,
    prevLogsPage,
    filterLogs,

    // Selected Log
    selectedLog,
    selectedLogLoading,
    setSelectedLog,

    // Statistics
    stats,
    statsLoading,
    statsError,
    fetchStats,

    // Operations
    startScraping,
    stopScraping,
    isStarting,
    isStopping,

    // Refresh
    refreshAll,
  };
};

export default useScraping;