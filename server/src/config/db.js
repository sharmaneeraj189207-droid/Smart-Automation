import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from './env.js';

let mongod = null;

export const connectDB = async () => {
  try {
    // Attempt connecting to the configured MongoDB URI with a short timeout
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 2500
    });
    console.log(`[Database] Connected successfully to MongoDB: ${mongoose.connection.host}`);
    return mongoose.connection;
  } catch (error) {
    console.warn(`[Database] Could not connect to primary MongoDB (${config.mongodbUri}): ${error.message}`);
    
    // In development or test environments, fallback to MongoMemoryServer
    if (!config.isProduction) {
      try {
        console.log('[Database] Starting in-memory MongoDB server for seamless zero-config operation...');
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        await mongoose.connect(uri);
        console.log(`[Database] Connected to In-Memory MongoDB at: ${uri}`);
        return mongoose.connection;
      } catch (memError) {
        console.error('[Database] Failed to start in-memory MongoDB:', memError);
        throw memError;
      }
    } else {
      throw error;
    }
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
    console.log('[Database] Disconnected from MongoDB');
  } catch (err) {
    console.error('[Database] Error disconnecting:', err);
  }
};
