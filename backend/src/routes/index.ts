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

import { prisma } from '../database/prisma';

// Health check endpoint (verifies server and database connection)
apiRouter.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    // Quick ping to database
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (error) {
    dbStatus = 'disconnected';
  }

  res.json({
    status: 'ok',
    service: 'PSYSCAN AI API',
    version: '1.0.0',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

export default apiRouter;
