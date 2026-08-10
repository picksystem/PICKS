/**
 * Admin Ticket Type Interfaces
 * Shared between Frontend and Backend
 *
 * Ticket Types:
 * - Incident
 * - Service Request
 * - Change Request
 * - Problem Request
 * - Task
 * - Ticket Template
 */

export interface ITicketTypeGateway {
  getAll(): Promise<ITicketType[]>;
  getById(id: number): Promise<ITicketType | null>;
  create(input: ICreateTicketTypeInput): Promise<ITicketType>;
  update(id: number, input: IUpdateTicketTypeInput): Promise<ITicketType>;
  delete(id: number): Promise<void>;
  reorder(orders: { id: number; displayOrder: number }[]): Promise<void>;
}

export type CustomFieldType = 'text' | 'textarea' | 'number' | 'date' | 'dropdown' | 'checkbox';

export interface ICustomField {
  id: string;
  fieldKey: string;
  fieldName: string;
  fieldType: CustomFieldType;
  path?: string;
  dropdownOptions?: string[];
  defaultValue?: string;
  isRequired?: boolean;
  /**
   * Per-ticket-type use flags. The key is the ticket type's `type`
   * (e.g. "incident", "service_request"). A field may be enabled on
   * one or more ticket types — they are not mutually exclusive.
   *
   * Special keys reserved for cross-cutting use:
   *  - `__createTicket__` — attaches the field to the generic Create Ticket form
   *  - `__ticketDetails__` — attaches the field to the generic Ticket Details sidebar
   */
  fieldUse: Record<string, boolean>;
  displayOrder: number;
}

export interface ITicketTypeSectionLayoutConfig {
  selectedFields: string[];
}

export interface ITicketTypeInfoBarLayoutConfig extends ITicketTypeSectionLayoutConfig {
  maxFields: number;
}

export interface ICreateTicketSectionLayoutConfig {
  selectedFields: string[];
}

export interface ITicketTypeLayoutConfig {
  infoBar: ITicketTypeInfoBarLayoutConfig;
  sideBar: ITicketTypeSectionLayoutConfig;
  ticketOptions: ITicketTypeSectionLayoutConfig;
  assignment: ITicketTypeSectionLayoutConfig;
  contactAndBilling: ITicketTypeSectionLayoutConfig;
  reporting: ITicketTypeSectionLayoutConfig;
  datesAndUsers: ITicketTypeSectionLayoutConfig;
  additionalFields: ITicketTypeSectionLayoutConfig;
  ticketCore: ITicketTypeSectionLayoutConfig;
  changeManagement: ITicketTypeSectionLayoutConfig;
  vendorBug: ITicketTypeSectionLayoutConfig;
  changeControl: ITicketTypeSectionLayoutConfig;
  resolutionWorkaround: ITicketTypeSectionLayoutConfig;
  createTicket: {
    ticketInformation: ICreateTicketSectionLayoutConfig;
    categorization: ICreateTicketSectionLayoutConfig;
    description: ICreateTicketSectionLayoutConfig;
    additionalDetails: ICreateTicketSectionLayoutConfig;
    priorityAssignment: ICreateTicketSectionLayoutConfig;
    auditInformation: ICreateTicketSectionLayoutConfig;
    attachments: ICreateTicketSectionLayoutConfig;
  };
}

export interface ITicketType {
  id: number;
  type: string;
  name: string;
  displayName: string;
  displayTag: string;
  shortDescription: string;
  description: string;
  prefix: string;
  isActive: boolean;
  numberLength: number;
  displayOrder: number;
  accessControl?: string[];
  layoutConfig?: ITicketTypeLayoutConfig | null;
  customFields?: ICustomField[];
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface ICreateTicketTypeInput {
  type: string;
  name: string;
  displayName?: string;
  displayTag?: string;
  shortDescription?: string;
  description?: string;
  prefix?: string;
  isActive?: boolean;
  numberLength?: number;
  displayOrder?: number;
  accessControl?: string[];
  layoutConfig?: ITicketTypeLayoutConfig | null;
  iconKey?: string;
  tag?: string;
  customFields?: ICustomField[];
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface IUpdateTicketTypeInput {
  type?: string;
  name?: string;
  displayName?: string;
  displayTag?: string;
  shortDescription?: string;
  description?: string;
  prefix?: string;
  isActive?: boolean;
  numberLength?: number;
  displayOrder?: number;
  accessControl?: string[];
  layoutConfig?: ITicketTypeLayoutConfig | null;
  iconKey?: string;
  tag?: string;
  customFields?: ICustomField[];
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface ITicketTypeResponse {
  message: string;
  data: ITicketType;
}

export interface ITicketTypeListResponse {
  message: string;
  data: ITicketType[];
}
