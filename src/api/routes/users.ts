import express from 'express';
import { db } from '@/lib/db';
import { authMiddleware } from '@/middleware/auth';
import { checkRole } from '@/middleware/roles';
import bcrypt from 'bcrypt';

const router = express.Router();

// Get users (admin and welfare_admin)
router.get('/', authMiddleware, checkRole(['admin', 'welfare_admin']), async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        m.id,
        m.first_name as "firstName",
        m.last_name as "lastName",
        m.email,
        m.role,
        m.membership_status as "status",
        m.created_at as "createdAt"
      FROM members m
      ORDER BY m.created_at DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Reset user password
router.post('/:id/reset-password', authMiddleware, checkRole(['admin']), async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  try {
    const { rows: [member] } = await db.query(
      'SELECT auth_id FROM members WHERE id = $1',
      [id]
    );

    if (!member) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await db.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [passwordHash, member.auth_id]
    );

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Toggle user active status
router.post('/:id/toggle-status', authMiddleware, checkRole(['admin']), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const { rows: [member] } = await db.query(
      'UPDATE members SET membership_status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (!member) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User status updated successfully', member });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Create user
router.post('/', authMiddleware, checkRole(['admin']), async (req, res) => {
  const { email, firstName, lastName, password, role } = req.body;
  
  try {
    // Start a transaction
    await db.query('BEGIN');

    // Create user in auth table
    const { rows: [user] } = await db.query(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id`,
      [email, await bcrypt.hash(password, 10)]
    );

    // Create member profile
    const { rows: [member] } = await db.query(
      `INSERT INTO members (auth_id, email, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user.id, email, firstName, lastName, role]
    );

    await db.query('COMMIT');
    res.status(201).json(member);
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

export default router; 