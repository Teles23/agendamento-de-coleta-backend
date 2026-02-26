import request from 'supertest';
import { app } from '../../app';

// Mocking Prisma at the module level for API tests
jest.mock('@prisma/client', () => {
  const actualPrisma = jest.requireActual('@prisma/client');
  return {
    ...actualPrisma,
    PrismaClient: jest.fn().mockImplementation(() => ({
      collectionRequest: {
        create: jest.fn().mockResolvedValue({
          id: 'uuid-test',
          protocol: 'AG_TEST_123',
          citizenName: 'Thiago Test',
          status: 'PENDENTE'
        }),
      },
    })),
  };
});

describe('POST /api/collections', () => {
  it('should create a new collection request', async () => {
    const response = await request(app)
      .post('/api/collections')
      .send({
        citizenName: 'Thiago Test',
        street: 'Rua Teste',
        number: '123',
        neighborhood: 'Centro',
        city: 'Cidade Teste',
        phone: '11999999999',
        suggestedDate: '2026-12-31', // Future date
        materialIds: ['material-id-1']
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('protocol');
    expect(response.body.message).toBe('Agendamento realizado com sucesso!');
  });

  it('should return 400 if required fields are missing', async () => {
    const response = await request(app)
      .post('/api/collections')
      .send({
        citizenName: 'Thiago Test'
        // missing other fields
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Todos os campos obrigatórios devem ser preenchidos.');
  });
});
