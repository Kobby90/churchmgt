import { Request, Response, NextFunction } from 'express';
import { db } from '@/lib/db';

export const checkRole = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { rows } = await db.query(
        'SELECT role FROM members WHERE id = $1',
        [req.user.id]
      );

      if (!rows.length) {
        return res.status(403).json({ error: 'User not found' });
      }

      const userRole = rows[0].role;
      console.log('Role check - User role:', userRole);
      console.log('Role check - Allowed roles:', allowedRoles);

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: allowedRoles,
          current: userRole
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}; 