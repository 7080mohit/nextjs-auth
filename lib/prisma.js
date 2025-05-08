import { PrismaClient } from '@prisma/client';

// Singleton pattern with globalThis
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : []
  });
};

const prisma = globalThis.prisma || prismaClientSingleton();

// Preserve Prisma client in development
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Keep your existing logging
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    console.log('Query: ' + e.query);
    console.log('Duration: ' + e.duration + 'ms');
  });
}

// Keep your graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Prisma Client disconnected');
  process.exit(0);
});

export default prisma;