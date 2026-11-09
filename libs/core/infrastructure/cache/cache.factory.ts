import { prisma } from '@serviceops/database';
import { ICacheGateway } from '@serviceops/interfaces';
import { PrismaCacheGateway } from './PrismaCacheGateway';

/**
 * Shared, lazily-created Postgres cache instance.
 *
 * Returns a module-level singleton so every gateway (configuration,
 * ticket-type, …) reads/writes the same cache and invalidations are visible
 * across the app. Kept in one place so call sites stay a single argument.
 */
let sharedCache: ICacheGateway | null = null;

export function getCacheGateway(): ICacheGateway {
  if (!sharedCache) {
    sharedCache = new PrismaCacheGateway(prisma);
  }
  return sharedCache;
}
