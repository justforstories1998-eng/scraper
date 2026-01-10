/**
 * BaseScraper Class
 *
 * Common scraper utilities: requests, robots.txt compliance, rate limiting,
 * retries, logging and MongoDB persistence.
 */

const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const logger = require('../utils/logger');
const { getRandomUserAgent, getHeadersForUserAgent } = require('../utils/userAgents');
const { scrapingLimiter, concurrentLimiter } = require('../utils/rateLimiter');
const { robotsCache } = require('../utils/robotsParser');
const Content = require('../models/Content');
const ScrapingLog = require('../models/ScrapingLog');
const { APIError, ScrapingError, DatabaseError } = require('../middleware/errorHandler');

const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT, 10) || 30000;
const MAX_RETRIES = parseInt(process.env.MAX_RETRIES, 10) || 3;
const USE_PUPPETEER = process.env.USE_PUPPETEER === 'true';

const SEARCH_KEYWORDS = process.env.SEARCH_KEYWORDS
  ? process.env.SEARCH_KEYWORDS.split(',').map(k => k.trim().toLowerCase()).filter(Boolean)
  : ['webmethods'];

const PROXY_HOST = process.env.PROXY_HOST;
const PROXY_PORT = process.env.PROXY_PORT;
const PROXY_USERNAME = process.env.PROXY_USERNAME;
const PROXY_PASSWORD = process.env.PROXY_PASSWORD;

class BaseScraper {
  constructor(name, type, sourceName, initialUrls, config = {}) {
    if (!name || !type || !sourceName || !Array.isArray(initialUrls) || initialUrls.length === 0) {
      throw new Error('BaseScraper requires name, type, sourceName, and initialUrls.');
    }

    this.name = name;
    this.type = type;
    this.sourceName = sourceName;
    this.initialUrls = initialUrls;

    this.logger = logger.child({ scraper: this.name, source: this.sourceName });

    this.config = {
      maxItems: parseInt(process.env.MAX_ITEMS_PER_CATEGORY, 10) || 500,
      keywords: SEARCH_KEYWORDS,
      ...config
    };

    // Use a truthful UA for robots checks
    this.robotsUserAgent = process.env.ROBOTS_USER_AGENT || 'WebMethodsScraper/1.0';

    this.puppeteerBrowser = null;
    this.scrapingLog = null;

    this.scrapedItems = [];
    this.processedUrls = new Set();
    this.failedUrls = new Set();
    this.retryAttempts = new Map();

    this.axiosProxy = this._buildAxiosProxy();
  }

  _buildAxiosProxy() {
    if (!PROXY_HOST || !PROXY_PORT) return null;

    const proxy = {
      protocol: 'http',
      host: PROXY_HOST,
      port: parseInt(PROXY_PORT, 10),
    };

    if (PROXY_USERNAME && PROXY_PASSWORD) {
      proxy.auth = {
        username: PROXY_USERNAME,
        password: PROXY_PASSWORD
      };
    }

    this.logger.info(`Proxy enabled for axios: ${PROXY_HOST}:${PROXY_PORT}`);
    return proxy;
  }

  // Abstract
  async scrapeSource() {
    throw new Error('scrapeSource() must be implemented by subclasses.');
  }

  // Abstract
  parsePage(html, url) {
    throw new Error('parsePage() must be implemented by subclasses.');
  }

