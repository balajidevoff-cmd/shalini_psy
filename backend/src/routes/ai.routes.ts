import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { requireAuth, requirePsychologistOrAdmin } from '../auth/auth.middleware';

const router = Router();

router.use(requireAuth());

router.get('/sessions/:id', AIController.getSessionAnalysis);
router.post('/suggestions/:id/decide', requirePsychologistOrAdmin(), AIController.decideSuggestion);

export default router;
