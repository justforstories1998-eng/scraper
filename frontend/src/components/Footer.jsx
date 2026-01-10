/**
 * Footer.jsx
 *
 * Application footer component.
 */

import React from 'react';
import { Github, Globe } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-12 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-300">
        <p className="text-sm">
          &copy; {currentYear} webMethods Scraper. All rights reserved.
        </p>
        <p className="text-sm mt-2">
          Made with <span className="text-red-500">❤️</span> for the webMethods Community.
        </p>
        <div className="flex justify-center space-x-4 mt-4">
          <a
            href="https://github.com/your-username/webmethods-scraper" // Replace with your GitHub repo URL
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300"
            title="View on GitHub"
            aria-label="View on GitHub"
          >
            <Github size={20} />
          </a>
          <a
            href="https://www.softwareag.com/en_corporate/products/webmethods.html" // Official webMethods page
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300"
            title="Learn more about webMethods"
            aria-label="Learn more about webMethods"
          >
            <Globe size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;