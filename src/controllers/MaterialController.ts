import { Request, Response } from 'express';
import { MaterialService } from '../services/MaterialService';

const materialService = new MaterialService();

export class MaterialController {
  async list(req: Request, res: Response) {
    try {
      const materials = await materialService.list();
      return res.json(materials);
    } catch (error: any) {
      return res.status(500).json({ message: 'Erro ao listar materiais.' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, description, category } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'O nome do material é obrigatório.' });
      }

      const material = await materialService.create({ name, description, category });
      return res.status(201).json(material);
    } catch (error: any) {
      return res.status(400).json({ message: 'Erro ao criar material.' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, category, active } = req.body;

      const material = await materialService.update(id, { name, description, category, active });
      return res.json(material);
    } catch (error: any) {
      return res.status(400).json({ message: 'Erro ao atualizar material.' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await materialService.delete(id);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ message: 'Erro ao remover material.' });
    }
  }
}
