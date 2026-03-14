import { Router } from 'express';

import ticketTypeRoutes from './TicketType/TicketType.routes';
import incidentRoutes from './Incident/Incident.routes';
import adminControlsRoutes from './AdminControls/AdminControls.routes';
import serviceRequestRoutes from './ServiceRequest/ServiceRequest.routes';
import advisoryRequestRoutes from './AdvisoryRequest/AdvisoryRequest.routes';
import ticketRoutes from './Ticket/Ticket.routes';
import configurationRoutes from './Configuration/Configuration.routes';
import { ADMIN_PATHS } from '@picks/constants';

const router = Router();

router.use(`/${ADMIN_PATHS.TICKET_TYPE}`, ticketTypeRoutes);
router.use(`/${ADMIN_PATHS.INCIDENTS}`, incidentRoutes);
router.use(`/${ADMIN_PATHS.ADMIN_CONTROLS}`, adminControlsRoutes);
router.use(`/${ADMIN_PATHS.SERVICE_REQUESTS}`, serviceRequestRoutes);
router.use(`/${ADMIN_PATHS.ADVISORY_REQUESTS}`, advisoryRequestRoutes);
router.use(`/${ADMIN_PATHS.TICKETS}`, ticketRoutes);
router.use(`/${ADMIN_PATHS.CONFIGURATION}`, configurationRoutes);

export default router;
