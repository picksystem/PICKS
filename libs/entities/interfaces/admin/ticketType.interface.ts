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

export interface ITicketTypeSectionLayoutConfig {
  selectedFields: string[];
}

export interface ITicketTypeInfoBarLayoutConfig extends ITicketTypeSectionLayoutConfig {
  maxFields: number;
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
