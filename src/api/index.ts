import express from 'express';
import authRouter from './routes/auth';
import membersRouter from './routes/members';
import familyUnitsRouter from './routes/family-units';
import transactionsRouter from './routes/transactions';
import welfareCasesRouter from './routes/welfare-cases';

const router = express.Router();

// Auth routes don't need auth middleware
router.use('/auth', authRouter);

// Protected routes
router.use('/members', membersRouter);
router.use('/family-units', familyUnitsRouter);
router.use('/transactions', transactionsRouter);
router.use('/welfare-cases', welfareCasesRouter);

export default router; 