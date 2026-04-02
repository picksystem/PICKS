import { Router } from 'express';
import { prisma } from '@serviceops/database';
import { PrismaConfigurationGateway } from '../../../../libs/core/infrastructure/admin/PrismaConfigurationGateway';
import { GetConfigurationUseCase } from '../../../../libs/core/use-cases/admin/configuration/GetConfiguration.usecase';
import { UpdateConfigurationUseCase } from '../../../../libs/core/use-cases/admin/configuration/UpdateConfiguration.usecase';
import { UpdateConfigurationSectionUseCase } from '../../../../libs/core/use-cases/admin/configuration/UpdateConfigurationSection.usecase';
import { ConfigurationController } from './Configuration.controller';

const router = Router();

const gateway = new PrismaConfigurationGateway(prisma);
const getUseCase = new GetConfigurationUseCase(gateway);
const updateUseCase = new UpdateConfigurationUseCase(gateway);
const updateSectionUseCase = new UpdateConfigurationSectionUseCase(gateway);

const controller = new ConfigurationController(getUseCase, updateUseCase, updateSectionUseCase);

router.get('/', controller.get);
router.put('/', controller.update);
router.patch('/:section', controller.updateSection);

export default router;
