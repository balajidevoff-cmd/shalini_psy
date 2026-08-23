import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload, RoleType } from './jwt';
import { sendError } from '../utils/api-response';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function requireAuth() {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendError(res, 'Authentication token missing or invalid', 'UNAUTHORIZED', 401);
      }

      const token = authHeader.split(' ')[1];
      const payload = verifyAccessToken(token);
      req.user = payload;
      return next();
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return sendError(res, 'Session expired. Please log in again.', 'TOKEN_EXPIRED', 401);
      }
      return sendError(res, 'Invalid authentication token', 'UNAUTHORIZED', 401);
    }
  };
}

export function requireRole(roles: RoleType[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Requires one of roles: ${roles.join(', ')}`,
        'FORBIDDEN',
        403
      );
    }

    return next();
  };
}

export function requirePsychologistOrAdmin() {
  return requireRole(['ADMIN', 'PSYCHOLOGIST']);
}

export function requireAssessorOrClinician() {
  return requireRole(['ADMIN', 'PSYCHOLOGIST', 'ASSESSOR']);
}
