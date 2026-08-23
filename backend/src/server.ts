import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import apiRouter from './routes';
import { errorHandler } from './middleware/error.middleware';
import { connectDatabase } from './database/prisma';

const app = express();

// 1. Security & Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows flexible development testing
  })
);

// 2. CORS Configuration
app.use(
  cors({
    origin: '*', // Supports all local dev environments
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// 3. Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Logging
if (config.env !== 'test') {
  app.use(morgan('dev'));
}

// 5. Rate limiting for sensitive authentication & API endpoints
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, message: 'Too many requests, please try again later.', errorCode: 'RATE_LIMIT_EXCEEDED' },
});
app.use('/api', generalLimiter);

// 6. Mount API routes
app.use('/api', apiRouter);

// 7. API Documentation Route (/api/docs)
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'PSYSCAN AI - REST API Documentation',
    version: '1.0.0',
    description: 'Secure Psychological Screening and Clinical Decision Support REST API',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        refresh: 'POST /api/auth/refresh',
        me: 'GET /api/auth/me',
      },
      patients: {
        list: 'GET /api/patients',
        getById: 'GET /api/patients/:id',
        create: 'POST /api/patients',
        update: 'PUT /api/patients/:id',
      },
      assessments: {
        list: 'GET /api/assessments',
        domains: 'GET /api/assessments/domains',
        getById: 'GET /api/assessments/:id',
      },
      sessions: {
        list: 'GET /api/sessions',
        getById: 'GET /api/sessions/:id',
        create: 'POST /api/sessions',
        saveResponses: 'POST /api/sessions/:id/responses',
        completeAndScore: 'POST /api/sessions/:id/complete',
      },
      ai: {
        getSessionAnalysis: 'GET /api/ai/sessions/:id',
        decideSuggestion: 'POST /api/ai/suggestions/:id/decide',
      },
      reviews: {
        getBySessionId: 'GET /api/reviews/sessions/:id',
        saveOrFinalize: 'POST /api/reviews/sessions/:id',
      },
      reports: {
        list: 'GET /api/reports',
        getById: 'GET /api/reports/:id',
        downloadPdf: 'GET /api/reports/sessions/:sessionId/download',
      },
      followups: {
        list: 'GET /api/followups',
        create: 'POST /api/followups',
        updateStatus: 'PUT /api/followups/:id/status',
      },
      admin: {
        users: 'GET /api/admin/users',
        updateUser: 'PUT /api/admin/users/:id',
        auditLogs: 'GET /api/admin/audit-logs',
      },
      dashboard: {
        metrics: 'GET /api/dashboard/metrics',
      },
    },
    clinicalDisclaimer: config.clinicalDisclaimer,
  });
});

// 8. Global Error Handler
app.use(errorHandler);

// 9. Start Server
const server = app.listen(config.port, async () => {
  console.log(`================================================`);
  console.log(`🧠 PSYSCAN AI Backend Server`);
  console.log(`🚀 Running at: http://localhost:${config.port}`);
  console.log(`📖 API Docs: http://localhost:${config.port}/api/docs`);
  console.log(`🩺 Clinical Reviewer: Shalini Devi V`);
  console.log(`================================================`);
  await connectDatabase();
});

export default app;
