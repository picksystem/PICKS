import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { prisma } from '@picks/database';
import { TicketController } from './Ticket.controller';
import { PrismaIncidentGateway, PrismaServiceRequestGateway, PrismaAdvisoryRequestGateway } from '@picks/core/infrastructure';
import {
  CreateIncidentUseCase,
  CreateServiceRequestUseCase,
  CreateAdvisoryRequestUseCase,
  GetIncidentByNumberUseCase,
  GetServiceRequestByNumberUseCase,
  GetAdvisoryRequestByNumberUseCase,
} from '@picks/core/use-cases';

// ── Gateways ─────────────────────────────────────────────────────────────────
const incidentGateway = new PrismaIncidentGateway(prisma as PrismaClient);
const serviceRequestGateway = new PrismaServiceRequestGateway(prisma as PrismaClient);
const advisoryRequestGateway = new PrismaAdvisoryRequestGateway(prisma as PrismaClient);

// ── Use Cases ─────────────────────────────────────────────────────────────────
const createIncidentUseCase = new CreateIncidentUseCase(incidentGateway);
const createServiceRequestUseCase = new CreateServiceRequestUseCase(serviceRequestGateway);
const createAdvisoryRequestUseCase = new CreateAdvisoryRequestUseCase(advisoryRequestGateway);
const getIncidentByNumberUseCase = new GetIncidentByNumberUseCase(incidentGateway);
const getServiceRequestByNumberUseCase = new GetServiceRequestByNumberUseCase(serviceRequestGateway);
const getAdvisoryRequestByNumberUseCase = new GetAdvisoryRequestByNumberUseCase(advisoryRequestGateway);

// ── Controller ────────────────────────────────────────────────────────────────
const controller = new TicketController(
  createIncidentUseCase,
  createServiceRequestUseCase,
  createAdvisoryRequestUseCase,
  getIncidentByNumberUseCase,
  getServiceRequestByNumberUseCase,
  getAdvisoryRequestByNumberUseCase,
);

// ── File upload setup ─────────────────────────────────────────────────────────
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

// Unified file upload
router.post('/attachments/upload', upload.array('files', 10), (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  const filenames = files.map((f) => f.filename);
  res.json({ data: filenames });
});

// Unified get by number endpoint — detects ticket type from number prefix
router.get('/:number', controller.getByNumber);

// Unified create endpoint — ticketType in body determines which entity is created
router.post('/', controller.create);

export default router;
