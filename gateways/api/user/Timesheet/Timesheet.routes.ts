import { Router } from 'express';
import { TimesheetController } from './Timesheet.controller';
import { TimesheetService } from './Timesheet.service';
import { TimesheetRepository } from './Timesheet.repository';

// Dependency injection
const repository = new TimesheetRepository();
const service = new TimesheetService(repository);
const controller = new TimesheetController(service);

const router = Router();

router.get('/', controller.get);
router.get('/approvals', controller.approvalHistory);
router.post('/lines', controller.addLine);
router.post('/save', controller.save);
router.post('/submit', controller.submit);
router.patch('/lines/:id', controller.updateLine);
router.delete('/lines/:id', controller.removeLine);

export default router;
