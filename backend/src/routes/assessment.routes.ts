import { Router } from 'express';
import { AssessmentController } from '../controllers/assessment.controller';
import { requireAuth } from '../auth/auth.middleware';

const router = Router();

router.use(requireAuth());

router.get('/', AssessmentController.getAll);
router.get('/domains', AssessmentController.getDomains);
router.get('/:id', AssessmentController.getById);

export default router;
