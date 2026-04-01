import path from 'node:path';
import { defineConfig } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
  schema: path.join(__dirname, 'schema.prisma'),
  migrate: {
    seed: 'npx ts-node gateways/prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
    // directUrl is used by migrations to bypass the pooler (required for Prisma Migrate)
    directUrl: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
} as any);
