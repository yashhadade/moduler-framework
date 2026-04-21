import { connect } from 'mongoose';
import logger from '../../logger.js';

export const connectToMongo = async () => {
  try {
    const { MONGO_CONNECTION_URL } = process.env;
    await connect(MONGO_CONNECTION_URL || '');
    logger.info('connected to mongoDB');
    return true;
  } catch (error) {
    logger.error('Failed to Connect with MongoDB', error);
  }
};
