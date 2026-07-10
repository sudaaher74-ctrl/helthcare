import { Router } from 'express';
import { analyzeFood, processVoiceCommand } from '../controllers/aiController';
import { authenticate } from '../middleware/auth';
const router = Router();
router.use(authenticate as any);
router.post('/analyze-food', analyzeFood as any);
router.post('/process-voice-command', processVoiceCommand as any);
export default router;
