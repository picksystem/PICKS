import { CreateHeaderUseCase } from '../CreateHeader.usecase';
import { InMemoryHeaderGateway } from '../../../../infrastructure/admin';
import { ConflictException } from '../../../../middleware';
import { ICreateHeaderInput } from '@picks/interfaces';

describe('CreateHeaderUseCase', () => {
  let useCase: CreateHeaderUseCase;
  let gateway: InMemoryHeaderGateway;

  beforeEach(() => {
    // Use InMemoryGateway for testing - no database needed!
    gateway = new InMemoryHeaderGateway();
    useCase = new CreateHeaderUseCase(gateway);
  });

  afterEach(() => {
    gateway.clear();
  });

  it('should create a header successfully', async () => {
    const input: ICreateHeaderInput = {
      ticketType: 'Support',
      key: 'support-ticket',
      name: 'Support Ticket',
      description: 'For support requests',
      app: 'admin',
      order: 1,
    };

    const result = await useCase.execute(input);

    expect(result).toMatchObject({
      id: expect.any(Number),
      ticketType: 'Support',
      key: 'support-ticket',
      name: 'Support Ticket',
      isActive: true,
      app: 'admin',
      order: 1,
    });
  });

  it('should throw ConflictException when key already exists', async () => {
    const input: ICreateHeaderInput = {
      ticketType: 'Support',
      key: 'duplicate-key',
      name: 'First Header',
      app: 'admin',
      order: 1,
    };

    // Create first header
    await useCase.execute(input);

    // Try to create another with same key
    const duplicateInput: ICreateHeaderInput = {
      ...input,
      name: 'Second Header',
      order: 2,
    };

    await expect(useCase.execute(duplicateInput)).rejects.toThrow(ConflictException);
    await expect(useCase.execute(duplicateInput)).rejects.toThrow(
      "Header with key 'duplicate-key' already exists",
    );
  });
});
