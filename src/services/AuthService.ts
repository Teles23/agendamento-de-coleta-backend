import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

export class AuthService {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    // Usa a mesma mensagem para e-mail e senha inválidos
    // evitando enumeração de usuários (timing-safe)
    const invalidCredentialsError = new Error("E-mail ou senha inválidos.");

    if (!user) {
      // Executa bcrypt mesmo sem usuário para evitar timing attack
      await bcrypt.compare(password, "$2a$10$invalidhashtopreventtimingattack");
      throw invalidCredentialsError;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw invalidCredentialsError;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET não configurado no servidor.");
    }

    const expiresIn = (process.env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]) || "1d";

    const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
