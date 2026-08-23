import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/api-response';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Unhandled API Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';

  return sendError(res, message, errorCode, statusCode);
}
