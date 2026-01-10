/**
 * Robots.txt Parser Utility
 * 
 * Parses and respects robots.txt files from target websites.
 * This ensures ethical scraping by following website crawling rules.
 */

const axios = require('axios');
const robotsParser = require('robots-parser');
const logger = require('./logger');
const { getRandomUserAgent, getHeadersForUserAgent } = require('./userAgents');

// ===========================================
// Robots.txt Cache
// ===========================================

/**
 * Cache for parsed robots.txt files
 * Avoids repeatedly fetching the same robots.txt
 */
class RobotsCache {
  constructor(options = {}) {
    this.cache = new Map();
    this.ttl = options.ttl || 60 * 60 * 1000; // 1 hour default TTL
    this.maxSize = options.maxSize || 100; // Maximum cached entries
    this.fetchTimeout = options.fetchTimeout || 10000; // 10 seconds
    this.userAgent = options.userAgent || 'WebMethodsScraper/1.0';
    
    // Statistics
    this.stats = {
      hits: 0,
      misses: 0,
      fetchErrors: 0,
      urlsChecked: 0
    };
  }
  
  /**
   * Get cache key from URL
   * @param {string} url - Full URL or domain
   * @returns {string} Cache key (origin)
   */
  getCacheKey(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.origin;
    } catch {
      // If not a valid URL, assume it's a domain
      return `https://${url.replace(/^(https?:\/\/)?(www\.)?/, '')}`;
    }
  }
  
  /**
   * Get robots.txt URL from base URL
   * @param {string} baseUrl - Base URL or origin
   * @returns {string} robots.txt URL
   */
  getRobotsUrl(baseUrl) {
    const origin = this.getCacheKey(baseUrl);
    return `${origin}/robots.txt`;
  }
  
  /**
   * Fetch and parse robots.txt for a domain
   * @param {string} url - URL to get robots.txt for
   * @returns {Promise<Object>} Parsed robots.txt or null
   */
  async fetch(url) {
    const origin = this.getCacheKey(url);
    const robotsUrl = this.getRobotsUrl(url);
    
    try {
      logger.debug(`Fetching robots.txt from ${robotsUrl}`);
      
      const userAgent = getRandomUserAgent('desktop');
      const headers = getHeadersForUserAgent(userAgent);
      
      const response = await axios.get(robotsUrl, {
        timeout: this.fetchTimeout,
        headers: {
          ...headers,
          'Accept': 'text/plain, text/html, */*'
        },
        validateStatus: (status) => status < 500 // Accept 4xx as valid (no robots.txt)
      });
      
      if (response.status === 200) {
        const robotsTxt = response.data;
        const parser = robotsParser(robotsUrl, robotsTxt);
        
        logger.debug(`Successfully parsed robots.txt for ${origin}`);
        
        return {
          origin,
          parser,
          content: robotsTxt,
          fetchedAt: Date.now(),
          exists: true
        };
      } else {
        // robots.txt doesn't exist or is inaccessible
        logger.debug(`No robots.txt found for ${origin} (status: ${response.status})`);
        
        return {
          origin,
          parser: null,
          content: null,
          fetchedAt: Date.now(),
          exists: false
        };
      }
    } catch (error) {
      this.stats.fetchErrors++;
      logger.warn(`Failed to fetch robots.txt for ${origin}: ${error.message}`);
      
      // Return permissive result on error (allow scraping)
      return {
        origin,
        parser: null,
        content: null,
        fetchedAt: Date.now(),
        exists: false,
        error: error.message
      };
    }
  }
  
  /**
   * Get cached or fetch robots.txt
   * @param {string} url - URL to check
   * @returns {Promise<Object>} Robots.txt data
   */
  async get(url) {
    const key = this.getCacheKey(url);
    
    // Check cache
    if (this.cache.has(key)) {
      const cached = this.cache.get(key);
      
      // Check if still valid
      if (Date.now() - cached.fetchedAt < this.ttl) {
        this.stats.hits++;
        return cached;
      }
      
      // Expired, remove from cache
      this.cache.delete(key);
    }
    
    this.stats.misses++;
    
    // Enforce max cache size
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    // Fetch and cache
    const robots = await this.fetch(url);
    this.cache.set(key, robots);
    
    return robots;
  }
  
  /**
   * Check if URL is allowed by robots.txt
   * @param {string} url - URL to check
   * @param {string} userAgent - User agent to check for
   * @returns {Promise<boolean>} Whether URL is allowed
   */
  async isAllowed(url, userAgent = null) {
    this.stats.urlsChecked++;
    
    const robots = await this.get(url);
    
    // If no robots.txt exists, allow by default
    if (!robots.exists || !robots.parser) {
      return true;
    }
    
    const ua = userAgent || this.userAgent;
    const allowed = robots.parser.isAllowed(url, ua);
    
    if (!allowed) {
      logger.debug(`URL blocked by robots.txt: ${url}`);
    }
    
    return allowed;
  }
  
  /**
   * Check if URL is disallowed by robots.txt
   * @param {string} url - URL to check
   * @param {string} userAgent - User agent to check for
   * @returns {Promise<boolean>} Whether URL is disallowed
   */
  async isDisallowed(url, userAgent = null) {
    return !(await this.isAllowed(url, userAgent));
  }
  
  /**
   * Get crawl delay for a domain
   * @param {string} url - URL to check
   * @param {string} userAgent - User agent to check for
   * @returns {Promise<number|null>} Crawl delay in seconds or null
   */
  async getCrawlDelay(url, userAgent = null) {
    const robots = await this.get(url);
    
    if (!robots.exists || !robots.parser) {
      return null;
    }
    
    const ua = userAgent || this.userAgent;
    const delay = robots.parser.getCrawlDelay(ua);
    
    return delay || null;
  }
  
  /**
   * Get sitemap URLs from robots.txt
   * @param {string} url - URL to check
   * @returns {Promise<string[]>} Array of sitemap URLs
   */
  async getSitemaps(url) {
    const robots = await this.get(url);
    
    if (!robots.exists || !robots.parser) {
      return [];
    }
    
    return robots.parser.getSitemaps() || [];
  }
  
  /**
   * Get preferred host from robots.txt
   * @param {string} url - URL to check
   * @returns {Promise<string|null>} Preferred host or null
   */
  async getPreferredHost(url) {
    const robots = await this.get(url);
    
    if (!robots.exists || !robots.parser) {
      return null;
    }
    
    return robots.parser.getPreferredHost() || null;
  }
  
  /**
   * Clear the cache
   */
  clear() {
    this.cache.clear();
    logger.debug('Robots.txt cache cleared');
  }
  
  /**
   * Remove specific entry from cache
   * @param {string} url - URL to remove
   */
  remove(url) {
    const key = this.getCacheKey(url);
    this.cache.delete(key);
  }
  
  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    return {
      ...this.stats,
      cacheSize: this.cache.size,
      hitRate: this.stats.hits + this.stats.misses > 0
        ? ((this.stats.hits / (this.stats.hits + this.stats.misses)) * 100).toFixed(2) + '%'
        : '0%',
      cachedDomains: Array.from(this.cache.keys())
    };
  }
  
  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      fetchErrors: 0,
      urlsChecked: 0
    };
  }
}

