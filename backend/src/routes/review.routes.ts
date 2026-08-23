import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { requireAuth, requirePsychologistOrAdmin } from '../auth/auth.middleware';

const router = Router();

router.use(requireAuth());

router.get('/sessions/:id', ReviewController.getBySessionId);
router.post('/sessions/:id', requirePsychologistOrAdmin(), ReviewController.saveOrUpdate);

export default router;
