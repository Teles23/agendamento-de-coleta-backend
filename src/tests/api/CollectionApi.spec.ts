import request from "supertest";
import { addDays, format } from "date-fns";
import { app } from "../../app";

// Mock Prisma para testes de API
jest.mock("@prisma/client", () => {
  const { Status } = { Status: { PENDENTE: "PENDENTE", AGENDADO: "AGENDADO", CONCLUIDO: "CONCLUIDO", CANCELADO: "CANCELADO" } };
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      collectionRequest: {
        create: jest.fn().mockResolvedValue({
          id: "uuid-test",
          protocol: "AG-20261230-ABCDEF",
          citizenName: "Thiago Test",
          status: "PENDENTE",
          materials: [],
        }),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
      },
      material: {
        findMany: jest.fn().mockResolvedValue([{ id: "mat-1", active: true }]),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    })),
    Status,
  };
});

const futureDate = format(addDays(new Date(), 10), "yyyy-MM-dd");

const validPayload = {
  citizenName: "Thiago Test",
  street: "Rua Teste",
  number: "123",
  neighborhood: "Centro",
  city: "Cidade Teste",
  phone: "11999999999",
  suggestedDate: futureDate,
  materialIds: ["mat-1"],
};

describe("POST /api/collections", () => {
  it("201 - deve criar agendamento com dados válidos", async () => {
    const res = await request(app).post("/api/collections").send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("protocol");
    expect(res.body.message).toBe("Agendamento realizado com sucesso!");
  });

  it("400 - deve rejeitar quando faltam campos obrigatórios", async () => {
    const res = await request(app).post("/api/collections").send({ citizenName: "Thiago" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Todos os campos obrigatórios devem ser preenchidos.");
    expect(res.body).toHaveProperty("fields");
  });

  it("400 - deve rejeitar telefone com formato inválido", async () => {
    const res = await request(app)
      .post("/api/collections")
      .send({ ...validPayload, phone: "123" }); // muito curto

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/telefone/i);
  });
});

describe("GET /api/collections (rota protegida)", () => {
  it("401 - deve rejeitar sem token", async () => {
    const res = await request(app).get("/api/collections");
    expect(res.status).toBe(401);
  });

  it("401 - deve rejeitar com token malformado", async () => {
    const res = await request(app)
      .get("/api/collections")
      .set("Authorization", "Bearer token_invalido");
    expect(res.status).toBe(401);
  });
});