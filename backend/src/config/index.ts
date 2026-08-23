import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend or root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/psyscan_ai',
  jwt: {
    secret: process.env.JWT_SECRET || 'psyscan-super-secure-jwt-secret-key-2026-prod',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'psyscan-super-secure-refresh-jwt-secret-key-2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  ai: {
    provider: process.env.AI_PROVIDER || 'mock', // 'mock' | 'gemini' | 'openai'
    apiKey: process.env.AI_API_KEY || '',
    model: process.env.AI_MODEL || 'gemini-1.5-flash',
  },
  clinicalDisclaimer:
    'PSYSCAN AI is intended for psychological screening and clinical decision support. It does not provide a medical or psychological diagnosis. AI-generated information is probabilistic and must be independently reviewed by a qualified mental health professional. Clinical decisions must be based on comprehensive professional assessment.',
};
