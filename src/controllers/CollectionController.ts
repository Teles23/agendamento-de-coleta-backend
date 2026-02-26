import { Request, Response } from 'express';
import { CollectionService } from '../services/CollectionService';
import { Status } from '@prisma/client';

const collectionService = new CollectionService();

export class CollectionController {
  async create(req: Request, res: Response) {
    try {
      const { citizenName, street, number, neighborhood, city, phone, email, suggestedDate, materialIds } = req.body;

      if (!citizenName || !street || !number || !neighborhood || !city || !phone || !suggestedDate || !materialIds) {
        return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos.' });
      }

      const collection = await collectionService.create({
        citizenName,
        street,
        number,
        neighborhood,
        city,
        phone,
        email,
        suggestedDate,
        materialIds,
      });

      return res.status(201).json({
        message: 'Agendamento realizado com sucesso!',
        protocol: collection.protocol,
        collection,
      });
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Erro ao criar agendamento.' });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const { status, dateFrom, dateTo } = req.query;

      const collections = await collectionService.list({
        status: status as Status,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
      });

      return res.json(collections);
    } catch (error: any) {
      return res.status(500).json({ message: 'Erro ao listar agendamentos.' });
    }
  }

  async detail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const collection = await collectionService.detail(id);

      return res.json(collection);
    } catch (error: any) {
      return res.status(404).json({ message: error.message || 'Erro ao buscar detalhes do agendamento.' });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, justification } = req.body;

      if (!status) {
        return res.status(400).json({ message: 'O novo status é obrigatório.' });
      }

      const collection = await collectionService.updateStatus(id, status as Status, justification);

      return res.json({ message: 'Status atualizado com sucesso!', collection });
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Erro ao atualizar status.' });
    }
  }
}
