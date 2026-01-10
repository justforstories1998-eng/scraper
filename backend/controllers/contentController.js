/**
 * Content Controller
 * 
 * Handles API requests related to retrieving and managing scraped content.
 * Provides endpoints for searching, filtering, and getting content statistics.
 */

const { asyncHandler, APIError, NotFoundError } = require('../middleware/errorHandler');
const Content = require('../models/Content');
const logger = require('../utils/logger'); // Import logger for internal actions

// ===========================================
// Content Retrieval
// ===========================================

/**
 * @desc    Get all scraped content with optional filtering and pagination
 * @route   GET /api/content
 * @access  Public
 */
exports.getAllContent = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    type,
    source,
    tags,
    keywords,
    sort = 'publishedAt',
    order = -1, // -1 for descending, 1 for ascending
    search, // Text search query
    status = 'active', // Only active content by default
    minRelevance,
    maxAgeDays // Filter by content age
  } = req.query;

  const query = { status };
  const sortOptions = {};

  if (type) {
    query.type = type;
  }
  if (source) {
    query.source = source;
  }
  if (tags) {
    query.tags = { $in: tags.split(',').map(tag => tag.trim().toLowerCase()) };
  }
  if (keywords) {
    query.keywords = { $in: keywords.split(',').map(keyword => keyword.trim().toLowerCase()) };
  }
  if (minRelevance) {
    query.relevanceScore = { $gte: parseInt(minRelevance) };
  }
  if (maxAgeDays) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(maxAgeDays));
    query.publishedAt = { $gte: cutoffDate };
  }

  // Handle sorting
  sortOptions[sort] = parseInt(order);

  const skip = (parseInt(page) - 1) * parseInt(limit);

  let contents;
  let total;

  if (search) {
    // If a search query is provided, use the text search functionality
    const searchResults = await Content.search(search, {
      page: parseInt(page),
      limit: parseInt(limit),
      type,
      source,
      status
    });
    contents = searchResults.contents;
    total = searchResults.pagination.total;
  } else {
    // Otherwise, use standard find with filters
    [contents, total] = await Promise.all([
      Content.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Content.countDocuments(query)
    ]);
  }

  res.status(200).json({
    success: true,
    data: contents,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
      hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
      hasPrev: parseInt(page) > 1
    }
  });
});

/**
 * @desc    Get content by type with pagination (deprecated, use /api/content?type=...)
 * @route   GET /api/content/type/:type
 * @access  Public
 */
exports.getContentByType = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { page = 1, limit = 20, sort = 'publishedAt', order = -1, status = 'active' } = req.query;

  const { contents, pagination } = await Content.findByType(type, {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { [sort]: parseInt(order) },
    status
  });

  if (!contents || contents.length === 0) {
    throw new NotFoundError(`No content found for type: ${type}`);
  }

  res.status(200).json({
    success: true,
    data: contents,
    pagination
  });
});

/**
 * @desc    Get single content item by ID
 * @route   GET /api/content/:id
 * @access  Public
 */
exports.getContentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const content = await Content.findById(id).lean();

  if (!content) {
    throw new NotFoundError(`Content with ID ${id}`);
  }

  // Increment views (consider making this less frequent or using a separate service)
  const updatedContent = await Content.findById(id); // Re-fetch to allow update
  if (updatedContent) {
    updatedContent.metrics.views = (updatedContent.metrics.views || 0) + 1;
    await updatedContent.save();
    logger.verbose(`Content ${id} views incremented.`);
  }

  res.status(200).json({
    success: true,
    data: content
  });
});

/**
 * @desc    Get aggregated content statistics
 * @route   GET /api/content/stats/overview
 * @access  Public
 */
exports.getContentStats = asyncHandler(async (req, res) => {
  const stats = await Content.getStats();
  res.status(200).json({
    success: true,
    data: stats
  });
});

// ===========================================
// Content Management (Admin Only - Placeholder)
// ===========================================

/**
 * @desc    Delete content by ID
 * @route   DELETE /api/content/:id
 * @access  Private (Admin Only)
 */
exports.deleteContent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const content = await Content.findByIdAndDelete(id);

  if (!content) {
    throw new NotFoundError(`Content with ID ${id}`);
  }

  logger.info(`Content with ID ${id} deleted.`);
  res.status(200).json({
    success: true,
    message: `Content with ID ${id} successfully deleted.`,
    data: null
  });
});

/**
 * @desc    Update content status (e.g., to 'archived', 'flagged')
 * @route   PATCH /api/content/:id/status
 * @access  Private (Admin Only)
 */
exports.updateContentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['active', 'archived', 'deleted', 'flagged'].includes(status)) {
    throw new APIError('Invalid status provided.', 400, 'INVALID_STATUS');
  }

  const content = await Content.findByIdAndUpdate(
    id,
    { $set: { status, lastUpdated: new Date() } },
    { new: true, runValidators: true }
  );

  if (!content) {
    throw new NotFoundError(`Content with ID ${id}`);
  }

  logger.info(`Content ${id} status updated to ${status}.`);
  res.status(200).json({
    success: true,
    message: `Content ${id} status updated to ${status}.`,
    data: content
  });
});

/**
 * @desc    Manually trigger cleanup of old content
 * @route   POST /api/content/cleanup
 * @access  Private (Admin Only)
 */
exports.triggerContentCleanup = asyncHandler(async (req, res) => {
  const maxAgeDays = parseInt(process.env.CONTENT_MAX_AGE_DAYS) || 90;
  const deletedCount = await Content.cleanup(maxAgeDays);
  
  logger.info(`Manual content cleanup triggered. Deleted ${deletedCount} items older than ${maxAgeDays} days.`);
  res.status(200).json({
    success: true,
    message: `Cleanup completed. Deleted ${deletedCount} items older than ${maxAgeDays} days.`,
    data: { deletedCount }
  });
});