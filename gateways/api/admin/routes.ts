import { Router } from 'express';

import ticketTypeRoutes from './TicketType/TicketType.routes';
import adminControlsRoutes from './AdminControls/AdminControls.routes';
import ticketRoutes from './Ticket/Ticket.routes';
import configurationRoutes from './Configuration/Configuration.routes';
import { ADMIN_PATHS } from '@serviceops/constants';

const router = Router();

router.use(`/${ADMIN_PATHS.TICKET_TYPE}`, ticketTypeRoutes);
router.use(`/${ADMIN_PATHS.ADMIN_CONTROLS}`, adminControlsRoutes);
router.use(`/${ADMIN_PATHS.TICKETS}`, ticketRoutes);
router.use(`/${ADMIN_PATHS.CONFIGURATION}`, configurationRoutes);

export default router;
