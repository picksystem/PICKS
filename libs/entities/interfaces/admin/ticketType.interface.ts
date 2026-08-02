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
}

export interface ITicketTypeResponse {
  message: string;
  data: ITicketType;
}

export interface ITicketTypeListResponse {
  message: string;
  data: ITicketType[];
}
