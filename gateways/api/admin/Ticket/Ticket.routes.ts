import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { buildTicketRouter } from './Ticket.controller';

/**
 * Bootstraps the ticket router by reading active ticket types from the
 * adminTicketType table and mounting all CRUD endpoints.
 *
 * Call this at server startup (after the DB is ready). Re-invoking it refreshes
 * the routing map (useful for tests or hot-reload of configuration).
 */
export async function createTicketRouter(): Promise<Router> {
  // File upload setup
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

  const ticketsRouter = await buildTicketRouter();

  // Unified file upload
  ticketsRouter.post(
    '/attachments/upload',
    upload.array('files', 10),
    (req: Request, res: Response) => {
      const files = req.files as Express.Multer.File[];
      const filenames = files.map((f) => f.filename);
      res.json({ data: filenames });
    },
  );

  return ticketsRouter;
}
