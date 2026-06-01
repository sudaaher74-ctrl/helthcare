import { Router } from 'express';
import { getStreaks } from '../controllers/streaksController';
import { authenticate } from '../middleware/auth';
const router = Router();
router.use(authenticate as any);
router.get('/', getStreaks as any);
export default router;
