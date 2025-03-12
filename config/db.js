const mongoose = require('mongoose');
const winston = require('winston');

/**
 * Database connection using Singleton pattern
 * Only one instance of DB connection will be created throughout the application
 */
class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'database-service' },
      transports: [
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
      ],
    });
    
    Database.instance = this;
    return this;
  }

  /**
   * Connect to MongoDB
   */
  async connect() {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      
      this.logger.info(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      this.logger.error(`Error connecting to MongoDB: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect() {
    try {
      await mongoose.disconnect();
      this.logger.info('MongoDB Disconnected');
    } catch (error) {
      this.logger.error(`Error disconnecting from MongoDB: ${error.message}`);
    }
  }
}

module.exports = new Database(); 