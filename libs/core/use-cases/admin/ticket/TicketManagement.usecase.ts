import {
  IAdminTicket,
  IAdminTicketComment,
  IAdminTicketTimeEntry,
  IAdminTicketResolution,
  IAdminTicketActivity,
  ICreateTicketInput,
  IAdminTicketGateway,
} from '@serviceops/interfaces';

export interface IGetAllTicketsInput {
  ticketType?: string;
  status?: string;
}

export interface IGetDraftsInput {
  ticketType?: string;
}

export interface IAddCommentInput {
  ticketId: number;
  subject: string;
  message: string;
  isInternal?: boolean;
  isSelfNote?: boolean;
  notifyAssigneesOnly?: boolean;
  isEmail?: boolean;
  status?: string;
  attachments?: string;
  createdBy: string;
}

export interface IAddTimeEntryInput {
  ticketId: number;
  date: string;
  hours: number;
  minutes: number;
  billingCode?: string;
  activityTask?: string;
  externalComment?: string;
  internalComment?: string;
  isNonBillable?: boolean;
  attachments?: string;
  createdBy: string;
}

export interface IAddResolutionInput {
  ticketId: number;
  application?: string;
  category?: string;
  subCategory?: string;
  customerConfirmation?: boolean;
  isRecurring?: boolean;
  rootCauseIdentified?: boolean;
  rootCause?: string;
  resolutionCode: string;
  resolution: string;
  internalNote?: string;
  attachments?: string;
  createdBy: string;
}

export interface IAddActivityInput {
  ticketId: number;
  activityType: string;
  description: string;
  previousValue?: string;
  newValue?: string;
  performedBy: string;
}

export class TicketManagementUseCase {
  constructor(private readonly ticketGateway: IAdminTicketGateway) {}

  // ── Ticket CRUD ────────────────────────────────────────────────────────────

  async create(input: ICreateTicketInput): Promise<IAdminTicket> {
    return this.ticketGateway.create(input);
  }

  async getAll(input?: IGetAllTicketsInput): Promise<IAdminTicket[]> {
    return this.ticketGateway.findAll(input);
  }

  async getById(id: number): Promise<IAdminTicket | null> {
    return this.ticketGateway.findById(id);
  }

  async getByNumber(number: string): Promise<IAdminTicket | null> {
    return this.ticketGateway.findByNumber(number);
  }

  async update(id: number, data: Partial<ICreateTicketInput>): Promise<IAdminTicket> {
    const existing = await this.ticketGateway.findById(id);
    if (!existing) {
      throw new Error(`Ticket with ID ${id} not found`);
    }
    return this.ticketGateway.update(id, data);
  }

  async delete(id: number): Promise<IAdminTicket> {
    const existing = await this.ticketGateway.findById(id);
    if (!existing) {
      throw new Error(`Ticket with ID ${id} not found`);
    }
    return this.ticketGateway.delete(id);
  }

  async getDrafts(input?: IGetDraftsInput): Promise<IAdminTicket[]> {
    const drafts = await this.ticketGateway.getDrafts();
    if (input?.ticketType) {
      return drafts.filter((d) => d.ticketType === input.ticketType);
    }
    return drafts;
  }

  async count(input?: { ticketType?: string }): Promise<number> {
    return this.ticketGateway.count(input);
  }

  // ── Sub-resources ──────────────────────────────────────────────────────────

  async addComment(input: IAddCommentInput): Promise<IAdminTicketComment> {
    const ticket = await this.ticketGateway.findById(input.ticketId);
    if (!ticket) {
      throw new Error(`Ticket with ID ${input.ticketId} not found`);
    }

    const comment = await this.ticketGateway.addComment(input);

    // Log activity
    await this.ticketGateway.addActivity({
      ticketId: input.ticketId,
      activityType: 'comment_added',
      description: `Comment added: ${input.subject}`,
      performedBy: input.createdBy,
      previousValue: undefined,
      newValue: String(comment.id),
    });

    return comment;
  }

  async getComments(ticketId: number): Promise<IAdminTicketComment[]> {
    return this.ticketGateway.getComments(ticketId);
  }

  async updateComment(
    commentId: number,
    data: { message?: string; isPinned?: boolean; isSaved?: boolean },
  ): Promise<IAdminTicketComment> {
    return this.ticketGateway.updateComment(commentId, data);
  }

  async addTimeEntry(input: IAddTimeEntryInput): Promise<IAdminTicketTimeEntry> {
    const ticket = await this.ticketGateway.findById(input.ticketId);
    if (!ticket) {
      throw new Error(`Ticket with ID ${input.ticketId} not found`);
    }

    const timeEntry = await this.ticketGateway.addTimeEntry(input);

    await this.ticketGateway.addActivity({
      ticketId: input.ticketId,
      activityType: 'time_entry_added',
      description: `Time entry added: ${input.hours}h ${input.minutes}m`,
      performedBy: input.createdBy,
      previousValue: undefined,
      newValue: String(timeEntry.id),
    });

    return timeEntry;
  }

  async getTimeEntries(ticketId: number): Promise<IAdminTicketTimeEntry[]> {
    return this.ticketGateway.getTimeEntries(ticketId);
  }

  async addResolution(input: IAddResolutionInput): Promise<IAdminTicketResolution> {
    const ticket = await this.ticketGateway.findById(input.ticketId);
    if (!ticket) {
      throw new Error(`Ticket with ID ${input.ticketId} not found`);
    }

    const resolution = await this.ticketGateway.addResolution(input);

    await this.ticketGateway.addActivity({
      ticketId: input.ticketId,
      activityType: 'resolution_added',
      description: `Resolution added: ${input.resolutionCode}`,
      performedBy: input.createdBy,
      previousValue: ticket.status,
      newValue: 'resolved',
    });

    // Auto-update ticket status to resolved
    await this.ticketGateway.update(input.ticketId, {
      status: 'resolved',
    });

    return resolution;
  }

  async getResolutions(ticketId: number): Promise<IAdminTicketResolution[]> {
    return this.ticketGateway.getResolutions(ticketId);
  }

  async getActivities(ticketId: number): Promise<IAdminTicketActivity[]> {
    return this.ticketGateway.getActivities(ticketId);
  }

  async getNextNumber(ticketType: string): Promise<string> {
    return this.ticketGateway.generateNumber(ticketType);
  }
}
