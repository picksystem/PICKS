import { Pool } from 'pg';
import fs from 'fs';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

// Parse URL to get components
const url = new URL(connectionString);
const pool = new Pool({
  host: url.hostname,
  port: parseInt(url.port),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace('/', ''),
  ssl: { rejectUnauthorized: false },
  max: 5,
});

async function main() {
  const client = await pool.connect();
  try {
    // Check current AdminTicket columns
    const cols = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'AdminTicket'
      ORDER BY ordinal_position
    `);
    console.log('Current AdminTicket columns:');
    cols.rows.forEach((r) => console.log(' ', r.column_name));

    // Drop old tables
    for (const s of [
      'DROP TABLE IF EXISTS "AdminTicketActivity" CASCADE',
      'DROP TABLE IF EXISTS "AdminTicketResolution" CASCADE',
      'DROP TABLE IF EXISTS "AdminTicketTimeEntry" CASCADE',
      'DROP TABLE IF EXISTS "AdminTicketComment" CASCADE',
      'DROP TABLE IF EXISTS "AdminTicket" CASCADE',
    ]) {
      console.log('Drop:', s.substring(0, 50));
      try {
        await client.query(s);
        console.log('  OK');
      } catch (e: any) {
        console.log('  Skip:', e.message);
      }
    }

    // Create tables from migration SQL
    const sql = fs.readFileSync('/tmp/unified_admin_ticket.sql', 'utf-8');
    const stmts = sql
      .split(';')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);
    for (const stmt of stmts) {
      console.log('Running:', `${stmt.substring(0, 80)}...`);
      try {
        await client.query(stmt);
        console.log('  OK');
      } catch (e: any) {
        console.log('  Error:', e.message);
      }
    }

    // Verify
    const cols2 = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'AdminTicket'
      ORDER BY ordinal_position
    `);
    console.log('\nNew AdminTicket columns:');
    cols2.rows.forEach((r) => console.log(' ', r.column_name));
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
