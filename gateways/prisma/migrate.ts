import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const sql = fs.readFileSync('/tmp/unified_admin_ticket.sql', 'utf-8');
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    console.log('Running:', `${stmt.substring(0, 80)}...`);
    try {
      await prisma.$executeRawUnsafe(stmt);
      console.log('  OK');
    } catch (e: any) {
      console.log('  Error:', e.message);
    }
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
