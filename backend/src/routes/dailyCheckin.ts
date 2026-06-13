import { Router } from 'express';
import { getDailyCheckin, logDailyCheckin } from '../controllers/dailyCheckinController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate as any);

router.get('/', getDailyCheckin);
router.post('/', logDailyCheckin);

export default router;
