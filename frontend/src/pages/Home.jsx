/**
 * Home.jsx
 *
 * This is the main Home page with a premium design that renders the Dashboard component.
 */

import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  Zap, 
  TrendingUp, 
  Globe, 
  Play, 
  Clock,
  ArrowRight,
  Activity,
  Database,
  RefreshCcw
} from 'lucide-react';
import Dashboard from '../components/Dashboard';
import { useAppContext } from '../context/AppContext';
import useScraping from '../hooks/useScraping';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const { 
    contentStats, 
    darkMode,
    addNotification 
  } = useAppContext();
  
  const { 
    status, 
    startScraping, 
    isStarting,
    availableScrapers 
  } = useScraping({ 
    autoFetchStatus: true, 
    pollWhileActive: true 
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showWelcome, setShowWelcome] = useState(true);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Format date
  const formatDate = () => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle quick scrape
  const handleQuickScrape = async () => {
    try {
      await startScraping();
      addNotification({
        type: 'success',
        title: 'Scraping Started',
        message: 'All scrapers have been initiated successfully.'
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  const isScrapingActive = status?.isRunning;

  return (
    <div className="home-page min-h-screen">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        {/* Gradient Orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 dark:bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-secondary-500/20 dark:bg-secondary-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Welcome Hero Section */}
      {showWelcome && (
        <div className="relative mb-8 overflow-hidden">
          {/* Hero Card */}
          <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 dark:from-primary-700 dark:via-primary-800 dark:to-indigo-900 rounded-2xl shadow-2xl overflow-hidden">
            {/* Decorative Pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="hero-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="10" cy="10" r="1.5" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hero-pattern)" />
              </svg>
            </div>

            {/* Animated Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

            {/* Content */}
            <div className="relative px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* Left Side - Welcome Message */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                    <span className="text-primary-200 text-sm font-medium uppercase tracking-wider">
                      webMethods Content Hub
                    </span>
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
                    {getGreeting()}! 👋
                  </h1>
                  
                  <p className="text-primary-100 text-lg max-w-2xl mb-4">
                    Your intelligent content aggregation dashboard for webMethods. 
                    Discover news, jobs, and articles from across the internet.
                  </p>

                  <div className="flex items-center gap-4 text-primary-200 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Activity className="w-4 h-4" />
                      <span>
                        {isScrapingActive ? (
                          <span className="text-green-400 font-medium">Scraping Active</span>
                        ) : (
                          'System Idle'
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side - Quick Stats & Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
                      <p className="text-2xl sm:text-3xl font-bold text-white">
                        {contentStats?.total?.toLocaleString() || '0'}
                      </p>
                      <p className="text-xs text-primary-200 mt-1">Total Content</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
                      <p className="text-2xl sm:text-3xl font-bold text-white">
                        {contentStats?.today?.toLocaleString() || '0'}
                      </p>
                      <p className="text-xs text-primary-200 mt-1">Added Today</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
                      <p className="text-2xl sm:text-3xl font-bold text-white">
                        {availableScrapers?.length || 0}
                      </p>
                      <p className="text-xs text-primary-200 mt-1">Scrapers</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
                      <p className="text-2xl sm:text-3xl font-bold text-white">
                        {Object.keys(contentStats?.byType || {}).length || 0}
                      </p>
                      <p className="text-xs text-primary-200 mt-1">Content Types</p>
                    </div>
                  </div>

                  {/* Quick Action Button */}
                  <button
                    onClick={handleQuickScrape}
                    disabled={isStarting || isScrapingActive}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl shadow-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    {isStarting ? (
                      <>
                        <LoadingSpinner size="sm" color="text-primary-600" />
                        <span>Starting...</span>
                      </>
                    ) : isScrapingActive ? (
                      <>
                        <RefreshCcw className="w-5 h-5 animate-spin" />
                        <span>Scraping...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        <span>Quick Scrape</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Wave */}
            <div className="absolute bottom-0 left-0 right-0">
              <svg viewBox="0 0 1440 120" className="w-full h-8 sm:h-12">
                <path 
                  fill={darkMode ? '#111827' : '#f9fafb'} 
                  d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <QuickNavCard
          to="/news"
          icon={<Globe className="w-6 h-6" />}
          title="News"
          description="Latest webMethods news"
          count={contentStats?.byType?.news?.count || 0}
          color="from-blue-500 to-blue-600"
          darkColor="from-blue-600 to-blue-700"
        />
        <QuickNavCard
          to="/jobs"
          icon={<Zap className="w-6 h-6" />}
          title="Jobs"
          description="Job opportunities"
          count={contentStats?.byType?.job?.count || 0}
          color="from-green-500 to-green-600"
          darkColor="from-green-600 to-green-700"
        />
        <QuickNavCard
          to="/articles"
          icon={<TrendingUp className="w-6 h-6" />}
          title="Articles"
          description="Blogs & tutorials"
          count={(contentStats?.byType?.blog?.count || 0) + (contentStats?.byType?.article?.count || 0)}
          color="from-purple-500 to-purple-600"
          darkColor="from-purple-600 to-purple-700"
        />
        <QuickNavCard
          to="/settings"
          icon={<Database className="w-6 h-6" />}
          title="Settings"
          description="Manage scrapers"
          count={null}
          color="from-orange-500 to-orange-600"
          darkColor="from-orange-600 to-orange-700"
        />
      </div>

      {/* Main Dashboard */}
      <div className="relative">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-gradient-to-b from-primary-500 to-secondary-500 rounded-full" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Analytics Dashboard
          </h2>
        </div>

        {/* Dashboard Component */}
        <Dashboard />
      </div>

      {/* Footer Decoration */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-400">
          <Sparkles className="w-4 h-4 text-primary-500" />
          <span>Powered by webMethods Scraper Engine</span>
        </div>
      </div>
    </div>
  );
};

// ===========================================
// Quick Navigation Card Component
// ===========================================

const QuickNavCard = ({ to, icon, title, description, count, color, darkColor }) => {
  const { darkMode } = useAppContext();
  
  return (
    <a
      href={to}
      className="group relative overflow-hidden rounded-xl p-5 transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${darkMode ? darkColor : color} opacity-90 group-hover:opacity-100 transition-opacity`} />
      
      {/* Decorative Circle */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full" />

      {/* Content */}
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <div className="text-white">{icon}</div>
          </div>
          {count !== null && (
            <span className="text-2xl font-bold text-white">
              {count.toLocaleString()}
            </span>
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-white/80">{description}</p>
        
        {/* Arrow */}
        <div className="mt-3 flex items-center text-white/80 text-sm font-medium group-hover:text-white transition-colors">
          <span>View all</span>
          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </a>
  );
};

export default Home;