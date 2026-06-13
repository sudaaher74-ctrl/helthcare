import { Router } from 'express';
import { getExpenses, addExpense, deleteExpense } from '../controllers/expensesController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all expense routes
router.use(authenticate as any);

router.get('/', getExpenses as any);
router.post('/', addExpense as any);
router.delete('/:id', deleteExpense as any);

export default router;
