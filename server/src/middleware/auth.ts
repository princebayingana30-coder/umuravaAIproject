import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export type AuthJwtPayload = {
  sub: string;
  email: string;
  role: 'recruiter';
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return secret;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing Bearer token' });
    }
    const token = header.slice('Bearer '.length);
    const payload = jwt.verify(token, getJwtSecret()) as AuthJwtPayload;
    (req as any).user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

