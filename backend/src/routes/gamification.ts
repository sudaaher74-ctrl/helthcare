import { Router } from 'express';
import { getGamificationStatus, addGamificationReward } from '../controllers/gamificationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate as any);

router.get('/status', getGamificationStatus);
router.post('/reward', addGamificationReward);

export default router;
