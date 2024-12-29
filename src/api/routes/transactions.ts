import express from 'express';
import { db } from '@/lib/db';
import { authMiddleware } from '@/middleware/auth';
import { checkRole } from '@/middleware/roles';

const router = express.Router();

// Get transactions
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rows: memberRows } = await db.query(
      'SELECT role FROM members WHERE auth_id = $1',
      [req.user.id]
    );

    const isAdmin = memberRows[0]?.role === 'admin' || memberRows[0]?.role === 'financial_admin';
    
    const { rows } = await db.query(
      `SELECT t.* FROM transactions t
       INNER JOIN members m ON t.member_id = m.id
       WHERE m.auth_id = $1 ${isAdmin ? 'OR TRUE' : ''}`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Create transaction
router.post('/', authMiddleware, async (req, res) => {
  const { member_id, amount, type, payment_method } = req.body;
  
  try {
    const { rows } = await db.query(
      `INSERT INTO transactions (member_id, amount, type, payment_method)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [member_id, amount, type, payment_method]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

export default router; 