import type { Request, Response, NextFunction } from 'express';
import { connectToRedis } from '../db.cache.connection/connection.redis.js';
import { getClientIp } from './clientIp.getter.js';
import { AppError } from './token.validate.js';

export const rateLimiter =
  (limit: number, windowMs: number) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      const apiKeyId = res.locals.apiKeyId || 'public';
      const ip = getClientIp(req);

      const routeKey = `${req.method}:${req.baseUrl}${req.route?.path}`;

      const redisKey = `rate:${apiKeyId}:${routeKey}:${ip}`;

      const redis = await connectToRedis();
      const current = await redis.incr(redisKey);

      if (current === 1) {
        await redis.pexpire(redisKey, windowMs);
      }

      if (current > limit) {
        return next(
          new AppError(`Rate limit exceeded. Max ${limit} requests in ${windowMs}ms`, 429)
        );
      }

      next();
    } catch (_err) {
      // ⚠️ Fail open if Redis fails
      next();
    }
  };
