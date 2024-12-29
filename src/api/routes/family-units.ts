import express from 'express';
import { db } from '@/lib/db';
import { authMiddleware } from '@/middleware/auth';
import { checkRole } from '@/middleware/roles';

const router = express.Router();

// Get family units
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT fu.* FROM family_units fu
       WHERE fu.id IN (
         SELECT family_unit_id 
         FROM members 
         WHERE auth_id = $1
       )`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch family units' });
  }
});

// Create family unit (admin only)
router.post('/', authMiddleware, checkRole(['admin']), async (req, res) => {
  const { name, head_of_family_id } = req.body;
  
  try {
    const { rows } = await db.query(
      `INSERT INTO family_units (name, head_of_family_id)
       VALUES ($1, $2)
       RETURNING *`,
      [name, head_of_family_id]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create family unit' });
  }
});

export default router; 