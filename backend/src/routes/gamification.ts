import { Router } from 'express';
import { getGamificationStatus, addGamificationReward } from '../controllers/gamificationController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/status', getGamificationStatus);
router.post('/reward', addGamificationReward);

export default router;
