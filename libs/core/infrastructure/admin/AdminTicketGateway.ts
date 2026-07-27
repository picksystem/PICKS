import { PrismaClient } from '@prisma/client';
import { prisma } from '@serviceops/database';
import {
  IAdminTicket,
  IAdminTicketComment,
  IAdminTicketTimeEntry,
  IAdminTicketResolution,
  IAdminTicketActivity,
  ICreateTicketInput,
} from '@serviceops/interfaces';

export class AdminTicketGateway {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || (prisma as unknown as PrismaClient);
  }

  // ── Ticket CRUD ────────────────────────────────────────────────────────────

  async create(data: ICreateTicketInput): Promise<IAdminTicket> {
    // Cast through any to handle the union of optional fields
    // from the ICreateTicketInput interface — many fields are present
    // but optional and Prisma's strict CreateInput type rejects extras.
    const ticket = await this.prisma.adminTicket.create({
      data: data as any,
    });
    return ticket as unknown as IAdminTicket;
  }

  async findAll(filters?: { ticketType?: string; status?: string }): Promise<IAdminTicket[]> {
    const where: Record<string, unknown> = {};
    if (filters?.ticketType) where.ticketType = filters.ticketType;
    if (filters?.status) where.status = filters.status;

    return this.prisma.adminTicket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    }) as unknown as Promise<IAdminTicket[]>;
  }

  async findById(id: number): Promise<IAdminTicket | null> {
    return this.prisma.adminTicket.findUnique({
      where: { id },
    }) as unknown as Promise<IAdminTicket | null>;
  }

  async findByNumber(number: string): Promise<IAdminTicket | null> {
    return this.prisma.adminTicket.findUnique({
      where: { number },
    }) as unknown as Promise<IAdminTicket | null>;
  }

  async update(id: number, data: Partial<ICreateTicketInput>): Promise<IAdminTicket> {
    const updateData: Record<string, unknown> = {};
    const fields = [
      'ticketType',
      'client',
      'caller',
      'callerPhone',
      'callerEmail',
      'callerLocation',
      'callerDepartment',
      'callerReportingManager',
      'additionalContacts',
      'businessCategory',
      'serviceLine',
      'application',
      'applicationCategory',
      'applicationSubCategory',
      'shortDescription',
      'description',
      'impact',
      'urgency',
      'priority',
      'priorityChangeReasonCode',
      'priorityChangeNote',
      'channel',
      'status',
      'assignmentGroup',
      'primaryResource',
      'secondaryResources',
      'isRecurring',
      'isMajor',
      'notes',
      'relatedRecords',
      'attachments',
      'followers',
      'internalFollowers',
      'clientPrimaryContact',
      'billingCode',
      'analysisSummary',
      'ticketSource',
      'cancellationReasonCode',
      'cancellationComment',
      'reopenReasonCode',
      'reopenComment',
      'convertedFrom',
      'conversionReasonCode',
      'conversionComment',
      'changeType',
      'changeJustification',
      'changeCurrentProcess',
      'changeProposedProcess',
      'changeRiskAnalysis',
      'changeBackoutPlan',
      'changeTestPlan',
      'changeTestResults',
      'changeAccessRequirements',
      'changeProductOwner',
      'changeKnownError',
      'changeProductBugFix',
      'changeProductBugId',
      'changeVendorName',
      'changeBugDetails',
      'changeVendorTicketRef',
      'changeCabRequired',
      'changeCabId',
      'changeTestCompleted',
      'changeTestEvidence',
      'timesReopened',
    ];

    for (const field of fields) {
      if (field in data) {
        const key = field as keyof ICreateTicketInput;
        const value = data[key];

        // Convert date strings to Date objects
        if (
          (key === 'dueDate' ||
            key === 'eta' ||
            key === 'changeProposedStart' ||
            key === 'changeProposedEnd' ||
            key === 'changeActualStart' ||
            key === 'changeActualEnd') &&
          typeof value === 'string'
        ) {
          updateData[field] = new Date(value);
        } else {
          updateData[field] = value;
        }
      }
    }

    const ticket = await this.prisma.adminTicket.update({
      where: { id },
      data: updateData,
    });
    return ticket as unknown as IAdminTicket;
  }

  async delete(id: number): Promise<IAdminTicket> {
    return this.prisma.adminTicket.delete({
      where: { id },
    }) as unknown as Promise<IAdminTicket>;
  }

  async getDrafts(): Promise<IAdminTicket[]> {
    const tickets = await this.prisma.adminTicket.findMany({
      where: {
        status: 'draft',
      },
      orderBy: { createdAt: 'desc' },
    });
    return tickets as unknown as IAdminTicket[];
  }

  async count(filters?: { ticketType?: string }): Promise<number> {
    const where: Record<string, unknown> = {};
    if (filters?.ticketType) where.ticketType = filters.ticketType;
    return this.prisma.adminTicket.count({ where });
  }

  // ── Number generation ──────────────────────────────────────────────────────

  async generateNumber(ticketType: string): Promise<string> {
    const typeRow = await this.prisma.adminTicketType.findFirst({
      where: { type: ticketType, isActive: true },
    });

    const prefix = typeRow?.prefix?.toUpperCase() || 'T';
    const numLength = typeRow?.numberLength || 7;

    const last = await this.prisma.adminTicket.findFirst({
      where: { number: { startsWith: prefix } },
      orderBy: { id: 'desc' },
    });

    let nextNum = 1;
    if (last) {
      const numericPart = last.number.replace(prefix, '');
      const parsed = parseInt(numericPart, 10);
      if (!isNaN(parsed)) nextNum = parsed + 1;
    }

    return `${prefix}${String(nextNum).padStart(numLength, '0')}`;
  }

  // ── Sub-resources ──────────────────────────────────────────────────────────

  async addComment(data: {
    ticketId: number;
    subject: string;
    message: string;
    isInternal?: boolean;
    isSelfNote?: boolean;
    notifyAssigneesOnly?: boolean;
    status?: string;
    attachments?: string;
    createdBy: string;
  }): Promise<IAdminTicketComment> {
    const commentData: any = {
      ticketId: data.ticketId,
      subject: data.subject,
      message: data.message,
      isInternal: data.isInternal ?? false,
      isSelfNote: data.isSelfNote ?? false,
      notifyAssigneesOnly: data.notifyAssigneesOnly ?? false,
      createdBy: data.createdBy,
    };
    if (data.status !== undefined) commentData.status = data.status;
    if (data.attachments !== undefined) commentData.attachments = data.attachments;
    return this.prisma.adminTicketComment.create({
      data: commentData,
    }) as unknown as Promise<IAdminTicketComment>;
  }

  async getComments(ticketId: number): Promise<IAdminTicketComment[]> {
    return this.prisma.adminTicketComment.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'desc' },
    }) as unknown as Promise<IAdminTicketComment[]>;
  }

  async addTimeEntry(data: {
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
  }): Promise<IAdminTicketTimeEntry> {
    const entryData: any = {
      ticketId: data.ticketId,
      date: data.date,
      hours: data.hours,
      minutes: data.minutes,
      isNonBillable: data.isNonBillable ?? false,
      createdBy: data.createdBy,
    };
    if (data.billingCode !== undefined) entryData.billingCode = data.billingCode;
    if (data.activityTask !== undefined) entryData.activityTask = data.activityTask;
    if (data.externalComment !== undefined) entryData.externalComment = data.externalComment;
    if (data.internalComment !== undefined) entryData.internalComment = data.internalComment;
    if (data.attachments !== undefined) entryData.attachments = data.attachments;
    return this.prisma.adminTicketTimeEntry.create({
      data: entryData,
    }) as unknown as Promise<IAdminTicketTimeEntry>;
  }

  async getTimeEntries(ticketId: number): Promise<IAdminTicketTimeEntry[]> {
    return this.prisma.adminTicketTimeEntry.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'desc' },
    }) as unknown as Promise<IAdminTicketTimeEntry[]>;
  }

  async addResolution(data: {
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
  }): Promise<IAdminTicketResolution> {
    const resolutionData: any = {
      ticketId: data.ticketId,
      customerConfirmation: data.customerConfirmation ?? false,
      isRecurring: data.isRecurring ?? false,
      rootCauseIdentified: data.rootCauseIdentified ?? false,
      resolutionCode: data.resolutionCode,
      resolution: data.resolution,
      createdBy: data.createdBy,
    };
    if (data.application !== undefined) resolutionData.application = data.application;
    if (data.category !== undefined) resolutionData.category = data.category;
    if (data.subCategory !== undefined) resolutionData.subCategory = data.subCategory;
    if (data.rootCause !== undefined) resolutionData.rootCause = data.rootCause;
    if (data.internalNote !== undefined) resolutionData.internalNote = data.internalNote;
    if (data.attachments !== undefined) resolutionData.attachments = data.attachments;
    return this.prisma.adminTicketResolution.create({
      data: resolutionData,
    }) as unknown as Promise<IAdminTicketResolution>;
  }

  async getResolutions(ticketId: number): Promise<IAdminTicketResolution[]> {
    return this.prisma.adminTicketResolution.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'desc' },
    }) as unknown as Promise<IAdminTicketResolution[]>;
  }

  async addActivity(data: {
    ticketId: number;
    activityType: string;
    description: string;
    previousValue?: string;
    newValue?: string;
    performedBy: string;
  }): Promise<IAdminTicketActivity> {
    const activityData: any = {
      ticketId: data.ticketId,
      activityType: data.activityType,
      description: data.description,
      performedBy: data.performedBy,
    };
    if (data.previousValue !== undefined) activityData.previousValue = data.previousValue;
    if (data.newValue !== undefined) activityData.newValue = data.newValue;
    return this.prisma.adminTicketActivity.create({
      data: activityData,
    }) as unknown as Promise<IAdminTicketActivity>;
  }

  async getActivities(ticketId: number): Promise<IAdminTicketActivity[]> {
    return this.prisma.adminTicketActivity.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'desc' },
    }) as unknown as Promise<IAdminTicketActivity[]>;
  }

  // ── Draft cleanup ──────────────────────────────────────────────────────────

  async deleteExpiredDrafts(): Promise<number> {
    const result = await this.prisma.adminTicket.deleteMany({
      where: {
        status: { in: ['draft', 'DRAFT'] },
        draftExpiresAt: { lt: new Date() },
      },
    });
    return result.count;
  }
}
