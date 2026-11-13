import { Router } from 'express';

import notFoundRoutes from './NotFound/NotFound.routes';
import timesheetRoutes from './Timesheet/Timesheet.routes';
import { USER_PATHS } from '@serviceops/constants';

const router = Router();

router.use(`/${USER_PATHS.NOT_FOUND}`, notFoundRoutes);
router.use(`/${USER_PATHS.TIMESHEET}`, timesheetRoutes);

export default router;
