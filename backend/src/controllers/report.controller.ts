import { Response } from 'express';
import { prisma } from '../database/prisma';
import { sendSuccess, sendError } from '../utils/api-response';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { ReportService } from '../reports/report.service';
import { AuditService } from '../utils/audit.service';

export class ReportController {
  public static async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const { patientId, page = '1', limit = '10' } = req.query;
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};
      if (patientId) where.patientId = patientId;

      const [reports, total] = await Promise.all([
        prisma.report.findMany({
          where,
          include: {
            patient: { select: { id: true, patientCode: true, firstName: true, lastName: true } },
            session: {
              select: {
                id: true,
                assessment: { select: { name: true, shortName: true } },
                score: { select: { rawScore: true, severity: true } },
                clinicalReview: { select: { riskLevel: true, finalClinicalImpression: true } },
              },
            },
          },
          orderBy: { generatedAt: 'desc' },
          skip,
          take: limitNum,
        }),
        prisma.report.count({ where }),
      ]);

      return sendSuccess(res, reports, 'Reports retrieved', 200, {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      });
    } catch (err: any) {
      return sendError(res, err.message, 'SERVER_ERROR', 500);
    }
  }

  public static async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const report = await prisma.report.findUnique({
        where: { id },
        include: {
          patient: {
            include: { contact: true, assignedPsychologist: true },
          },
          session: {
            include: {
              assessment: { include: { domain: true } },
              score: { include: { subscaleScores: true } },
              aiAnalysis: {
                include: {
                  suggestions: { where: { status: { in: ['ACCEPTED', 'MODIFIED'] } } },
                },
              },
              clinicalReview: { include: { psychologist: true } },
            },
          },
        },
      });

      if (!report) {
        return sendError(res, 'Report not found', 'NOT_FOUND', 404);
      }

      await AuditService.log({
        userId: req.user?.userId,
        userEmail: req.user?.email,
        action: 'REPORT_VIEWED',
        entityType: 'Report',
        entityId: id,
        ipAddress: req.ip,
      });

      return sendSuccess(res, report);
    } catch (err: any) {
      return sendError(res, err.message, 'SERVER_ERROR', 500);
    }
  }

  public static async downloadPdf(req: AuthenticatedRequest, res: Response) {
    try {
      const { sessionId } = req.params;

      const { pdfBuffer, reportNumber } = await ReportService.generatePdfReport(sessionId);

      await AuditService.log({
        userId: req.user?.userId,
        userEmail: req.user?.email,
        action: 'REPORT_DOWNLOADED_PDF',
        entityType: 'AssessmentSession',
        entityId: sessionId,
        ipAddress: req.ip,
        metadata: { reportNumber },
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${reportNumber}.pdf"`);
      return res.send(pdfBuffer);
    } catch (err: any) {
      return sendError(res, err.message, 'PDF_GENERATION_FAILED', 500);
    }
  }
}
