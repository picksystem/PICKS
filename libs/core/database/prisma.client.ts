import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Lazily-initialized singletons.
// Prisma v7 uses the "client" engine which requires a driver adapter (PrismaPg).
//
// WHY LAZY? tsx/esbuild hoists all `import` statements to the top of the
// compiled CJS output, so this module is evaluated BEFORE dotenv.config()
// runs in server.ts. If we called `new Pool(...)` here, DATABASE_URL would
// be undefined. Deferring creation to first use (during the first request)
// guarantees the env vars are already loaded.
const g = global as unknown as { _pool?: Pool; _prisma?: PrismaClient };

function parseDbUrl(raw: string) {
  const u = new URL(raw);
  return {
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    host: u.hostname,
    port: parseInt(u.port, 10) || 5432,
    database: u.pathname.replace(/^\//, ''),
  };
}

function getPool(): Pool {
  if (!g._pool) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error('DATABASE_URL is not set');
    g._pool = new Pool({
      ...parseDbUrl(dbUrl),
      max: 10,
      min: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: { rejectUnauthorized: false },
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    });
  }
  return g._pool;
}

function getPrisma(): PrismaClient {
  if (!g._prisma) {
    const pool = getPool();
    g._prisma = new PrismaClient({
      adapter: new PrismaPg(pool),
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return g._prisma;
}

// Proxy forwards property access to the real instance, creating it on first use.
// typeof checks handle PrismaClient methods (which need the correct `this`).
export const pool: Pool = new Proxy({} as Pool, {
  get(_, prop: string | symbol) {
    const p = getPool();
    const val = (p as any)[prop];
    return typeof val === 'function' ? val.bind(p) : val;
  },
});

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_, prop: string | symbol) {
    const p = getPrisma();
    const val = (p as any)[prop];
    return typeof val === 'function' ? val.bind(p) : val;
  },
});

export default prisma;
