import { Router } from 'express';
import { SessionController } from '../controllers/session.controller';
import { requireAuth } from '../auth/auth.middleware';

const router = Router();

router.use(requireAuth());

router.get('/', SessionController.getAll);
router.get('/:id', SessionController.getById);
router.post('/', SessionController.create);
router.post('/:id/responses', SessionController.saveResponses);
router.post('/:id/complete', SessionController.completeAndScore);

export default router;
