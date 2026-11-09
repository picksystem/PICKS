import { Router } from 'express';
import { prisma } from '@serviceops/database';
import { requireAdmin } from '@serviceops/middleware';
import { AdminControlsController } from './AdminControls.controller';

const controller = new AdminControlsController(prisma);
const router = Router();

// Reads are available to any authenticated user (the admin controls config is
// consumed by non-admin UI such as ticket creation). Only the write is admin.
router.get('/', controller.get);
router.put('/', requireAdmin, controller.update);

export default router;
