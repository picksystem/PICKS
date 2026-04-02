import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AdvisoryRequestController } from './AdvisoryRequest.controller';
import { prisma, pool } from '@serviceops/database';
import { PrismaAdvisoryRequestGateway } from '@serviceops/core/infrastructure';
import {
  CreateAdvisoryRequestUseCase,
  GetAdvisoryRequestUseCase,
  GetAdvisoryRequestByNumberUseCase,
  GetAllAdvisoryRequestsUseCase,
  UpdateAdvisoryRequestUseCase,
  DeleteAdvisoryRequestUseCase,
} from '@serviceops/core/use-cases';

// Dependency injection - Gateway Pattern
const advisoryRequestGateway = new PrismaAdvisoryRequestGateway(prisma, pool);

// Use Cases with injected gateway
const createAdvisoryRequestUseCase = new CreateAdvisoryRequestUseCase(advisoryRequestGateway);
const getAdvisoryRequestUseCase = new GetAdvisoryRequestUseCase(advisoryRequestGateway);
const getAdvisoryRequestByNumberUseCase = new GetAdvisoryRequestByNumberUseCase(
  advisoryRequestGateway,
);
const getAllAdvisoryRequestsUseCase = new GetAllAdvisoryRequestsUseCase(advisoryRequestGateway);
const updateAdvisoryRequestUseCase = new UpdateAdvisoryRequestUseCase(advisoryRequestGateway);
const deleteAdvisoryRequestUseCase = new DeleteAdvisoryRequestUseCase(advisoryRequestGateway);

// Controller with injected use cases
const controller = new AdvisoryRequestController(
  createAdvisoryRequestUseCase,
  getAdvisoryRequestUseCase,
  getAdvisoryRequestByNumberUseCase,
  getAllAdvisoryRequestsUseCase,
  updateAdvisoryRequestUseCase,
  deleteAdvisoryRequestUseCase,
  prisma,
);

// ── File upload setup ────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '../../../../uploads/attachments');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
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

// Advisory Request CRUD
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

export { advisoryRequestGateway };
export default router;
