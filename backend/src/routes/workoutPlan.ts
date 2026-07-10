import { Router } from 'express';
import { getPlan, updatePlan, resetPlan, getLibrary } from '../controllers/workoutPlanController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate as any);

router.get('/', getPlan as any);
router.put('/', updatePlan as any);
router.post('/reset', resetPlan as any);
router.get('/library', getLibrary as any);

export default router;
