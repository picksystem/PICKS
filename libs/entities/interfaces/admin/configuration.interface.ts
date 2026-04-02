// ── Primitive building blocks ──────────────────────────────────────────────────

export interface IConfigPriorityLevel {
  id: string;
  name: string;
  description: string;
  color: string;
  bgColor: string;
  sortOrder: number;
  /** ticketType key → enabled flag; keys are synced from AdminTicketType */
  enabledFor: Record<string, boolean>;
}

export interface IConfigImpactLevel {
  id: string;
  name: string;
  displayName: string;
  description: string;
  bgColor: string;
  sortOrder: number;
  isActive: boolean;
  /** ticketType key → enabled flag */
  enabledFor: Record<string, boolean>;
}

export interface IConfigUrgencyLevel {
  id: string;
  name: string;
  displayName: string;
  description: string;
  bgColor: string;
  sortOrder: number;
  isActive: boolean;
  /** ticketType key → enabled flag */
  enabledFor: Record<string, boolean>;
}

/** impactId → urgencyId → priorityId */
export type IConfigMatrixMap = Record<string, Record<string, string>>;

export interface IConfigStatusLevel {
  id: string;
  name: string;
  displayName: string;
  description: string;
  color: string;
  bgColor: string;
  sortOrder: number;
  isActive: boolean;
  isFinal: boolean; // resolved/closed/cancelled
}

export interface IConfigSLA {
  id: string;
  name: string;
  description: string;
  priorityId: string;
  responseTimeMinutes: number;
  resolutionTimeMinutes: number;
  enabledFor: Record<string, boolean>;
  isActive: boolean;
}

// ── Section shapes ─────────────────────────────────────────────────────────────

export interface IConfigGeneral {
  systemName: string;
  systemDescription: string;
  timezone: string;
  dateFormat: string;
  language: string;
}

export interface IConfigPriorities {
  levels: IConfigPriorityLevel[];
  impactLevels: IConfigImpactLevel[];
  urgencyLevels: IConfigUrgencyLevel[];
  /** ticketType key → IConfigMatrixMap; auto-populated for every active ticket type */
  matrices: Record<string, IConfigMatrixMap>;
}

export interface IConfigStatuses {
  /** ticketType key → status list */
  byTicketType: Record<string, IConfigStatusLevel[]>;
}

export interface IConfigSLAs {
  items: IConfigSLA[];
}

// ── Root configuration document ───────────────────────────────────────────────

/** Full configuration stored as a single JSON document in AdminConfiguration. */
export interface IConfigurationData {
  general: IConfigGeneral;
  priorities: IConfigPriorities;
  statuses: IConfigStatuses;
  slas: IConfigSLAs;
  // Future sections (categorization, approvals, calendars, …) extend here
}