  async run(triggeredBy = 'manual') {
    this.logger.info(`Starting ${this.name}...`);
    const startTime = Date.now();

    this.scrapedItems = [];
    this.processedUrls.clear();
    this.failedUrls.clear();

    this.scrapingLog = await ScrapingLog.startSession({
      scraperName: this.name,
      source: this.sourceName,
      sourceUrl: this.initialUrls[0],
      triggeredBy,
      config: this.config,
    });

    try {
      // Pre-check robots for initial URLs; skip disallowed, don't kill entire run
      const allowedInitial = [];
      for (const url of this.initialUrls) {
        const allowed = await robotsCache.isAllowed(url, this.robotsUserAgent);
        if (!allowed) {
          this.logger.warn(`Robots blocked initial URL: ${url} (skipping)`);
          await this.scrapingLog.addWarning({ message: 'Robots blocked initial URL (skipped)', url });
          continue;
        }
        allowedInitial.push(url);
      }

      if (allowedInitial.length === 0) {
        throw new APIError('All initial URLs are blocked by robots.txt. Nothing to scrape.', 403, 'ROBOTS_DISALLOWED');
      }

      // Let scraper implementation use initialUrls if it wants
      this.initialUrls = allowedInitial;

      await this.scrapeSource();

      const saved = await this._processAndSaveItems(this.scrapedItems);

      const duration = Date.now() - startTime;
      await this.scrapingLog.complete({
        found: this.scrapedItems.length,
        inserted: saved.inserted,
        updated: saved.modified,
        duplicates: saved.total - saved.inserted - saved.modified,
        failed: saved.failed,
        urlsProcessed: this.processedUrls.size,
        urlsFailed: this.failedUrls.size,
      });

      logger.scrapeSuccess(this.sourceName, this.scrapedItems.length, duration);

      return {
        success: true,
        message: `${this.name} completed.`,
        details: {
          itemsFound: this.scrapedItems.length,
          itemsInserted: saved.inserted,
          itemsUpdated: saved.modified,
          itemsSkipped: saved.total - saved.inserted - saved.modified,
          urlsProcessed: this.processedUrls.size,
          urlsFailed: this.failedUrls.size,
          durationMs: duration
        }
      };
    } catch (error) {
      logger.scrapeError(this.sourceName, error);
      if (this.scrapingLog) await this.scrapingLog.fail(error);

      return {
        success: false,
        message: `${this.name} failed`,
        error: error.message,
      };
    } finally {
      await this.cleanup();
    }
  }

  async cleanup() {
    if (this.puppeteerBrowser) {
      try {
        await this.puppeteerBrowser.close();
      } catch (e) {
        this.logger.warn(`Error closing puppeteer: ${e.message}`);
      } finally {
        this.puppeteerBrowser = null;
      }
    }
  }

  async request(url, options = {}) {
    const maxRetries = options.maxRetries || MAX_RETRIES;
    let attempts = this.retryAttempts.get(url) || 0;

    while (attempts < maxRetries) {
      try {
        const allowed = await robotsCache.isAllowed(url, this.robotsUserAgent);
        if (!allowed) {
          await this.scrapingLog.addWarning({ message: 'Robots blocked URL (skipped)', url });
          throw new APIError(`Robots disallowed: ${url}`, 403, 'ROBOTS_DISALLOWED');
        }

        const html = await concurrentLimiter.execute(async () => {
          await scrapingLimiter.acquire(url);

          const ua = getRandomUserAgent('desktop');
          const headers = getHeadersForUserAgent(ua);

          const res = await axios({
            method: options.method || 'GET',
            url,
            timeout: REQUEST_TIMEOUT,
            responseType: 'text',
            headers: { ...headers, ...(options.headers || {}) },
            data: options.data,
            // axios proxy config (optional)
            proxy: this.axiosProxy || false,
            validateStatus: (s) => s >= 200 && s < 400
          });

          this.processedUrls.add(url);
          this.retryAttempts.delete(url);
          return res.data;
        });

        return html;
      } catch (error) {
        attempts++;
        this.retryAttempts.set(url, attempts);

        // Robots disallowed should not be retried
        if (error?.errorCode === 'ROBOTS_DISALLOWED' || error?.statusCode === 403) {
          this.failedUrls.add(url);
          throw error;
        }

        await this.scrapingLog.addError({
          type: error.name || 'RequestError',
          message: error.message,
          url,
          stack: error.stack,
          retryCount: attempts
        });

        if (attempts >= maxRetries) {
          this.failedUrls.add(url);
          throw new ScrapingError(`Failed to fetch ${url} after ${maxRetries} attempts: ${error.message}`, url);
        }

        const backoff = Math.pow(2, attempts) * 1000 + Math.random() * 500;
        await new Promise(r => setTimeout(r, backoff));
      }
    }
  }

