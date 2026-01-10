/**
 * Dashboard.jsx
 *
 * Main dashboard component that provides an overview of scraped content statistics
 * and scraping activity status.
 */

import React, { useEffect, useState } from 'react';
import { Layers, List, Briefcase, Newspaper, BarChart2, TrendingUp, AlertTriangle, RefreshCcw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAppContext } from '../context/AppContext';
import useScraping from '../hooks/useScraping'; // Fixed: Changed from { useScraping } to useScraping
import StatsCard from './StatsCard';
import ScrapingStatus from './ScrapingStatus';
import LoadingSpinner from './LoadingSpinner';
import { format } from 'date-fns';

const Dashboard = () => {
  const {
    contentStats,
    contentStatsLoading,
    contentStatsError,
    fetchContentStats,
    refreshData,
    addNotification,
    darkMode,
  } = useAppContext();

  const {
    stats: scrapingAggStats,
    statsLoading: scrapingStatsLoading,
    statsError: scrapingStatsError,
    fetchStats: fetchScrapingStats,
  } = useScraping({ 
    autoFetchStatus: false, 
    autoFetchLogs: false, 
    pollWhileActive: false 
  });

  const [daysForStats, setDaysForStats] = useState(
    parseInt(import.meta.env.VITE_DEFAULT_STAT_DAYS) || 7
  );

  useEffect(() => {
    fetchContentStats();
    fetchScrapingStats(daysForStats);
  }, [fetchContentStats, fetchScrapingStats, daysForStats]);

  const handleRefreshAll = async () => {
    await refreshData();
    await fetchScrapingStats(daysForStats);
    addNotification({ 
      type: 'success', 
      title: 'Dashboard Refreshed', 
      message: 'All dashboard data has been updated.' 
    });
  };

  // Loading State
  if (contentStatsLoading && !contentStats) {
    return (
      <div className="flex flex-col justify-center items-center py-20">
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Loading dashboard data...</p>
      </div>
    );
  }

  // Error State
  if (contentStatsError && !contentStats) {
    return (
      <div className="text-center py-20">
        <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Error Loading Dashboard</h2>
        <p className="text-lg text-red-600 dark:text-red-400 mb-4">{contentStatsError}</p>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Please check your backend connection and try again.</p>
        <button
          onClick={handleRefreshAll}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Prepare data for content type chart
  const contentTypeData = contentStats?.byType 
    ? Object.keys(contentStats.byType).map(type => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        count: contentStats.byType[type].count,
      })) 
    : [];

  // Prepare data for daily scraping activity chart
  const dailyScrapingData = scrapingAggStats?.daily?.map(day => ({
    date: format(new Date(day._id), 'MMM dd'),
    runs: day.runs,
    inserted: day.itemsInserted,
    errors: day.errors,
  })) || [];

  // Chart colors based on theme
  const chartColors = {
    primary: '#3b82f6',
    success: '#22c55e',
    purple: '#8b5cf6',
    danger: '#ef4444',
    text: darkMode ? '#d1d5db' : '#4b5563',
    grid: darkMode ? '#374151' : '#e5e7eb',
    background: darkMode ? '#1f2937' : '#ffffff',
  };

  return (
    <div className="space-y-8">
      {/* Header with Refresh Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Overview of your webMethods content aggregation</p>
        </div>
        <button
          onClick={handleRefreshAll}
          disabled={contentStatsLoading || scrapingStatsLoading}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors font-medium"
        >
          <RefreshCcw size={18} className={`mr-2 ${(contentStatsLoading || scrapingStatsLoading) ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={<Layers />}
          label="Total Content"
          value={contentStats?.total?.toLocaleString() || '0'}
          colorClass="text-primary-600"
          bgColorClass="bg-primary-100 dark:bg-primary-900/30"
        />
        <StatsCard
          icon={<Newspaper />}
          label="Content Today"
          value={contentStats?.today?.toLocaleString() || '0'}
          colorClass="text-secondary-600"
          bgColorClass="bg-secondary-100 dark:bg-secondary-900/30"
        />
        <StatsCard
          icon={<TrendingUp />}
          label={`Scrapes (${daysForStats}d)`}
          value={scrapingAggStats?.overall?.totalRuns?.toLocaleString() || '0'}
          colorClass="text-indigo-600"
          bgColorClass="bg-indigo-100 dark:bg-indigo-900/30"
        />
        <StatsCard
          icon={<AlertTriangle />}
          label={`Errors (${daysForStats}d)`}
          value={scrapingAggStats?.overall?.totalErrors?.toLocaleString() || '0'}
          colorClass="text-red-600"
          bgColorClass="bg-red-100 dark:bg-red-900/30"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Content Type Distribution Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-soft transition-colors duration-300">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <List size={24} className="mr-2 text-primary-600" /> Content by Type
          </h3>
          {contentTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={contentTypeData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis 
                  dataKey="name" 
                  stroke={chartColors.text} 
                  tick={{ fill: chartColors.text, fontSize: 12 }}
                />
                <YAxis 
                  allowDecimals={false} 
                  stroke={chartColors.text}
                  tick={{ fill: chartColors.text, fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                  contentStyle={{ 
                    backgroundColor: chartColors.background, 
                    border: `1px solid ${chartColors.grid}`,
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                  itemStyle={{ color: chartColors.text }}
                  labelStyle={{ color: chartColors.text, fontWeight: 'bold' }}
                />
                <Legend />
                <Bar 
                  dataKey="count" 
                  fill={chartColors.primary} 
                  name="Total Content" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <List size={48} className="mb-4 opacity-50" />
              <p>No content data available yet.</p>
              <p className="text-sm mt-2">Start scraping to see content distribution.</p>
            </div>
          )}
        </div>

        {/* Content by Source Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-soft transition-colors duration-300">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Briefcase size={24} className="mr-2 text-secondary-600" /> Top Sources
          </h3>
          {contentStats?.bySource && contentStats.bySource.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={contentStats.bySource.slice(0, 8)}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis 
                  type="number" 
                  stroke={chartColors.text}
                  tick={{ fill: chartColors.text, fontSize: 12 }}
                  allowDecimals={false}
                />
                <YAxis 
                  type="category" 
                  dataKey="source" 
                  stroke={chartColors.text}
                  tick={{ fill: chartColors.text, fontSize: 11 }}
                  width={90}
                />
                <Tooltip
                  cursor={{ fill: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                  contentStyle={{ 
                    backgroundColor: chartColors.background, 
                    border: `1px solid ${chartColors.grid}`,
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                  itemStyle={{ color: chartColors.text }}
                  labelStyle={{ color: chartColors.text, fontWeight: 'bold' }}
                />
                <Bar 
                  dataKey="count" 
                  fill={chartColors.success} 
                  name="Content Count"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <Briefcase size={48} className="mb-4 opacity-50" />
              <p>No source data available yet.</p>
              <p className="text-sm mt-2">Start scraping to see content sources.</p>
            </div>
          )}
        </div>
      </div>

      {/* Daily Scraping Activity Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-soft transition-colors duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <BarChart2 size={24} className="mr-2 text-purple-600" /> Scraping Activity
          </h3>
          <div className="flex items-center gap-2">
            <label htmlFor="daysSelect" className="text-sm text-gray-600 dark:text-gray-400">
              Period:
            </label>
            <select
              id="daysSelect"
              value={daysForStats}
              onChange={(e) => setDaysForStats(parseInt(e.target.value))}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm text-gray-900 dark:text-gray-100"
            >
              <option value={7}>Last 7 Days</option>
              <option value={14}>Last 14 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 90 Days</option>
            </select>
          </div>
        </div>
        
        {scrapingStatsLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : scrapingStatsError ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-500">
            <AlertTriangle size={48} className="mb-4" />
            <p>Error loading scraping statistics</p>
            <button
              onClick={() => fetchScrapingStats(daysForStats)}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        ) : dailyScrapingData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={dailyScrapingData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis 
                dataKey="date" 
                stroke={chartColors.text}
                tick={{ fill: chartColors.text, fontSize: 12 }}
              />
              <YAxis 
                yAxisId="left" 
                allowDecimals={false} 
                stroke={chartColors.text}
                tick={{ fill: chartColors.text, fontSize: 12 }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                allowDecimals={false} 
                stroke={chartColors.text}
                tick={{ fill: chartColors.text, fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                contentStyle={{ 
                  backgroundColor: chartColors.background, 
                  border: `1px solid ${chartColors.grid}`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
                itemStyle={{ color: chartColors.text }}
                labelStyle={{ color: chartColors.text, fontWeight: 'bold' }}
              />
              <Legend />
              <Bar 
                yAxisId="left" 
                dataKey="inserted" 
                fill={chartColors.success} 
                name="Items Inserted"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                yAxisId="right" 
                dataKey="runs" 
                fill={chartColors.purple} 
                name="Scrapes Run"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                yAxisId="left" 
                dataKey="errors" 
                fill={chartColors.danger} 
                name="Errors"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <BarChart2 size={48} className="mb-4 opacity-50" />
            <p>No scraping activity data for the selected period.</p>
            <p className="text-sm mt-2">Run some scrapers to see activity data here.</p>
          </div>
        )}
      </div>

      {/* Scraping Statistics Summary */}
      {scrapingAggStats?.overall && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-soft transition-colors duration-300">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Scraping Summary (Last {daysForStats} Days)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-primary-600">
                {scrapingAggStats.overall.totalRuns?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Runs</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-green-600">
                {scrapingAggStats.overall.totalItemsInserted?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Items Inserted</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-blue-600">
                {scrapingAggStats.overall.totalItemsFound?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Items Found</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-purple-600">
                {scrapingAggStats.overall.successRate?.toFixed(1) || 0}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Success Rate</p>
            </div>
          </div>
        </div>
      )}

      {/* Live Scraping Status */}
      <ScrapingStatus />
    </div>
  );
};

export default Dashboard;