export interface IConfiguration {
  id: number;
  data: IConfigurationData;
  updatedBy?: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ── API response shapes ────────────────────────────────────────────────────────

export interface IConfigurationResponse {
  message: string;
  data: IConfiguration;
}

// ── Input shapes ───────────────────────────────────────────────────────────────

/** Replace the full configuration document. */
export interface IUpdateConfigurationInput {
  data: IConfigurationData;
  updatedBy?: number;
}

/** Update a single named section without touching others. */
export interface IUpdateConfigurationSectionInput<
  K extends keyof IConfigurationData = keyof IConfigurationData,
> {
  section: K;
  value: IConfigurationData[K];
  updatedBy?: number;
}

// ── Gateway interface ─────────────────────────────────────────────────────────

export interface IConfigurationGateway {
  /** Returns the singleton row, auto-creating it with defaults when absent. */
  get(): Promise<IConfiguration>;
  /** Full replace of the configuration data. */
  upsert(data: IConfigurationData, updatedBy?: number): Promise<IConfiguration>;
  /** Patch a single section; other sections remain untouched. */
  updateSection<K extends keyof IConfigurationData>(
    section: K,
    value: IConfigurationData[K],
    updatedBy?: number,
  ): Promise<IConfiguration>;
}

// ── Use-case interfaces ───────────────────────────────────────────────────────

export interface IGetConfigurationUseCase {
  execute(): Promise<IConfiguration>;
}

export interface IUpdateConfigurationUseCase {
  execute(input: IUpdateConfigurationInput): Promise<IConfiguration>;
}

export interface IUpdateConfigurationSectionUseCase {
  execute<K extends keyof IConfigurationData>(
    input: IUpdateConfigurationSectionInput<K>,
  ): Promise<IConfiguration>;
}

// ── Default values (shared between backend seed / frontend fallback) ──────────

export const DEFAULT_CONFIGURATION_DATA: IConfigurationData = {
  general: {
    systemName: 'serivceops',
    systemDescription: 'IT Service Management Platform',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    language: 'en',
  },
  priorities: {
    levels: [
      {
        id: 'critical',
        name: '1-Critical',
        description: 'Business-critical outage — immediate action required',
        color: '#fff',
        bgColor: '#b91c1c',
        sortOrder: 1,
        enabledFor: {},
      },
      {
        id: 'high',
        name: '2-High',
        description: 'Major impact on operations — urgent attention needed',
        color: '#fff',
        bgColor: '#ea580c',
        sortOrder: 2,
        enabledFor: {},
      },
      {
        id: 'medium',
        name: '3-Medium',
        description: 'Moderate impact — address promptly',
        color: '#fff',
        bgColor: '#ca8a04',
        sortOrder: 3,
        enabledFor: {},
      },
      {
        id: 'low',
        name: '4-Low',
        description: 'Minor impact — address within normal SLA windows',
        color: '#fff',
        bgColor: '#2563eb',
        sortOrder: 4,
        enabledFor: {},
      },
      {
        id: 'planning',
        name: '5-Planning',
        description: 'Scheduled or planned work — no immediate urgency',
        color: '#fff',
        bgColor: '#0f766e',
        sortOrder: 5,
        enabledFor: {},
      },
    ],
    impactLevels: [
      {
        id: 'high',
        name: 'high',
        displayName: '1 - High',
        description: 'Widespread disruption affecting multiple users or core business functions',
        bgColor: '#b91c1c',
        sortOrder: 1,
        isActive: true,
        enabledFor: {},
      },
      {
        id: 'medium',
        name: 'medium',
        displayName: '2 - Medium',
        description: 'Partial disruption affecting a team or non-critical business function',
        bgColor: '#ca8a04',
        sortOrder: 2,
        isActive: true,
        enabledFor: {},
      },
      {
        id: 'low',
        name: 'low',
        displayName: '3 - Low',
        description: 'Minimal disruption, isolated to a single user or workaround available',
        bgColor: '#15803d',
        sortOrder: 3,
        isActive: true,
        enabledFor: {},
      },
    ],
    urgencyLevels: [
      {
        id: 'high',
        name: 'high',
        displayName: '1 - High',
        description: 'Immediate resolution required — time-critical situation',
        bgColor: '#b91c1c',
        sortOrder: 1,
        isActive: true,
        enabledFor: {},
      },
      {
        id: 'medium',
        name: 'medium',
        displayName: '2 - Medium',
        description: 'Should be resolved within hours — significant business pressure',
        bgColor: '#ca8a04',
        sortOrder: 2,
        isActive: true,
        enabledFor: {},
      },
      {
        id: 'low',
        name: 'low',
        displayName: '3 - Low',
        description: 'Can wait until next available window — low time sensitivity',
        bgColor: '#15803d',
        sortOrder: 3,
        isActive: true,
        enabledFor: {},
      },
    ],
    /** matrices are seeded per-ticket-type when the config is first read */
    matrices: {},
  },
  statuses: {
    byTicketType: {},
  },
  slas: {
    items: [],
  },
};
