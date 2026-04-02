import {
  IIncidentGateway,
  IIncident,
  ICreateIncidentInput,
  IUpdateIncidentInput,
  IncidentStatus,
} from '@serviceops/interfaces';

/**
 * In-Memory implementation of Incident Gateway
 * Used for testing and development without database
 */
export class InMemoryIncidentGateway implements IIncidentGateway {
  private incidents: IIncident[] = [];
  private nextId = 1;
  private nextNumber = 1;

  async create(data: ICreateIncidentInput & { number: string }): Promise<IIncident> {
    const incident: IIncident = {
      id: this.nextId++,
      number: data.number,
      client: data.client || null,
      caller: data.caller,
      callerPhone: data.callerPhone || null,
      callerEmail: data.callerEmail || null,
      callerLocation: data.callerLocation || null,
      callerDepartment: data.callerDepartment || null,
      additionalContacts: data.additionalContacts || null,
      businessCategory: data.businessCategory || null,
      serviceLine: data.serviceLine || null,
      application: data.application || null,
      applicationCategory: data.applicationCategory || null,
      applicationSubCategory: data.applicationSubCategory || null,
      shortDescription: data.shortDescription || null,
      description: data.description || null,
      impact: data.impact || null,
      urgency: data.urgency || null,
      priority: data.priority || null,
      channel: data.channel || null,
      status: data.status || IncidentStatus.NEW,
      assignmentGroup: data.assignmentGroup || null,
      primaryResource: data.primaryResource || null,
      secondaryResources: data.secondaryResources || null,
      createdBy: data.createdBy,
      isRecurring: data.isRecurring || false,
      isMajor: data.isMajor || false,
      isReleaseManagement: data.isReleaseManagement || false,
      eta: data.eta ? new Date(data.eta) : null,
      notes: data.notes || null,
      relatedRecords: data.relatedRecords || null,
      attachments: data.attachments || null,
      followers: data.followers || null,
      internalFollowers: data.internalFollowers || null,
      draftExpiresAt: data.draftExpiresAt ? new Date(data.draftExpiresAt) : null,
      // Contact & Billing
      clientPrimaryContact: data.clientPrimaryContact || null,
      billingCode: data.billingCode || null,
      approvedEstimatesHours: data.approvedEstimatesHours ?? null,
      estimatesDetails: data.estimatesDetails || null,
      // Reporting
      analysisSummary: data.analysisSummary || null,
      ticketSource: data.ticketSource || null,
      // Audit timestamps
      resolvedAt: null,
      resolvedBy: null,
      closedAt: null,
      closedBy: null,
      reopenedAt: null,
      reopenedBy: null,
      approvedAt: null,
      approvedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.incidents.push(incident);
    return incident;
  }

  async findAll(): Promise<IIncident[]> {
    return [...this.incidents].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async findById(id: number): Promise<IIncident | null> {
    return this.incidents.find((i) => i.id === id) || null;
  }

  async findByNumber(number: string): Promise<IIncident | null> {
    return this.incidents.find((i) => i.number === number) || null;
  }

  async findByStatus(status: IncidentStatus): Promise<IIncident[]> {
    return this.incidents
      .filter((i) => i.status === status)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async update(id: number, data: IUpdateIncidentInput): Promise<IIncident> {
    const index = this.incidents.findIndex((i) => i.id === id);
    if (index === -1) {
      throw new Error(`Incident with ID ${id} not found`);
    }

    const { eta, ...rest } = data;
    this.incidents[index] = {
      ...this.incidents[index],
      ...rest,
      ...(eta !== undefined ? { eta: eta ? new Date(eta) : null } : {}),
      updatedAt: new Date(),
    };

    return this.incidents[index];
  }

  async delete(id: number): Promise<IIncident> {
    const index = this.incidents.findIndex((i) => i.id === id);
    if (index === -1) {
      throw new Error(`Incident with ID ${id} not found`);
    }

    const [deleted] = this.incidents.splice(index, 1);
    return deleted;
  }

  async deleteExpiredDrafts(): Promise<number> {
    const now = new Date();
    const expiredDrafts = this.incidents.filter(
      (i) => i.status === IncidentStatus.DRAFT && i.draftExpiresAt && new Date(i.draftExpiresAt) < now,
    );
    this.incidents = this.incidents.filter(
      (i) => !(i.status === IncidentStatus.DRAFT && i.draftExpiresAt && new Date(i.draftExpiresAt) < now),
    );
    return expiredDrafts.length;
  }

  async getNextNumber(): Promise<string> {
    let number: string;
    let exists = true;

    // Generate unique random number
    while (exists) {
      const randomNum = Math.floor(1000000 + Math.random() * 9000000); // 7 digit random number
      number = `INC${randomNum}`;
      exists = this.incidents.some((i) => i.number === number);
    }

    return number!;
  }

  // Helper method for testing
  clear(): void {
    this.incidents = [];
    this.nextId = 1;
    this.nextNumber = 1;
  }
}
