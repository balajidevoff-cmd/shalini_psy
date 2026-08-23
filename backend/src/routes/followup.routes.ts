import { Router } from 'express';
import { FollowUpController } from '../controllers/followup.controller';
import { requireAuth, requirePsychologistOrAdmin } from '../auth/auth.middleware';

const router = Router();

router.use(requireAuth());

router.get('/', FollowUpController.getAll);
router.post('/', requirePsychologistOrAdmin(), FollowUpController.create);
router.put('/:id/status', requirePsychologistOrAdmin(), FollowUpController.updateStatus);

export default router;
