import { Router } from 'express';
import { prisma } from '@serviceops/database';
import { PrismaConfigurationGateway } from '../../../../libs/core/infrastructure/admin/PrismaConfigurationGateway';
import { getCacheGateway } from '../../../../libs/core/infrastructure/cache/cache.factory';
import { GetConfigurationUseCase } from '../../../../libs/core/use-cases/admin/configuration/GetConfiguration.usecase';
import { UpdateConfigurationUseCase } from '../../../../libs/core/use-cases/admin/configuration/UpdateConfiguration.usecase';
import { UpdateConfigurationSectionUseCase } from '../../../../libs/core/use-cases/admin/configuration/UpdateConfigurationSection.usecase';
import { ConfigurationController } from './Configuration.controller';
import { requireAdmin } from '@serviceops/middleware';

const router = Router();

const gateway = new PrismaConfigurationGateway(prisma, getCacheGateway());
const getUseCase = new GetConfigurationUseCase(gateway);
const updateUseCase = new UpdateConfigurationUseCase(gateway);
const updateSectionUseCase = new UpdateConfigurationSectionUseCase(gateway);

const controller = new ConfigurationController(getUseCase, updateUseCase, updateSectionUseCase);

// Reads are available to any authenticated user; writes are admin-only.
router.get('/', controller.get);
router.put('/', requireAdmin, controller.update);
router.patch('/:section', requireAdmin, controller.updateSection);

export default router;
