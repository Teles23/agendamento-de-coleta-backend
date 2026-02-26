import { PrismaClient, Status } from "@prisma/client";
import { addDays, isWeekend, startOfDay } from "date-fns";

const prisma = new PrismaClient();

export class CollectionService {
  private isBusinessDay(date: Date): boolean {
    // Basic check for weekends. Formal holidays would need a library or db table.
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

  async create(data: {
    citizenName: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    phone: string;
    email?: string;
    suggestedDate: string;
    materialIds: string[];
  }) {
    const suggestedDate = startOfDay(new Date(data.suggestedDate));
    const now = startOfDay(new Date());

    // RN001.2: Data sugerida deve ser pelo menos 2 dias úteis após a data atual
    const minimumDate = this.addBusinessDays(now, 2);

    if (suggestedDate < minimumDate) {
      throw new Error(
        `A data sugerida deve ser a partir de ${minimumDate.toLocaleDateString("pt-BR")}.`,
      );
    }

    // RN001.5: Geração de protocolo único
    const protocol = `AG${Date.now()}${Math.floor(Math.random() * 1000)}`;

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
          include: {
            material: true,
          },
        },
      },
    });

    return collectionRequest;
  }

  async list(filters: { status?: Status; dateFrom?: string; dateTo?: string }) {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.suggestedDate = {};
      if (filters.dateFrom)
        where.suggestedDate.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.suggestedDate.lte = new Date(filters.dateTo);
    }

    return prisma.collectionRequest.findMany({
      where,
      orderBy: {
        suggestedDate: "asc",
      },
      include: {
        materials: {
          include: {
            material: true,
          },
        },
      },
    });
  }

  async detail(id: string) {
    const collection = await prisma.collectionRequest.findUnique({
      where: { id },
      include: {
        materials: {
          include: {
            material: true,
          },
        },
      },
    });

    if (!collection) {
      throw new Error("Agendamento não encontrado.");
    }

    return collection;
  }

  async updateStatus(id: string, status: Status, justification?: string) {
    // RN005.3: Justificativa obrigatória para CONCLUIDO ou CANCELADO
    if (
      (status === Status.CONCLUIDO || status === Status.CANCELADO) &&
      !justification
    ) {
      throw new Error("Justificativa é obrigatória para este status.");
    }

    return prisma.collectionRequest.update({
      where: { id },
      data: {
        status,
        justification: justification || null,
        lastStatusUpdate: new Date(),
      },
    });
  }
}
