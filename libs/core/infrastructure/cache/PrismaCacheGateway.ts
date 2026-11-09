import { ICacheGateway } from '@serviceops/interfaces';

/**
 * PostgreSQL-backed cache gateway.
 *
 * Uses the shared Prisma client (jsonb CacheEntry table) instead of a separate
 * Redis instance. This is a persistent cache — no in-memory implementation is
 * maintained, keeping behaviour in sync with production.
 *
 * Values are stored as jsonb; keys are plain strings. Expired entries are
 * removed opportunistically on read and by `pruneExpired` (run periodically
 * from the server process, alongside the expired-draft cleanup).
 */

export class PrismaCacheGateway implements ICacheGateway {
  constructor(private readonly db: any) {}

  async get<T>(key: string): Promise<T | null> {
    const row = await this.db.cacheEntry.findUnique({ where: { key } });
    if (!row) return null;

    // Opportunistic expiry: if the entry has lapsed, delete it and report a miss.
    if (new Date(row.expiresAt).getTime() <= Date.now()) {
      await this.db.cacheEntry.delete({ where: { key } });
      return null;
    }

    const value = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
    return value as T;
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    await this.db.cacheEntry.upsert({
      where: { key },
      update: { value: value as object, expiresAt },
      create: { key, value: value as object, expiresAt },
    });
  }

  async delete(key: string): Promise<void> {
    await this.db.cacheEntry.deleteMany({ where: { key } });
  }

  async deleteByPrefix(prefix: string): Promise<void> {
    await this.db.cacheEntry.deleteMany({ where: { key: { startsWith: prefix } } });
  }

  async pruneExpired(): Promise<void> {
    await this.db.cacheEntry.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  }
}

export default PrismaCacheGateway;
