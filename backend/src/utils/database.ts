import { PrismaClient } from '@prisma/client';

// Prisma client instance
export const prisma = new PrismaClient();

// Connect to database
export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('Connected to database');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

// Disconnect from database
export async function disconnectDB() {
  await prisma.$disconnect();
}

export default prisma;