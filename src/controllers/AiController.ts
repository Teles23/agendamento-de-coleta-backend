import { Request, Response } from "express";
import * as AiService from "../services/AiService";

export class AiController {
  /**
   * POST /api/ai/classify
   * Body: { description: string }
   * Resposta: { result: Record<string, boolean> }
   */
  async classifyMaterials(req: Request, res: Response) {
    const { description } = req.body;

    if (!description || typeof description !== "string" || !description.trim()) {
      return res
        .status(400)
        .json({ message: "O campo 'description' é obrigatório." });
    }

    // Limita a descrição a 500 caracteres para evitar abuso
    const sanitizedDescription = description.trim().slice(0, 500);

    try {
      const result = await AiService.classifyMaterials(sanitizedDescription);
      return res.json({ result });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao processar classificação de materiais.";
      console.error("[AiController.classifyMaterials]", error);
      return res.status(500).json({ message });
    }
  }

  /**
   * POST /api/ai/optimize-routes
   * Body: { collections: PendingCollection[] }
   * Resposta: { result: string }
   * Rota protegida — requer autenticação de admin.
   */
  async optimizeRoutes(req: Request, res: Response) {
    const { collections } = req.body;

    if (!Array.isArray(collections) || collections.length === 0) {
      return res.status(400).json({
        message: "O campo 'collections' deve ser um array não vazio.",
      });
    }

    try {
      const result = await AiService.optimizeRoutes(collections);
      return res.json({ result });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao processar otimização de rotas.";
      console.error("[AiController.optimizeRoutes]", error);
      return res.status(500).json({ message });
    }
  }
}
