import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { IncidentController } from './Incident.controller';
import { prisma } from '@serviceops/database';
import { PrismaClient } from '@prisma/client';
import { PrismaIncidentGateway } from '@serviceops/core/infrastructure';
import {
  CreateIncidentUseCase,
  GetIncidentUseCase,
  GetIncidentByNumberUseCase,
  GetAllIncidentsUseCase,
  UpdateIncidentUseCase,
  DeleteIncidentUseCase,
  CleanupExpiredDraftsUseCase,
} from '@serviceops/core/use-cases';

// Dependency injection - Gateway Pattern
const incidentGateway = new PrismaIncidentGateway(prisma as PrismaClient);

// Use Cases with injected gateway
const createIncidentUseCase = new CreateIncidentUseCase(incidentGateway);
const getIncidentUseCase = new GetIncidentUseCase(incidentGateway);
const getIncidentByNumberUseCase = new GetIncidentByNumberUseCase(incidentGateway);
const getAllIncidentsUseCase = new GetAllIncidentsUseCase(incidentGateway);
const updateIncidentUseCase = new UpdateIncidentUseCase(incidentGateway);
const deleteIncidentUseCase = new DeleteIncidentUseCase(incidentGateway);
const cleanupExpiredDraftsUseCase = new CleanupExpiredDraftsUseCase(incidentGateway);

// Controller with injected use cases
const controller = new IncidentController(
  createIncidentUseCase,
  getIncidentUseCase,
  getIncidentByNumberUseCase,
  getAllIncidentsUseCase,
  updateIncidentUseCase,
  deleteIncidentUseCase,
  cleanupExpiredDraftsUseCase,
  prisma as PrismaClient,
);

// ── File upload setup ────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '../../../../uploads/attachments');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    // Only strip characters that are truly unsafe on Windows/Linux filesystems.
    // Preserve spaces, parentheses, etc. so the stored filename matches the original name.
    const safeName = file.originalname.replace(/[/\\:*?"<>|]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /pdf|doc|docx|xls|xlsx|png|jpg|jpeg|gif/i;
    const ext = path.extname(file.originalname).slice(1);
    cb(null, allowed.test(ext));
  },
});

const router = Router();

// File upload
router.post('/attachments/upload', upload.array('files', 10), (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  const filenames = files.map((f) => f.filename);
  res.json({ data: filenames });
});

// Incident CRUD
router.get('/', controller.getAll);
router.get('/drafts', controller.getDrafts);
router.get('/number/:number', controller.getByNumber);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.delete);

// Comments
router.get('/:id/comments', controller.getComments);
router.post('/:id/comments', controller.createComment);

// Time Entries
router.get('/:id/time-entries', controller.getTimeEntries);
router.post('/:id/time-entries', controller.createTimeEntry);

// Resolutions
router.get('/:id/resolutions', controller.getResolutions);
router.post('/:id/resolutions', controller.createResolution);

// Activities
router.get('/:id/activities', controller.getActivities);

export { incidentGateway };
export default router;
