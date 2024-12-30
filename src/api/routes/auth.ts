import express from 'express';
import { db } from '@/lib/db';
import { createToken, verifyToken } from '@/middleware/auth';
import bcrypt from 'bcrypt';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check user credentials
    const { rows: [user] } = await db.query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 2. Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Get member details
    const { rows: [member] } = await db.query(
      'SELECT id, auth_id, email, role FROM members WHERE auth_id = $1',
      [user.id]
    );

    const token = createToken(user.id);

    res.json({ token, user: member });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/register', async (req, res) => {
  const { 
    email, 
    password, 
    firstName, 
    lastName, 
    phone, 
    address,
    dateOfBirth 
  } = req.body;

  try {
    // Start a transaction
    await db.query('BEGIN');

    // 1. Create user record with hashed password
    const passwordHash = await bcrypt.hash(password, 10);
    const { rows: [user] } = await db.query(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id`,
      [email, passwordHash]
    );

    // 2. Create member record
    const { rows: [member] } = await db.query(
      `INSERT INTO members 
       (auth_id, email, first_name, last_name, phone, address, date_of_birth, membership_status, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', 'member')
       RETURNING id, auth_id, email, role`,
      [user.id, email, firstName, lastName, phone, address, dateOfBirth]
    );

    // Commit transaction
    await db.query('COMMIT');

    // Generate JWT token
    const token = createToken(user.id);

    res.json({ 
      token, 
      user: member 
    });

  } catch (error) {
    // Rollback transaction on error
    await db.query('ROLLBACK');
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization header' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const { userId } = verifyToken(token);

    const { rows } = await db.query(
      'SELECT id, auth_id, email, role FROM members WHERE auth_id = $1',
      [userId]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: rows[0] });
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router; 