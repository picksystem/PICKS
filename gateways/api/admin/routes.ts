import { Router } from 'express';

import adminControlsRoutes from './AdminControls/AdminControls.routes';
import configurationRoutes from './Configuration/Configuration.routes';
import { ADMIN_PATHS } from '@serviceops/constants';

/**
 * Builds the admin route tree.
 *
 * @param ticketRouter - Dynamically-built ticket router (from adminTicketType table).
 *                      If undefined, the /tickets subtree is skipped (useful for tests
 *                      that don't need ticket CRUD).
 */
export function buildAdminRouter(ticketRouter?: Router): Router {
  const router = Router();

  router.use(`/${ADMIN_PATHS.ADMIN_CONTROLS}`, adminControlsRoutes);
  router.use(`/${ADMIN_PATHS.CONFIGURATION}`, configurationRoutes);

  if (ticketRouter) {
    router.use(`/${ADMIN_PATHS.TICKETS}`, ticketRouter);
  }

  return router;
}
