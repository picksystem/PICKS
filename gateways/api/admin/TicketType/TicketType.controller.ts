import { Request, Response } from 'express';
import { prisma } from '@serviceops/database';
import { PrismaTicketTypeGateway } from '@serviceops/core/infrastructure';
import {
  GetTicketTypesUseCase,
  GetTicketTypeByIdUseCase,
  CreateTicketTypeUseCase,
  UpdateTicketTypeUseCase,
  DeleteTicketTypeUseCase,
  ReorderTicketTypesUseCase,
} from '@serviceops/core/use-cases';

const gateway = new PrismaTicketTypeGateway(prisma as any);

const getTicketTypesUseCase = new GetTicketTypesUseCase(gateway);
const getTicketTypeByIdUseCase = new GetTicketTypeByIdUseCase(gateway);
const createTicketTypeUseCase = new CreateTicketTypeUseCase(gateway);
const updateTicketTypeUseCase = new UpdateTicketTypeUseCase(gateway);
const deleteTicketTypeUseCase = new DeleteTicketTypeUseCase(gateway);
const reorderTicketTypesUseCase = new ReorderTicketTypesUseCase(gateway);

export class TicketTypeController {
  get = async (_req: Request, res: Response): Promise<void> => {
    try {
      const data = await getTicketTypesUseCase.execute();
      res.json({ data, message: 'Ticket types retrieved successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to fetch ticket types' });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid ID format' });
        return;
      }
      const data = await getTicketTypeByIdUseCase.execute(id);
      res.json({ data, message: 'Ticket type retrieved successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to fetch ticket type' });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await createTicketTypeUseCase.execute(req.body);
      res.status(201).json({ data, message: 'Ticket type created successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to create ticket type' });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid ID format' });
        return;
      }
      const data = await updateTicketTypeUseCase.execute(id, req.body);
      res.json({ data, message: 'Ticket type updated successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to update ticket type' });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid ID format' });
        return;
      }
      await deleteTicketTypeUseCase.execute(id);
      res.json({ message: 'Ticket type deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to delete ticket type' });
    }
  };

  reorder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orders } = req.body;
      if (!Array.isArray(orders)) {
        res.status(400).json({ message: '`orders` must be an array' });
        return;
      }
      await reorderTicketTypesUseCase.execute(orders);
      res.json({ message: 'Ticket types reordered successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to reorder ticket types' });
    }
  };
}
