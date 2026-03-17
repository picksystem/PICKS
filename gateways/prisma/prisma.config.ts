import path from 'node:path';
import { defineConfig } from 'prisma/config';
import 'dotenv/config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default defineConfig({
  schema: path.join(__dirname, 'schema.prisma'),
  migrate: {
    seed: 'npx ts-node gateways/prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
} as any);
