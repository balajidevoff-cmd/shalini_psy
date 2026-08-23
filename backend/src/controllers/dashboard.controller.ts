import { Response } from 'express';
import { prisma } from '../database/prisma';
import { sendSuccess, sendError } from '../utils/api-response';
import { AuthenticatedRequest } from '../auth/auth.middleware';

export class DashboardController {
  public static async getMetrics(req: AuthenticatedRequest, res: Response) {
    try {
      const [
        totalPatients,
        activeAssessments,
        completedSessions,
        pendingReviews,
        highRiskFlags,
        followUpsDue,
        reportsGenerated,
      ] = await Promise.all([
        prisma.patient.count(),
        prisma.assessmentSession.count({ where: { status: 'IN_PROGRESS' } }),
        prisma.assessmentSession.count({ where: { status: { in: ['COMPLETED', 'REVIEWED', 'FINALIZED'] } } }),
        prisma.assessmentSession.count({ where: { status: 'UNDER_REVIEW' } }),
        prisma.assessmentScore.count({ where: { hasRiskFlag: true } }),
        prisma.followUpPlan.count({ where: { status: 'SCHEDULED' } }),
        prisma.report.count(),
      ]);

      // Severity Distribution from AssessmentScores
      const allScores = await prisma.assessmentScore.findMany({
        select: { severity: true, severityColor: true },
      });

      const severityCounts: Record<string, { count: number; color: string }> = {};
      for (const s of allScores) {
        if (!severityCounts[s.severity]) {
          severityCounts[s.severity] = { count: 0, color: s.severityColor || '#3B82F6' };
        }
        severityCounts[s.severity].count++;
      }

      const severityDistribution = Object.entries(severityCounts).map(([label, data]) => ({
        name: label,
        count: data.count,
        color: data.color,
      }));

      // Domain distribution
      const domains = await prisma.assessmentDomain.findMany({
        include: {
          _count: { select: { assessments: true } },
        },
      });

      const domainDistribution = domains.map((d) => ({
        domain: d.name,
        count: d._count.assessments,
      }));

      // Recent Activity
      const recentSessions = await prisma.assessmentSession.findMany({
        include: {
          patient: { select: { patientCode: true, firstName: true, lastName: true } },
          assessment: { select: { name: true, shortName: true } },
          score: { select: { severity: true, rawScore: true, hasRiskFlag: true } },
          clinicalReview: { select: { riskLevel: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      return sendSuccess(res, {
        cards: {
          totalPatients,
          activeAssessments,
          completedSessions,
          pendingReviews,
          highRiskFlags,
          followUpsDue,
          reportsGenerated,
        },
        charts: {
          severityDistribution,
          domainDistribution,
          completionTrend: [
            { month: 'Jan', completed: 12, screened: 15 },
            { month: 'Feb', completed: 18, screened: 20 },
            { month: 'Mar', completed: 24, screened: 28 },
            { month: 'Apr', completed: 29, screened: 32 },
            { month: 'May', completed: 35, screened: 40 },
            { month: 'Jun', completed: 42, screened: 45 },
          ],
        },
        recentSessions,
      });
    } catch (err: any) {
      return sendError(res, err.message, 'SERVER_ERROR', 500);
    }
  }
}
