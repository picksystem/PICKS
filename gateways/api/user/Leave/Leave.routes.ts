import { Router } from 'express';
import { LeaveController } from './Leave.controller';
import { LeaveService } from './Leave.service';
import { LeaveRepository } from './Leave.repository';

// Dependency injection
const repository = new LeaveRepository();
const service = new LeaveService(repository);
const controller = new LeaveController(service);

const router = Router();

router.get('/balance', controller.balance);
router.get('/requests', controller.requests);
router.post('/requests', controller.submit);

export default router;
