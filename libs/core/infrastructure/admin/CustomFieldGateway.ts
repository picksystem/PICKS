import { ICustomField } from '@serviceops/interfaces';

export interface ICustomFieldGateway {
  getAll(ticketType: string): Promise<ICustomField[]>;
  getById(ticketType: string, fieldId: string): Promise<ICustomField | null>;
  create(ticketType: string, field: ICustomField): Promise<ICustomField[]>;
  update(ticketType: string, field: ICustomField): Promise<ICustomField[]>;
  delete(ticketType: string, fieldId: string): Promise<ICustomField[]>;
}