  async puppeteerRequest(url, options = {}) {
    if (!USE_PUPPETEER) {
      throw new Error('Puppeteer is disabled. Set USE_PUPPETEER=true to enable.');
    }

    const maxRetries = options.maxRetries || MAX_RETRIES;
    let attempts = this.retryAttempts.get(url) || 0;

    while (attempts < maxRetries) {
      let page;
      try {
        const allowed = await robotsCache.isAllowed(url, this.robotsUserAgent);
        if (!allowed) {
          await this.scrapingLog.addWarning({ message: 'Robots blocked URL (skipped)', url });
          throw new APIError(`Robots disallowed: ${url}`, 403, 'ROBOTS_DISALLOWED');
        }

        if (!this.puppeteerBrowser) {
          this.puppeteerBrowser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
          });
        }

        await scrapingLimiter.acquire(url);

        page = await this.puppeteerBrowser.newPage();
        await page.setViewport({ width: 1366, height: 768 });

        const ua = getRandomUserAgent('desktop');
        await page.setUserAgent(ua);

        await page.goto(url, { waitUntil: options.waitUntil || 'networkidle2', timeout: REQUEST_TIMEOUT });

        if (options.waitForSelector) {
          await page.waitForSelector(options.waitForSelector, { timeout: REQUEST_TIMEOUT });
        }

        // Optional scroll for feeds
        if (options.scrollToBottom) {
          const times = options.scrollTimes || 3;
          for (let i = 0; i < times; i++) {
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await new Promise(r => setTimeout(r, options.scrollDelay || 1500));
          }
        }

        const html = await page.content();
        this.processedUrls.add(url);
        this.retryAttempts.delete(url);
        return html;
      } catch (error) {
        attempts++;
        this.retryAttempts.set(url, attempts);

        if (error?.errorCode === 'ROBOTS_DISALLOWED' || error?.statusCode === 403) {
          this.failedUrls.add(url);
          throw error;
        }

        await this.scrapingLog.addError({
          type: error.name || 'PuppeteerError',
          message: error.message,
          url,
          stack: error.stack,
          retryCount: attempts
        });

        if (attempts >= maxRetries) {
          this.failedUrls.add(url);
          throw new ScrapingError(`Failed to fetch ${url} with Puppeteer: ${error.message}`, url);
        }

        const backoff = Math.pow(2, attempts) * 1000 + Math.random() * 500;
        await new Promise(r => setTimeout(r, backoff));
      } finally {
        if (page && !page.isClosed()) {
          await page.close();
        }
      }
    }
  }

  addItem(item) {
    if (!item?.title || !item?.url) {
      this.logger.warn('Skipping item: missing title/url', item);
      return;
    }

    const text = [
      item.title,
      item.description,
      ...(item.tags || []),
      ...(item.keywords || []),
      item.source,
      item.sourceName
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const isRelevant = this.config.keywords.some(k => text.includes(k));
    if (!isRelevant) return;

    item.type = item.type || this.type;
    item.sourceName = item.sourceName || this.sourceName;
    item.scrapedBy = this.name;

    this.scrapedItems.push(item);
  }

  async _processAndSaveItems(items) {
    if (!items.length) return { inserted: 0, modified: 0, total: 0, failed: 0 };

    try {
      const limited = items.slice(0, this.config.maxItems);
      const result = await Content.bulkUpsert(limited);
      return { ...result, failed: 0 };
    } catch (error) {
      throw new DatabaseError(`Failed saving items: ${error.message}`);
    }
  }
}

module.exports = BaseScraper;