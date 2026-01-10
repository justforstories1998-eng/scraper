/**
 * Content Routes
 * 
 * Defines API endpoints for retrieving and managing scraped content.
 */

const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { readOnlyLimiter } = require('../utils/rateLimiter'); // Import the read-only API limiter

// ===========================================
// Public Content Endpoints (Read-Only)
// ===========================================

/**
 * @route   GET /api/content
 * @desc    Get all scraped content with optional filtering, search, and pagination
 * @access  Public
 */
router.get('/', readOnlyLimiter, contentController.getAllContent);

/**
 * @route   GET /api/content/type/:type
 * @desc    Get content by type with pagination (DEPRECATED: Use /api/content?type=...)
 * @access  Public
 */
router.get('/type/:type', readOnlyLimiter, contentController.getContentByType);

/**
 * @route   GET /api/content/:id
 * @desc    Get a single content item by ID
 * @access  Public
 */
router.get('/:id', readOnlyLimiter, contentController.getContentById);

/**
 * @route   GET /api/content/stats/overview
 * @desc    Get aggregated content statistics
 * @access  Public
 */
router.get('/stats/overview', readOnlyLimiter, contentController.getContentStats);

// ===========================================
// Admin Content Endpoints (Write/Delete - Placeholder for Auth)
// In a real application, these routes would be protected by authentication
// and authorization middleware (e.g., JWT token check, role-based access).
// ===========================================

/**
 * @route   DELETE /api/content/:id
 * @desc    Delete content by ID
 * @access  Private (Admin Only - Requires Auth)
 */
router.delete('/:id', contentController.deleteContent); // Add auth middleware here: authMiddleware.isAdmin,

/**
 * @route   PATCH /api/content/:id/status
 * @desc    Update content status (e.g., to 'archived', 'flagged')
 * @access  Private (Admin Only - Requires Auth)
 */
router.patch('/:id/status', contentController.updateContentStatus); // Add auth middleware here: authMiddleware.isAdmin,

/**
 * @route   POST /api/content/cleanup
 * @desc    Manually trigger cleanup of old content
 * @access  Private (Admin Only - Requires Auth)
 */
router.post('/cleanup', contentController.triggerContentCleanup); // Add auth middleware here: authMiddleware.isAdmin,

module.exports = router;