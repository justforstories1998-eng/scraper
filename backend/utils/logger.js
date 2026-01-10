/**
 * Logger Utility
 * 
 * Centralized logging configuration using Winston.
 * Provides consistent logging across the application with
 * support for multiple transports (console, file).
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// ===========================================
// Log Directory Setup
// ===========================================

const logDir = path.join(__dirname, '..', 'logs');

// Create logs directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// ===========================================
// Log Levels Configuration
// ===========================================

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'cyan',
  debug: 'blue',
  silly: 'gray'
};

// Add colors to winston
winston.addColors(colors);

// ===========================================
// Custom Log Format
// ===========================================

// Format for console output (colorized)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    
    // Append metadata if present
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    
    return msg;
  })
);

// Format for file output (JSON)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Format for file output (readable text)
const textFileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack, ...metadata }) => {
    let msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (stack) {
      msg += `\n${stack}`;
    }
    
    if (Object.keys(metadata).length > 0) {
      msg += `\n${JSON.stringify(metadata, null, 2)}`;
    }
    
    return msg;
  })
);

// ===========================================
// Determine Log Level
// ===========================================

const getLogLevel = () => {
  const env = process.env.NODE_ENV || 'development';
  const configuredLevel = process.env.LOG_LEVEL;
  
  if (configuredLevel && levels[configuredLevel] !== undefined) {
    return configuredLevel;
  }
  
  // Default levels based on environment
  switch (env) {
    case 'production':
      return 'info';
    case 'test':
      return 'error';
    default:
      return 'debug';
  }
};

// ===========================================
// Create Transports
// ===========================================

const transports = [];

// Console transport (always enabled)
transports.push(
  new winston.transports.Console({
    format: consoleFormat,
    level: getLogLevel()
  })
);

// File transports (enabled in non-test environments)
if (process.env.NODE_ENV !== 'test') {
  // Error log file
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    })
  );

  // Combined log file
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: fileFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    })
  );

  // HTTP requests log file
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'http.log'),
      level: 'http',
      format: textFileFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 3,
      tailable: true
    })
  );

  // Scraping activity log file
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'scraping.log'),
      format: textFileFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    })
  );
}

// ===========================================
// Create Logger Instance
// ===========================================

const logger = winston.createLogger({
  levels,
  level: getLogLevel(),
  transports,
  exitOnError: false,
  
  // Handle exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
      format: fileFormat
    })
  ],
  
  // Handle promise rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log'),
      format: fileFormat
    })
  ]
});

// ===========================================
// Custom Logging Methods
// ===========================================

/**
 * Log scraping activity
 */
logger.scrape = (message, metadata = {}) => {
  logger.info(`[SCRAPER] ${message}`, { type: 'scraping', ...metadata });
};

/**
 * Log scraping success
 */
logger.scrapeSuccess = (source, itemCount, duration) => {
  logger.info(`[SCRAPER] Successfully scraped ${itemCount} items from ${source}`, {
    type: 'scraping',
    source,
    itemCount,
    duration: `${duration}ms`,
    status: 'success'
  });
};

/**
 * Log scraping failure
 */
logger.scrapeError = (source, error) => {
  logger.error(`[SCRAPER] Failed to scrape ${source}: ${error.message}`, {
    type: 'scraping',
    source,
    status: 'error',
    error: error.message,
    stack: error.stack
  });
};

/**
 * Log database operations
 */
logger.db = (operation, collection, details = {}) => {
  logger.debug(`[DB] ${operation} on ${collection}`, {
    type: 'database',
    operation,
    collection,
    ...details
  });
};

/**
 * Log API requests
 */
logger.api = (method, path, statusCode, duration) => {
  const level = statusCode >= 400 ? 'warn' : 'http';
  logger[level](`[API] ${method} ${path} ${statusCode} - ${duration}ms`, {
    type: 'api',
    method,
    path,
    statusCode,
    duration
  });
};

/**
 * Log performance metrics
 */
logger.performance = (operation, duration, metadata = {}) => {
  logger.verbose(`[PERF] ${operation} completed in ${duration}ms`, {
    type: 'performance',
    operation,
    duration,
    ...metadata
  });
};

/**
 * Create a child logger with preset metadata
 */
logger.child = (metadata) => {
  return {
    info: (message, extra = {}) => logger.info(message, { ...metadata, ...extra }),
    error: (message, extra = {}) => logger.error(message, { ...metadata, ...extra }),
    warn: (message, extra = {}) => logger.warn(message, { ...metadata, ...extra }),
    debug: (message, extra = {}) => logger.debug(message, { ...metadata, ...extra }),
    verbose: (message, extra = {}) => logger.verbose(message, { ...metadata, ...extra })
  };
};

// ===========================================
// Stream for Morgan HTTP Logger (Optional)
// ===========================================

logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

// ===========================================
// Utility Functions
// ===========================================

/**
 * Get all log files
 */
logger.getLogFiles = () => {
  try {
    const files = fs.readdirSync(logDir);
    return files.map(file => ({
      name: file,
      path: path.join(logDir, file),
      size: fs.statSync(path.join(logDir, file)).size
    }));
  } catch (error) {
    return [];
  }
};

/**
 * Clear all log files
 */
logger.clearLogs = () => {
  try {
    const files = fs.readdirSync(logDir);
    files.forEach(file => {
      fs.writeFileSync(path.join(logDir, file), '');
    });
    logger.info('All log files cleared');
    return true;
  } catch (error) {
    logger.error('Failed to clear log files:', error);
    return false;
  }
};

/**
 * Read recent log entries
 */
logger.getRecentLogs = (filename = 'combined.log', lines = 100) => {
  try {
    const filePath = path.join(logDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return [];
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const allLines = content.split('\n').filter(line => line.trim());
    
    return allLines.slice(-lines).map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return { message: line };
      }
    });
  } catch (error) {
    logger.error('Failed to read log file:', error);
    return [];
  }
};

// ===========================================
// Export Logger
// ===========================================

module.exports = logger;