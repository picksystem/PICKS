import {
  IHeaderGateway,
  IHeader,
  ICreateHeaderInput,
  ICreateHeaderUseCase,
} from '@picks/interfaces';
import { ConflictException } from '../../../middleware';

/**
 * Create Header Use Case
 * Encapsulates the business logic for creating a new header
 */
export class CreateHeaderUseCase implements ICreateHeaderUseCase {
  constructor(private readonly headerGateway: IHeaderGateway) {}

  async execute(input: ICreateHeaderInput): Promise<IHeader> {
    // Business rule: key must be unique
    const existing = await this.headerGateway.findByKey(input.key);
    if (existing) {
      throw new ConflictException(`Header with key '${input.key}' already exists`);
    }

    return this.headerGateway.create(input);
  }
}
