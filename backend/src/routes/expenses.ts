import { Router } from 'express';
import { getExpenses, addExpense, deleteExpense, previewSms, ingestSms, ingestSmsBatch } from '../controllers/expensesController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all expense routes
router.use(authenticate as any);

router.get('/', getExpenses as any);
router.post('/', addExpense as any);
router.delete('/:id', deleteExpense as any);

// SMS auto-import
router.post('/sms/preview', previewSms as any);
router.post('/sms/ingest', ingestSms as any);
router.post('/sms/batch', ingestSmsBatch as any);

export default router;
