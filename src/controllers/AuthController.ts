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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao realizar login.';
      const statusCode = message === 'E-mail ou senha inválidos.' ? 401 : 500;
      return res.status(statusCode).json({ message });
    }
  }
}
