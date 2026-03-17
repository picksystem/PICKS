import path from 'node:path';
import { defineConfig } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'gateways/prisma/schema.prisma'),
  migrate: {
    seed: 'npx ts-node gateways/prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
