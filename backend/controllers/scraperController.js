/**
 * Scraper Controller
 *
 * Handles API requests related to managing and monitoring scraping operations.
 */

const path = require('path');
const fs = require('fs');

const { asyncHandler, APIError } = require('../middleware/errorHandler');
const scraperManager = require('../scrapers/scraperManager');
const ScrapingLog = require('../models/ScrapingLog');
const logger = require('../utils/logger');

// ===========================================
// Scraper Operations
// ===========================================

/**
 * @desc    Start all registered scrapers
 * @route   POST /api/scraper/start
 * @access  Public (recommend protecting in production)
 */
exports.startAllScrapers = asyncHandler(async (req, res) => {
  const { triggeredBy = 'api_manual' } = req.body || {};

  const status = scraperManager.getScrapingStatus();
  if (status.isRunning) {
    throw new APIError('Scraping already in progress.', 409, 'SCRAPING_ALREADY_RUNNING');
  }

  // Fire-and-forget background run
  scraperManager.runAllScrapers(triggeredBy).catch((error) => {
    logger.error('Error during background scraping execution:', error);
  });

  return res.status(202).json({
    success: true,
    message: 'All scrapers initiated. Check status for progress.',
    data: scraperManager.getScrapingStatus(),
  });
});

/**
 * @desc    Start a specific scraper by type
 * @route   POST /api/scraper/start/:type
 * @access  Public (recommend protecting in production)
 */
exports.startSpecificScraper = asyncHandler(async (req, res) => {
  const scraperType = String(req.params.type || '').toLowerCase();
  const { triggeredBy = 'api_manual' } = req.body || {};

  const available = scraperManager.getAvailableScrapers();
  if (!available.includes(scraperType)) {
    throw new APIError(
      `Scraper type '${scraperType}' not found. Available types: ${available.join(', ')}`,
      404,
      'SCRAPER_NOT_FOUND'
    );
  }

  // Keep it simple & safe: if anything is running, block starting another.
  // (You can relax this later if you want per-scraper concurrency.)
  const status = scraperManager.getScrapingStatus();
  if (status.isRunning) {
    throw new APIError('Scraping already in progress.', 409, 'SCRAPING_ALREADY_RUNNING');
  }

  scraperManager.runSpecificScraper(scraperType, triggeredBy).catch((error) => {
    logger.error(`Error during background scraping execution for ${scraperType}:`, error);
  });

  return res.status(202).json({
    success: true,
    message: `Scraper '${scraperType}' initiated. Check status for progress.`,
    data: scraperManager.getScrapingStatus(),
  });
});

/**
 * @desc    Stop all running scrapers
 * @route   POST /api/scraper/stop
 * @access  Public
 */
exports.stopAllScrapers = asyncHandler(async (req, res) => {
  await scraperManager.stopAllScrapers();
  return res.status(200).json({
    success: true,
    message: 'Attempted to stop all active scrapers.',
    data: scraperManager.getScrapingStatus(),
  });
});

// ===========================================
// Scraper Status and Logs
// ===========================================

/**
 * @desc    Get current status of scraping operations
 * @route   GET /api/scraper/status
 * @access  Public
 */
exports.getScrapingStatus = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    data: scraperManager.getScrapingStatus(),
  });
});

/**
 * @desc    Get a list of all available scraper types
 * @route   GET /api/scraper/types
 * @access  Public
 */
exports.getAvailableScrapers = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    data: scraperManager.getAvailableScrapers(),
  });
});

/**
 * @desc    Get scraping logs from database
 * @route   GET /api/scraper/logs
 * @access  Public
 */
exports.getScrapingLogs = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    scraperName,
    source,
    status,
    startDate,
    endDate,
  } = req.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    scraperName,
    source,
    status,
    startDate,
    endDate,
  };

  const { logs, pagination } = await ScrapingLog.getRecent(options);

  return res.status(200).json({
    success: true,
    data: logs,
    pagination,
  });
});

/**
 * @desc    Get a specific scraping log by ID
 * @route   GET /api/scraper/logs/:id
 * @access  Public
 */
exports.getScrapingLogById = asyncHandler(async (req, res) => {
  const log = await ScrapingLog.findById(req.params.id);
  if (!log) {
    throw new APIError('Scraping log not found', 404, 'LOG_NOT_FOUND');
  }

  return res.status(200).json({
    success: true,
    data: log,
  });
});

/**
 * @desc    Get aggregated scraping statistics
 * @route   GET /api/scraper/stats
 * @access  Public
 */
exports.getScrapingStats = asyncHandler(async (req, res) => {
  const { days = 7 } = req.query;
  const stats = await ScrapingLog.getStatistics(parseInt(days, 10));

  return res.status(200).json({
    success: true,
    data: stats,
  });
});

/**
 * @desc    Get raw log file content
 * @route   GET /api/scraper/file-logs/:filename
 * @access  Public (recommend admin-only in production)
 */
exports.getFileLogs = asyncHandler(async (req, res) => {
  const filename = req.params.filename;
  const logDir = path.join(__dirname, '..', 'logs');
  const filePath = path.join(logDir, filename);

  // Basic filename validation to prevent traversal
  if (!filename.match(/^[a-zA-Z0-9_\-.]+\.log$/) || !fs.existsSync(filePath)) {
    throw new APIError('Log file not found or invalid filename.', 404, 'INVALID_LOG_FILENAME');
  }

  const maxLines = parseInt(req.query.maxLines || '500', 10);

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').slice(-maxLines).join('\n');

    return res.status(200).json({
      success: true,
      filename,
      content: lines,
      fullContentLength: content.length,
      linesRead: lines.split('\n').length,
    });
  } catch (error) {
    logger.error(`Error reading log file ${filename}:`, error);
    throw new APIError(`Could not read log file: ${error.message}`, 500, 'LOG_FILE_READ_ERROR');
  }
});