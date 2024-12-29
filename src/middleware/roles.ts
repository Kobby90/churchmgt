import { Request, Response, NextFunction } from 'express';
import { db } from '@/lib/db';

export const checkRole = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { rows } = await db.query(
        'SELECT role FROM members WHERE auth_id = $1',
        [req.user.id]
      );

      if (!rows.length || !allowedRoles.includes(rows[0].role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Error checking permissions' });
    }
  };
}; 