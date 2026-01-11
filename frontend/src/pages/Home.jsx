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
    <div className="home-page min-h-screen relative">
      {/* Enhanced Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        {/* Primary Gradient Mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-gray-900 dark:to-indigo-950/50" />
        
        {/* Floating Orbs with Enhanced Glow */}
        <div 
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-60 dark:opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.08) 40%, transparent 70%)',
            filter: 'blur(40px)',
            animation: 'float 20s ease-in-out infinite',
          }}
        />
        <div 
          className="absolute top-1/3 -left-48 w-[600px] h-[600px] rounded-full opacity-50 dark:opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.12) 0%, rgba(59, 130, 246, 0.06) 50%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'float 25s ease-in-out infinite reverse',
          }}
        />
        <div 
          className="absolute -bottom-24 right-1/4 w-[450px] h-[450px] rounded-full opacity-40 dark:opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, rgba(168, 85, 247, 0.05) 50%, transparent 70%)',
            filter: 'blur(50px)',
            animation: 'float 22s ease-in-out infinite',
            animationDelay: '-5s',
          }}
        />
        
        {/* Refined Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />

        {/* Noise Texture Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Welcome Hero Section */}
      {showWelcome && (
        <div className="relative mb-10 overflow-hidden">
          {/* Hero Card with Glass Effect */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/10 dark:shadow-indigo-500/5">
            {/* Multi-layer Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 dark:from-indigo-700 dark:via-violet-800 dark:to-purple-900" />
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/40 via-transparent to-fuchsia-600/30" />
            
            {/* Mesh Gradient Overlay */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `
                  radial-gradient(at 20% 30%, rgba(99, 102, 241, 0.4) 0px, transparent 50%),
                  radial-gradient(at 80% 20%, rgba(236, 72, 153, 0.3) 0px, transparent 50%),
                  radial-gradient(at 40% 80%, rgba(34, 211, 238, 0.3) 0px, transparent 50%)
                `,
              }}
            />

            {/* Animated Particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white/40 rounded-full"
                  style={{
                    left: `${15 + i * 15}%`,
                    top: `${20 + (i % 3) * 25}%`,
                    animation: `pulse 3s ease-in-out infinite`,
                    animationDelay: `${i * 0.5}s`,
                  }}
                />
              ))}
            </div>

            {/* Glassmorphism Accent Lines */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Content */}
            <div className="relative px-8 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                {/* Left Side - Welcome Message */}
                <div className="flex-1 space-y-5">
                  <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                    <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                    <span className="text-white/90 text-sm font-medium tracking-wide">
                      webMethods Content Hub
                    </span>
                  </div>
                  
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                    {getGreeting()}!
                    <span className="inline-block ml-3 animate-[wave_2.5s_ease-in-out_infinite]">👋</span>
                  </h1>
                  
                  <p className="text-lg sm:text-xl text-white/80 max-w-2xl leading-relaxed font-light">
                    Your intelligent content aggregation dashboard for webMethods. 
                    Discover news, jobs, and articles from across the internet.
                  </p>

                  <div className="flex flex-wrap items-center gap-6 pt-2">
                    <div className="flex items-center gap-2.5 text-white/70">
                      <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">{formatDate()}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                        <Activity className="w-4 h-4 text-white/70" />
                      </div>
                      <span className="text-sm font-medium">
                        {isScrapingActive ? (
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            <span className="text-emerald-300">Scraping Active</span>
                          </span>
                        ) : (
                          <span className="text-white/70">System Idle</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side - Quick Stats & Actions */}
                <div className="flex flex-col gap-5">
                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard 
                      value={contentStats?.total?.toLocaleString() || '0'} 
                      label="Total Content" 
                    />
                    <StatCard 
                      value={contentStats?.today?.toLocaleString() || '0'} 
                      label="Added Today" 
                      highlight 
                    />
                    <StatCard 
                      value={availableScrapers?.length || 0} 
                      label="Scrapers" 
                    />
                    <StatCard 
                      value={Object.keys(contentStats?.byType || {}).length || 0} 
                      label="Content Types" 
                    />
                  </div>

                  {/* Quick Action Button */}
                  <button
                    onClick={handleQuickScrape}
                    disabled={isStarting || isScrapingActive}
                    className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-white text-indigo-700 font-semibold rounded-2xl shadow-xl shadow-black/10 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-xl"
                  >
                    {/* Button Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-100 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-700 -skew-x-12" />
                    
                    <span className="relative flex items-center gap-3">
                      {isStarting ? (
                        <>
                          <LoadingSpinner size="sm" color="text-indigo-600" />
                          <span>Starting...</span>
                        </>
                      ) : isScrapingActive ? (
                        <>
                          <RefreshCcw className="w-5 h-5 animate-spin" />
                          <span>Scraping...</span>
                        </>
                      ) : (
                        <>
                          <div className="p-1.5 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                            <Play className="w-4 h-4" />
                          </div>
                          <span>Quick Scrape</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Curved Edge */}
            <div className="absolute -bottom-1 left-0 right-0">
              <svg viewBox="0 0 1440 60" className="w-full h-10 sm:h-14" preserveAspectRatio="none">
                <path 
                  fill={darkMode ? '#0f172a' : '#f8fafc'} 
                  d="M0,0 C480,60 960,60 1440,0 L1440,60 L0,60 Z"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
        <QuickNavCard
          to="/news"
          icon={<Globe className="w-6 h-6" />}
          title="News"
          description="Latest webMethods news"
          count={contentStats?.byType?.news?.count || 0}
          gradient="from-blue-500 via-blue-600 to-cyan-600"
          glowColor="blue"
        />
        <QuickNavCard
          to="/jobs"
          icon={<Zap className="w-6 h-6" />}
          title="Jobs"
          description="Job opportunities"
          count={contentStats?.byType?.job?.count || 0}
          gradient="from-emerald-500 via-green-600 to-teal-600"
          glowColor="emerald"
        />
        <QuickNavCard
          to="/articles"
          icon={<TrendingUp className="w-6 h-6" />}
          title="Articles"
          description="Blogs & tutorials"
          count={(contentStats?.byType?.blog?.count || 0) + (contentStats?.byType?.article?.count || 0)}
          gradient="from-violet-500 via-purple-600 to-fuchsia-600"
          glowColor="violet"
        />
        <QuickNavCard
          to="/settings"
          icon={<Database className="w-6 h-6" />}
          title="Settings"
          description="Manage scrapers"
          count={null}
          gradient="from-orange-500 via-amber-600 to-yellow-600"
          glowColor="orange"
        />
      </div>

      {/* Main Dashboard */}
      <div className="relative">
        {/* Section Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <div className="h-10 w-1.5 bg-gradient-to-b from-indigo-500 via-violet-500 to-purple-500 rounded-full" />
            <div className="absolute inset-0 h-10 w-1.5 bg-gradient-to-b from-indigo-500 via-violet-500 to-purple-500 rounded-full blur-sm opacity-60" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Analytics Dashboard
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Real-time insights and performance metrics
            </p>
          </div>
        </div>

        {/* Dashboard Component */}
        <div className="relative">
          <Dashboard />
        </div>
      </div>

      {/* Footer Decoration */}
      <div className="mt-16 mb-8 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg shadow-slate-200/20 dark:shadow-slate-900/20">
          <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Powered by webMethods Scraper Engine
          </span>
        </div>
      </div>

      {/* Custom Keyframes */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-25px) translateX(5px); }
        }
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-15deg); }
        }
      `}</style>
    </div>
  );
};

// ===========================================
// Stat Card Component
// ===========================================

const StatCard = ({ value, label, highlight = false }) => (
  <div className={`
    relative overflow-hidden rounded-2xl px-5 py-4 text-center backdrop-blur-md border transition-all duration-300 hover:scale-[1.02]
    ${highlight 
      ? 'bg-white/20 border-white/30 shadow-lg shadow-white/10' 
      : 'bg-white/10 border-white/20 hover:bg-white/15'
    }
  `}>
    {highlight && (
      <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-amber-400/30 to-transparent rounded-bl-3xl" />
    )}
    <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
      {value}
    </p>
    <p className="text-xs text-white/70 mt-1.5 font-medium uppercase tracking-wider">
      {label}
    </p>
  </div>
);

// ===========================================
// Quick Navigation Card Component
// ===========================================

const QuickNavCard = ({ to, icon, title, description, count, gradient, glowColor }) => {
  const { darkMode } = useAppContext();
  
  const glowColors = {
    blue: 'group-hover:shadow-blue-500/25',
    emerald: 'group-hover:shadow-emerald-500/25',
    violet: 'group-hover:shadow-violet-500/25',
    orange: 'group-hover:shadow-orange-500/25',
  };
  
  return (
    <a
      href={to}
      className={`
        group relative overflow-hidden rounded-2xl p-6 transition-all duration-500 
        hover:scale-[1.03] hover:-translate-y-1 active:scale-[0.98]
        shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50
        hover:shadow-2xl ${glowColors[glowColor]}
      `}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-95 group-hover:opacity-100 transition-all duration-500`} />
      
      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Decorative Elements */}
      <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full transition-transform duration-500 group-hover:scale-125" />
      <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-white/5 rounded-full transition-transform duration-700 group-hover:scale-125" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      {/* Content */}
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm border border-white/20 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
            <div className="text-white">{icon}</div>
          </div>
          {count !== null && (
            <div className="text-right">
              <span className="text-3xl font-bold text-white tracking-tight">
                {count.toLocaleString()}
              </span>
            </div>
          )}
        </div>
        
        <h3 className="text-xl font-bold text-white mb-1.5 tracking-tight">{title}</h3>
        <p className="text-sm text-white/75 font-medium">{description}</p>
        
        {/* Arrow Link */}
        <div className="mt-5 flex items-center text-white/80 text-sm font-semibold group-hover:text-white transition-colors">
          <span>View all</span>
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
        </div>
      </div>
    </a>
  );
};

export default Home;