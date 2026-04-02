import { Router } from 'express';

import notFoundRoutes from './NotFound/NotFound.routes';
import { USER_PATHS } from '@serviceops/constants';

const router = Router();

router.use(`/${USER_PATHS.NOT_FOUND}`, notFoundRoutes);

export default router;
