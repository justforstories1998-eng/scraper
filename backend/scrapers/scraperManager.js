/**
 * Scraper Manager
 * 
 * Orchestrates the execution of all individual scraper instances.
 */

const logger = require('../utils/logger');
const ScrapingLog = require('../models/ScrapingLog');
const { scrapingLimiter, concurrentLimiter } = require('../utils/rateLimiter');

// Lazy load scrapers to avoid circular dependencies
let scraperInstances = null;

const getScraperInstances = () => {
  if (!scraperInstances) {
    try {
      const NewsScraper = require('./newsScraper');
      const JobScraper = require('./jobScraper');
      const BlogScraper = require('./blogScraper');

      scraperInstances = {
        news: new NewsScraper(),
        job: new JobScraper(),
        blog: new BlogScraper(),
      };
    } catch (error) {
      logger.error('Error initializing scrapers:', error);
      scraperInstances = {};
    }
  }
  return scraperInstances;
};

// ===========================================
// Global Scraper State
// ===========================================

const scrapingStatus = {
  isRunning: false,
  activeScrapers: new Map(),
  lastRun: null,
  nextRun: null,
  progress: {},
  overall: {
    totalScraped: 0,
    totalInserted: 0,
    totalErrors: 0
  }
};

// ===========================================
// Scraper Management Functions
// ===========================================

async function runScraper(scraper, triggeredBy) {
  const scraperName = scraper.name;
  logger.info(`Starting individual scraper: ${scraperName}`);

  scrapingStatus.activeScrapers.set(scraperName, { status: 'running', startTime: new Date() });
  scrapingStatus.isRunning = true;

  try {
    const result = await scraper.run(triggeredBy);

    if (result.success) {
      logger.info(`${scraperName} completed successfully.`);
      scrapingStatus.activeScrapers.set(scraperName, { status: 'completed', endTime: new Date() });
      scrapingStatus.overall.totalScraped += result.details?.itemsFound || 0;
      scrapingStatus.overall.totalInserted += result.details?.itemsInserted || 0;
    } else {
      logger.error(`${scraperName} failed: ${result.error}`);
      scrapingStatus.activeScrapers.set(scraperName, { status: 'failed', endTime: new Date(), error: result.error });
      scrapingStatus.overall.totalErrors++;
    }
    return result;

  } catch (error) {
    logger.error(`Unhandled error during ${scraperName} execution: ${error.message}`, error);
    scrapingStatus.activeScrapers.set(scraperName, { status: 'failed', endTime: new Date(), error: error.message });
    scrapingStatus.overall.totalErrors++;
    
    return {
      success: false,
      message: `Scraper ${scraperName} encountered an error`,
      error: error.message
    };

  } finally {
    scrapingStatus.isRunning = Array.from(scrapingStatus.activeScrapers.values()).some(
      s => s.status === 'running'
    );
  }
}

async function runAllScrapers(triggeredBy = 'manual') {
  if (scrapingStatus.isRunning) {
    logger.warn('Scraping already in progress. Skipping new request to run all scrapers.');
    return { success: false, message: 'Scraping already in progress.' };
  }

  logger.info('Initiating all scrapers...');
  scrapingStatus.isRunning = true;
  scrapingStatus.lastRun = new Date();
  scrapingStatus.activeScrapers.clear();
  scrapingStatus.overall = { totalScraped: 0, totalInserted: 0, totalErrors: 0 };
  
  try {
    scrapingLimiter.resetStats();
    concurrentLimiter.reset();
  } catch (error) {
    logger.warn('Error resetting limiters:', error.message);
  }

  const instances = getScraperInstances();
  const scraperPromises = Object.values(instances).map(scraper =>
    runScraper(scraper, triggeredBy).catch(error => ({
      success: false,
      error: error.message
    }))
  );

  const results = await Promise.allSettled(scraperPromises);

  scrapingStatus.isRunning = false;
  scrapingStatus.lastRun = new Date();
  logger.info('All scraper runs completed.');
  logger.info(`Overall Results: Scraped: ${scrapingStatus.overall.totalScraped}, Inserted: ${scrapingStatus.overall.totalInserted}, Errors: ${scrapingStatus.overall.totalErrors}`);

  // Content cleanup
  try {
    const Content = require('../models/Content');
    const contentMaxAgeDays = parseInt(process.env.CONTENT_MAX_AGE_DAYS) || 90;
    const deletedCount = await Content.cleanup(contentMaxAgeDays);
    logger.info(`Content cleanup completed. Deleted ${deletedCount} items older than ${contentMaxAgeDays} days.`);
  } catch (cleanupError) {
    logger.error(`Error during content cleanup: ${cleanupError.message}`);
  }

  return results.map(r => r.status === 'fulfilled' ? r.value : { success: false, message: r.reason?.message || 'Unknown error' });
}

async function runSpecificScraper(scraperType, triggeredBy = 'manual') {
  const instances = getScraperInstances();
  const scraper = instances[scraperType];
  
  if (!scraper) {
    const error = new Error(`Scraper type '${scraperType}' not found. Available: ${Object.keys(instances).join(', ')}`);
    error.statusCode = 404;
    throw error;
  }
  
  return runScraper(scraper, triggeredBy);
}

async function stopAllScrapers() {
  if (!scrapingStatus.isRunning) {
    logger.info('No active scrapers to stop.');
    return;
  }
  
  logger.warn('Attempting to stop all active scrapers.');
  scrapingStatus.isRunning = false;
  scrapingStatus.activeScrapers.forEach((value, name) => {
    scrapingStatus.activeScrapers.set(name, { ...value, status: 'cancelled', endTime: new Date() });
  });
}

function getScrapingStatus() {
  const activeScraperStatus = Array.from(scrapingStatus.activeScrapers).map(([name, status]) => {
    return { name, ...status };
  });

  return {
    ...scrapingStatus,
    activeScrapers: activeScraperStatus,
    rateLimiterStats: scrapingLimiter.getStats(),
    concurrentLimiterStats: concurrentLimiter.getState(),
  };
}

function getAvailableScrapers() {
  const instances = getScraperInstances();
  return Object.keys(instances);
}

// ===========================================
// Exports
// ===========================================

module.exports = {
  get scraperInstances() {
    return getScraperInstances();
  },
  runAllScrapers,
  runSpecificScraper,
  stopAllScrapers,
  getScrapingStatus,
  getAvailableScrapers,
};