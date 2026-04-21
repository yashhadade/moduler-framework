import type { NextFunction, Request, Response } from 'express';
import { Role } from '../utility/constant.js';
export const roleValidator = (allowedRoles: (typeof Role)[keyof typeof Role][]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = res.locals.role; // Attached by tokenValidator

    if (!allowedRoles.includes(userRole as (typeof Role)[keyof typeof Role])) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN_ACCESS', message: 'You do not have permission for this action.' },
      });
    }
    next();
  };
};
