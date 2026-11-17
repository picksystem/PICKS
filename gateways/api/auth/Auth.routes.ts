import { Router } from 'express';
import { AuthController } from './Auth.controller';

const controller = new AuthController();
const router = Router();

router.post('/', controller.handleAction);
// Read-only session status for GET — mirrors the POST `get-session` action so a
// plain `GET /api/auth` (old builds, browser prefetch, health probes) reports
// session state instead of falling through to the 404 handler.
router.get('/', controller.getSession);

export default router;
