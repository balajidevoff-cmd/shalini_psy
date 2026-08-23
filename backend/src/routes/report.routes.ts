import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { requireAuth } from '../auth/auth.middleware';

const router = Router();

router.use(requireAuth());

router.get('/', ReportController.getAll);
router.get('/:id', ReportController.getById);
router.get('/sessions/:sessionId/download', ReportController.downloadPdf);

export default router;
