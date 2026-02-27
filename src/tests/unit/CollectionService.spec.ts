import { addDays, format } from 'date-fns';
import { CollectionService } from '../../services/CollectionService';

// Mocking Prisma
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      collectionRequest: {
        create: jest.fn().mockResolvedValue({ protocol: 'AG12345' }),
      },
      material: {
        findMany: jest.fn(),
      },
    })),
    Status: {
      PENDENTE: 'PENDENTE',
      AGENDADO: 'AGENDADO',
      CONCLUIDO: 'CONCLUIDO',
      CANCELADO: 'CANCELADO',
    },
  };
});

describe('CollectionService', () => {
  let collectionService: CollectionService;

  beforeEach(() => {
    collectionService = new CollectionService();
  });

  it('should generate a protocol starting with AG', async () => {
    const data = {
      citizenName: 'Thiago',
      street: 'Rua A',
      number: '123',
      neighborhood: 'Bairro B',
      city: 'Cidade C',
      phone: '123456789',
      suggestedDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      materialIds: ['1'],
    };

    const result = await collectionService.create(data);
    expect(result.protocol).toMatch(/^AG/);
  });

  it('should fail if suggested date is less than 2 business days away', async () => {
    const today = new Date();
    const invalidDate = format(today, 'yyyy-MM-dd'); // Today is invalid

    const data = {
      citizenName: 'Thiago',
      street: 'Rua A',
      number: '123',
      neighborhood: 'Bairro B',
      city: 'Cidade C',
      phone: '123456789',
      suggestedDate: invalidDate,
      materialIds: ['1'],
    };

    await expect(collectionService.create(data)).rejects.toThrow(/A data sugerida deve ser a partir de/);
  });

  it('should accept a date that is clearly more than 2 business days away', async () => {
    const safeDate = format(addDays(new Date(), 10), 'yyyy-MM-dd');

    const data = {
      citizenName: 'Thiago',
      street: 'Rua A',
      number: '123',
      neighborhood: 'Bairro B',
      city: 'Cidade C',
      phone: '123456789',
      suggestedDate: safeDate,
      materialIds: ['1'],
    };

    const result = await collectionService.create(data);
    expect(result).toBeDefined();
  });
});
