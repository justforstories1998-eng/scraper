/**
 * main.jsx
 *
 * This is the entry point for the React application.
 * It renders the main App component into the DOM.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css'; // Global Tailwind CSS styles and custom base styles
import { AppProvider } from './context/AppContext.jsx'; // Context Provider for global state

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* AppProvider wraps the entire application to make global state available */}
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>,
);