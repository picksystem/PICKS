import { Router } from 'express';
import { CustomFieldController } from './CustomField.controller';
import { requireAdmin } from '@serviceops/middleware';

const router = Router();
const controller = new CustomFieldController();

// Reads are available to any authenticated user; writes are admin-only.
router.get('/', controller.get);
router.get('/:id', controller.getById);
router.post('/', requireAdmin, controller.create);
router.put('/:id', requireAdmin, controller.update);
router.delete('/:id', requireAdmin, controller.delete);

export default router;
