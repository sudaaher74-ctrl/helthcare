import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';
const router = Router();
router.use(authenticate as any);
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { theme: true, timezone: true, notificationsEnabled: true } });
    res.json({ success: true, data: user });
  } catch(e) { next(e); }
});
router.put('/', async (req: AuthRequest, res, next) => {
  try {
    const { theme, timezone, notificationsEnabled } = req.body;
    const user = await prisma.user.update({ where: { id: req.user!.id }, data: { theme, timezone, notificationsEnabled }, select: { theme: true, timezone: true, notificationsEnabled: true } });
    res.json({ success: true, data: user });
  } catch(e) { next(e); }
});
export default router;
