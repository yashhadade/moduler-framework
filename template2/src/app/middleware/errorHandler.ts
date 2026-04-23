import type { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from '../utility/response.handler.js';
import { ZodError } from 'zod';
import logger from '../../logger.js';
/** Thrown response objects (e.g. CLIENT_RESPONSES.CLIENT_NOT_FOUND) and Error-like objects */
interface ErrorWithStatus {
  statusCode?: number;
  message?: string;
}

function formatZodMessage(error: ZodError): string {
  return error.issues.map((issue) => issue.message).join(', ');
}

export const errorHandler = (
  err: ErrorWithStatus | Error | ZodError | string,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Error in request', err);

  let statusCode = 500;
  let message: string = 'Internal Server Error';

  if (err instanceof ZodError) {
    statusCode = 400;
    message = formatZodMessage(err);
  } else if (typeof err === 'string') {
    statusCode = 400;
    message = err;
  } else if (err && typeof err === 'object' && 'statusCode' in err && 'message' in err) {
    statusCode = err.statusCode ?? 500;
    message = err.message ?? 'Internal Server Error';
  } else if (err instanceof Error) {
    statusCode = (err as ErrorWithStatus).statusCode ?? 500;
    message = err.message ?? 'Internal Server Error';
  }

  res.status(statusCode).json(new ResponseHandler(null, message));
};
