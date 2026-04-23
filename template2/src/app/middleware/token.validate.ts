import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import { getPublicKey } from '../utility/key.generate.js';

/* =========================
   Custom Error Class
========================= */
export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/* =========================
   Excluded Path Class
========================= */
export class ExcludedPath {
  public url: string;
  public method: string;

  constructor(url: string, method: string) {
    this.url = url;
    this.method = method.toUpperCase();
  }
}

/* =========================
   JWT Payload Interface
========================= */
interface CustomJwtPayload extends JwtPayload {
  id: string;
  role: string;
}

/* =========================
   Token Validator Middleware
========================= */
export const tokenValidator =
  (excludedPaths: ExcludedPath[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      // 1️⃣ Skip excluded routes (use full path: baseUrl + path, e.g. /auth/login)
      const fullPath = (req.baseUrl || '') + (req.path === '/' ? '' : req.path);
      const normalize = (p: string) => (p.length > 1 ? p.replace(/\/+$/, '') : p);
      const reqPath = normalize(fullPath);
      const reqMethod = req.method.toUpperCase();
      const isExcluded = excludedPaths.some(
        (path) => normalize(path.url) === reqPath && path.method === reqMethod
      );
      if (isExcluded) return next();

      // 2️⃣ Get Authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError('Unauthorized: Token missing', 401));
      }

      const token = authHeader.split(' ')[1];

      // 3️⃣ Get Public Key
      const publicKey = getPublicKey();
      if (!publicKey) {
        return next(new AppError('Public key not found', 500));
      }

      // 4️⃣ Verify Token (includes expiry check if `exp` is set on token)
      const decoded = jwt.verify(token || '', publicKey) as CustomJwtPayload;

      // 5️⃣ Attach user info to response
      res.locals.userId = decoded.id;
      res.locals.role = decoded.role;

      next();
    } catch {
      next(new AppError('Unauthorized: Invalid token', 401));
    }
  };
