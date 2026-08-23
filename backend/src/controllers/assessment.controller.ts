import { Response } from 'express';
import { prisma } from '../database/prisma';
import { sendSuccess, sendError } from '../utils/api-response';
import { AuthenticatedRequest } from '../auth/auth.middleware';

export class AssessmentController {
  public static async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const { domainId, search, activeOnly = 'true' } = req.query;

      const where: any = {};
      if (activeOnly === 'true') where.active = true;
      if (domainId) where.domainId = domainId;
      if (search) {
        where.OR = [
          { name: { contains: String(search) } },
          { shortName: { contains: String(search) } },
        ];
      }

      const assessments = await prisma.assessment.findMany({
        where,
        include: {
          domain: true,
          versions: {
            where: { isCurrent: true },
            include: {
              _count: { select: { questions: true } },
              severityBands: { orderBy: { orderIndex: 'asc' } },
            },
          },
        },
        orderBy: { name: 'asc' },
      });

      return sendSuccess(res, assessments, 'Assessments fetched successfully');
    } catch (err: any) {
      return sendError(res, err.message, 'SERVER_ERROR', 500);
    }
  }

  public static async getDomains(req: AuthenticatedRequest, res: Response) {
    try {
      const domains = await prisma.assessmentDomain.findMany({
        include: {
          _count: { select: { assessments: true } },
        },
        orderBy: { orderIndex: 'asc' },
      });
      return sendSuccess(res, domains);
    } catch (err: any) {
      return sendError(res, err.message, 'SERVER_ERROR', 500);
    }
  }

  public static async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const assessment = await prisma.assessment.findUnique({
        where: { id },
        include: {
          domain: true,
          versions: {
            include: {
              questions: {
                orderBy: { orderIndex: 'asc' },
                include: { options: { orderBy: { orderIndex: 'asc' } } },
              },
              severityBands: { orderBy: { orderIndex: 'asc' } },
              scoringRules: true,
            },
          },
        },
      });

      if (!assessment) {
        return sendError(res, 'Assessment not found', 'NOT_FOUND', 404);
      }

      return sendSuccess(res, assessment);
    } catch (err: any) {
      return sendError(res, err.message, 'SERVER_ERROR', 500);
    }
  }
}
