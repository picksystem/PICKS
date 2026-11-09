/**
 * Cache gateway contract.
 *
 * Backed by PostgreSQL (a CacheEntry table) instead of a separate Redis
 * instance — PostgreSQL is fast enough for our cache needs and keeps the
 * infrastructure to a single database. Implementations must be persistent
 * (no in-memory fakes), so they stay in sync with the real deployment.
 */
export interface ICacheGateway {
  /**
   * Read a cached value. Returns `null` on a miss or when the entry has
   * expired (expired entries are removed opportunistically).
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Store a value under `key` with a time-to-live in seconds. The value is
   * serialized as JSON (Postgres `jsonb`).
   */
  set(key: string, value: unknown, ttlSeconds: number): Promise<void>;

  /** Remove a key from the cache. No-op if the key is absent. */
  delete(key: string): Promise<void>;

  /** Remove a whole prefix of keys (e.g. `config:*`). No-op if none match. */
  deleteByPrefix(prefix: string): Promise<void>;

  /** Delete all expired entries. Called periodically by the server process. */
  pruneExpired(): Promise<void>;
}
