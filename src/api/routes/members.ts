import express from 'express';
import { db } from '@/lib/db';
import { authMiddleware } from '@/middleware/auth';
import { checkRole } from '@/middleware/roles';

const router = express.Router();

// Get member(s)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM members 
       WHERE auth_id = $1 
       OR EXISTS (
         SELECT 1 FROM members 
         WHERE auth_id = $1 AND role = 'admin'
       )`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Create member (during signup)
router.post('/', async (req, res) => {
  const { auth_id, email, first_name, last_name, phone, address } = req.body;
  
  try {
    const { rows } = await db.query(
      `INSERT INTO members (auth_id, email, first_name, last_name, phone, address)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [auth_id, email, first_name, last_name, phone, address]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create member' });
  }
});

// Update member
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const { rows } = await db.query(
      `UPDATE members 
       SET ${Object.keys(updates).map((key, i) => `${key} = $${i + 2}`).join(', ')}
       WHERE id = $1 
       AND (auth_id = $${Object.keys(updates).length + 2} 
         OR EXISTS (
           SELECT 1 FROM members 
           WHERE auth_id = $${Object.keys(updates).length + 2} 
           AND role = 'admin'
         ))
       RETURNING *`,
      [id, ...Object.values(updates), req.user.id]
    );
    
    if (!rows.length) {
      return res.status(403).json({ error: 'Unauthorized to update this member' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update member' });
  }
});

export default router; 