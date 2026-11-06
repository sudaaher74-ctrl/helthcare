import { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../utils/prisma';
const router = Router();
router.use(authenticate as any);
router.get('/:date', async (req: Request, res, next) => {
  try {
    const date = new Date(req.params.date);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    const userId = req.user!.id;
    const [habitLogs, meals, workouts, weightLog, sleepLog, tasks] = await Promise.all([
      prisma.habitLog.findMany({ where: { userId, date: { gte: date, lt: nextDate } }, include: { habit: true } }),
      prisma.meal.findMany({ where: { userId, date: { gte: date, lt: nextDate } }, include: { foodEntries: true } }),
      prisma.workoutSession.findMany({ where: { userId, date: { gte: date, lt: nextDate } }, include: { exercises: { include: { sets: true } } } }),
      prisma.weightLog.findFirst({ where: { userId, date: { gte: date, lt: nextDate } } }),
      prisma.sleepLog.findFirst({ where: { userId, date: { gte: date, lt: nextDate } } }),
      prisma.task.findMany({ where: { userId, dueDate: { gte: date, lt: nextDate } } }),
    ]);
    res.json({ success: true, data: { date, habitLogs, meals, workouts, weightLog, sleepLog, tasks } });
  } catch(e) { next(e); }
});
export default router;
