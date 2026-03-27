import { prisma } from "../lib/prisma";

export class MaterialService {
  async list() {
    return prisma.material.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });
  }

  async create(data: { name: string; description?: string; category?: string }) {
    return prisma.material.create({
      data,
    });
  }

  async update(id: string, data: { name?: string; description?: string; category?: string; active?: boolean }) {
    return prisma.material.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    // Soft delete by setting active to false
    return prisma.material.update({
      where: { id },
      data: { active: false },
    });
  }
}
