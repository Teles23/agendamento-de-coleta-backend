import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
      }

      const result = await authService.login(email, password);

      return res.json(result);
    } catch (error: any) {
      return res.status(401).json({ message: error.message || 'Erro ao realizar login.' });
    }
  }
}
