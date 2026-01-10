/**
 * Scraping Log Model
 * 
 * Mongoose schema for logging scraping activities, errors,
 * and performance metrics. Useful for monitoring and debugging.
 */

const mongoose = require('mongoose');

// ===========================================
// Scraping Log Schema Definition
// ===========================================

const scrapingLogSchema = new mongoose.Schema(
  {
    // Unique session identifier
    sessionId: {
      type: String,
      required: true,
      index: true
    },
    
    // Scraper type/name
    scraperName: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    
    // Target source being scraped
    source: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    
    // Source URL
    sourceUrl: {
      type: String,
      trim: true
    },
    
    // Scraping status
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed', 'cancelled', 'partial'],
      default: 'pending',
      index: true
    },
    
    // Start and end times
    startedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    
    endedAt: {
      type: Date
    },
    
    // Duration in milliseconds
    duration: {
      type: Number,
      default: 0
    },
    
    // Results statistics
    results: {
      // Total items found
      found: {
        type: Number,
        default: 0
      },
      
      // New items inserted
      inserted: {
        type: Number,
        default: 0
      },
      
      // Existing items updated
      updated: {
        type: Number,
        default: 0
      },
      
      // Duplicate items skipped
      duplicates: {
        type: Number,
        default: 0
      },
      
      // Items that failed to process
      failed: {
        type: Number,
        default: 0
      },
      
      // URLs processed
      urlsProcessed: {
        type: Number,
        default: 0
      },
      
      // URLs that failed
      urlsFailed: {
        type: Number,
        default: 0
      }
    },
    
    // Performance metrics
    performance: {
      // Average time per item in ms
      avgTimePerItem: {
        type: Number,
        default: 0
      },
      
      // Total requests made
      totalRequests: {
        type: Number,
        default: 0
      },
      
      // Failed requests
      failedRequests: {
        type: Number,
        default: 0
      },
      
      // Average response time in ms
      avgResponseTime: {
        type: Number,
        default: 0
      },
      
      // Data transferred in bytes
      dataTransferred: {
        type: Number,
        default: 0
      },
      
      // Memory usage in MB
      memoryUsage: {
        type: Number,
        default: 0
      }
    },
    
    // Errors encountered (renamed from 'errors' to avoid reserved keyword warning)
    errorLogs: [{
      timestamp: {
        type: Date,
        default: Date.now
      },
      
      type: {
        type: String,
        trim: true
      },
      
      message: {
        type: String,
        trim: true
      },
      
      url: {
        type: String,
        trim: true
      },
      
      stack: {
        type: String
      },
      
      retryCount: {
        type: Number,
        default: 0
      }
    }],
    
    // Warnings
    warnings: [{
      timestamp: {
        type: Date,
        default: Date.now
      },
      
      message: {
        type: String,
        trim: true
      },
      
      url: {
        type: String,
        trim: true
      }
    }],
    
    // Configuration used for this scraping session
    config: {
      maxItems: {
        type: Number
      },
      
      delay: {
        type: Number
      },
      
      timeout: {
        type: Number
      },
      
      retries: {
        type: Number
      },
      
      userAgent: {
        type: String
      },
      
      keywords: [{
        type: String
      }],
      
      filters: {
        type: mongoose.Schema.Types.Mixed
      }
    },
    
    // Trigger source (manual, scheduled, api)
    triggeredBy: {
      type: String,
      enum: ['manual', 'scheduled', 'api', 'system'],
      default: 'manual'
    },
    
    // User/system that triggered the scrape
    triggeredById: {
      type: String,
      trim: true
    },
    
    // Notes or comments
    notes: {
      type: String,
      trim: true
    },
    
    // Rate limiting info
    rateLimiting: {
      wasThrottled: {
        type: Boolean,
        default: false
      },
      
      throttleCount: {
        type: Number,
        default: 0
      },
      
      totalDelayMs: {
        type: Number,
        default: 0
      }
    },
    
    // Robots.txt compliance
    robotsCompliance: {
      checked: {
        type: Boolean,
        default: false
      },
      
      urlsBlocked: {
        type: Number,
        default: 0
      },
      
      crawlDelayApplied: {
        type: Number
      }
    }
  },
  {
    timestamps: true,
    collection: 'scraping_logs'
  }
);

// ===========================================
// Indexes
// ===========================================

// Compound indexes for common queries
scrapingLogSchema.index({ scraperName: 1, startedAt: -1 });
scrapingLogSchema.index({ status: 1, startedAt: -1 });
scrapingLogSchema.index({ source: 1, startedAt: -1 });

