import { Router } from 'express';
import { TicketTypeController } from './TicketType.controller';
import { prisma } from '@serviceops/database';
import { PrismaClient } from '@prisma/client';
import { PrismaTicketTypeGateway } from '@serviceops/core/infrastructure';
import {
  CreateTicketTypeUseCase,
  GetTicketTypeUseCase,
  GetAllTicketTypesUseCase,
  UpdateTicketTypeUseCase,
  DeleteTicketTypeUseCase,
  ReorderTicketTypesUseCase,
} from '@serviceops/core/use-cases';

// Dependency injection - Gateway Pattern
const ticketTypeGateway = new PrismaTicketTypeGateway(prisma as PrismaClient);

// Use Cases with injected gateway
const createTicketTypeUseCase = new CreateTicketTypeUseCase(ticketTypeGateway);
const getTicketTypeUseCase = new GetTicketTypeUseCase(ticketTypeGateway);
const getAllTicketTypesUseCase = new GetAllTicketTypesUseCase(ticketTypeGateway);
const updateTicketTypeUseCase = new UpdateTicketTypeUseCase(ticketTypeGateway);
const deleteTicketTypeUseCase = new DeleteTicketTypeUseCase(ticketTypeGateway);
const reorderTicketTypesUseCase = new ReorderTicketTypesUseCase(ticketTypeGateway);

// Controller with injected use cases
const controller = new TicketTypeController(
  createTicketTypeUseCase,
  getTicketTypeUseCase,
  getAllTicketTypesUseCase,
  updateTicketTypeUseCase,
  deleteTicketTypeUseCase,
  reorderTicketTypesUseCase,
);

const router = Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.patch('/reorder', controller.reorder);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
