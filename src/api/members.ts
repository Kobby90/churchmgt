import express from 'express';
import { db } from '../lib/db';
import { authMiddleware } from '../middleware/auth';
import { checkRole } from '../middleware/roles';

router.post('/', async (req, res) => {
  const { auth_id, email, first_name, last_name, phone, address } = req.body;
  
  try {
    // Check if member already exists
    const { rows: existing } = await db.query(
      'SELECT id FROM members WHERE email = $1',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Member with this email already exists' });
    }

    const { rows } = await db.query(
      `INSERT INTO members 
       (auth_id, email, first_name, last_name, phone, address, membership_status, role)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', 'member')
       RETURNING *`,
      [auth_id, email, first_name, last_name, phone, address]
    );
    
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Member creation error:', error);
    res.status(500).json({ error: 'Failed to create member' });
  }
}); 