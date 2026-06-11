import { Request, Response } from 'express';
import { IConfigurationData } from '@serviceops/interfaces';
import { GetConfigurationUseCase } from '../../../../libs/core/use-cases/admin/configuration/GetConfiguration.usecase';
import { UpdateConfigurationUseCase } from '../../../../libs/core/use-cases/admin/configuration/UpdateConfiguration.usecase';
import { UpdateConfigurationSectionUseCase } from '../../../../libs/core/use-cases/admin/configuration/UpdateConfigurationSection.usecase';

const MAX_RICH_TEXT_LENGTH = 50_000;
const MATRIX_ALLOWED_FIELDS = new Set([
  'priorityId',
  'shortDescription',
  'description',
  'activateSimplePriorities',
  'internalNote',
]);

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * Validate the `priorities.matrices` payload shape.
 * Returns an error string if invalid, null if valid.
 * The on-disk format is the extended cell shape
 * `{ priorityId, shortDescription?, description?, activateSimplePriorities?, internalNote? }`,
 * so we reject anything that doesn't conform (and gracefully coerce the
 * legacy `priorityId: string` form).
 */
const validatePrioritiesMatrices = (value: unknown): string | null => {
  if (!isPlainObject(value)) return '`priorities` section must be an object';
  const { matrices } = value as { matrices?: unknown };
  if (matrices === undefined) return null;
  if (!isPlainObject(matrices)) return '`priorities.matrices` must be an object';

  for (const [ticketType, byImpact] of Object.entries(matrices)) {
    if (!isPlainObject(byImpact)) {
      return `priorities.matrices['${ticketType}'] must be an object keyed by impact id`;
    }
    for (const [impactId, byUrgency] of Object.entries(byImpact)) {
      if (!isPlainObject(byUrgency)) {
        return `priorities.matrices['${ticketType}']['${impactId}'] must be an object keyed by urgency id`;
      }
      for (const [urgencyId, cell] of Object.entries(byUrgency)) {
        if (typeof cell === 'string') {
          // Legacy format — auto-coerced in the gateway, accept silently.
          continue;
        }
        if (!isPlainObject(cell)) {
          return `priorities.matrices['${ticketType}']['${impactId}']['${urgencyId}'] must be an object`;
        }
        for (const field of Object.keys(cell)) {
          if (!MATRIX_ALLOWED_FIELDS.has(field)) {
            return `priorities.matrices['${ticketType}']['${impactId}']['${urgencyId}'] has unknown field '${field}'`;
          }
        }
        const c = cell as {
          priorityId?: unknown;
          shortDescription?: unknown;
          description?: unknown;
          activateSimplePriorities?: unknown;
          internalNote?: unknown;
        };
        if (typeof c.priorityId !== 'string') {
          return `priorities.matrices['${ticketType}']['${impactId}']['${urgencyId}'].priorityId must be a string`;
        }
        for (const textField of ['shortDescription', 'description', 'internalNote'] as const) {
          const v = c[textField];
          if (v !== undefined && typeof v !== 'string') {
            return `priorities.matrices['${ticketType}']['${impactId}']['${urgencyId}'].${textField} must be a string`;
          }
          if (typeof v === 'string' && v.length > MAX_RICH_TEXT_LENGTH) {
            return `priorities.matrices['${ticketType}']['${impactId}']['${urgencyId}'].${textField} exceeds ${MAX_RICH_TEXT_LENGTH} characters`;
          }
        }
        if (
          c.activateSimplePriorities !== undefined &&
          typeof c.activateSimplePriorities !== 'boolean'
        ) {
          return `priorities.matrices['${ticketType}']['${impactId}']['${urgencyId}'].activateSimplePriorities must be a boolean`;
        }
      }
    }
  }
  return null;
};

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
    const prioritiesError = validatePrioritiesMatrices(data.priorities);
    if (prioritiesError) {
      res.status(400).json({ message: prioritiesError });
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
      'reasonCodes',
      'timesheets',
      'expenses',
      'calendars',
      'ticketUpdateTemplates',
      'commentTemplates',
      'internalNoteTemplates',
      'resolutionTemplates',
      'timeEntryTemplates',
    ];
    if (!validSections.includes(section)) {
      res.status(400).json({ message: `Unknown section: ${section}` });
      return;
    }
    if (value === undefined) {
      res.status(400).json({ message: '`value` field is required' });
      return;
    }
    if (section === 'priorities') {
      const prioritiesError = validatePrioritiesMatrices(value);
      if (prioritiesError) {
        res.status(400).json({ message: prioritiesError });
        return;
      }
    }
    const updated = await this.updateConfigurationSectionUseCase.execute({
      section,
      value,
      updatedBy,
    });
    res.json({ data: updated, message: `Configuration section '${section}' updated` });
  };
}
