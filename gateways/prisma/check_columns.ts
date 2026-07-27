import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({});

async function main() {
  try {
    const r = await prisma.$queryRawUnsafe(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'AdminTicket' ORDER BY ordinal_position",
    );
    for (const c of r as any[]) {
      console.log(c.column_name);
    }
  } catch (e: any) {
    console.log('Error:', e.message);
  }
  await prisma.$disconnect();
}

main();
