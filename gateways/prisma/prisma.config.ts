import path from 'node:path';
import { defineConfig } from 'prisma/config';
import 'dotenv/config';

function buildUrl(base: string | undefined): string | undefined {
  if (!base) return undefined;
  const password = process.env.DB_PASSWORD;
  if (!password) return base;
  const u = new URL(base);
  u.password = password;
  return u.toString();
}

const dbUrl = buildUrl(process.env.DATABASE_URL);
const directUrl = buildUrl(process.env.DIRECT_URL) ?? dbUrl;

export default defineConfig({
  schema: path.join(__dirname, 'schema.prisma'),
  migrate: {
    seed: 'npx tsx gateways/prisma/seed.ts',
  },
  datasource: {
    url: dbUrl,
    directUrl,
  },
} as any);
