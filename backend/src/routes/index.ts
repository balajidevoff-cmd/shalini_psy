import { Router } from 'express';
import authRoutes from './auth.routes';
import patientRoutes from './patient.routes';
import assessmentRoutes from './assessment.routes';
import sessionRoutes from './session.routes';
import aiRoutes from './ai.routes';
import reviewRoutes from './review.routes';
import reportRoutes from './report.routes';
import followupRoutes from './followup.routes';
import dashboardRoutes from './dashboard.routes';
import adminRoutes from './admin.routes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/patients', patientRoutes);
apiRouter.use('/assessments', assessmentRoutes);
apiRouter.use('/sessions', sessionRoutes);
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/reviews', reviewRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/followups', followupRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/admin', adminRoutes);

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'PSYSCAN AI API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

export default apiRouter;
