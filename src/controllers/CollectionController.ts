import { Request, Response } from "express";
import { CollectionService } from "../services/CollectionService";
import { Status } from "@prisma/client";

const collectionService = new CollectionService();

export class CollectionController {
  async create(req: Request, res: Response) {
    try {
      const {
        citizenName,
        street,
        number,
        neighborhood,
        city,
        phone,
        email,
        suggestedDate,
        materialIds,
      } = req.body;

      // Validação básica dos campos obrigatórios
      const requiredFields: Record<string, unknown> = {
        citizenName,
        street,
        number,
        neighborhood,
        city,
        phone,
        suggestedDate,
        materialIds,
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([, value]) => !value)
        .map(([key]) => key);

      if (missingFields.length > 0) {
        return res.status(400).json({
          message: "Todos os campos obrigatórios devem ser preenchidos.",
          fields: missingFields,
        });
      }

      // RN-G02.2: Validar formato de telefone (somente dígitos, 10-11 caracteres)
      const phoneDigits = String(phone).replace(/\D/g, "");
      if (phoneDigits.length < 10 || phoneDigits.length > 11) {
        return res.status(400).json({
          message: "Formato de telefone inválido. Informe DDD + número (10 ou 11 dígitos).",
        });
      }

      const collection = await collectionService.create({
        citizenName,
        street,
        number,
        neighborhood,
        city,
        phone: phoneDigits, // salva apenas dígitos
        email,
        suggestedDate,
        materialIds,
      });

      return res.status(201).json({
        message: "Agendamento realizado com sucesso!",
        protocol: collection.protocol,
        collection,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao criar agendamento.";
      return res.status(400).json({ message });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const { status, dateFrom, dateTo } = req.query;

      // Validar enum de status, se informado
      if (status && !Object.values(Status).includes(status as Status)) {
        return res.status(400).json({
          message: `Status inválido. Use: ${Object.values(Status).join(", ")}.`,
        });
      }

      const collections = await collectionService.list({
        status: status as Status,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
      });

      return res.json(collections);
    } catch (error: unknown) {
      return res.status(500).json({ message: "Erro interno ao listar agendamentos." });
    }
  }

  async detail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const collection = await collectionService.detail(id);
      return res.json(collection);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao buscar agendamento.";
      const status = message === "Agendamento não encontrado." ? 404 : 500;
      return res.status(status).json({ message });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, justification } = req.body;

      if (!status) {
        return res.status(400).json({ message: "O campo 'status' é obrigatório." });
      }

      const collection = await collectionService.updateStatus(id, status as Status, justification);
      return res.json({ message: "Status atualizado com sucesso!", collection });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar status.";
      const httpStatus = message === "Agendamento não encontrado." ? 404 : 400;
      return res.status(httpStatus).json({ message });
    }
  }
}