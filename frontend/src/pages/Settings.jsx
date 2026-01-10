/**
 * Settings.jsx
 *
 * This page allows users to configure various application settings and view advanced logs.
 * Features: Dark Mode toggle, scraping control, and access to backend logs.
 * This page is enabled/disabled via a feature flag in .env.
 */

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import useScraping from '../hooks/useScraping';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Lightbulb, Server, BookOpen, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

// ===========================================
// Custom Toggle Component
// ===========================================

const Toggle = ({ enabled, onChange, label }) => {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
        enabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
      }`}
      role="switch"
      aria-checked={enabled}
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};

// ===========================================
// Settings Page Component
// ===========================================

const Settings = () => {
  const { darkMode, toggleDarkMode, addNotification } = useAppContext();
  const {
    availableScrapers,
    scrapersLoading,
    fetchAvailableScrapers,
    logs: scrapingLogs,
    logsLoading: scrapingLogsLoading,
    logsError: scrapingLogsError,
    logsPagination,
    fetchLogs,
    nextLogsPage,
    prevLogsPage,
    fetchLogById,
    selectedLog,
    selectedLogLoading,
    setSelectedLog,
  } = useScraping({
    autoFetchStatus: true,
    autoFetchLogs: true,
    pollWhileActive: true,
  });

  const [filterScraperName, setFilterScraperName] = useState('');
  const [filterLogStatus, setFilterLogStatus] = useState('');
  const [fileLogName, setFileLogName] = useState('combined.log');
  const [fileLogContent, setFileLogContent] = useState('');
  const [fileLogLoading, setFileLogLoading] = useState(false);
  const [fileLogError, setFileLogError] = useState('');

  // Fetch available scrapers for log filter dropdown
  useEffect(() => {
    fetchAvailableScrapers();
  }, [fetchAvailableScrapers]);

  // Fetch file logs
  const fetchFileLogs = async () => {
    setFileLogLoading(true);
    setFileLogError('');
    setFileLogContent('');
    try {
      const response = await api.getFileLogs(fileLogName, 1000); // Fetch last 1000 lines
      if (response.success) {
        setFileLogContent(response.content);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch file logs');
      }
    } catch (err) {
      setFileLogError(err.error?.message || err.message || 'Failed to fetch file logs');
      addNotification({
        type: 'error',
        title: 'Error',
        message: `Failed to load ${fileLogName} logs.`,
      });
    } finally {
      setFileLogLoading(false);
    }
  };

  useEffect(() => {
    fetchFileLogs();
  }, [fileLogName]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterLogs = () => {
    fetchLogs({
      scraperName: filterScraperName || undefined,
      status: filterLogStatus || undefined,
      page: 1,
    });
  };

  const handleClearLogsFilters = () => {
    setFilterScraperName('');
    setFilterLogStatus('');
    fetchLogs({ page: 1 });
  };

  // Feature flag check for the entire page
  if (import.meta.env.VITE_FEATURE_SETTINGS_PAGE !== 'true') {
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">This feature is currently disabled.</p>
        <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
          Enable it by setting <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">VITE_FEATURE_SETTINGS_PAGE=true</code> in your frontend .env file.
        </p>
      </div>
    );
  }

  return (
    <div className="settings-page space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Settings & Tools</h1>

      {/* General Settings */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-soft transition-colors duration-300">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <Lightbulb size={24} className="mr-2 text-primary-600" /> General Settings
        </h2>
        
        {/* Dark Mode Toggle */}
        {import.meta.env.VITE_FEATURE_DARK_MODE_TOGGLE === 'true' && (
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <label htmlFor="darkModeToggle" className="text-gray-700 dark:text-gray-300 font-medium">
                Dark Mode
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Toggle between light and dark theme
              </p>
            </div>
            <Toggle
              enabled={darkMode}
              onChange={toggleDarkMode}
              label="Enable dark mode"
            />
          </div>
        )}

        {/* Application Info */}
        <div className="py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 dark:text-gray-300 font-medium">Application Version</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Current version of the application</p>
            </div>
            <span className="text-gray-600 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">
              v1.0.0
            </span>
          </div>
        </div>

        {/* Backend Status */}
        <div className="py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 dark:text-gray-300 font-medium">Backend API</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Backend server connection status</p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Connected
            </span>
          </div>
        </div>
      </div>

      {/* Scraping Log Viewer */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-soft transition-colors duration-300">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <BookOpen size={24} className="mr-2 text-primary-600" /> Scraping Logs (Database)
        </h2>

        {/* Filters for Logs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <select
            value={filterScraperName}
            onChange={(e) => setFilterScraperName(e.target.value)}
            className="block w-full sm:w-1/3 px-3 py-2 border border-gray-300 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-gray-100"
          >
            <option value="">All Scrapers</option>
            {scrapersLoading ? (
              <option disabled>Loading...</option>
            ) : (
              availableScrapers.map(scraper => (
                <option key={scraper} value={scraper}>{scraper}</option>
              ))
            )}
          </select>
          <select
            value={filterLogStatus}
            onChange={(e) => setFilterLogStatus(e.target.value)}
            className="block w-full sm:w-1/3 px-3 py-2 border border-gray-300 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-gray-100"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
            <option value="partial">Partial</option>
          </select>
          <button
            onClick={handleFilterLogs}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            Apply Filters
          </button>
          <button
            onClick={handleClearLogsFilters}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
          >
            Clear Filters
          </button>
        </div>

        {/* Scraping Log Table */}
        {scrapingLogsLoading ? (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading logs...</span>
          </div>
        ) : scrapingLogsError ? (
          <div className="text-center py-8">
            <p className="text-red-500 dark:text-red-400">Error loading logs: {scrapingLogsError}</p>
            <button
              onClick={() => fetchLogs({ page: 1 })}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : scrapingLogs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">No scraping logs found.</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Logs will appear here after running scrapers.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Scraper</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Source</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Started</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Inserted</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Errors</th>
                  <th scope="col" className="relative px-4 py-3"><span className="sr-only">Details</span></th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {scrapingLogs.map(log => (
                  <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {log.scraperName}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {log.source}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        log.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        log.status === 'running' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        log.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        log.status === 'cancelled' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {format(new Date(log.startedAt), 'MMM dd, HH:mm')}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {log.results?.inserted || 0}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <span className={log.errorLogs?.length > 0 || log.errors?.length > 0 ? 'text-red-500' : ''}>
                        {log.errorLogs?.length || log.errors?.length || 0}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => fetchLogById(log._id)} 
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination for Logs */}
        {logsPagination.total > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-700 dark:text-gray-300">
            <span>
              Showing {((logsPagination.page - 1) * logsPagination.limit) + 1} to {Math.min(logsPagination.page * logsPagination.limit, logsPagination.total)} of {logsPagination.total} logs
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={prevLogsPage}
                disabled={!logsPagination.hasPrev}
                className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                Page {logsPagination.page} of {logsPagination.pages}
              </span>
              <button
                onClick={nextLogsPage}
                disabled={!logsPagination.hasNext}
                className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Raw File Log Viewer */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-soft transition-colors duration-300">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <Server size={24} className="mr-2 text-primary-600" /> Raw Server Logs (Files)
        </h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label htmlFor="fileLogName" className="text-gray-700 dark:text-gray-300 text-sm font-medium">
              Select Log File:
            </label>
            <select
              id="fileLogName"
              value={fileLogName}
              onChange={(e) => setFileLogName(e.target.value)}
              className="block px-3 py-2 border border-gray-300 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-gray-100"
            >
              <option value="combined.log">combined.log</option>
              <option value="error.log">error.log</option>
              <option value="http.log">http.log</option>
              <option value="scraping.log">scraping.log</option>
              <option value="exceptions.log">exceptions.log</option>
              <option value="rejections.log">rejections.log</option>
            </select>
          </div>
          <button
            onClick={fetchFileLogs}
            disabled={fileLogLoading}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 text-sm font-medium flex items-center"
          >
            {fileLogLoading ? (
              <>
                <LoadingSpinner size="sm" color="text-white" />
                <span className="ml-2">Loading...</span>
              </>
            ) : (
              'Refresh'
            )}
          </button>
        </div>

        {fileLogLoading ? (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading log file...</span>
          </div>
        ) : fileLogError ? (
          <div className="text-center py-8">
            <p className="text-red-500 dark:text-red-400">Error loading file log: {fileLogError}</p>
            <button
              onClick={fetchFileLogs}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-md text-xs overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap font-mono custom-scrollbar">
              {fileLogContent || 'No log content available. The log file may be empty or not exist yet.'}
            </pre>
            {fileLogContent && (
              <div className="absolute top-2 right-2">
                <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                  {fileLogContent.split('\n').length} lines
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-start py-8 px-4">
          <div className="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <Clock size={24} className="mr-2 text-primary-600" />
                Log Details: {selectedLog.scraperName}
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <span className="text-2xl text-gray-500 dark:text-gray-400">&times;</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {selectedLogLoading ? (
                <div className="flex justify-center items-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Session ID</p>
                      <p className="font-mono text-sm text-gray-900 dark:text-gray-100">{selectedLog.sessionId}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedLog.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        selectedLog.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {selectedLog.status}
                      </span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Source</p>
                      <p className="text-gray-900 dark:text-gray-100">{selectedLog.source}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Source URL</p>
                      <a 
                        href={selectedLog.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary-600 hover:underline text-sm break-all"
                      >
                        {selectedLog.sourceUrl}
                      </a>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Started At</p>
                      <p className="text-gray-900 dark:text-gray-100">{format(new Date(selectedLog.startedAt), 'PPpp')}</p>
                    </div>
                    {selectedLog.endedAt && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Ended At</p>
                        <p className="text-gray-900 dark:text-gray-100">{format(new Date(selectedLog.endedAt), 'PPpp')}</p>
                      </div>
                    )}
                    {selectedLog.duration > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                        <p className="text-gray-900 dark:text-gray-100">{selectedLog.formattedDuration}</p>
                      </div>
                    )}
                  </div>

                  {/* Results */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Results</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{selectedLog.results?.found || 0}</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">Found</p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{selectedLog.results?.inserted || 0}</p>
                        <p className="text-xs text-green-600 dark:text-green-400">Inserted</p>
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-center">
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{selectedLog.results?.duplicates || 0}</p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">Duplicates</p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{selectedLog.results?.failed || 0}</p>
                        <p className="text-xs text-red-600 dark:text-red-400">Failed</p>
                      </div>
                    </div>
                  </div>

                  {/* Errors */}
                  {(selectedLog.errorLogs?.length > 0 || selectedLog.errors?.length > 0) && (
                    <div>
                      <h4 className="font-semibold text-red-600 dark:text-red-400 mb-3">
                        Errors ({selectedLog.errorLogs?.length || selectedLog.errors?.length})
                      </h4>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {(selectedLog.errorLogs || selectedLog.errors)?.map((error, index) => (
                          <div key={index} className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded-r-lg">
                            <p className="font-medium text-red-700 dark:text-red-400">{error.type}</p>
                            <p className="text-sm text-red-600 dark:text-red-300">{error.message}</p>
                            {error.url && (
                              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                                URL: <a href={error.url} target="_blank" rel="noopener noreferrer" className="underline">{error.url}</a>
                              </p>
                            )}
                            {error.stack && (
                              <details className="mt-2">
                                <summary className="cursor-pointer text-xs text-red-500 hover:text-red-700">View Stack Trace</summary>
                                <pre className="bg-gray-900 text-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto whitespace-pre-wrap">
                                  {error.stack}
                                </pre>
                              </details>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Configuration */}
                  {selectedLog.config && Object.keys(selectedLog.config).length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Configuration</h4>
                      <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap font-mono">
                        {JSON.stringify(selectedLog.config, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;