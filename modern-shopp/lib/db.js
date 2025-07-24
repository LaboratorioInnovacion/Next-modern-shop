import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient({
  //mostrar logs
  // log: ['query', 'error', 'warn']
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
