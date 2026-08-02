import { Router } from 'express';
import { TicketTypeController } from './TicketType.controller';
import { ADMIN_PATHS } from '@serviceops/constants';

const router = Router();
const controller = new TicketTypeController();

router.get('/', controller.get);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.patch('/reorder', controller.reorder);

export default router;
