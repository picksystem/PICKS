import { Router } from 'express';
import { CustomFieldController } from './CustomField.controller';

const router = Router();
const controller = new CustomFieldController();

router.get('/', controller.get);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
