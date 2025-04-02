import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const pwd = process.env.JWT_PASSWORD;

if (!pwd) {
  throw new Error("JWT_PASSWORD is not set");
}

// Extend Express Request type to include id
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization as unknown as string;

  try {
    const payload = jwt.verify(token, pwd!) as unknown as { id: string };
    req.id = payload.id;
    next();
  } catch (e) {
    return res.status(403).json({
      message: "You are not logged in",
    });
  }
}
