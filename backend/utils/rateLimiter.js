/**
 * Rate Limiter Utility
 * 
 * Provides rate limiting functionality for both API endpoints
 * and outgoing scraping requests to avoid overloading target servers.
 */

const rateLimit = require('express-rate-limit');
const logger = require('./logger');

// ===========================================
// API Rate Limiting (Express Middleware)
// ===========================================

/**
 * General API rate limiter - More permissive for development
 */
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 1 * 60 * 1000, // 1 minute (changed from 15)
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // 1000 requests per window (increased)
  message: {
    success: false,
    error: {
      message: 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: '1 minute'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
      path: req.originalUrl,
      method: req.method
    });
    res.status(429).json(options.message);
  },
  
  skip: (req) => {
    // Skip for health check and status endpoints in development
    if (req.path === '/health') return true;
    if (process.env.NODE_ENV === 'development') {
      // Skip rate limiting for GET requests in development
      if (req.method === 'GET') return true;
    }
    return false;
  },
  
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }
});

/**
 * Strict rate limiter for scraping endpoints
 */
const scrapingApiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'development' ? 100 : 20, // More permissive in dev
  message: {
    success: false,
    error: {
      message: 'Scraping rate limit exceeded. Please wait before initiating more scrapes.',
      code: 'SCRAPING_RATE_LIMIT_EXCEEDED',
      retryAfter: '1 hour'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  handler: (req, res, next, options) => {
    logger.warn(`Scraping rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  }
});

/**
 * Lenient rate limiter for read-only endpoints
 */
const readOnlyLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 500, // 500 requests per minute
  message: {
    success: false,
    error: {
      message: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip in development
    return process.env.NODE_ENV === 'development';
  }
});

// ===========================================
// Scraping Rate Limiter (For Outgoing Requests)
// ===========================================

class ScrapingRateLimiter {
  constructor(options = {}) {
    this.maxTokens = options.maxTokens || 10;
    this.refillRate = options.refillRate || 1;
    this.minDelay = options.minDelay || parseInt(process.env.SCRAPE_DELAY_MIN) || 2000;
    this.maxDelay = options.maxDelay || parseInt(process.env.SCRAPE_DELAY_MAX) || 5000;
    
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
    this.queue = [];
    this.isProcessing = false;
    
    this.domainBuckets = new Map();
    this.domainConfig = {
      default: { maxTokens: 5, refillRate: 0.5, minDelay: 2000, maxDelay: 5000 },
      'google.com': { maxTokens: 3, refillRate: 0.3, minDelay: 3000, maxDelay: 8000 },
      'linkedin.com': { maxTokens: 2, refillRate: 0.2, minDelay: 5000, maxDelay: 10000 },
      'indeed.com': { maxTokens: 3, refillRate: 0.3, minDelay: 3000, maxDelay: 7000 },
      'twitter.com': { maxTokens: 2, refillRate: 0.2, minDelay: 4000, maxDelay: 8000 },
      'github.com': { maxTokens: 5, refillRate: 0.5, minDelay: 2000, maxDelay: 4000 }
    };
    
    this.stats = {
      totalRequests: 0,
      throttledRequests: 0,
      averageWaitTime: 0,
      requestsByDomain: new Map()
    };
  }
  
  refillTokens() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    const tokensToAdd = elapsed * this.refillRate;
    
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
  
  getDomainBucket(domain) {
    const baseDomain = this.extractBaseDomain(domain);
    
    if (!this.domainBuckets.has(baseDomain)) {
      const config = this.domainConfig[baseDomain] || this.domainConfig.default;
      this.domainBuckets.set(baseDomain, {
        tokens: config.maxTokens,
        lastRefill: Date.now(),
        ...config
      });
    }
    
    const bucket = this.domainBuckets.get(baseDomain);
    
    const now = Date.now();
    const elapsed = (now - bucket.lastRefill) / 1000;
    bucket.tokens = Math.min(bucket.maxTokens, bucket.tokens + elapsed * bucket.refillRate);
    bucket.lastRefill = now;
    
    return bucket;
  }
  
  extractBaseDomain(urlOrDomain) {
    try {
      let hostname = urlOrDomain;
      
      if (urlOrDomain.includes('://')) {
        hostname = new URL(urlOrDomain).hostname;
      }
      
      hostname = hostname.replace(/^www\./, '');
      
      const parts = hostname.split('.');
      if (parts.length >= 2) {
        return parts.slice(-2).join('.');
      }
      
      return hostname;
    } catch {
      return 'unknown';
    }
  }
  
  getRandomDelay(bucket = null) {
    const minDelay = bucket?.minDelay || this.minDelay;
    const maxDelay = bucket?.maxDelay || this.maxDelay;
    
    return Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
  }
  
  async acquire(url = '') {
    const startTime = Date.now();
    const domain = this.extractBaseDomain(url);
    const bucket = this.getDomainBucket(domain);
    
    this.stats.totalRequests++;
    
    const domainCount = this.stats.requestsByDomain.get(domain) || 0;
    this.stats.requestsByDomain.set(domain, domainCount + 1);
    
    if (bucket.tokens < 1) {
      this.stats.throttledRequests++;
      
      const tokensNeeded = 1 - bucket.tokens;
      const waitTime = (tokensNeeded / bucket.refillRate) * 1000;
      
      logger.debug(`Rate limiting: waiting ${waitTime.toFixed(0)}ms for ${domain}`);
      
      await this.delay(waitTime);
      
      bucket.tokens = Math.min(bucket.maxTokens, bucket.tokens + (waitTime / 1000) * bucket.refillRate);
    }
    
    bucket.tokens -= 1;
    
    const randomDelay = this.getRandomDelay(bucket);
    await this.delay(randomDelay);
    
    const totalWaitTime = Date.now() - startTime;
    this.stats.averageWaitTime = (this.stats.averageWaitTime * (this.stats.totalRequests - 1) + totalWaitTime) / this.stats.totalRequests;
    
    logger.debug(`Rate limiter: acquired permit for ${domain} after ${totalWaitTime}ms`);
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async execute(fn, url = '') {
    await this.acquire(url);
    return fn();
  }
  
  async enqueue(fn, url = '') {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, url, resolve, reject });
      this.processQueue();
    });
  }
  
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.queue.length > 0) {
      const { fn, url, resolve, reject } = this.queue.shift();
      
      try {
        await this.acquire(url);
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }
    
    this.isProcessing = false;
  }
  
  getStats() {
    const domainStats = {};
    this.stats.requestsByDomain.forEach((count, domain) => {
      domainStats[domain] = count;
    });
    
    return {
      totalRequests: this.stats.totalRequests,
      throttledRequests: this.stats.throttledRequests,
      throttleRate: this.stats.totalRequests > 0 
        ? ((this.stats.throttledRequests / this.stats.totalRequests) * 100).toFixed(2) + '%'
        : '0%',
      averageWaitTime: Math.round(this.stats.averageWaitTime) + 'ms',
      queueLength: this.queue.length,
      requestsByDomain: domainStats
    };
  }
  
  resetStats() {
    this.stats = {
      totalRequests: 0,
      throttledRequests: 0,
      averageWaitTime: 0,
      requestsByDomain: new Map()
    };
  }
  
  reset() {
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
    this.queue = [];
    this.isProcessing = false;
    this.domainBuckets.clear();
    this.resetStats();
  }
  
  configureDomain(domain, config) {
    this.domainConfig[domain] = {
      ...this.domainConfig.default,
      ...config
    };
    
    this.domainBuckets.delete(domain);
  }
}

// ===========================================
// Concurrent Request Limiter
// ===========================================

class ConcurrentLimiter {
  constructor(maxConcurrent = 3) {
    this.maxConcurrent = parseInt(process.env.MAX_CONCURRENT_REQUESTS) || maxConcurrent;
    this.currentCount = 0;
    this.queue = [];
  }
  
  async acquire() {
    if (this.currentCount < this.maxConcurrent) {
      this.currentCount++;
      return () => this.release();
    }
    
    return new Promise(resolve => {
      this.queue.push(() => {
        this.currentCount++;
        resolve(() => this.release());
      });
    });
  }
  
  release() {
    this.currentCount--;
    
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      next();
    }
  }
  
  async execute(fn) {
    const release = await this.acquire();
    try {
      return await fn();
    } finally {
      release();
    }
  }
  
  getState() {
    return {
      currentCount: this.currentCount,
      maxConcurrent: this.maxConcurrent,
      queueLength: this.queue.length
    };
  }
  
  reset() {
    this.currentCount = 0;
    this.queue = [];
  }
}

// ===========================================
// Create Default Instances
// ===========================================

const scrapingLimiter = new ScrapingRateLimiter();
const concurrentLimiter = new ConcurrentLimiter();

// ===========================================
// Exports
// ===========================================

module.exports = {
  apiLimiter,
  scrapingApiLimiter,
  readOnlyLimiter,
  ScrapingRateLimiter,
  scrapingLimiter,
  ConcurrentLimiter,
  concurrentLimiter
};