import { Router } from 'express';
import { getDailyCheckin, logDailyCheckin } from '../controllers/dailyCheckinController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', getDailyCheckin);
router.post('/', logDailyCheckin);

export default router;
