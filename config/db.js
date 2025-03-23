const mongoose = require('mongoose');
const winston = require('winston');

class Database {
  constructor() {
    if (!Database.instance) {
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
    }
    
    return Database.instance;
  }

  async connect() {
    if (!this.connection) {
      try {
        this.connection = await mongoose.connect(process.env.MONGO_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });

        this.logger.info(`MongoDB Connected: ${this.connection.connection.host}`);
      } catch (error) {
        this.logger.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
      }
    }
    return this.connection;
  }

  async disconnect() {
    if (this.connection) {
      try {
        await mongoose.disconnect();
        this.logger.info('MongoDB Disconnected');
        this.connection = null;
      } catch (error) {
        this.logger.error(`Error disconnecting from MongoDB: ${error.message}`);
      }
    }
  }
}

module.exports = new Database();