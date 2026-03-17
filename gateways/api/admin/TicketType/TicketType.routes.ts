import { Router } from 'express';
import { TicketTypeController } from './TicketType.controller';
import { prisma } from '@picks/database';
import { PrismaClient } from '@prisma/client';
import { PrismaTicketTypeGateway } from '@picks/core/infrastructure';
import {
  CreateTicketTypeUseCase,
  GetTicketTypeUseCase,
  GetAllTicketTypesUseCase,
  UpdateTicketTypeUseCase,
  DeleteTicketTypeUseCase,
} from '@picks/core/use-cases';

// Dependency injection - Gateway Pattern
const ticketTypeGateway = new PrismaTicketTypeGateway(prisma as PrismaClient);

// Use Cases with injected gateway
const createTicketTypeUseCase = new CreateTicketTypeUseCase(ticketTypeGateway);
const getTicketTypeUseCase = new GetTicketTypeUseCase(ticketTypeGateway);
const getAllTicketTypesUseCase = new GetAllTicketTypesUseCase(ticketTypeGateway);
const updateTicketTypeUseCase = new UpdateTicketTypeUseCase(ticketTypeGateway);
const deleteTicketTypeUseCase = new DeleteTicketTypeUseCase(ticketTypeGateway);

// Controller with injected use cases
const controller = new TicketTypeController(
  createTicketTypeUseCase,
  getTicketTypeUseCase,
  getAllTicketTypesUseCase,
  updateTicketTypeUseCase,
  deleteTicketTypeUseCase,
);

const router = Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
