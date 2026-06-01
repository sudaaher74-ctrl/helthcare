import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';
const router = Router();
router.use(authenticate as any);
router.get('/', getDashboard as any);
export default router;
