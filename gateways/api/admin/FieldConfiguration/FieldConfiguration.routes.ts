import { Router } from 'express';
import { FieldConfigurationController } from './FieldConfiguration.controller';
import { prisma } from '@serviceops/database';
import { PrismaClient } from '@prisma/client';
import { PrismaFieldConfigurationGateway } from '@serviceops/core/infrastructure';
import {
  CreateFieldConfigurationUseCase,
  GetFieldConfigurationUseCase,
  GetAllFieldConfigurationsUseCase,
  UpdateFieldConfigurationUseCase,
  DeleteFieldConfigurationUseCase,
} from '@serviceops/core/use-cases';

// Dependency injection - Gateway Pattern
const fieldConfigurationGateway = new PrismaFieldConfigurationGateway(prisma as PrismaClient);

// Use Cases with injected gateway
const createFieldConfigurationUseCase = new CreateFieldConfigurationUseCase(
  fieldConfigurationGateway,
);
const getFieldConfigurationUseCase = new GetFieldConfigurationUseCase(fieldConfigurationGateway);
const getAllFieldConfigurationsUseCase = new GetAllFieldConfigurationsUseCase(
  fieldConfigurationGateway,
);
const updateFieldConfigurationUseCase = new UpdateFieldConfigurationUseCase(
  fieldConfigurationGateway,
);
const deleteFieldConfigurationUseCase = new DeleteFieldConfigurationUseCase(
  fieldConfigurationGateway,
);

// Controller with injected use cases
const controller = new FieldConfigurationController(
  createFieldConfigurationUseCase,
  getFieldConfigurationUseCase,
  getAllFieldConfigurationsUseCase,
  updateFieldConfigurationUseCase,
  deleteFieldConfigurationUseCase,
);

const router = Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
