/**
 * webMethods Scraper - Main Server Entry Point
 * 
 * This is the main server file that initializes the Express application,
 * connects to MongoDB, sets up middleware, routes, and scheduled tasks.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const cron = require('node-cron');
const path = require('path');

// Import custom modules
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./utils/rateLimiter');

// Import routes
const scraperRoutes = require('./routes/scraperRoutes');
const contentRoutes = require('./routes/contentRoutes');

// Import scraper manager for scheduled tasks
const scraperManager = require('./scrapers/scraperManager');

// Initialize Express app
const app = express();

// ===========================================
// Security Middleware
// ===========================================

// Helmet helps secure Express apps by setting various HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Disable for development, enable in production
}));

// ===========================================
// CORS Configuration
// ===========================================

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// ===========================================
// Body Parsing Middleware
// ===========================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===========================================
// Request Logging Middleware
// ===========================================

app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});

// ===========================================
// Rate Limiting
// ===========================================

app.use('/api/', apiLimiter);

// ===========================================
// Health Check Endpoint
// ===========================================

app.get('/health', (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
  
  res.status(200).json(healthCheck);
});

// ===========================================
// API Info Endpoint
// ===========================================

app.get('/api', (req, res) => {
  res.json({
    name: 'webMethods Scraper API',
    version: '1.0.0',
    description: 'API for scraping and managing webMethods-related content',
    endpoints: {
      health: 'GET /health',
      content: {
        getAll: 'GET /api/content',
        getById: 'GET /api/content/:id',
        getByType: 'GET /api/content/type/:type',
        search: 'GET /api/content/search?q=query',
        stats: 'GET /api/content/stats/overview',
        delete: 'DELETE /api/content/:id'
      },
      scraper: {
        status: 'GET /api/scraper/status',
        start: 'POST /api/scraper/start',
        startByType: 'POST /api/scraper/start/:type',
        stop: 'POST /api/scraper/stop',
        logs: 'GET /api/scraper/logs'
      }
    }
  });
});

// ===========================================
// API Routes
// ===========================================

app.use('/api/content', contentRoutes);
app.use('/api/scraper', scraperRoutes);

// ===========================================
// 404 Handler
// ===========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// ===========================================
// Error Handling Middleware
// ===========================================

app.use(errorHandler);

// ===========================================
// Database Connection & Server Startup
// ===========================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info('MongoDB connected successfully');

    // Start the Express server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      logger.info(`📍 API available at http://localhost:${PORT}/api`);
      logger.info(`❤️  Health check at http://localhost:${PORT}/health`);
    });

    // ===========================================
    // Scheduled Scraping Tasks
    // ===========================================

    if (process.env.AUTO_SCRAPE_ENABLED === 'true') {
      const cronSchedule = process.env.SCRAPE_CRON_SCHEDULE || '0 */6 * * *';
      
      // Validate cron expression
      if (cron.validate(cronSchedule)) {
        cron.schedule(cronSchedule, async () => {
          logger.info('🔄 Starting scheduled scraping task...');
          try {
            await scraperManager.runAllScrapers();
            logger.info('✅ Scheduled scraping completed successfully');
          } catch (error) {
            logger.error('❌ Scheduled scraping failed:', error.message);
          }
        });
        
        logger.info(`⏰ Automatic scraping scheduled: ${cronSchedule}`);
      } else {
        logger.warn(`Invalid cron schedule: ${cronSchedule}. Automatic scraping disabled.`);
      }
    } else {
      logger.info('⏸️  Automatic scraping is disabled');
    }

    // ===========================================
    // Graceful Shutdown
    // ===========================================

    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      // Stop accepting new connections
      server.close(async () => {
        logger.info('HTTP server closed');
        
        // Stop any running scrapers
        try {
          await scraperManager.stopAllScrapers();
          logger.info('All scrapers stopped');
        } catch (error) {
          logger.error('Error stopping scrapers:', error.message);
        }
        
        // Close MongoDB connection
        try {
          await mongoose.connection.close();
          logger.info('MongoDB connection closed');
        } catch (error) {
          logger.error('Error closing MongoDB connection:', error.message);
        }
        
        logger.info('Graceful shutdown completed');
        process.exit(0);
      });
      
      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

  } catch (error) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

// Export app for testing purposes
module.exports = app;