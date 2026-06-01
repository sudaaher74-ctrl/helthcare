import { Router } from 'express';
import { getProfile, updateProfile, completeOnboarding } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
const router = Router();
router.use(authenticate as any);
router.get('/profile', getProfile as any);
router.put('/profile', updateProfile as any);
router.post('/onboarding', completeOnboarding as any);
export default router;
