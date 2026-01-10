/**
 * App.jsx
 *
 * Main application component that sets up routing and the overall layout.
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import layout components
import Header from './components/Header';
import Footer from './components/Footer';

// Import page components
import Home from './pages/Home';
import News from './pages/News';
import Jobs from './pages/Jobs';
import Articles from './pages/Articles';
import Settings from './pages/Settings';

// Import global context
import { useAppContext } from './context/AppContext';

/**
 * Main App Component
 */
function App() {
  const { darkMode } = useAppContext();

  return (
    <Router>
      {/* Apply dark mode class to the outermost container */}
      <div className={`min-h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
        {/* Background wrapper for consistent styling */}
        <div className="flex-grow flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
          {/* Header - Always visible */}
          <Header />

          {/* Main Content Area */}
          <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <Routes>
              {/* Home / Dashboard */}
              <Route path="/" element={<Home />} />

              {/* Content Type Pages */}
              <Route path="/news" element={<News />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/articles" element={<Articles />} />

              {/* Settings Page */}
              <Route path="/settings" element={<Settings />} />

              {/* Catch-all: Redirect to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer - Always visible */}
          <Footer />
        </div>
      </div>
    </Router>
  );
}

export default App;