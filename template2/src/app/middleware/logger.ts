import type { Request, Response, NextFunction } from 'express';
import logger from '../../logger.js';

export const pathLogger = (req: Request, res: Response, next: NextFunction): void => {
  logger.info(`${req.method}: ${req.originalUrl}`);
  next();
};
