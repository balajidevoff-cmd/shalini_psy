import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../auth/auth.middleware';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refresh);
router.get('/me', requireAuth(), AuthController.me);

export default router;
