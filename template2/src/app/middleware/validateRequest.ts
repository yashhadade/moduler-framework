import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';

/**
 * Optional: use in route handlers when you want strict typing for req.body.
 * After validateBody(schema), you can just use req.body directly; this type is for TypeScript only.
 */
export type ValidatedBodyRequest<T> = Request & { body: T };

export type ValidatedQueryRequest<T> = Request & { query: T };
export type ValidatedParamsRequest<T> = Request & { params: T };

function validateRequestPart<T>(
  schema: ZodType<T>,
  getPart: (req: Request) => unknown,
  setPart: (req: Request, value: T) => void
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(getPart(req));
      setPart(req, parsed);
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Validates req.body with the given Zod schema.
 * On success: replaces req.body with the parsed value and calls next().
 * On failure: passes ZodError to next() (handled by global errorHandler as 400).
 * In your handler, just use req.body — it is already validated and parsed.
 */
export function validateBody<T>(schema: ZodType<T>) {
  return validateRequestPart(
    schema,
    (req) => req.body,
    (req, value) => {
      req.body = value as Request['body'];
    }
  );
}

/**
 * Validates req.query. Use for GET request query strings.
 */
export function validateQuery<T>(schema: ZodType<T>) {
  return validateRequestPart(
    schema,
    (req) => req.query,
    (req, value) => {
      req.query = value as Request['query'];
    }
  );
}

/**
 * Validates req.params (e.g. :id). Use for route params.
 */
export function validateParams<T>(schema: ZodType<T>) {
  return validateRequestPart(
    schema,
    (req) => req.params,
    (req, value) => {
      req.params = value as Request['params'];
    }
  );
}
