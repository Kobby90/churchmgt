import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export function createToken(userId: string): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
}

export function verifyToken(token: string) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      id: string;
      email?: string;
    };
    
    if (!decoded || !decoded.id) {
      throw new Error('Invalid token payload');
    }
    
    return { userId: decoded.id };
  } catch (error) {
    console.error('Token verification error:', error);
    throw new Error('Invalid token');
  }
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response, 
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { userId } = verifyToken(token);

    // Get member details directly from members table
    const { rows: memberRows } = await db.query(`
      SELECT m.id, m.email, m.role 
      FROM members m 
      WHERE m.auth_id = $1
    `, [userId]);

    if (!memberRows.length) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = memberRows[0];
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}; 