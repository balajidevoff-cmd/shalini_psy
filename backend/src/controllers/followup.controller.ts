import { Response } from 'express';
import { prisma } from '../database/prisma';
import { sendSuccess, sendError } from '../utils/api-response';
import { createFollowUpSchema } from '../validators/validators';
import { AuthenticatedRequest } from '../auth/auth.middleware';

export class FollowUpController {
  public static async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const { patientId, status } = req.query;

      const where: any = {};
      if (patientId) where.patientId = patientId as string;
      if (status) where.status = status as string;

      const followUps = await prisma.followUpPlan.findMany({
        where,
        include: {
          patient: { select: { id: true, patientCode: true, firstName: true, lastName: true, age: true, gender: true } },
          assignedClinician: { select: { id: true, firstName: true, lastName: true, title: true } },
        },
        orderBy: { scheduledDate: 'asc' },
      });

      return sendSuccess(res, followUps);
    } catch (err: any) {
      return sendError(res, err.message, 'SERVER_ERROR', 500);
    }
  }

  public static async create(req: AuthenticatedRequest, res: Response) {
    try {
      const parsed = createFollowUpSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Validation error', 'VALIDATION_ERROR', 400, parsed.error.errors);
      }

      const data = parsed.data;

      const followUp = await prisma.followUpPlan.create({
        data: {
          patientId: data.patientId,
          assignedClinicianId: data.assignedClinicianId || req.user?.userId,
          scheduledDate: new Date(data.scheduledDate),
          followUpType: data.followUpType,
          purpose: data.purpose,
          notes: data.notes,
          status: 'SCHEDULED',
        },
        include: {
          patient: true,
          assignedClinician: true,
        },
      });

      return sendSuccess(res, followUp, 'Follow-up appointment scheduled', 201);
    } catch (err: any) {
      return sendError(res, err.message, 'SERVER_ERROR', 500);
    }
  }

  public static async updateStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const updated = await prisma.followUpPlan.update({
        where: { id },
        data: {
          status: status,
          notes: notes !== undefined ? notes : undefined,
        },
      });

      return sendSuccess(res, updated, 'Follow-up status updated');
    } catch (err: any) {
      return sendError(res, err.message, 'SERVER_ERROR', 500);
    }
  }
}
