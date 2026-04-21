import express from 'express';
import { registerRoutes } from './routes/routes.js';
import { connectToMongo } from './db.cache.connection/connection.mongo.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { ResponseHandler } from './utility/response.handler.js';
import logger from '../logger.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const startServer = async () => {
  try {
    const app = express();
    await connectToMongo();
    // await connectToRedis();
    registerRoutes(app);

    app.get('/health', (req, res) => {
      res.send(new ResponseHandler('OK'));
    });

    // Serve static files (like widget.js)
    app.use(express.static(path.join(__dirname, 'public')));

    const port = process.env.PORT || 3000;
    const host = '0.0.0.0';

    app.listen(Number(port), host, () => {
      logger.info(`server is listening on port : ${port}`);
    });
  } catch (error) {
    logger.error('Error starting server', error);
    process.exit(1);
  }
};
