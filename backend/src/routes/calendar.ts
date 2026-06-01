import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';
const router = Router();
router.use(authenticate as any);
router.get('/:date', async (req: AuthRequest, res, next) => {
  try {
    const date = new Date(req.params.date); date.setHours(0,0,0,0);
    const userId = req.user!.id;
    const [habitLogs, meals, workouts, weightLog, sleepLog, tasks] = await Promise.all([
      prisma.habitLog.findMany({ where: { userId, date }, include: { habit: true } }),
      prisma.meal.findMany({ where: { userId, date }, include: { foodEntries: true } }),
      prisma.workoutSession.findMany({ where: { userId, date }, include: { exercises: { include: { sets: true } } } }),
      prisma.weightLog.findFirst({ where: { userId, date } }),
      prisma.sleepLog.findFirst({ where: { userId, date } }),
      prisma.task.findMany({ where: { userId, dueDate: { gte: date, lt: new Date(date.getTime() + 86400000) } } }),
    ]);
    res.json({ success: true, data: { date, habitLogs, meals, workouts, weightLog, sleepLog, tasks } });
  } catch(e) { next(e); }
});
export default router;
