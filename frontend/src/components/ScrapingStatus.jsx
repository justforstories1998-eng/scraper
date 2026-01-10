/**
 * ScrapingStatus.jsx
 *
 * Displays the current status of the scraping process, including active scrapers,
 * rate limiter stats, and overall progress.
 */

import React, { useState } from 'react';
import { Play, StopCircle, RefreshCcw, Info, CheckCircle2, XCircle, Clock, Database, Gauge, BarChart, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import useScraping from '../hooks/useScraping'; // Changed from { useScraping } to useScraping
import LoadingSpinner from './LoadingSpinner';
import { formatDistanceToNow, format } from 'date-fns';

const ScrapingStatus = () => {
  const { addNotification } = useAppContext();
  const {
    status,
    statusLoading,
    statusError,
    availableScrapers,
    scrapersLoading,
    startScraping,
    stopScraping,
    isStarting,
    isStopping,
    fetchStatus,
  } = useScraping({
    autoFetchStatus: true,
    pollWhileActive: true // Enable polling for status updates
  });

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedScraperType, setSelectedScraperType] = useState(null);

  const isOverallRunning = status?.isRunning;
  const lastRunTime = status?.lastRun ? new Date(status.lastRun) : null;

  const handleStartScraping = async (type = null) => {
    try {
      await startScraping(type);
    } catch (error) {
      // Notification handled by useScraping hook
      console.error('Start scraping error:', error);
    }
  };

  const handleStopScraping = async () => {
    try {
      await stopScraping();
    } catch (error) {
      // Notification handled by useScraping hook
      console.error('Stop scraping error:', error);
    }
  };

  const openDetailModal = (type) => {
    setSelectedScraperType(type);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedScraperType(null);
  };

  const getScraperStatusInfo = (scraperName) => {
    if (!status || !status.activeScrapers) return null;
    return status.activeScrapers.find(s => s.name === scraperName);
  };

  const getStatusIcon = (scraperStatus) => {
    switch (scraperStatus) {
      case 'running':
        return <RefreshCcw size={18} className="text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle2 size={18} className="text-green-500" />;
      case 'failed':
        return <XCircle size={18} className="text-red-500" />;
      case 'cancelled':
        return <StopCircle size={18} className="text-yellow-500" />;
      default:
        return <Info size={18} className="text-gray-400" />;
    }
  };

  const getStatusBadgeClass = (scraperStatus) => {
    switch (scraperStatus) {
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'cancelled':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (statusLoading && !status) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-soft">
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner size="lg" />
          <p className="ml-3 text-lg text-gray-700 dark:text-gray-300">Loading scraping status...</p>
        </div>
      </div>
    );
  }

  if (statusError) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-soft">
        <div className="text-center py-8 text-red-600 dark:text-red-400">
          <h3 className="text-xl font-bold mb-2">Error Loading Scraping Status</h3>
          <p>{statusError}</p>
          <button
            onClick={fetchStatus}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const overallProgress = status?.overall || {
    totalScraped: 0,
    totalInserted: 0,
    totalErrors: 0
  };

  const rateLimiterStats = status?.rateLimiterStats || {
    totalRequests: 0,
    throttledRequests: 0,
    throttleRate: '0%',
    averageWaitTime: '0ms'
  };

  const concurrentLimiterStats = status?.concurrentLimiterStats || {
    currentCount: 0,
    maxConcurrent: 0,
    queueLength: 0
  };

  const lastRunDisplay = lastRunTime
    ? `${formatDistanceToNow(lastRunTime, { addSuffix: true })} (${format(lastRunTime, 'PPpp')})`
    : 'Never';

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-soft transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
          <BarChart size={24} className="mr-2 text-primary-600" /> Scraping Status
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchStatus}
            disabled={statusLoading}
            className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            <RefreshCcw size={16} className={`mr-2 ${statusLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {!isOverallRunning ? (
            <button
              onClick={() => handleStartScraping()}
              disabled={isStarting}
              className="flex items-center px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 disabled:opacity-50 transition-colors text-sm font-medium"
            >
              {isStarting ? (
                <>
                  <LoadingSpinner size="sm" color="text-white" />
                  <span className="ml-2">Starting...</span>
                </>
              ) : (
                <>
                  <Play size={18} className="mr-2" />
                  Start All Scrapers
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleStopScraping}
              disabled={isStopping}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors text-sm font-medium"
            >
              {isStopping ? (
                <>
                  <LoadingSpinner size="sm" color="text-white" />
                  <span className="ml-2">Stopping...</span>
                </>
              ) : (
                <>
                  <StopCircle size={18} className="mr-2" />
                  Stop All Scrapers
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mb-6">
        <div className={`inline-flex items-center px-4 py-2 rounded-full ${
          isOverallRunning 
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
        }`}>
          {isOverallRunning ? (
            <>
              <RefreshCcw size={18} className="mr-2 animate-spin" />
              <span className="font-medium">Scraping in Progress</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={18} className="mr-2" />
              <span className="font-medium">Idle</span>
            </>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="flex items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <Clock size={24} className="mr-3 text-primary-500" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Last Run</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{lastRunDisplay}</p>
          </div>
        </div>
        <div className="flex items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <Database size={24} className="mr-3 text-green-500" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Inserted</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{overallProgress.totalInserted}</p>
          </div>
        </div>
        <div className="flex items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <BarChart size={24} className="mr-3 text-blue-500" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Scraped</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{overallProgress.totalScraped}</p>
          </div>
        </div>
        <div className="flex items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <XCircle size={24} className="mr-3 text-red-500" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Errors</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{overallProgress.totalErrors}</p>
          </div>
        </div>
      </div>

      {/* Scrapers Overview */}
      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Individual Scrapers</h4>
      {scrapersLoading ? (
        <div className="flex justify-center py-4">
          <LoadingSpinner />
        </div>
      ) : availableScrapers.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 py-4">No scrapers available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {availableScrapers.map((type) => {
            const scraperInfo = getScraperStatusInfo(type);
            const currentStatus = scraperInfo?.status || 'idle';
            const buttonDisabled = isStarting || isStopping || currentStatus === 'running';

            return (
              <div key={type} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{type}</p>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getStatusBadgeClass(currentStatus)} flex items-center`}>
                      {getStatusIcon(currentStatus)}
                      <span className="ml-1 capitalize">{currentStatus}</span>
                    </span>
                  </div>
                  {scraperInfo?.error && (
                    <p className="text-red-500 dark:text-red-400 text-xs mb-2 truncate" title={scraperInfo.error}>
                      Error: {scraperInfo.error.substring(0, 40)}...
                    </p>
                  )}
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    {scraperInfo?.startTime && (
                      <p>Started: {format(new Date(scraperInfo.startTime), 'p')}</p>
                    )}
                    {scraperInfo?.endTime && (
                      <p>Ended: {format(new Date(scraperInfo.endTime), 'p')}</p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => handleStartScraping(type)}
                    disabled={buttonDisabled}
                    className="flex-1 px-3 py-1.5 bg-primary-600 text-white text-xs rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    <Play size={14} className="mr-1" /> Start
                  </button>
                  <button
                    onClick={() => openDetailModal(type)}
                    className="flex-1 px-3 py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors flex items-center justify-center"
                  >
                    <Info size={14} className="mr-1" /> Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rate Limiter & Concurrent Limiter Stats */}
      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-3">System Metrics</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
          <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center mb-3">
            <Gauge size={18} className="mr-2 text-orange-500" /> Outgoing Request Rate Limiter
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Total Requests</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{rateLimiterStats.totalRequests}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Throttled</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{rateLimiterStats.throttledRequests}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Throttle Rate</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{rateLimiterStats.throttleRate}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Avg Wait Time</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{rateLimiterStats.averageWaitTime}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
          <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center mb-3">
            <BarChart size={18} className="mr-2 text-teal-500" /> Concurrent Request Limiter
          </p>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Active</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{concurrentLimiterStats.currentCount}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Max</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{concurrentLimiterStats.maxConcurrent}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Queue</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{concurrentLimiterStats.queueLength}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scraper Detail Modal */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
          <div className="relative p-6 border w-full max-w-md shadow-lg rounded-lg bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 capitalize">
                {selectedScraperType} Scraper
              </h3>
              <button
                onClick={closeDetailModal}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="text-gray-700 dark:text-gray-300 space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Scraper Information</h4>
                <p className="text-sm">Type: <span className="font-semibold capitalize">{selectedScraperType}</span></p>
                <p className="text-sm">Status: <span className="font-semibold">{getScraperStatusInfo(selectedScraperType)?.status || 'Idle'}</span></p>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This scraper collects {selectedScraperType} content related to webMethods from various sources across the internet.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    handleStartScraping(selectedScraperType);
                    closeDetailModal();
                  }}
                  disabled={isStarting || getScraperStatusInfo(selectedScraperType)?.status === 'running'}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm font-medium"
                >
                  Start Scraper
                </button>
                <button
                  onClick={closeDetailModal}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScrapingStatus;