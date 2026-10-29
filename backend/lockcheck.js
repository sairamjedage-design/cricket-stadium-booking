const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const locks = await prisma.$queryRaw`
      SELECT pid, age(clock_backend_start, current_timestamp), state, query
      FROM pg_stat_activity
      WHERE datname = current_database();
    `;
    console.log('Locks:', locks);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
