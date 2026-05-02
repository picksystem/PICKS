import { Request, Response } from 'express';
import { IConfigurationData } from '@serviceops/interfaces';
import { GetConfigurationUseCase } from '../../../../libs/core/use-cases/admin/configuration/GetConfiguration.usecase';
import { UpdateConfigurationUseCase } from '../../../../libs/core/use-cases/admin/configuration/UpdateConfiguration.usecase';
import { UpdateConfigurationSectionUseCase } from '../../../../libs/core/use-cases/admin/configuration/UpdateConfigurationSection.usecase';

export class ConfigurationController {
  constructor(
    private readonly getConfigurationUseCase: GetConfigurationUseCase,
    private readonly updateConfigurationUseCase: UpdateConfigurationUseCase,
    private readonly updateConfigurationSectionUseCase: UpdateConfigurationSectionUseCase,
  ) {}

  /** GET /api/admin/configuration */
  get = async (_req: Request, res: Response): Promise<void> => {
    const data = await this.getConfigurationUseCase.execute();
    res.json({ data, message: 'Configuration retrieved' });
  };

  /** PUT /api/admin/configuration — replace full config */
  update = async (req: Request, res: Response): Promise<void> => {
    const { data, updatedBy } = req.body as { data: IConfigurationData; updatedBy?: number };
    if (!data) {
      res.status(400).json({ message: '`data` field is required' });
      return;
    }
    const updated = await this.updateConfigurationUseCase.execute({ data, updatedBy });
    res.json({ data: updated, message: 'Configuration updated' });
  };

  /** PATCH /api/admin/configuration/:section — update a single section */
  updateSection = async (req: Request, res: Response): Promise<void> => {
    const section = req.params.section as keyof IConfigurationData;
    const { value, updatedBy } = req.body as {
      value: IConfigurationData[typeof section];
      updatedBy?: number;
    };
    const validSections: (keyof IConfigurationData)[] = [
      'general',
      'priorities',
      'statuses',
      'releaseStatuses',
      'slas',
      'categorization',
      'consultantProfiles',
      'approvals',
      'userConfig',
    ];
    if (!validSections.includes(section)) {
      res.status(400).json({ message: `Unknown section: ${section}` });
      return;
    }
    if (value === undefined) {
      res.status(400).json({ message: '`value` field is required' });
      return;
    }
    const updated = await this.updateConfigurationSectionUseCase.execute({
      section,
      value,
      updatedBy,
    });
    res.json({ data: updated, message: `Configuration section '${section}' updated` });
  };
}
