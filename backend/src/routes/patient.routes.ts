import { Router } from 'express';
import { PatientController } from '../controllers/patient.controller';
import { requireAuth, requireAssessorOrClinician } from '../auth/auth.middleware';

const router = Router();

router.use(requireAuth());

router.get('/', PatientController.getAll);
router.get('/:id', PatientController.getById);
router.post('/', requireAssessorOrClinician(), PatientController.create);
router.put('/:id', requireAssessorOrClinician(), PatientController.update);

export default router;
