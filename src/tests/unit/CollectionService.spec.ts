import { addDays, format, nextMonday } from "date-fns";
import { CollectionService } from "../../services/CollectionService";

// Mock Prisma
jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    collectionRequest: {
      create: jest.fn().mockResolvedValue({ protocol: "AG-20260228-ABCDEF" }),
    },
    material: {
      findMany: jest.fn().mockResolvedValue([{ id: "mat-1", active: true }]),
    },
  })),
  Status: {
    PENDENTE: "PENDENTE",
    AGENDADO: "AGENDADO",
    CONCLUIDO: "CONCLUIDO",
    CANCELADO: "CANCELADO",
  },
}));

const buildValidData = (suggestedDate: string) => ({
  citizenName: "Thiago Silveira",
  street: "Rua das Flores",
  number: "123",
  neighborhood: "Centro",
  city: "São Paulo",
  phone: "11999999999",
  suggestedDate,
  materialIds: ["mat-1"],
});

describe("CollectionService", () => {
  let service: CollectionService;

  beforeEach(() => {
    service = new CollectionService();
    jest.clearAllMocks();
  });

  // --- Protocolo ---
  describe("generateProtocol", () => {
    it("deve gerar protocolo no formato AG-YYYYMMDD-XXXXXX", async () => {
      const futureDate = format(addDays(new Date(), 10), "yyyy-MM-dd");
      const result = await service.create(buildValidData(futureDate));
      expect(result.protocol).toMatch(/^AG-\d{8}-[A-Z0-9]{6}$/);
    });
  });

  // --- Validação de data ---
  describe("validação de data (RN001.2)", () => {
    it("deve rejeitar data de hoje", async () => {
      const today = format(new Date(), "yyyy-MM-dd");
      await expect(service.create(buildValidData(today))).rejects.toThrow(
        /mínimo 2 dias úteis/
      );
    });

    it("deve rejeitar data de amanhã", async () => {
      const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");
      await expect(service.create(buildValidData(tomorrow))).rejects.toThrow(
        /mínimo 2 dias úteis/
      );
    });

    it("deve aceitar data com 10 dias de antecedência", async () => {
      const futureDate = format(addDays(new Date(), 10), "yyyy-MM-dd");
      const result = await service.create(buildValidData(futureDate));
      expect(result).toBeDefined();
    });

    it("deve aceitar data que é uma próxima segunda-feira com pelo menos 2 dias úteis", async () => {
      // Garante que a data calculada tenha sempre antecedência suficiente
      const safeDate = format(nextMonday(addDays(new Date(), 7)), "yyyy-MM-dd");
      const result = await service.create(buildValidData(safeDate));
      expect(result).toBeDefined();
    });
  });

  // --- Status ---
  describe("updateStatus (RN005.3)", () => {
    it("deve exigir justificativa ao cancelar", async () => {
      await expect(
        service.updateStatus("some-id", "CANCELADO" as any)
      ).rejects.toThrow(/Justificativa é obrigatória/);
    });

    it("deve exigir justificativa ao concluir", async () => {
      await expect(
        service.updateStatus("some-id", "CONCLUIDO" as any)
      ).rejects.toThrow(/Justificativa é obrigatória/);
    });
  });
});