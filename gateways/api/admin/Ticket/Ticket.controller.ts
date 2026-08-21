import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '@serviceops/database';
import {
  TicketManagementUseCase,
  IAddCommentInput,
  IAddTimeEntryInput,
  IAddResolutionInput,
  IAddActivityInput,
} from '@serviceops/core/use-cases';
import { AdminTicketGateway } from '@serviceops/core/infrastructure';

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

// ── Dependency wiring ────────────────────────────────────────────────────────

const ticketGateway = new AdminTicketGateway(prisma as any);
const ticketUseCase = new TicketManagementUseCase(ticketGateway);

// ── Route builder ────────────────────────────────────────────────────────────

export function buildTicketRouter(): Router {
  const router = Router();

  // ── Drafts ────────────────────────────────────────────────────────────────

  router.get('/drafts', async (req: Request, res: Response): Promise<void> => {
    try {
      const ticketType = req.query.ticketType as string | undefined;
      const drafts = await ticketUseCase.getDrafts(ticketType ? { ticketType } : undefined);
      res.json({ message: 'Draft tickets retrieved successfully', data: drafts });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to fetch drafts' });
    }
  });

  // ── Sub-resources (must be before /:number to avoid route shadowing) ───────

  // Comments
  router.get('/:ticketId/comments', async (req: Request, res: Response): Promise<void> => {
    try {
      const ticketId = parseInt(req.params.ticketId, 10);
      const comments = await ticketUseCase.getComments(ticketId);
      res.json({ message: 'Comments retrieved successfully', data: comments });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to fetch comments' });
    }
  });

  router.post('/:ticketId/comments', async (req: Request, res: Response): Promise<void> => {
    try {
      const ticketId = parseInt(req.params.ticketId, 10);
      const comment = await ticketUseCase.addComment({
        ...req.body,
        ticketId,
      } as IAddCommentInput);
      res.status(201).json({ message: 'Comment added successfully', data: comment });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to add comment' });
    }
  });

  router.patch(
    '/:ticketId/comments/:commentId',
    async (req: Request, res: Response): Promise<void> => {
      try {
        const commentId = parseInt(req.params.commentId, 10);
        const { isPinned, isSaved, message } = req.body as {
          isPinned?: boolean;
          isSaved?: boolean;
          message?: string;
        };
        const comment = await ticketUseCase.updateComment(commentId, {
          isPinned,
          isSaved,
          message,
        });
        res.json({ message: 'Comment updated successfully', data: comment });
      } catch (error: any) {
        res.status(500).json({ message: error.message || 'Failed to update comment' });
      }
    },
  );

  // Time entries
  router.get('/:ticketId/time-entries', async (req: Request, res: Response): Promise<void> => {
    try {
      const ticketId = parseInt(req.params.ticketId, 10);
      const entries = await ticketUseCase.getTimeEntries(ticketId);
      res.json({ message: 'Time entries retrieved successfully', data: entries });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to fetch time entries' });
    }
  });

  router.post('/:ticketId/time-entries', async (req: Request, res: Response): Promise<void> => {
    try {
      const ticketId = parseInt(req.params.ticketId, 10);
      const entry = await ticketUseCase.addTimeEntry({
        ...req.body,
        ticketId,
      } as IAddTimeEntryInput);
      res.status(201).json({ message: 'Time entry added successfully', data: entry });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to add time entry' });
    }
  });

  // Resolutions
  router.get('/:ticketId/resolutions', async (req: Request, res: Response): Promise<void> => {
    try {
      const ticketId = parseInt(req.params.ticketId, 10);
      const resolutions = await ticketUseCase.getResolutions(ticketId);
      res.json({ message: 'Resolutions retrieved successfully', data: resolutions });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to fetch resolutions' });
    }
  });

  router.post('/:ticketId/resolutions', async (req: Request, res: Response): Promise<void> => {
    try {
      const ticketId = parseInt(req.params.ticketId, 10);
      const resolution = await ticketUseCase.addResolution({
        ...req.body,
        ticketId,
      } as IAddResolutionInput);
      res.status(201).json({ message: 'Resolution added successfully', data: resolution });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to add resolution' });
    }
  });

  // Activities
  router.get('/:ticketId/activities', async (req: Request, res: Response): Promise<void> => {
    try {
      const ticketId = parseInt(req.params.ticketId, 10);
      const activities = await ticketUseCase.getActivities(ticketId);
      res.json({ message: 'Activities retrieved successfully', data: activities });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to fetch activities' });
    }
  });

  // ── Get by number (legacy — matches ticket number string) ─────────────────

  router.get('/:number', async (req: Request, res: Response): Promise<void> => {
    try {
      const { number } = req.params;
      const ticket = await ticketUseCase.getByNumber(number);

      if (!ticket) {
        res.status(404).json({ message: `Ticket not found: ${number}` });
        return;
      }

      res.json({ message: 'OK', data: ticket });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to fetch ticket' });
    }
  });

  // ── Create ───────────────────────────────────────────────────────────────

  router.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
      const { ticketType, ...data } = req.body;

      if (!ticketType) {
        res.status(400).json({ message: 'ticketType is required' });
        return;
      }

      const ticket = await ticketUseCase.create({
        ticketType,
        ...data,
        createdBy: data.createdBy || 'system',
      });
      res.status(201).json({
        message: 'Ticket created successfully',
        data: ticket,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to create ticket' });
    }
  });

  // ── List all (optional ?ticketType= filter) ──────────────────────────────

  router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
      const ticketType = req.query.ticketType as string | undefined;
      const tickets = await ticketUseCase.getAll(ticketType ? { ticketType } : undefined);
      res.json({ message: 'Tickets retrieved successfully', data: tickets });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to fetch tickets' });
    }
  });

  // ── Get / Update / Delete by ID ─────────────────────────────────────────

  router.get('/id/:id', async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid ID format' });
        return;
      }

      const ticket = await ticketUseCase.getById(id);
      if (!ticket) {
        res.status(404).json({ message: `Ticket with ID ${id} not found` });
        return;
      }

      res.json({ message: 'Ticket retrieved successfully', data: ticket });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to fetch ticket' });
    }
  });

  router.put('/id/:id', async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid ID format' });
        return;
      }

      const { ticketType, ...data } = req.body;

      const ticket = await ticketUseCase.update(id, data as any);
      res.json({ message: 'Ticket updated successfully', data: ticket });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to update ticket' });
    }
  });

  router.patch('/id/:id', async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid ID format' });
        return;
      }

      const { ticketType, ...data } = req.body;

      const ticket = await ticketUseCase.update(id, data as any);
      res.json({ message: 'Ticket updated successfully', data: ticket });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to update ticket' });
    }
  });

  router.delete('/id/:id', async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid ID format' });
        return;
      }

      const ticket = await ticketUseCase.delete(id);
      res.json({ message: 'Ticket deleted successfully', data: ticket });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to delete ticket' });
    }
  });

  // File upload
  router.post('/attachments/upload', upload.array('files', 10), (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    const filenames = files.map((f) => f.filename);
    res.json({ data: filenames });
  });

  return router;
}
