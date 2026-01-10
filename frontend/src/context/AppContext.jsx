/**
 * AppContext.jsx
 *
 * Global application state management using React Context.
 * Provides shared state and functions to all components in the application.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// ===========================================
// Create Context
// ===========================================

const AppContext = createContext();

// ===========================================
// Custom Hook for Using Context
// ===========================================

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// ===========================================
// App Provider Component
// ===========================================

export const AppProvider = ({ children }) => {
  // =========================================
  // UI State
  // =========================================
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for saved preference, default to system preference or false
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      return JSON.parse(savedMode);
    }
    // Check system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // =========================================
  // Content State
  // =========================================
  const [contentStats, setContentStats] = useState(null);
  const [contentStatsLoading, setContentStatsLoading] = useState(false);
  const [contentStatsError, setContentStatsError] = useState(null);

  // =========================================
  // Scraping State
  // =========================================
  const [scrapingStatus, setScrapingStatus] = useState(null);
  const [scrapingStatusLoading, setScrapingStatusLoading] = useState(false);
  const [scrapingStatusError, setScrapingStatusError] = useState(null);
  const [availableScrapers, setAvailableScrapers] = useState([]);

  // =========================================
  // Dark Mode Toggle
  // =========================================
  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      return newMode;
    });
  }, []);

  // =========================================
  // Notifications
  // =========================================
  const addNotification = useCallback((notification) => {
    const id = Date.now();
    const newNotification = {
      id,
      type: 'info', // info, success, warning, error
      duration: 5000, // Auto-dismiss after 5 seconds
      ...notification,
    };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto-remove notification after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // =========================================
  // Fetch Content Statistics
  // =========================================
  const fetchContentStats = useCallback(async () => {
    setContentStatsLoading(true);
    setContentStatsError(null);
    try {
      const response = await api.getContentStats();
      if (response.success) {
        setContentStats(response.data);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch content stats');
      }
    } catch (error) {
      console.error('Error fetching content stats:', error);
      setContentStatsError(error.message || 'Failed to fetch content stats');
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load content statistics',
      });
    } finally {
      setContentStatsLoading(false);
    }
  }, [addNotification]);

  // =========================================
  // Fetch Scraping Status
  // =========================================
  const fetchScrapingStatus = useCallback(async () => {
    setScrapingStatusLoading(true);
    setScrapingStatusError(null);
    try {
      const response = await api.getScrapingStatus();
      if (response.success) {
        setScrapingStatus(response.data);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch scraping status');
      }
    } catch (error) {
      console.error('Error fetching scraping status:', error);
      setScrapingStatusError(error.message || 'Failed to fetch scraping status');
    } finally {
      setScrapingStatusLoading(false);
    }
  }, []);

  // =========================================
  // Fetch Available Scrapers
  // =========================================
  const fetchAvailableScrapers = useCallback(async () => {
    try {
      const response = await api.getAvailableScrapers();
      if (response.success) {
        setAvailableScrapers(response.data);
      }
    } catch (error) {
      console.error('Error fetching available scrapers:', error);
    }
  }, []);

  // =========================================
  // Start Scraping
  // =========================================
  const startScraping = useCallback(async (type = null) => {
    try {
      let response;
      if (type) {
        response = await api.startSpecificScraper(type);
        addNotification({
          type: 'success',
          title: 'Scraping Started',
          message: `${type} scraper has been initiated.`,
        });
      } else {
        response = await api.startAllScrapers();
        addNotification({
          type: 'success',
          title: 'Scraping Started',
          message: 'All scrapers have been initiated.',
        });
      }

      // Refresh status after starting
      setTimeout(fetchScrapingStatus, 1000);

      return response;
    } catch (error) {
      console.error('Error starting scraper:', error);
      addNotification({
        type: 'error',
        title: 'Scraping Failed',
        message: error.response?.data?.error?.message || error.message || 'Failed to start scraping',
      });
      throw error;
    }
  }, [addNotification, fetchScrapingStatus]);

  // =========================================
  // Stop Scraping
  // =========================================
  const stopScraping = useCallback(async () => {
    try {
      const response = await api.stopAllScrapers();
      addNotification({
        type: 'info',
        title: 'Scraping Stopped',
        message: 'Scraping operations have been stopped.',
      });

      // Refresh status after stopping
      setTimeout(fetchScrapingStatus, 1000);

      return response;
    } catch (error) {
      console.error('Error stopping scraper:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.error?.message || error.message || 'Failed to stop scraping',
      });
      throw error;
    }
  }, [addNotification, fetchScrapingStatus]);

  // =========================================
  // Refresh All Data
  // =========================================
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchContentStats(),
      fetchScrapingStatus(),
      fetchAvailableScrapers(),
    ]);
    addNotification({
      type: 'success',
      title: 'Data Refreshed',
      message: 'All data has been refreshed.',
      duration: 3000,
    });
  }, [fetchContentStats, fetchScrapingStatus, fetchAvailableScrapers, addNotification]);

  // =========================================
  // Initial Data Load
  // =========================================
  useEffect(() => {
    fetchContentStats();
    fetchScrapingStatus();
    fetchAvailableScrapers();
  }, [fetchContentStats, fetchScrapingStatus, fetchAvailableScrapers]);

  // =========================================
  // Periodic Status Refresh (when scraping is active)
  // =========================================
  useEffect(() => {
    let intervalId;

    if (scrapingStatus?.isRunning) {
      // Refresh status every 5 seconds when scraping is active
      intervalId = setInterval(() => {
        fetchScrapingStatus();
      }, 5000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [scrapingStatus?.isRunning, fetchScrapingStatus]);

  // =========================================
  // Context Value
  // =========================================
  const value = {
    // UI State
    darkMode,
    toggleDarkMode,
    sidebarOpen,
    setSidebarOpen,

    // Notifications
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,

    // Content Stats
    contentStats,
    contentStatsLoading,
    contentStatsError,
    fetchContentStats,

    // Scraping Status
    scrapingStatus,
    scrapingStatusLoading,
    scrapingStatusError,
    fetchScrapingStatus,
    availableScrapers,
    startScraping,
    stopScraping,

    // Actions
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;