// ===========================================
// URL Validation and Filtering
// ===========================================

/**
 * Filter a list of URLs based on robots.txt rules
 * @param {string[]} urls - Array of URLs to filter
 * @param {RobotsCache} cache - Robots cache instance
 * @param {string} userAgent - User agent to check for
 * @returns {Promise<Object>} Allowed and disallowed URLs
 */
async function filterUrlsByRobots(urls, cache, userAgent = null) {
  const allowed = [];
  const disallowed = [];
  
  for (const url of urls) {
    try {
      if (await cache.isAllowed(url, userAgent)) {
        allowed.push(url);
      } else {
        disallowed.push(url);
      }
    } catch (error) {
      // On error, allow the URL
      logger.warn(`Error checking robots.txt for ${url}: ${error.message}`);
      allowed.push(url);
    }
  }
  
  return { allowed, disallowed };
}

/**
 * Create a scraping plan respecting robots.txt
 * @param {string[]} urls - URLs to scrape
 * @param {RobotsCache} cache - Robots cache instance
 * @param {string} userAgent - User agent
 * @returns {Promise<Object>} Scraping plan with delays
 */
async function createScrapingPlan(urls, cache, userAgent = null) {
  const plan = {
    urls: [],
    totalDelay: 0,
    disallowedUrls: []
  };
  
  // Group URLs by domain
  const urlsByDomain = new Map();
  
  for (const url of urls) {
    const origin = cache.getCacheKey(url);
    if (!urlsByDomain.has(origin)) {
      urlsByDomain.set(origin, []);
    }
    urlsByDomain.get(origin).push(url);
  }
  
  // Process each domain
  for (const [origin, domainUrls] of urlsByDomain) {
    const crawlDelay = await cache.getCrawlDelay(origin, userAgent);
    const delay = crawlDelay ? crawlDelay * 1000 : 2000; // Default 2 seconds
    
    for (const url of domainUrls) {
      const isAllowed = await cache.isAllowed(url, userAgent);
      
      if (isAllowed) {
        plan.urls.push({
          url,
          origin,
          delay
        });
        plan.totalDelay += delay;
      } else {
        plan.disallowedUrls.push(url);
      }
    }
  }
  
  return plan;
}

