import { Router } from 'express';
import { TicketTypeController } from './TicketType.controller';
import { requireAdmin } from '@serviceops/middleware';

const router = Router();
const controller = new TicketTypeController();

// Reads are available to any authenticated user; writes are admin-only.
router.get('/', controller.get);
router.get('/:id', controller.getById);
router.post('/', requireAdmin, controller.create);
router.put('/:id', requireAdmin, controller.update);
router.delete('/:id', requireAdmin, controller.delete);
router.patch('/reorder', requireAdmin, controller.reorder);

export default router;
