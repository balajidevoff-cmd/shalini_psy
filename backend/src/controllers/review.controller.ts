import { Response } from 'express';
import { prisma } from '../database/prisma';
import { sendSuccess, sendError } from '../utils/api-response';
import { clinicalReviewSchema } from '../validators/validators';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { AuditService } from '../utils/audit.service';

export class ReviewController {
  public static async getBySessionId(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const review = await prisma.clinicalReview.findUnique({
        where: { sessionId: id },
        include: {
          psychologist: {
            select: { id: true, firstName: true, lastName: true, title: true, licenseNumber: true },
          },
        },
      });

      return sendSuccess(res, review || null);
    } catch (err: any) {
      return sendError(res, err.message, 'SERVER_ERROR', 500);
    }
  }

  public static async saveOrUpdate(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const parsed = clinicalReviewSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Validation failed', 'VALIDATION_ERROR', 400, parsed.error.errors);
      }

      const data = parsed.data;

      // Find psychologist user record
      const psychologistId = req.user?.userId;
      const psychologist = await prisma.user.findUnique({ where: { id: psychologistId } });

      const clinicianName = psychologist
        ? `${psychologist.firstName} ${psychologist.lastName}`
        : 'Shalini Devi V';

      // Elevated risk validation requirement
      if (
        (data.riskLevel === 'MODERATE' || data.riskLevel === 'HIGH') &&
        data.finalize &&
        (!data.riskJustification || data.riskJustification.trim().length < 5)
      ) {
        return sendError(
          res,
          'A clinical justification is strictly required for Moderate or High risk ratings prior to finalization.',
          'RISK_JUSTIFICATION_REQUIRED',
          400
        );
      }

      const furtherAssessmentsStr = Array.isArray(data.furtherAssessments)
        ? JSON.stringify(data.furtherAssessments)
        : data.furtherAssessments || null;

      const isFinal = data.finalize;
      const reviewStatus = isFinal ? 'FINALIZED' : 'DRAFT';

      const review = await prisma.clinicalReview.upsert({
        where: { sessionId: id },
        create: {
          sessionId: id,
          psychologistId: psychologist?.id || 'default',
          psychologistName: clinicianName,
          clinicalInterview: data.clinicalInterview,
          clinicalObservations: data.clinicalObservations,
          areasOfConcern: data.areasOfConcern,
          riskLevel: data.riskLevel,
          riskJustification: data.riskJustification,
          recommendations: data.recommendations,
          furtherAssessments: furtherAssessmentsStr,
          referralPlan: data.referralPlan,
          followUpPlanNotes: data.followUpPlanNotes,
          finalClinicalImpression: data.finalClinicalImpression,
          status: reviewStatus,
          reviewedAt: isFinal ? new Date() : null,
        },
        update: {
          psychologistName: clinicianName,
          clinicalInterview: data.clinicalInterview,
          clinicalObservations: data.clinicalObservations,
          areasOfConcern: data.areasOfConcern,
          riskLevel: data.riskLevel,
          riskJustification: data.riskJustification,
          recommendations: data.recommendations,
          furtherAssessments: furtherAssessmentsStr,
          referralPlan: data.referralPlan,
          followUpPlanNotes: data.followUpPlanNotes,
          finalClinicalImpression: data.finalClinicalImpression,
          status: reviewStatus,
          reviewedAt: isFinal ? new Date() : undefined,
        },
      });

      // If finalized, update the parent session status to FINALIZED
      if (isFinal) {
        await prisma.assessmentSession.update({
          where: { id },
          data: { status: 'FINALIZED' },
        });

        // Automatically create or update a Report entry
        const session = await prisma.assessmentSession.findUnique({
          where: { id },
          include: { patient: true, assessment: true, score: true },
        });

        if (session) {
          const reportNumber = `RPT-${new Date().getFullYear()}-${session.patient.patientCode.replace('PSY-', '')}-${Math.floor(
            1000 + Math.random() * 9000
          )}`;

          await prisma.report.create({
            data: {
              patientId: session.patientId,
              sessionId: id,
              reportNumber,
              title: `AI-Assisted Psychological Screening Report (${session.assessment.shortName})`,
              reviewedByName: clinicianName,
              reviewedByRole: psychologist?.title || 'Senior Clinical Psychologist',
              summaryJson: JSON.stringify({
                patientCode: session.patient.patientCode,
                assessment: session.assessment.name,
                rawScore: session.score?.rawScore,
                severity: session.score?.severity,
                riskLevel: data.riskLevel,
                finalImpression: data.finalClinicalImpression,
                status: 'FINALIZED',
              }),
            },
          });
        }
      }

      await AuditService.log({
        userId: req.user?.userId,
        userEmail: req.user?.email,
        action: isFinal ? 'CLINICAL_REVIEW_FINALIZED' : 'CLINICAL_REVIEW_SAVED_DRAFT',
        entityType: 'ClinicalReview',
        entityId: review.id,
        ipAddress: req.ip,
        metadata: {
          sessionId: id,
          riskLevel: data.riskLevel,
          status: reviewStatus,
        },
      });

      return sendSuccess(
        res,
        review,
        isFinal ? 'Clinical review finalized successfully' : 'Draft saved successfully'
      );
    } catch (err: any) {
      return sendError(res, err.message, 'SERVER_ERROR', 500);
    }
  }
}
