import { Response } from 'express';
import { prisma } from '../database/prisma';
import { sendSuccess, sendError } from '../utils/api-response';
import { aiSuggestionDecisionSchema } from '../validators/validators';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { AuditService } from '../utils/audit.service';

export class AIController {
  public static async getSessionAnalysis(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const aiAnalysis = await prisma.aIAnalysis.findUnique({
        where: { sessionId: id },
        include: {
          suggestions: {
            orderBy: { orderIndex: 'asc' },
          },
        },
      });

      if (!aiAnalysis) {
        return sendError(res, 'AI analysis not found for this session', 'NOT_FOUND', 404);
      }

      return sendSuccess(res, aiAnalysis);
    } catch (err: any) {
      return sendError(res, err.message, 'SERVER_ERROR', 500);
    }
  }

  public static async decideSuggestion(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const parsed = aiSuggestionDecisionSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Validation failed', 'VALIDATION_ERROR', 400, parsed.error.errors);
      }

      const { status, decisionComment, modifiedContent } = parsed.data;

      const suggestion = await prisma.aISuggestion.findUnique({ where: { id } });
      if (!suggestion) {
        return sendError(res, 'AI suggestion not found', 'NOT_FOUND', 404);
      }

      const updated = await prisma.aISuggestion.update({
        where: { id },
        data: {
          status: status,
          decisionComment: decisionComment || suggestion.decisionComment,
          modifiedContent: status === 'MODIFIED' ? modifiedContent || suggestion.modifiedContent : null,
          decidedAt: new Date(),
        },
      });

      await AuditService.log({
        userId: req.user?.userId,
        userEmail: req.user?.email,
        action: `AI_SUGGESTION_${status}`,
        entityType: 'AISuggestion',
        entityId: id,
        ipAddress: req.ip,
        metadata: {
          suggestionType: suggestion.suggestionType,
          status,
          decisionComment,
        },
      });

      return sendSuccess(res, updated, `Suggestion ${status.toLowerCase()} successfully`);
    } catch (err: any) {
      return sendError(res, err.message, 'SERVER_ERROR', 500);
    }
  }
}
