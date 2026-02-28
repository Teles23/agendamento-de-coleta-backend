import { PrismaClient, Status } from "@prisma/client";
import { addDays, isWeekend, startOfDay, format } from "date-fns";

const prisma = new PrismaClient();

// --- Tipos ---
interface CreateCollectionData {
  citizenName: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  phone: string;
  email?: string;
  suggestedDate: string;
  materialIds: string[];
}

interface ListCollectionFilters {
  status?: Status;
  dateFrom?: string;
  dateTo?: string;
}

export class CollectionService {
  // -------------------------------------------------------
  // Helpers de data
  // -------------------------------------------------------

  private isBusinessDay(date: Date): boolean {
    return !isWeekend(date);
  }

  private addBusinessDays(date: Date, days: number): Date {
    let result = new Date(date);
    let added = 0;
    while (added < days) {
      result = addDays(result, 1);
      if (this.isBusinessDay(result)) {
        added++;
      }
    }
    return result;
  }

  /**
   * Gera um protocolo único no formato AG-YYYYMMDD-XXXXXX
   * Legível e rastreável por data de criação.
   */
  private generateProtocol(): string {
    const datePart = format(new Date(), "yyyyMMdd");
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `AG${datePart}${randomPart}`;
  }

  // -------------------------------------------------------
  // CRUD
  // -------------------------------------------------------

  async create(data: CreateCollectionData) {
    const suggestedDate = startOfDay(new Date(data.suggestedDate));
    const now = startOfDay(new Date());

    // RN001.2: Data sugerida deve ser pelo menos 2 dias úteis após a data atual
    const minimumDate = this.addBusinessDays(now, 2);

    if (suggestedDate < minimumDate) {
      throw new Error(
        `A data sugerida deve ser a partir de ${minimumDate.toLocaleDateString("pt-BR")} (mínimo 2 dias úteis).`,
      );
    }

    // RN001.3: Validar se todos os materiais existem
    if (!data.materialIds || data.materialIds.length === 0) {
      throw new Error("Selecione ao menos um tipo de material.");
    }

    const materials = await prisma.material.findMany({
      where: { id: { in: data.materialIds }, active: true },
    });

    if (materials.length !== data.materialIds.length) {
      throw new Error(
        "Um ou mais materiais informados são inválidos ou estão inativos.",
      );
    }

    const protocol = this.generateProtocol();

    const collectionRequest = await prisma.collectionRequest.create({
      data: {
        protocol,
        citizenName: data.citizenName,
        street: data.street,
        number: data.number,
        neighborhood: data.neighborhood,
        city: data.city,
        phone: data.phone,
        email: data.email,
        suggestedDate,
        status: Status.PENDENTE,
        materials: {
          create: data.materialIds.map((materialId) => ({
            material: { connect: { id: materialId } },
          })),
        },
      },
      include: {
        materials: {
          include: { material: true },
        },
      },
    });

    return collectionRequest;
  }

  async list(filters: ListCollectionFilters) {
    const where: Record<string, unknown> = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.suggestedDate = {
        ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
        ...(filters.dateTo && { lte: new Date(filters.dateTo) }),
      };
    }

    return prisma.collectionRequest.findMany({
      where,
      orderBy: { suggestedDate: "asc" }, // RN003.4: mais próximos primeiro
      include: {
        materials: {
          include: { material: true },
        },
      },
    });
  }

  async detail(id: string) {
    const collection = await prisma.collectionRequest.findUnique({
      where: { id },
      include: {
        materials: {
          include: { material: true },
        },
      },
    });

    if (!collection) {
      throw new Error("Agendamento não encontrado.");
    }

    return collection;
  }

  async updateStatus(id: string, status: Status, justification?: string) {
    // RN005.1: Validar enum de status
    const validStatuses = Object.values(Status);
    if (!validStatuses.includes(status)) {
      throw new Error(`Status inválido. Use: ${validStatuses.join(", ")}.`);
    }

    // RN005.3: Justificativa obrigatória para CONCLUIDO ou CANCELADO
    if (
      (status === Status.CONCLUIDO || status === Status.CANCELADO) &&
      !justification?.trim()
    ) {
      throw new Error(
        "Justificativa é obrigatória ao concluir ou cancelar um agendamento.",
      );
    }

    // Verificar se o agendamento existe antes de atualizar
    await this.detail(id);

    return prisma.collectionRequest.update({
      where: { id },
      data: {
        status,
        justification: justification?.trim() || null,
        lastStatusUpdate: new Date(), // RN005.2
      },
    });
  }
}
