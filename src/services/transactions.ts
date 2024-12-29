import { db } from '@/lib/db';
import { Transaction } from '@/types';

export const transactionService = {
  async getTransactions(userId: string) {
    const { rows: memberRows } = await db.query(
      'SELECT id, role FROM members WHERE auth_id = $1',
      [userId]
    );

    const isAdmin = memberRows[0]?.role === 'admin' || memberRows[0]?.role === 'financial_admin';
    const memberId = memberRows[0]?.id;

    const { rows } = await db.query(
      `SELECT 
        t.*,
        m.first_name,
        m.last_name,
        m.email
       FROM transactions t
       INNER JOIN members m ON t.member_id = m.id
       WHERE m.id = $1 ${isAdmin ? 'OR TRUE' : ''}
       ORDER BY t.created_at DESC`,
      [memberId]
    );

    return rows;
  },

  async createTransaction(userId: string, data: Omit<Transaction, 'id' | 'created_at'>) {
    const { rows: [member] } = await db.query(
      'SELECT id FROM members WHERE auth_id = $1',
      [userId]
    );

    const { rows: [transaction] } = await db.query(
      `INSERT INTO transactions 
       (member_id, amount, type, payment_method, status, date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        member.id,
        data.amount,
        data.type,
        data.payment_method,
        'completed',
        data.date || new Date().toISOString()
      ]
    );

    return transaction;
  },

  async getTransactionStats(userId: string) {
    const { rows: memberRows } = await db.query(
      'SELECT id, role FROM members WHERE auth_id = $1',
      [userId]
    );

    const memberId = memberRows[0]?.id;
    const isAdmin = memberRows[0]?.role === 'admin' || memberRows[0]?.role === 'financial_admin';

    const { rows } = await db.query(
      `SELECT 
        type,
        SUM(amount) as total,
        COUNT(*) as count
       FROM transactions
       WHERE (member_id = $1 ${isAdmin ? 'OR TRUE' : ''})
       AND date >= NOW() - INTERVAL '30 days'
       GROUP BY type`,
      [memberId]
    );

    return rows;
  }
}; 