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
  'internalNote',
]);

const SIMPLE_BUCKET_ALLOWED_FIELDS = new Set(['active', 'description']);

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * Validate the `priorities` section payload shape.
 * Returns an error string if invalid, null if valid.
 * The on-disk format for matrix cells is the extended cell shape
 * `{ priorityId, shortDescription?, description?, internalNote? }`,
 * so we reject anything that doesn't conform (and gracefully coerce the
 * legacy `priorityId: string` form).
 *
 * The Simple Properties activation state lives in `priorities.simplePriorities`
 * and is validated separately.
 */
const validatePrioritiesMatrices = (value: unknown): string | null => {
  if (!isPlainObject(value)) return '`priorities` section must be an object';
  const { matrices, simplePriorities } = value as {
    matrices?: unknown;
    simplePriorities?: unknown;
  };
  if (matrices === undefined && simplePriorities === undefined) return null;
  if (matrices !== undefined && !isPlainObject(matrices)) {
    return '`priorities.matrices` must be an object';
  }
  if (simplePriorities !== undefined) {
    if (!isPlainObject(simplePriorities)) {
      return '`priorities.simplePriorities` must be an object keyed by ticket type';
    }
    for (const [ttKey, bucket] of Object.entries(simplePriorities)) {
      if (!isPlainObject(bucket)) {
        return `priorities.simplePriorities['${ttKey}'] must be an object`;
      }
      for (const field of Object.keys(bucket)) {
        if (!SIMPLE_BUCKET_ALLOWED_FIELDS.has(field)) {
          return `priorities.simplePriorities['${ttKey}'] has unknown field '${field}'`;
        }
      }
      const b = bucket as { active?: unknown; description?: unknown };
      if (b.active !== undefined && typeof b.active !== 'boolean') {
        return `priorities.simplePriorities['${ttKey}'].active must be a boolean`;
      }
      if (b.description !== undefined && typeof b.description !== 'string') {
        return `priorities.simplePriorities['${ttKey}'].description must be a string`;
      }
      if (typeof b.description === 'string' && b.description.length > MAX_RICH_TEXT_LENGTH) {
        return `priorities.simplePriorities['${ttKey}'].description exceeds ${MAX_RICH_TEXT_LENGTH} characters`;
      }
    }
  }
  if (matrices === undefined) return null;

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
