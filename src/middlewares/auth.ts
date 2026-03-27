import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Token de autenticação não fornecido." });
  }

  const token = authHeader.split(" ")[1];

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Falha de configuração do servidor — não vazar detalhes ao cliente
    console.error("[authMiddleware] JWT_SECRET não configurado.");
    return res
      .status(500)
      .json({ message: "Erro de configuração do servidor." });
  }

  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    (req as any).user = { id: decoded.id, email: decoded.email };
    return next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Token de autenticação inválido ou expirado." });
  }
};
