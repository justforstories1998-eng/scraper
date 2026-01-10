/**
 * Error Handler Middleware
 * 
 * Centralized error handling middleware for the Express application.
 * Provides consistent error responses and logging across all routes.
 */

const logger = require('../utils/logger');

// ===========================================
// Custom Error Classes
// ===========================================

/**
 * Base API Error class
 * Extends the built-in Error class with additional properties
 */
class APIError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error - 400 Bad Request
 */
class ValidationError extends APIError {
  constructor(message, errors = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

/**
 * Not Found Error - 404
 */
class NotFoundError extends APIError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

/**
 * Unauthorized Error - 401
 */
class UnauthorizedError extends APIError {
  constructor(message = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * Forbidden Error - 403
 */
class ForbiddenError extends APIError {
  constructor(message = 'Access forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * Conflict Error - 409
 */
class ConflictError extends APIError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * Rate Limit Error - 429
 */
class RateLimitError extends APIError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

/**
 * Scraping Error - 500
 */
class ScrapingError extends APIError {
  constructor(message, source = null) {
    super(message, 500, 'SCRAPING_ERROR');
    this.source = source;
  }
}

/**
 * Database Error - 500
 */
class DatabaseError extends APIError {
  constructor(message = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR');
  }
}

// ===========================================
// Error Response Formatter
// ===========================================

const formatErrorResponse = (error, includeStack = false) => {
  const response = {
    success: false,
    error: {
      message: error.message || 'An unexpected error occurred',
      code: error.errorCode || 'INTERNAL_ERROR',
      status: error.statusCode || 500
    }
  };

  // Include validation errors if present
  if (error.errors && Array.isArray(error.errors)) {
    response.error.details = error.errors;
  }

  // Include source for scraping errors
  if (error.source) {
    response.error.source = error.source;
  }

  // Include stack trace in development mode
  if (includeStack && process.env.NODE_ENV === 'development') {
    response.error.stack = error.stack;
  }

  return response;
};

// ===========================================
// MongoDB Error Handler
// ===========================================

const handleMongoDBError = (error) => {
  // Duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || 'field';
    const value = error.keyValue ? error.keyValue[field] : 'value';
    return new ConflictError(`Duplicate value for ${field}: ${value}`);
  }

  // Validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors || {}).map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));
    return new ValidationError('Validation failed', errors);
  }

  // Cast error (invalid ObjectId, etc.)
  if (error.name === 'CastError') {
    return new ValidationError(`Invalid ${error.path}: ${error.value}`);
  }

  // Document not found
  if (error.name === 'DocumentNotFoundError') {
    return new NotFoundError('Document');
  }

  return new DatabaseError(error.message);
};

// ===========================================
// Axios Error Handler
// ===========================================

const handleAxiosError = (error) => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const message = error.response.data?.message || error.message;

    if (status === 404) {
      return new NotFoundError('External resource');
    }
    if (status === 429) {
      return new RateLimitError('Rate limited by external service');
    }
    if (status >= 500) {
      return new ScrapingError(`External service error: ${message}`, error.config?.url);
    }

    return new APIError(message, status);
  }

  if (error.request) {
    // Request made but no response received
    return new ScrapingError('No response from external service', error.config?.url);
  }

  // Request setup error
  return new ScrapingError(`Request failed: ${error.message}`);
};

// ===========================================
// Main Error Handler Middleware
// ===========================================

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Log the error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Handle MongoDB errors
  if (err.name && ['MongoError', 'MongoServerError', 'ValidationError', 'CastError', 'DocumentNotFoundError'].includes(err.name)) {
    error = handleMongoDBError(err);
  }

  // Handle Axios errors
  if (err.isAxiosError) {
    error = handleAxiosError(err);
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error = new ValidationError('Invalid JSON in request body');
  }

  // Handle Mongoose timeout errors
  if (err.name === 'MongooseServerSelectionError') {
    error = new DatabaseError('Database connection timeout');
  }

  // Default to 500 if status code not set
  const statusCode = error.statusCode || 500;
  
  // Don't expose internal error details in production
  if (statusCode === 500 && process.env.NODE_ENV === 'production' && !error.isOperational) {
    error = new APIError('An unexpected error occurred', 500);
  }

  // Format and send error response
  const includeStack = process.env.NODE_ENV === 'development';
  const response = formatErrorResponse(error, includeStack);

  res.status(statusCode).json(response);
};

// ===========================================
// Async Handler Wrapper
// ===========================================

/**
 * Wraps async route handlers to catch errors
 * Usage: router.get('/route', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ===========================================
// Not Found Handler
// ===========================================

const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl}`);
  next(error);
};

// ===========================================
// Exports
// ===========================================

module.exports = errorHandler;

module.exports.APIError = APIError;
module.exports.ValidationError = ValidationError;
module.exports.NotFoundError = NotFoundError;
module.exports.UnauthorizedError = UnauthorizedError;
module.exports.ForbiddenError = ForbiddenError;
module.exports.ConflictError = ConflictError;
module.exports.RateLimitError = RateLimitError;
module.exports.ScrapingError = ScrapingError;
module.exports.DatabaseError = DatabaseError;

module.exports.asyncHandler = asyncHandler;
module.exports.notFoundHandler = notFoundHandler;
module.exports.formatErrorResponse = formatErrorResponse;