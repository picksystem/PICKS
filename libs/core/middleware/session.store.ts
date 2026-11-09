import session from 'express-session';
import type { Pool } from 'pg';

type Store = typeof session.Store;

/**
 * Postgres-backed session store for express-session.
 *
 * Sessions are persisted in the UserSession table — no separate cache/Redis
 * instance; PostgreSQL doubles as the session store. The whole session payload
 * is written to `data` (jsonb). Expired rows are pruned by `prune` (run
 * periodically from the server process) and opportunistically on `get`.
 */
export class PgSessionStore extends session.Store {
  constructor(
    private readonly pool: Pool,
    private readonly sessionTtlMs: number,
  ) {
    super();
  }

  get(
    sessionId: string,
    callback: (err: Error | null, session?: session.SessionData | null) => void,
  ): void {
    this.pool
      .query(`SELECT data FROM "UserSession" WHERE id = $1 AND "expiresAt" > now()`, [sessionId])
      .then((result) => {
        if (result.rows.length === 0) {
          callback(null, null);
          return;
        }
        const raw = result.rows[0].data;
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        callback(null, parsed);
      })
      .catch((err: unknown) => callback(err as Error));
  }

  set(sessionId: string, sessionData: session.SessionData, callback: (err?: Error) => void): void {
    const expiresAt = new Date(Date.now() + this.sessionTtlMs);
    const data = JSON.stringify(sessionData ?? {});
    this.pool
      .query(
        `INSERT INTO "UserSession" (id, "data", "createdAt", "expiresAt")
         VALUES ($1, $2::jsonb, now(), $3)
         ON CONFLICT (id) DO UPDATE SET "data" = $2::jsonb, "expiresAt" = $3`,
        [sessionId, data, expiresAt],
      )
      .then(() => callback())
      .catch((err: unknown) => callback(err as Error));
  }

  destroy(sessionId: string, callback: (err?: Error) => void): void {
    this.pool
      .query(`DELETE FROM "UserSession" WHERE id = $1`, [sessionId])
      .then(() => callback())
      .catch((err: unknown) => callback(err as Error));
  }

  /** Clear all expired sessions. Called on a timer by the server process. */
  async prune(callback?: (err?: Error) => void): Promise<void> {
    try {
      await this.pool.query(`DELETE FROM "UserSession" WHERE "expiresAt" < now()`);
      callback?.();
    } catch (err) {
      callback?.(err as Error);
    }
  }
}

// Keep the Store type alias referenced so the class extends the right base.
export type { Store };
