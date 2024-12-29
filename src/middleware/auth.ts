import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../lib/auth';
import { db } from '../lib/db';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const { userId } = verifyToken(token);

    const { rows } = await db.query(
      'SELECT id, email, role FROM members WHERE auth_id = $1',
      [userId]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
} 