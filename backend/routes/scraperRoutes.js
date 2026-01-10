/**
 * Scraper Routes
 * 
 * Defines API endpoints for interacting with the web scraping operations.
 */

const express = require('express');
const router = express.Router();
const scraperController = require('../controllers/scraperController');
const { scrapingApiLimiter } = require('../utils/rateLimiter'); // Import the dedicated scraping API limiter

// ===========================================
// Scraper Operations
// ===========================================

/**
 * @route   POST /api/scraper/start
 * @desc    Start all registered scrapers
 * @access  Public (should be restricted in production, e.g., to admin)
 */
router.post('/start', scrapingApiLimiter, scraperController.startAllScrapers);

/**
 * @route   POST /api/scraper/start/:type
 * @desc    Start a specific scraper by type (e.g., 'news', 'job', 'blog')
 * @access  Public (should be restricted in production)
 */
router.post('/start/:type', scrapingApiLimiter, scraperController.startSpecificScraper);

/**
 * @route   POST /api/scraper/stop
 * @desc    Attempt to stop all currently running scrapers
 * @access  Public (should be restricted in production)
 */
router.post('/stop', scrapingApiLimiter, scraperController.stopAllScrapers);

// ===========================================
// Scraper Status and Logs
// ===========================================

/**
 * @route   GET /api/scraper/status
 * @desc    Get the current status of all scraping operations
 * @access  Public
 */
router.get('/status', scraperController.getScrapingStatus);

/**
 * @route   GET /api/scraper/types
 * @desc    Get a list of all available scraper types
 * @access  Public
 */
router.get('/types', scraperController.getAvailableScrapers);

/**
 * @route   GET /api/scraper/logs
 * @desc    Get paginated scraping logs from the database
 * @access  Public (should be restricted in production)
 */
router.get('/logs', scraperController.getScrapingLogs);

/**
 * @route   GET /api/scraper/logs/:id
 * @desc    Get details of a specific scraping log entry by ID
 * @access  Public (should be restricted in production)
 */
router.get('/logs/:id', scraperController.getScrapingLogById);

/**
 * @route   GET /api/scraper/stats
 * @desc    Get aggregated statistics about scraping operations
 * @access  Public
 */
router.get('/stats', scraperController.getScrapingStats);

/**
 * @route   GET /api/scraper/file-logs/:filename
 * @desc    Get content of raw log files (e.g., error.log, combined.log)
 * @access  Public (HIGHLY RECOMMENDED to be restricted to admin in production)
 */
router.get('/file-logs/:filename', scraperController.getFileLogs);


module.exports = router;