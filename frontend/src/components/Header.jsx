// ... (rest of the imports)
import {
  Moon,
  Sun,
  Bell,
  X,
  Info,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Menu,
  Home,
  Newspaper,
  Briefcase,
  FileText,
  Settings,
  RefreshCcw,
  Sparkles,
  ChevronRight,
  Zap,
  Activity,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import LoadingSpinner from './LoadingSpinner';

const Header = () => {
  const {
    darkMode,
    toggleDarkMode,
    notifications,
    removeNotification,
    clearNotifications,
    scrapingStatus,
    scrapingStatusLoading,
    fetchScrapingStatus,
  } = useAppContext();

  const location = useLocation();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const notificationsRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        mobileMenuButtonRef.current &&
        !mobileMenuButtonRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Navigation items
  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home, end: true },
    { path: '/news', label: 'News', icon: Newspaper },
    { path: '/jobs', label: 'Jobs', icon: Briefcase },
    { path: '/articles', label: 'Articles', icon: FileText },
  ];

  // Add settings if enabled
  if (import.meta.env.VITE_FEATURE_SETTINGS_PAGE === 'true') {
    navItems.push({ path: '/settings', label: 'Settings', icon: Settings });
  }

  const getNotificationIcon = (type) => {
    const iconProps = { size: 18 };
    switch (type) {
      case 'info':
        return <Info {...iconProps} className="text-blue-500" />;
      case 'success':
        return <CheckCircle {...iconProps} className="text-green-500" />;
      case 'warning':
        return <AlertTriangle {...iconProps} className="text-yellow-500" />;
      case 'error':
        return <AlertCircle {...iconProps} className="text-red-500" />;
      default:
        return <Info {...iconProps} className="text-gray-400" />;
    }
  };

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-l-blue-500';
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-l-green-500';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-l-yellow-500';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-l-red-500';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-l-gray-500';
    }
  };

  const isScrapingRunning = scrapingStatus?.isRunning;
  const enableDarkModeToggle = import.meta.env.VITE_FEATURE_DARK_MODE_TOGGLE === 'true';
  const unreadCount = notifications.length;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50'
            : 'bg-white/60 dark:bg-gray-900/60 backdrop-blur-md'
        }`}
      >
        {/* Top Accent Bar */}
        <div className="h-0.5 bg-gradient-to-r from-primary-500 via-purple-500 to-secondary-500" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <Link
              to="/"
              className="flex items-center gap-3 group"
            >
              {/* Animated Logo Container */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                  <Zap className="w-5 h-5 text-white" />
                </div>
              </div>
              
              {/* Logo Text */}
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  webMethods
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5 font-medium">
                  Content Scraper
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center">
              <div className="flex items-center bg-gray-100/80 dark:bg-gray-800/80 rounded-full p-1.5 backdrop-blur-sm">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        isActive
                          ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-md'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50'
                      }`
                    }
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Scraping Status Indicator */}
              <div className="hidden sm:flex items-center">
                {scrapingStatusLoading ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <LoadingSpinner size="sm" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Loading...</span>
                  </div>
                ) : (
                  <button
                    onClick={fetchScrapingStatus}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 group ${
                      isScrapingRunning
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Activity 
                      size={14} 
                      className={isScrapingRunning ? 'animate-pulse' : ''} 
                    />
                    <span className="text-xs font-medium">
                      {isScrapingRunning ? 'Scraping...' : 'Idle'}
                    </span>
                    <RefreshCcw 
                      size={12} 
                      className={`transition-transform duration-300 ${
                        scrapingStatusLoading ? 'animate-spin' : 'group-hover:rotate-180'
                      }`} 
                    />
                  </button>
                )}
              </div>

              {/* Notifications */}
              <div ref={notificationsRef} className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`relative p-2.5 rounded-xl transition-all duration-300 ${
                    isNotificationsOpen
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden animate-fade-in">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <Sparkles size={18} className="text-primary-500" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Notifications
                        </h3>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={clearNotifications}
                          className="text-xs font-medium text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                          <Bell size={32} className="mb-2 opacity-30" />
                          <p className="text-sm">No notifications</p>
                          <p className="text-xs mt-1">You're all caught up!</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                          {notifications.map((notification, index) => (
                            <div
                              key={notification.id}
                              className={`flex items-start gap-3 p-4 border-l-4 transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-750 ${getNotificationStyles(notification.type)}`}
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <div className="flex-shrink-0 mt-0.5">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                                  {notification.message}
                                </p>
                              </div>
                              <button
                                onClick={() => removeNotification(notification.id)}
                                className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
                        <Link
                          to="/settings"
                          className="flex items-center justify-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                        >
                          View all activity
                          <ChevronRight size={14} />
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Dark Mode Toggle */}
              {enableDarkModeToggle && (
                <button
                  onClick={toggleDarkMode}
                  className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 overflow-hidden"
                  aria-label="Toggle dark mode"
                >
                  <div className="relative w-5 h-5">
                    <Sun
                      size={20}
                      className={`absolute inset-0 transform transition-all duration-500 ${
                        darkMode
                          ? 'rotate-0 scale-100 opacity-100'
                          : 'rotate-90 scale-0 opacity-0'
                      }`}
                    />
                    <Moon
                      size={20}
                      className={`absolute inset-0 transform transition-all duration-500 ${
                        darkMode
                          ? '-rotate-90 scale-0 opacity-0'
                          : 'rotate-0 scale-100 opacity-100'
                      }`}
                    />
                  </div>
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                ref={mobileMenuButtonRef}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
                aria-label="Toggle menu"
              >
                <div className="relative w-5 h-5">
                  <span
                    className={`absolute left-0 top-1 w-5 h-0.5 bg-current transform transition-all duration-300 ${
                      isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                    }`}
                  />
                  <span
                    className={`absolute left-0 top-2.5 w-5 h-0.5 bg-current transition-all duration-300 ${
                      isMobileMenuOpen ? 'opacity-0 scale-0' : ''
                    }`}
                  />
                  <span
                    className={`absolute left-0 top-4 w-5 h-0.5 bg-current transform transition-all duration-300 ${
                      isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Menu Drawer */}
      <div
        ref={mobileMenuRef}
        className={`fixed top-0 right-0 bottom-0 w-72 bg-white dark:bg-gray-900 shadow-2xl z-50 lg:hidden transform transition-transform duration-300 ease-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">Menu</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mobile Scraping Status */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className={`flex items-center justify-between p-3 rounded-xl ${
            isScrapingRunning
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
              : 'bg-gray-50 dark:bg-gray-800'
          }`}>
            <div className="flex items-center gap-2">
              <Activity 
                size={16} 
                className={isScrapingRunning ? 'text-green-500 animate-pulse' : 'text-gray-400'} 
              />
              <span className={`text-sm font-medium ${
                isScrapingRunning ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
              }`}>
                {isScrapingRunning ? 'Scraping Active' : 'System Idle'}
              </span>
            </div>
            <button
              onClick={fetchScrapingStatus}
              disabled={scrapingStatusLoading}
              className="p-1.5 rounded-lg bg-white dark:bg-gray-700 shadow-sm"
            >
              <RefreshCcw size={14} className={scrapingStatusLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-lg shadow-primary-500/30'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              <ChevronRight size={16} className="ml-auto opacity-50" />
            </NavLink>
          ))}
        </nav>

        {/* Mobile Menu Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              © 2024 webMethods Scraper
            </span>
            {enableDarkModeToggle && (
              <button
                onClick={toggleDarkMode}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-700 shadow-sm text-xs font-medium text-gray-600 dark:text-gray-300"
              >
                {darkMode ? <Sun size={14} /> : <Moon size={14} />}
                {darkMode ? 'Light' : 'Dark'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-[66px]" />
    </>
  );
};

export default Header;