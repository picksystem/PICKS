import { Router } from 'express';
import { AuthController } from './Auth.controller';

const controller = new AuthController();
const router = Router();

router.post('/', controller.handleAction);

export default router;
