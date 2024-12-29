import express from 'express';
import { db } from '@/lib/db';
import { authMiddleware } from '@/middleware/auth';
import { checkRole } from '@/middleware/roles';

const router = express.Router();

// Get welfare cases
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { rows: memberRows } = await db.query(
      'SELECT role FROM members WHERE auth_id = $1',
      [req.user.id]
    );

    if (!memberRows.length) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const isAdmin = memberRows[0]?.role === 'admin' || memberRows[0]?.role === 'welfare_admin';
    
    const { rows } = await db.query(
      `SELECT w.*, m.first_name, m.last_name 
       FROM welfare_cases w
       INNER JOIN members m ON w.member_id = m.id
       WHERE m.auth_id = $1 ${isAdmin ? 'OR TRUE' : ''}
       ORDER BY w.created_at DESC`,
      [req.user.id]
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching welfare cases:', error);
    res.status(500).json({ error: 'Failed to fetch welfare cases' });
  }
});

// Create welfare case
router.post('/', authMiddleware, async (req, res) => {
  const { member_id, title, description, amount_requested } = req.body;
  
  try {
    const { rows } = await db.query(
      `INSERT INTO welfare_cases (member_id, title, description, amount_requested)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [member_id, title, description, amount_requested]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create welfare case' });
  }
});

// Update welfare case (admin only)
router.put('/:id', authMiddleware, checkRole(['admin', 'welfare_admin']), async (req, res) => {
  const { id } = req.params;
  const { status, amount_approved } = req.body;
  
  try {
    const { rows } = await db.query(
      `UPDATE welfare_cases 
       SET status = $1, amount_approved = $2
       WHERE id = $3
       RETURNING *`,
      [status, amount_approved, id]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update welfare case' });
  }
});

export default router; 