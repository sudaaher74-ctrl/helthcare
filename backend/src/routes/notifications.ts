import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
const router = Router();
router.use(authenticate as any);
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const n = await prisma.notification.findMany({ where: { userId: req.user!.id }, orderBy: { createdAt: 'desc' }, take: 50 });
    res.json({ success: true, data: n });
  } catch(e) { next(e); }
});
router.patch('/:id/read', async (req: AuthRequest, res, next) => {
  try {
    await prisma.notification.updateMany({ where: { id: req.params.id, userId: req.user!.id }, data: { isRead: true } });
    res.json({ success: true });
  } catch(e) { next(e); }
});
export default router;
