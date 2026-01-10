/**
 * Content Model
 * 
 * Mongoose schema for storing scraped content including
 * news articles, job postings, blog posts, and other webMethods-related content.
 */

const mongoose = require('mongoose');

// ===========================================
// Content Schema Definition
// ===========================================

const contentSchema = new mongoose.Schema(
  {
    // Unique identifier for deduplication
    contentHash: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    
    // Content type categorization
    type: {
      type: String,
      required: true,
      enum: ['news', 'job', 'blog', 'article', 'documentation', 'tutorial', 'video', 'other'],
      index: true
    },
    
    // Content title
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    
    // Content description or excerpt
    description: {
      type: String,
      trim: true,
      maxlength: 5000
    },
    
    // Full content body (if available)
    content: {
      type: String,
      trim: true
    },
    
    // Source URL
    url: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    
    // Source website/domain
    source: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    
    // Source name (friendly name)
    sourceName: {
      type: String,
      trim: true
    },
    
    // Author information
    author: {
      name: {
        type: String,
        trim: true
      },
      url: {
        type: String,
        trim: true
      }
    },
    
    // Publication date
    publishedAt: {
      type: Date,
      index: true
    },
    
    // Image URL
    imageUrl: {
      type: String,
      trim: true
    },
    
    // Tags and categories
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    
    categories: [{
      type: String,
      trim: true
    }],
    
    // Keywords found in content
    keywords: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    
    // Job-specific fields
    jobDetails: {
      company: {
        type: String,
        trim: true
      },
      location: {
        type: String,
        trim: true
      },
      salary: {
        type: String,
        trim: true
      },
      employmentType: {
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship', 'temporary', 'other', null]
      },
      experienceLevel: {
        type: String,
        enum: ['entry', 'mid', 'senior', 'lead', 'executive', 'other', null]
      },
      remote: {
        type: Boolean,
        default: false
      },
      skills: [{
        type: String,
        trim: true
      }],
      applyUrl: {
        type: String,
        trim: true
      }
    },
    
    // Relevance score (how relevant to webMethods)
    relevanceScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    
    // Sentiment analysis (optional)
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral', null],
      default: null
    },
    
    // Language
    language: {
      type: String,
      default: 'en',
      trim: true
    },
    
    // Scraping metadata
    scrapedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    
    scrapedBy: {
      type: String,
      trim: true
    },
    
    // Content status
    status: {
      type: String,
      enum: ['active', 'archived', 'deleted', 'flagged'],
      default: 'active',
      index: true
    },
    
    // View and engagement metrics
    metrics: {
      views: {
        type: Number,
        default: 0
      },
      clicks: {
        type: Number,
        default: 0
      },
      shares: {
        type: Number,
        default: 0
      }
    },
    
    // Raw scraped data (for debugging)
    rawData: {
      type: mongoose.Schema.Types.Mixed
    },
    
    // Last updated timestamp
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    
    // Expiration date (for automatic cleanup)
    // NOTE: Removed 'index: true' here to avoid duplicate index warning
    // The TTL index is defined separately below
    expiresAt: {
      type: Date
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    collection: 'contents'
  }
);

// ===========================================
// Indexes
// ===========================================

// Compound indexes for common queries
contentSchema.index({ type: 1, scrapedAt: -1 });
contentSchema.index({ type: 1, publishedAt: -1 });
contentSchema.index({ source: 1, scrapedAt: -1 });
contentSchema.index({ status: 1, type: 1 });
contentSchema.index({ tags: 1 });
contentSchema.index({ keywords: 1 });

// Text index for full-text search
contentSchema.index(
  {
    title: 'text',
    description: 'text',
    content: 'text',
    tags: 'text',
    keywords: 'text'
  },
  {
    weights: {
      title: 10,
      description: 5,
      tags: 3,
      keywords: 3,
      content: 1
    },
    name: 'content_text_index'
  }
);

// TTL index for automatic expiration
contentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ===========================================
// Virtual Properties
// ===========================================

// Virtual for age of content
contentSchema.virtual('age').get(function () {
  if (!this.publishedAt) return null;
  
  const now = new Date();
  const published = new Date(this.publishedAt);
  const diffMs = now - published;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
});

// Virtual for short description
contentSchema.virtual('shortDescription').get(function () {
  if (!this.description) return '';
  return this.description.length > 200
    ? this.description.substring(0, 200) + '...'
    : this.description;
});

// Include virtuals in JSON output
contentSchema.set('toJSON', { virtuals: true });
contentSchema.set('toObject', { virtuals: true });

// ===========================================
// Static Methods
// ===========================================

/**
 * Generate content hash for deduplication
 * @param {string} url - Content URL
 * @param {string} title - Content title
 * @returns {string} Hash string
 */
