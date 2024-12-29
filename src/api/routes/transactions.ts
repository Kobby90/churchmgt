import express from 'express';
import { authMiddleware } from '@/middleware/auth';
import { transactionService } from '@/services/transactions';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const transactions = await transactionService.getTransactions(req.user.id);
    res.json(transactions);
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const stats = await transactionService.getTransactionStats(req.user.id);
    res.json(stats);
  } catch (error) {
    console.error('Failed to fetch transaction stats:', error);
    res.status(500).json({ error: 'Failed to fetch transaction stats' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const transaction = await transactionService.createTransaction(req.user.id, req.body);
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Failed to create transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

export default router; 