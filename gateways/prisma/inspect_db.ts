// Load env vars
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Parse URL
const u = new URL(process.env.DATABASE_URL!);
const pool = new Pool({
  host: u.hostname,
  port: parseInt(u.port) || 5432,
  user: decodeURIComponent(u.username),
  password: decodeURIComponent(u.password),
  database: u.pathname.replace(/^\//, ''),
  ssl: { rejectUnauthorized: false },
  max: 5,
});

const adapter = new PrismaPg(pool);

async function main() {
  const prisma = new PrismaClient({ adapter });

  try {
    // Check AdminTicket columns
    const result = await prisma.$queryRawUnsafe(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'AdminTicket'
      ORDER BY ordinal_position
    `);
    console.log('AdminTicket columns:');
    (result as any[]).forEach((r: any) => console.log(' ', r.column_name));
  } catch (e: any) {
    console.log('AdminTicket error:', e.message);
  }

  // Check all tables
  try {
    const tables = await prisma.$queryRawUnsafe(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('\nAll tables:');
    (tables as any[]).forEach((r: any) => console.log(' ', r.table_name));
  } catch (e: any) {
    console.log('Tables error:', e.message);
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });