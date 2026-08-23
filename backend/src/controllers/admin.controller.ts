import { Response } from 'express';
import { prisma } from '../database/prisma';
import { sendSuccess, sendError } from '../utils/api-response';
import { AuthenticatedRequest } from '../auth/auth.middleware';

export class AdminController {
  public static async getUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          title: true,
          licenseNumber: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          _count: { select: { assignedPatients: true, clinicalReviews: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return sendSuccess(res, users);
    } catch (err: any) {
      return sendError(res, err.message, 'SERVER_ERROR', 500);
    }
  }

  public static async updateUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { role, status, title, licenseNumber, firstName, lastName } = req.body;

      const updated = await prisma.user.update({
        where: { id },
        data: {
          role,
          status,
          title,
          licenseNumber,
          firstName,
          lastName,
        },
      });

      return sendSuccess(res, updated, 'User updated successfully');
    } catch (err: any) {
      return sendError(res, err.message, 'SERVER_ERROR', 500);
    }
  }

  public static async getAuditLogs(req: AuthenticatedRequest, res: Response) {
    try {
      const { action, entityType, page = '1', limit = '20' } = req.query;
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};
      if (action) where.action = action;
      if (entityType) where.entityType = entityType;

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          include: {
            user: { select: { id: true, firstName: true, lastName: true, role: true } },
          },
          orderBy: { timestamp: 'desc' },
          skip,
          take: limitNum,
        }),
        prisma.auditLog.count({ where }),
      ]);

      return sendSuccess(res, logs, 'Audit logs retrieved', 200, {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      });
    } catch (err: any) {
      return sendError(res, err.message, 'SERVER_ERROR', 500);
    }
  }
}
