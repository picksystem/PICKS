import { ICustomField } from '@serviceops/interfaces';
import { ICustomFieldGateway } from 'libs/core/infrastructure/admin/CustomFieldGateway';

export interface IGetCustomFieldsUseCase {
  execute(ticketType: string): Promise<ICustomField[]>;
}

export class GetCustomFieldsUseCase implements IGetCustomFieldsUseCase {
  constructor(private readonly gateway: ICustomFieldGateway) {}

  async execute(ticketType: string): Promise<ICustomField[]> {
    return this.gateway.getAll(ticketType);
  }
}

export interface IGetCustomFieldByIdUseCase {
  execute(ticketType: string, fieldId: string): Promise<ICustomField | null>;
}

export class GetCustomFieldByIdUseCase implements IGetCustomFieldByIdUseCase {
  constructor(private readonly gateway: ICustomFieldGateway) {}

  async execute(ticketType: string, fieldId: string): Promise<ICustomField | null> {
    return this.gateway.getById(ticketType, fieldId);
  }
}

export interface ICreateCustomFieldUseCase {
  execute(ticketType: string, field: ICustomField): Promise<ICustomField[]>;
}

export class CreateCustomFieldUseCase implements ICreateCustomFieldUseCase {
  constructor(private readonly gateway: ICustomFieldGateway) {}

  async execute(ticketType: string, field: ICustomField): Promise<ICustomField[]> {
    return this.gateway.create(ticketType, field);
  }
}

export interface IUpdateCustomFieldUseCase {
  execute(ticketType: string, field: ICustomField): Promise<ICustomField[]>;
}

export class UpdateCustomFieldUseCase implements IUpdateCustomFieldUseCase {
  constructor(private readonly gateway: ICustomFieldGateway) {}

  async execute(ticketType: string, field: ICustomField): Promise<ICustomField[]> {
    return this.gateway.update(ticketType, field);
  }
}

export interface IDeleteCustomFieldUseCase {
  execute(ticketType: string, fieldId: string): Promise<ICustomField[]>;
}

export class DeleteCustomFieldUseCase implements IDeleteCustomFieldUseCase {
  constructor(private readonly gateway: ICustomFieldGateway) {}

  async execute(ticketType: string, fieldId: string): Promise<ICustomField[]> {
    return this.gateway.delete(ticketType, fieldId);
  }
}