contentSchema.statics.generateHash = function (url, title) {
  const crypto = require('crypto');
  const data = `${url.toLowerCase().trim()}|${title.toLowerCase().trim()}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Find content by type with pagination
 * @param {string} type - Content type
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Paginated results
 */
contentSchema.statics.findByType = async function (type, options = {}) {
  const {
    page = 1,
    limit = 20,
    sort = { publishedAt: -1 },
    status = 'active'
  } = options;
  
  const skip = (page - 1) * limit;
  
  const query = { type, status };
  
  const [contents, total] = await Promise.all([
    this.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(query)
  ]);
  
  return {
    contents,
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
 * Search content using text index
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Search results
 */
contentSchema.statics.search = async function (query, options = {}) {
  const {
    page = 1,
    limit = 20,
    type = null,
    source = null,
    status = 'active'
  } = options;
  
  const skip = (page - 1) * limit;
  
  const searchQuery = {
    $text: { $search: query },
    status
  };
  
  if (type) searchQuery.type = type;
  if (source) searchQuery.source = source;
  
  const [contents, total] = await Promise.all([
    this.find(searchQuery, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(searchQuery)
  ]);
  
  return {
    contents,
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
 * Get content statistics
 * @returns {Promise<Object>} Statistics
 */
contentSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        latestDate: { $max: '$publishedAt' },
        oldestDate: { $min: '$publishedAt' }
      }
    }
  ]);
  
  const sourceStats = await this.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: '$source',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  const totalCount = await this.countDocuments({ status: 'active' });
  const todayCount = await this.countDocuments({
    status: 'active',
    scrapedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
  });
  
  return {
    total: totalCount,
    today: todayCount,
    byType: stats.reduce((acc, s) => {
      acc[s._id] = {
        count: s.count,
        latestDate: s.latestDate,
        oldestDate: s.oldestDate
      };
      return acc;
    }, {}),
    bySource: sourceStats.map(s => ({
      source: s._id,
      count: s.count
    }))
  };
};

/**
 * Find or create content (upsert)
 * @param {Object} contentData - Content data
 * @returns {Promise<Object>} Created or existing content
 */
contentSchema.statics.findOrCreate = async function (contentData) {
  const hash = this.generateHash(contentData.url, contentData.title);
  
  const existing = await this.findOne({ contentHash: hash });
  
  if (existing) {
    return { content: existing, created: false };
  }
  
  const content = await this.create({
    ...contentData,
    contentHash: hash
  });
  
  return { content, created: true };
};

/**
 * Bulk upsert contents
 * @param {Array} contents - Array of content data
 * @returns {Promise<Object>} Upsert results
 */
contentSchema.statics.bulkUpsert = async function (contents) {
  const operations = contents.map(content => {
    const hash = this.generateHash(content.url, content.title);
    return {
      updateOne: {
        filter: { contentHash: hash },
        update: {
          $set: {
            ...content,
            contentHash: hash,
            lastUpdated: new Date()
          },
          $setOnInsert: {
            scrapedAt: new Date()
          }
        },
        upsert: true
      }
    };
  });
  
  const result = await this.bulkWrite(operations, { ordered: false });
  
  return {
    inserted: result.upsertedCount,
    modified: result.modifiedCount,
    total: contents.length
  };
};

/**
 * Clean up old content
 * @param {number} maxAgeDays - Maximum age in days
 * @returns {Promise<number>} Number of deleted documents
 */
contentSchema.statics.cleanup = async function (maxAgeDays = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);
  
  const result = await this.deleteMany({
    scrapedAt: { $lt: cutoffDate },
    status: { $ne: 'flagged' } // Don't delete flagged content
  });
  
  return result.deletedCount;
};

// ===========================================
// Instance Methods
// ===========================================

/**
 * Increment view count
 */
contentSchema.methods.incrementViews = async function () {
  this.metrics.views += 1;
  await this.save();
};

/**
 * Increment click count
 */
contentSchema.methods.incrementClicks = async function () {
  this.metrics.clicks += 1;
  await this.save();
};

/**
 * Archive content
 */
contentSchema.methods.archive = async function () {
  this.status = 'archived';
  await this.save();
};

/**
 * Flag content for review
 */
contentSchema.methods.flag = async function () {
  this.status = 'flagged';
  await this.save();
};

// ===========================================
// Pre-save Middleware
// ===========================================

contentSchema.pre('save', function (next) {
  // Update lastUpdated timestamp
  this.lastUpdated = new Date();
  
  // Generate content hash if not present
  if (!this.contentHash) {
    this.contentHash = this.constructor.generateHash(this.url, this.title);
  }
  
  // Set expiration date if not set
  if (!this.expiresAt) {
    const maxAgeDays = parseInt(process.env.CONTENT_MAX_AGE_DAYS) || 90;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + maxAgeDays);
    this.expiresAt = expiresAt;
  }
  
  next();
});

// ===========================================
// Create and Export Model
// ===========================================

const Content = mongoose.model('Content', contentSchema);

module.exports = Content;