// ===========================================
// Robots.txt Content Parser
// ===========================================

/**
 * Parse robots.txt content manually for additional insights
 * @param {string} content - robots.txt content
 * @returns {Object} Parsed rules
 */
function parseRobotsTxtContent(content) {
  if (!content) return null;
  
  const lines = content.split('\n');
  const rules = {
    userAgents: {},
    sitemaps: [],
    host: null,
    crawlDelays: {}
  };
  
  let currentUserAgent = null;
  
  for (let line of lines) {
    // Remove comments
    line = line.split('#')[0].trim();
    
    if (!line) continue;
    
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    
    const directive = line.substring(0, colonIndex).trim().toLowerCase();
    const value = line.substring(colonIndex + 1).trim();
    
    switch (directive) {
      case 'user-agent':
        currentUserAgent = value.toLowerCase();
        if (!rules.userAgents[currentUserAgent]) {
          rules.userAgents[currentUserAgent] = {
            allow: [],
            disallow: []
          };
        }
        break;
        
      case 'disallow':
        if (currentUserAgent && value) {
          rules.userAgents[currentUserAgent].disallow.push(value);
        }
        break;
        
      case 'allow':
        if (currentUserAgent && value) {
          rules.userAgents[currentUserAgent].allow.push(value);
        }
        break;
        
      case 'sitemap':
        if (value) {
          rules.sitemaps.push(value);
        }
        break;
        
      case 'host':
        rules.host = value;
        break;
        
      case 'crawl-delay':
        if (currentUserAgent) {
          rules.crawlDelays[currentUserAgent] = parseFloat(value);
        }
        break;
    }
  }
  
  return rules;
}

// ===========================================
// Default Instance
// ===========================================

const robotsCache = new RobotsCache({
  ttl: 60 * 60 * 1000, // 1 hour
  maxSize: 100,
  fetchTimeout: 10000,
  userAgent: 'WebMethodsScraper/1.0'
});

// ===========================================
// Exports
// ===========================================

module.exports = {
  RobotsCache,
  robotsCache,
  filterUrlsByRobots,
  createScrapingPlan,
  parseRobotsTxtContent
};