// TTL index - automatically delete logs older than 30 days
scrapingLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
);

// ===========================================
// Virtual Properties
// ===========================================

// Success rate
scrapingLogSchema.virtual('successRate').get(function () {
  const total = this.results.found || 0;
  const failed = this.results.failed || 0;
  
  if (total === 0) return 0;
  return (((total - failed) / total) * 100).toFixed(2);
});

// Formatted duration
scrapingLogSchema.virtual('formattedDuration').get(function () {
  const ms = this.duration || 0;
  
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(2)}m`;
  return `${(ms / 3600000).toFixed(2)}h`;
});

// Has errors (updated to use errorLogs)
scrapingLogSchema.virtual('hasErrors').get(function () {
  return this.errorLogs && this.errorLogs.length > 0;
});

// Error count (updated to use errorLogs)
scrapingLogSchema.virtual('errorCount').get(function () {
  return this.errorLogs ? this.errorLogs.length : 0;
});

// Alias 'errors' to 'errorLogs' for backward compatibility
scrapingLogSchema.virtual('errors').get(function () {
  return this.errorLogs;
});

// Include virtuals in JSON output
scrapingLogSchema.set('toJSON', { virtuals: true });
scrapingLogSchema.set('toObject', { virtuals: true });

// ===========================================
// Static Methods
// ===========================================

/**
 * Generate unique session ID
 * @returns {string} Session ID
 */
scrapingLogSchema.statics.generateSessionId = function () {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `scrape_${timestamp}_${random}`;
};

/**
 * Create a new scraping session log
 * @param {Object} data - Session data
 * @returns {Promise<Object>} Created log
 */
scrapingLogSchema.statics.startSession = async function (data) {
  const sessionId = this.generateSessionId();
  
  const log = await this.create({
    sessionId,
    scraperName: data.scraperName,
    source: data.source,
    sourceUrl: data.sourceUrl,
    status: 'running',
    startedAt: new Date(),
    triggeredBy: data.triggeredBy || 'manual',
    triggeredById: data.triggeredById,
    config: data.config || {}
  });
  
  return log;
};

/**
 * Get recent logs with pagination
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated logs
 */
scrapingLogSchema.statics.getRecent = async function (options = {}) {
  const {
    page = 1,
    limit = 20,
    scraperName = null,
    source = null,
    status = null,
    startDate = null,
    endDate = null
  } = options;
  
  const skip = (page - 1) * limit;
  const query = {};
  
  if (scraperName) query.scraperName = scraperName;
  if (source) query.source = source;
  if (status) query.status = status;
  
  if (startDate || endDate) {
    query.startedAt = {};
    if (startDate) query.startedAt.$gte = new Date(startDate);
    if (endDate) query.startedAt.$lte = new Date(endDate);
  }
  
  const [logs, total] = await Promise.all([
    this.find(query)
      .sort({ startedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(query)
  ]);
  
  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  };
};

/**
 * Get scraping statistics
 * @param {number} days - Number of days to analyze
 * @returns {Promise<Object>} Statistics
 */
scrapingLogSchema.statics.getStatistics = async function (days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const stats = await this.aggregate([
    { $match: { startedAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$scraperName',
        totalRuns: { $sum: 1 },
        successfulRuns: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        failedRuns: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        totalItemsFound: { $sum: '$results.found' },
        totalItemsInserted: { $sum: '$results.inserted' },
        avgDuration: { $avg: '$duration' },
        totalErrors: { $sum: { $size: { $ifNull: ['$errorLogs', []] } } }
      }
    },
    { $sort: { totalRuns: -1 } }
  ]);
  
  const dailyStats = await this.aggregate([
    { $match: { startedAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$startedAt' }
        },
        runs: { $sum: 1 },
        itemsFound: { $sum: '$results.found' },
        itemsInserted: { $sum: '$results.inserted' },
        errors: { $sum: { $size: { $ifNull: ['$errorLogs', []] } } }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  const overallStats = await this.aggregate([
    { $match: { startedAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalRuns: { $sum: 1 },
        totalItemsFound: { $sum: '$results.found' },
        totalItemsInserted: { $sum: '$results.inserted' },
        avgDuration: { $avg: '$duration' },
        successRate: {
          $avg: {
            $cond: [{ $eq: ['$status', 'completed'] }, 100, 0]
          }
        }
      }
    }
  ]);
  
  return {
    period: `${days} days`,
    startDate,
    endDate: new Date(),
    overall: overallStats[0] || {
      totalRuns: 0,
      totalItemsFound: 0,
      totalItemsInserted: 0,
      avgDuration: 0,
      successRate: 0
    },
    byScraperName: stats,
    daily: dailyStats
  };
};

/**
 * Get currently running scraping sessions
 * @returns {Promise<Array>} Running sessions
 */
scrapingLogSchema.statics.getRunning = async function () {
  return this.find({ status: 'running' })
    .sort({ startedAt: -1 })
    .lean();
};

/**
 * Get failed sessions for retry
 * @param {number} hours - Hours to look back
 * @returns {Promise<Array>} Failed sessions
 */
scrapingLogSchema.statics.getFailedForRetry = async function (hours = 24) {
  const startDate = new Date();
  startDate.setHours(startDate.getHours() - hours);
  
  return this.find({
    status: 'failed',
    startedAt: { $gte: startDate }
  })
    .sort({ startedAt: -1 })
    .lean();
};

// ===========================================
// Instance Methods
// ===========================================

/**
 * Mark session as completed
 * @param {Object} results - Results data
 */
scrapingLogSchema.methods.complete = async function (results = {}) {
  this.status = 'completed';
  this.endedAt = new Date();
  this.duration = this.endedAt - this.startedAt;
  
  if (results.found !== undefined) this.results.found = results.found;
  if (results.inserted !== undefined) this.results.inserted = results.inserted;
  if (results.updated !== undefined) this.results.updated = results.updated;
  if (results.duplicates !== undefined) this.results.duplicates = results.duplicates;
  if (results.failed !== undefined) this.results.failed = results.failed;
  if (results.urlsProcessed !== undefined) this.results.urlsProcessed = results.urlsProcessed;
  if (results.urlsFailed !== undefined) this.results.urlsFailed = results.urlsFailed;
  
  // Calculate average time per item
  if (this.results.found > 0) {
    this.performance.avgTimePerItem = this.duration / this.results.found;
  }
  
  await this.save();
};

/**
 * Mark session as failed
 * @param {Error} error - Error that caused failure
 */
scrapingLogSchema.methods.fail = async function (error) {
  this.status = 'failed';
  this.endedAt = new Date();
  this.duration = this.endedAt - this.startedAt;
  
  this.errorLogs.push({
    timestamp: new Date(),
    type: error.name || 'Error',
    message: error.message,
    stack: error.stack
  });
  
  await this.save();
};

/**
 * Mark session as cancelled
 */
scrapingLogSchema.methods.cancel = async function () {
  this.status = 'cancelled';
  this.endedAt = new Date();
  this.duration = this.endedAt - this.startedAt;
  await this.save();
};

/**
 * Add an error to the log
 * @param {Object} errorData - Error data
 */
scrapingLogSchema.methods.addError = async function (errorData) {
  this.errorLogs.push({
    timestamp: new Date(),
    type: errorData.type || 'Error',
    message: errorData.message,
    url: errorData.url,
    stack: errorData.stack,
    retryCount: errorData.retryCount || 0
  });
  
  await this.save();
};

/**
 * Add a warning to the log
 * @param {Object} warningData - Warning data
 */
scrapingLogSchema.methods.addWarning = async function (warningData) {
  this.warnings.push({
    timestamp: new Date(),
    message: warningData.message,
    url: warningData.url
  });
  
  await this.save();
};

/**
 * Update results incrementally
 * @param {Object} updates - Results updates
 */
scrapingLogSchema.methods.updateResults = async function (updates) {
  if (updates.found) this.results.found += updates.found;
  if (updates.inserted) this.results.inserted += updates.inserted;
  if (updates.updated) this.results.updated += updates.updated;
  if (updates.duplicates) this.results.duplicates += updates.duplicates;
  if (updates.failed) this.results.failed += updates.failed;
  if (updates.urlsProcessed) this.results.urlsProcessed += updates.urlsProcessed;
  if (updates.urlsFailed) this.results.urlsFailed += updates.urlsFailed;
  
  await this.save();
};

/**
 * Update performance metrics
 * @param {Object} metrics - Performance metrics
 */
scrapingLogSchema.methods.updatePerformance = async function (metrics) {
  Object.assign(this.performance, metrics);
  await this.save();
};

// ===========================================
// Create and Export Model
// ===========================================

const ScrapingLog = mongoose.model('ScrapingLog', scrapingLogSchema);

module.exports = ScrapingLog;