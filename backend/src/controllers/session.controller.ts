import { Response } from 'express';
import { prisma } from '../database/prisma';
import { sendSuccess, sendError } from '../utils/api-response';
import { createSessionSchema, submitResponsesSchema } from '../validators/validators';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { DeterministicScoringEngine } from '../scoring/scoring.engine';
import { AIService } from '../ai/ai.service';
import { AuditService } from '../utils/audit.service';

export class SessionController {
  public static async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const { patientId, status, page = '1', limit = '10' } = req.query;
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};
      if (patientId) where.patientId = patientId;
      if (status) where.status = status;

      const [sessions, total] = await Promise.all([
        prisma.assessmentSession.findMany({
          where,
          include: {
            patient: { select: { id: true, patientCode: true, firstName: true, lastName: true, age: true, gender: true } },
            assessment: { select: { id: true, name: true, shortName: true, domain: true } },
            score: true,
            clinicalReview: { select: { id: true, status: true, riskLevel: true, psychologistName: true } },
            conductedBy: { select: { firstName: true, lastName: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum,
        }),
        prisma.assessmentSession.count({ where }),
      ]);

      return sendSuccess(res, sessions, 'Sessions fetched successfully', 200, {
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

      const session = await prisma.assessmentSession.findUnique({
        where: { id },
        include: {
          patient: {
            include: {
              assignedPsychologist: true,
              contact: true,
              history: true,
            },
          },
          assessment: { include: { domain: true } },
          assessmentVersion: {
            include: {
              questions: {
                orderBy: { orderIndex: 'asc' },
                include: { options: { orderBy: { orderIndex: 'asc' } } },
              },
              severityBands: { orderBy: { orderIndex: 'asc' } },
              scoringRules: true,
            },
          },
          responses: {
            include: { question: true },
          },
          score: {
            include: { subscaleScores: true },
          },
          aiAnalysis: {
            include: {
              suggestions: { orderBy: { orderIndex: 'asc' } },
            },
          },
          clinicalReview: {
            include: { psychologist: true },
          },
          conductedBy: true,
        },
      });

      if (!session) {
        return sendError(res, 'Session not found', 'NOT_FOUND', 404);
      }

      return sendSuccess(res, session);
    } catch (err: any) {
      return sendError(res, err.message, 'SERVER_ERROR', 500);
    }
  }

  public static async create(req: AuthenticatedRequest, res: Response) {
    try {
      const parsed = createSessionSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Validation error', 'VALIDATION_ERROR', 400, parsed.error.errors);
      }

      const { patientId, assessmentId, assessmentVersionId, assignmentId } = parsed.data;

      // Find current version if not supplied
      let versionId = assessmentVersionId;
      if (!versionId) {
        const currentVer = await prisma.assessmentVersion.findFirst({
          where: { assessmentId, isCurrent: true },
        });
        if (!currentVer) {
          return sendError(res, 'Assessment version not found', 'NOT_FOUND', 404);
        }
        versionId = currentVer.id;
      }

      const session = await prisma.assessmentSession.create({
        data: {
          patientId,
          assessmentId,
          assessmentVersionId: versionId,
          assignmentId,
          conductedById: req.user?.userId,
          status: 'IN_PROGRESS',
          startedAt: new Date(),
        },
        include: {
          assessment: true,
          patient: true,
        },
      });

      await AuditService.log({
        userId: req.user?.userId,
        userEmail: req.user?.email,
        action: 'ASSESSMENT_SESSION_CREATED',
        entityType: 'AssessmentSession',
        entityId: session.id,
        ipAddress: req.ip,
      });

      return sendSuccess(res, session, 'Assessment session initiated', 201);
    } catch (err: any) {
      return sendError(res, err.message, 'SERVER_ERROR', 500);
    }
  }

  public static async saveResponses(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const parsed = submitResponsesSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Invalid responses format', 'VALIDATION_ERROR', 400, parsed.error.errors);
      }

      const session = await prisma.assessmentSession.findUnique({ where: { id } });
      if (!session) {
        return sendError(res, 'Session not found', 'NOT_FOUND', 404);
      }

      const { responses } = parsed.data;

      // Upsert responses
      for (const r of responses) {
        await prisma.assessmentResponse.upsert({
          where: {
            sessionId_questionId: {
              sessionId: id,
              questionId: r.questionId,
            },
          },
          create: {
            sessionId: id,
            questionId: r.questionId,
            responseValue: r.responseValue,
            responseText: r.responseText,
          },
          update: {
            responseValue: r.responseValue,
            responseText: r.responseText,
            answeredAt: new Date(),
          },
        });
      }

      return sendSuccess(res, { savedCount: responses.length }, 'Responses saved successfully');
    } catch (err: any) {
      return sendError(res, err.message, 'SERVER_ERROR', 500);
    }
  }

  public static async completeAndScore(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const session = await prisma.assessmentSession.findUnique({
        where: { id },
        include: {
          assessment: true,
          assessmentVersion: {
            include: {
              questions: { include: { options: true } },
              scoringRules: true,
              severityBands: true,
            },
          },
          responses: {
            include: { question: true },
          },
          patient: {
            include: { history: true, assignedPsychologist: true },
          },
        },
      });

      if (!session) {
        return sendError(res, 'Session not found', 'NOT_FOUND', 404);
      }

      if (session.responses.length === 0) {
        return sendError(res, 'Cannot score session with zero answered questions', 'NO_RESPONSES', 400);
      }

      // 1. Run Deterministic Scoring Engine
      const questionResponses = session.responses.map((r) => ({
        questionId: r.questionId,
        questionNumber: r.question.questionNumber,
        responseValue: r.responseValue,
        subscale: r.question.subscale,
        isReverseScored: r.question.isReverseScored,
        riskTriggerValue: r.question.riskTriggerValue,
      }));

      const scoringRules = session.assessmentVersion.scoringRules.map((r) => ({
        scoringMethod: r.scoringMethod as any,
        minScore: r.minScore,
        maxScore: r.maxScore,
        cutoffScore: r.cutoffScore,
        subscaleName: r.subscaleName,
        ruleJson: r.ruleJson,
      }));

      const severityBands = session.assessmentVersion.severityBands.map((b) => ({
        minScore: b.minScore,
        maxScore: b.maxScore,
        severityLabel: b.severityLabel,
        colorHex: b.colorHex,
        clinicalDescription: b.clinicalDescription,
        subscaleName: b.subscaleName,
      }));

      const scoreResult = DeterministicScoringEngine.calculate(
        questionResponses,
        scoringRules,
        severityBands,
        session.assessment.name,
        session.assessment.shortName
      );

      // Save Score into Database
      const savedScore = await prisma.assessmentScore.upsert({
        where: { sessionId: id },
        create: {
          sessionId: id,
          rawScore: scoreResult.rawScore,
          maxPossibleScore: scoreResult.maxPossibleScore,
          standardScore: scoreResult.standardScore,
          percentile: scoreResult.percentile,
          severity: scoreResult.severity,
          severityColor: scoreResult.severityColor,
          hasRiskFlag: scoreResult.hasRiskFlag,
          riskFlagDetails: scoreResult.riskFlagDetails,
          interpretation: scoreResult.interpretation,
        },
        update: {
          rawScore: scoreResult.rawScore,
          maxPossibleScore: scoreResult.maxPossibleScore,
          standardScore: scoreResult.standardScore,
          percentile: scoreResult.percentile,
          severity: scoreResult.severity,
          severityColor: scoreResult.severityColor,
          hasRiskFlag: scoreResult.hasRiskFlag,
          riskFlagDetails: scoreResult.riskFlagDetails,
          interpretation: scoreResult.interpretation,
        },
      });

      // Clear existing subscale scores and reinsert
      await prisma.assessmentSubscaleScore.deleteMany({ where: { scoreId: savedScore.id } });
      if (scoreResult.subscaleScores.length > 0) {
        await prisma.assessmentSubscaleScore.createMany({
          data: scoreResult.subscaleScores.map((s) => ({
            scoreId: savedScore.id,
            subscaleName: s.subscaleName,
            rawScore: s.rawScore,
            maxScore: s.maxScore,
            severity: s.severity,
            colorHex: s.colorHex,
          })),
        });
      }

      // Update session status to COMPLETED / UNDER_REVIEW
      await prisma.assessmentSession.update({
        where: { id },
        data: {
          status: 'UNDER_REVIEW',
          completedAt: new Date(),
        },
      });

      // 2. Trigger AI-Assisted Screening Pipeline
      try {
        const aiOutput = await AIService.analyzeSession({
          patientCode: session.patient.patientCode,
          age: session.patient.age,
          gender: session.patient.gender,
          education: session.patient.education,
          occupation: session.patient.occupation,
          presentingComplaints: session.patient.history?.presentingComplaints,
          symptomDuration: session.patient.history?.symptomDuration,
          medicalHistory: session.patient.history?.medicalHistory,
          familyHistory: session.patient.history?.familyHistory,
          suicidalThoughts: session.patient.history?.suicidalThoughts,
          selfHarmHistory: session.patient.history?.selfHarmHistory,
          assessmentName: session.assessment.name,
          shortName: session.assessment.shortName,
          rawScore: scoreResult.rawScore,
          maxScore: scoreResult.maxPossibleScore,
          severity: scoreResult.severity,
          hasRiskFlag: scoreResult.hasRiskFlag,
          riskFlagDetails: scoreResult.riskFlagDetails,
          subscales: scoreResult.subscaleScores,
        });

        // Store AI Analysis in DB
        const savedAI = await prisma.aIAnalysis.upsert({
          where: { sessionId: id },
          create: {
            sessionId: id,
            modelName: aiOutput.modelName,
            modelVersion: aiOutput.modelVersion,
            promptVersion: aiOutput.promptVersion,
            summary: aiOutput.summary,
            riskObservation: aiOutput.riskObservation,
            status: 'AWAITING_REVIEW',
          },
          update: {
            modelName: aiOutput.modelName,
            modelVersion: aiOutput.modelVersion,
            promptVersion: aiOutput.promptVersion,
            summary: aiOutput.summary,
            riskObservation: aiOutput.riskObservation,
          },
        });

        // Store AI Suggestions for interactive psychologist review
        await prisma.aISuggestion.deleteMany({ where: { aiAnalysisId: savedAI.id } });
        for (let i = 0; i < aiOutput.suggestions.length; i++) {
          const sug = aiOutput.suggestions[i];
          await prisma.aISuggestion.create({
            data: {
              aiAnalysisId: savedAI.id,
              suggestionType: sug.suggestionType,
              title: sug.title,
              content: sug.content,
              confidenceLevel: sug.confidenceLevel,
              inputReferencesJson: sug.inputReferences ? JSON.stringify(sug.inputReferences) : null,
              orderIndex: i + 1,
            },
          });
        }
      } catch (aiError) {
        console.error('AI pipeline processing error (continuing with scoring):', aiError);
      }

      await AuditService.log({
        userId: req.user?.userId,
        userEmail: req.user?.email,
        action: 'ASSESSMENT_COMPLETED_AND_SCORED',
        entityType: 'AssessmentSession',
        entityId: id,
        ipAddress: req.ip,
        metadata: {
          rawScore: scoreResult.rawScore,
          severity: scoreResult.severity,
          hasRiskFlag: scoreResult.hasRiskFlag,
        },
      });

      return sendSuccess(
        res,
        {
          sessionId: id,
          score: scoreResult,
        },
        'Assessment completed and scored successfully'
      );
    } catch (err: any) {
      return sendError(res, err.message, 'SERVER_ERROR', 500);
    }
  }
}
