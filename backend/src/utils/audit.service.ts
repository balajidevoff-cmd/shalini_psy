import { prisma } from '../database/prisma';

export interface AuditLogParams {
  userId?: string;
  userEmail?: string;
  action: string;
  entityType: string;
  entityId?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

export class AuditService {
  static async log(params: AuditLogParams) {
    try {
      await prisma.auditLog.create({
        data: {
          userId: params.userId,
          userEmail: params.userEmail,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          ipAddress: params.ipAddress,
          metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        },
      });
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }
}
