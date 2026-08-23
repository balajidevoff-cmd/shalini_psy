import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Preserve PrismaClient instance across warm serverless function invocations
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL) {
  globalForPrisma.prisma = prisma;
}

export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to database successfully.');
  } catch (error) {
    console.error('❌ Database connection error (non-fatal):', error);
  }
}
