import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { requireAuth, requireRole } from '../auth/auth.middleware';

const router = Router();

router.use(requireAuth());
router.use(requireRole(['ADMIN']));

router.get('/users', AdminController.getUsers);
router.put('/users/:id', AdminController.updateUser);
router.get('/audit-logs', AdminController.getAuditLogs);

export default router;
