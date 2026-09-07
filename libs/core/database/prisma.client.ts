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
const g = global as unknown as {
  _pool?: Pool;
  _prisma?: PrismaClient;
  _poolErrors?: number;
};

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

/**
 * Creates a new pg Pool with settings safe for Supabase Session Mode pooler.
 *
 * Supabase aggressively drops idle connections (~10 min). The safest defence
 * is keeping a small minimum pool (`min: 2`) so there are always active
 * connections the pooler won't terminate.
 *
 * Error handlers catch any connection drops that still slip through and
 * reset the pool so the next request gets fresh connections.
 */
function createPool(): Pool {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error('DATABASE_URL is not set');
  const parsed = parseDbUrl(dbUrl);
  if (process.env.DB_PASSWORD) parsed.password = process.env.DB_PASSWORD;

  const pool = new Pool({
    ...parsed,
    max: 10,
    min: 2,
    idleTimeoutMillis: 0,
    connectionTimeoutMillis: 10_000,
    statement_timeout: 30_000,
    ssl: { rejectUnauthorized: false },
    keepAlive: true,
    keepAliveInitialDelayMillis: 10_000,
  });

  pool.on('error', (err: Error) => {
    // Pool-level error (not a query error). Force reset after 3 occurrences.
    console.error('[PrismaPool] Pool error – will reset on next query', err.message);
    g._poolErrors = (g._poolErrors || 0) + 1;
    if (g._poolErrors >= 3) {
      console.warn('[PrismaPool] Too many errors – destroying pool');
      g._pool = undefined;
      g._prisma = undefined;
      g._poolErrors = 0;
    }
  });

  return pool;
}

function getPool(): Pool {
  if (!g._pool) {
    g._pool = createPool();
  }
  return g._pool;
}

function getPrisma(): PrismaClient {
  if (!g._prisma) {
    const pool = getPool();
    const prismaClient = new PrismaClient({
      adapter: new PrismaPg(pool),
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    // Hook into Prisma's error pipeline so we can reset the pool when the
    // server closes the connection on us. This fires for async events from
    // the engine (e.g. connection drops mid-query).
    (prismaClient as any).$on('error', (err: Error) => {
      if (err.message?.includes('Server has closed the connection')) {
        g._pool = undefined;
        g._prisma = undefined;
        g._poolErrors = 0;
      }
    });

    g._prisma = prismaClient;
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
