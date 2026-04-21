import express, { type Request, type Response, type NextFunction } from 'express';
import { json, urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { pathLogger } from './logger.js';

export const registerAppMiddleware = (app: express.Application) => {
  app.use(
    cors({
      origin: true, // Allow all origins
      credentials: true, // Allow cookies to be sent with requests
    })
  );
  app.use(json());
  app.use(urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(pathLogger);
  app.set('trust proxy', true);
  app.use((err: { code?: string }, req: Request, res: Response, next: NextFunction) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'PDF must be 10MB or less.' });
    }
    return next(err);
  });
};
