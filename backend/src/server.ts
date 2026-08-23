import { app } from './app';
import { config } from './config';
import { connectDatabase } from './database/prisma';

// Only start the local HTTP listener when running in standalone mode (not in Vercel serverless functions)
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  const server = app.listen(config.port, async () => {
    console.log(`================================================`);
    console.log(`🧠 PSYSCAN AI Backend Server`);
    console.log(`🚀 Running at: http://localhost:${config.port}`);
    console.log(`📖 API Docs: http://localhost:${config.port}/api/docs`);
    console.log(`🩺 Clinical Reviewer: Shalini Devi V`);
    console.log(`================================================`);
    await connectDatabase();
  });

  // Graceful shutdown handling
  const shutdown = () => {
    console.log('Shutting down server gracefully...');
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

export default app;
