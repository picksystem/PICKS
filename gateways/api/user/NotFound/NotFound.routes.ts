import { Router } from 'express';
import { NotFoundController } from './NotFound.controller';
import { NotFoundService } from './NotFound.service';
import { NotFoundRepository } from './NotFound.repository';

// Dependency injection
const repository = new NotFoundRepository();
const service = new NotFoundService(repository);
const controller = new NotFoundController(service);

const router = Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
