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

    // First check if user exists in auth table
    const { rows: userRows } = await db.query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );


    if (!userRows.length) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Then get member details
    const { rows: memberRows } = await db.query(
      'SELECT id, email, role FROM members WHERE auth_id = $1',
      [userId]
    );

    if (!memberRows.length) {
      return res.status(401).json({ error: 'Member profile not found' });
    }

    req.user = memberRows[0];
    console.log('Auth middleware - User role:', req.user.role);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
} 