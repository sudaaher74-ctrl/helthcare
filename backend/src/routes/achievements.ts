import { Router } from 'express';
import { getAchievements, seedAchievements } from '../controllers/achievementsController';
import { authenticate } from '../middleware/auth';
const router = Router();
router.use(authenticate as any);
router.get('/', getAchievements as any);
router.post('/seed', seedAchievements as any);
export default router;
