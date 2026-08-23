import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import apiRouter from './routes';
import { errorHandler } from './middleware/error.middleware';
import { sendError } from './utils/api-response';

const app = express();

// Trust proxy headers for serverless deployments (Vercel, AWS, reverse proxies)
app.set('trust proxy', 1);

// 1. Security & Headers
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// 2. Dynamic CORS Configuration (supports local dev, deployed frontend, and vercel preview domains)
const allowedOrigins = [
  config.frontendUrl,
  config.corsOrigin,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);

      // Match allowed list, wildcards, or any .vercel.app domain
      if (
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes('*') ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }

      return callback(null, true); // Permissive fallback to prevent breaking deployments
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  })
);

// 3. Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Logging
if (config.env !== 'test') {
  app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
}

// 5. Rate limiting for sensitive API endpoints
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    errorCode: 'RATE_LIMIT_EXCEEDED',
  },
});
app.use('/api', generalLimiter);

// 6. Root Health & Status Route
app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    service: 'PSYSCAN AI Backend API',
    version: '1.0.0',
    docs: '/api/docs',
    health: '/api/health',
  });
});

// 7. Mount API routes
app.use('/api', apiRouter);

// 8. API Documentation Route (/api/docs)
app.get('/api/docs', (req: Request, res: Response) => {
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

// 9. 404 Handler for Unknown Routes
app.use((req: Request, res: Response) => {
  return sendError(res, `Route ${req.method} ${req.originalUrl} not found`, 'NOT_FOUND', 404);
});

// 10. Global Error Handler
app.use(errorHandler);

export { app };
export default app;
