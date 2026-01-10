/**
 * MongoDB Database Configuration
 * 
 * This module handles the connection to MongoDB using Mongoose.
 * It supports both MongoDB Atlas (cloud) and local MongoDB installations.
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

// ===========================================
// MongoDB Connection Options
// ===========================================

const connectionOptions = {
  // Maximum number of connections in the connection pool
  maxPoolSize: 10,
  
  // Minimum number of connections in the connection pool
  minPoolSize: 2,
  
  // Server selection timeout in milliseconds
  serverSelectionTimeoutMS: 5000,
  
  // Socket timeout in milliseconds
  socketTimeoutMS: 45000,
  
  // Heartbeat frequency in milliseconds
  heartbeatFrequencyMS: 10000,
  
  // Time to wait before retrying a failed connection
  retryWrites: true,
  
  // Write concern
  w: 'majority'
  
  // NOTE: useNewUrlParser and useUnifiedTopology are removed
  // as they are deprecated in MongoDB Driver 4.0.0+
};

// ===========================================
// Connection State Tracking
// ===========================================

let isConnected = false;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 5;
const RETRY_DELAY = 5000; // 5 seconds

// ===========================================
// Connect to MongoDB
// ===========================================

const connectDB = async () => {
  // Check if already connected
  if (isConnected && mongoose.connection.readyState === 1) {
    logger.info('MongoDB is already connected');
    return mongoose.connection;
  }

  const mongoURI = process.env.MONGODB_URI;

  // Validate MongoDB URI
  if (!mongoURI) {
    logger.error('MongoDB URI is not defined in environment variables');
    logger.info('Please set MONGODB_URI in your .env file');
    logger.info('Example for MongoDB Atlas: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/webmethods-scraper');
    logger.info('Example for Local MongoDB: mongodb://localhost:27017/webmethods-scraper');
    throw new Error('MongoDB URI is required');
  }

  try {
    connectionAttempts++;
    logger.info(`Attempting to connect to MongoDB (attempt ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS})...`);

    // Connect to MongoDB
    const conn = await mongoose.connect(mongoURI, connectionOptions);

    isConnected = true;
    connectionAttempts = 0;

    logger.info(`✅ MongoDB Connected Successfully`);
    logger.info(`   Host: ${conn.connection.host}`);
    logger.info(`   Database: ${conn.connection.name}`);
    logger.info(`   Port: ${conn.connection.port || 'default'}`);

    return conn;

  } catch (error) {
    isConnected = false;
    
    logger.error(`❌ MongoDB Connection Error: ${error.message}`);

    // Provide helpful error messages based on error type
    if (error.message.includes('ECONNREFUSED')) {
      logger.error('Connection refused. Please check if MongoDB is running.');
      logger.info('For local MongoDB: sudo systemctl start mongod (Linux) or net start MongoDB (Windows)');
    } else if (error.message.includes('authentication failed')) {
      logger.error('Authentication failed. Please check your username and password.');
    } else if (error.message.includes('ETIMEDOUT')) {
      logger.error('Connection timed out. Please check your network and MongoDB URI.');
    } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
      logger.error('Host not found. Please check your MongoDB URI.');
    }

    // Retry connection if not exceeded max attempts
    if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
      logger.info(`Retrying connection in ${RETRY_DELAY / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectDB();
    } else {
      logger.error(`Failed to connect after ${MAX_CONNECTION_ATTEMPTS} attempts`);
      throw error;
    }
  }
};

// ===========================================
// MongoDB Event Handlers
// ===========================================

mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected to MongoDB');
  isConnected = true;
});

mongoose.connection.on('error', (err) => {
  logger.error(`Mongoose connection error: ${err.message}`);
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose disconnected from MongoDB');
  isConnected = false;
});

mongoose.connection.on('reconnected', () => {
  logger.info('Mongoose reconnected to MongoDB');
  isConnected = true;
});

// ===========================================
// Close Connection
// ===========================================

const closeDB = async () => {
  try {
    await mongoose.connection.close();
    isConnected = false;
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error(`Error closing MongoDB connection: ${error.message}`);
    throw error;
  }
};

// ===========================================
// Get Connection Status
// ===========================================

const getConnectionStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  return {
    isConnected,
    state: states[mongoose.connection.readyState] || 'unknown',
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null
  };
};

// ===========================================
// Create Indexes
// ===========================================

const createIndexes = async () => {
  try {
    logger.info('Creating database indexes...');
    
    // Get all registered models
    const models = mongoose.modelNames();
    
    for (const modelName of models) {
      const model = mongoose.model(modelName);
      await model.createIndexes();
      logger.info(`  ✓ Indexes created for ${modelName}`);
    }
    
    logger.info('All database indexes created successfully');
  } catch (error) {
    logger.error(`Error creating indexes: ${error.message}`);
    throw error;
  }
};

// ===========================================
// Database Utilities
// ===========================================

const dropDatabase = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot drop database in production environment');
  }
  
  try {
    await mongoose.connection.dropDatabase();
    logger.info('Database dropped successfully');
  } catch (error) {
    logger.error(`Error dropping database: ${error.message}`);
    throw error;
  }
};

const getStats = async () => {
  try {
    const stats = await mongoose.connection.db.stats();
    return {
      database: stats.db,
      collections: stats.collections,
      documents: stats.objects,
      dataSize: `${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`,
      storageSize: `${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`,
      indexes: stats.indexes,
      indexSize: `${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`
    };
  } catch (error) {
    logger.error(`Error getting database stats: ${error.message}`);
    throw error;
  }
};

// ===========================================
// Exports
// ===========================================

module.exports = connectDB;

module.exports.closeDB = closeDB;
module.exports.getConnectionStatus = getConnectionStatus;
module.exports.createIndexes = createIndexes;
module.exports.dropDatabase = dropDatabase;
module.exports.getStats = getStats;