import { Router } from 'express';
import { analyzeFood } from '../controllers/aiController';
import { authenticate } from '../middleware/auth';
const router = Router();
router.use(authenticate as any);
router.post('/analyze-food', analyzeFood as any);
export default router;
