import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

// GET /api/sleep
export const getSleepLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 30 } = req.query;
    const logs = await prisma.sleepLog.findMany({
      where: { userId: req.user!.id },
      orderBy: { date: 'desc' },
      take: parseInt(limit as string),
    });

    const avgDuration = logs.length ? logs.reduce((a, l) => a + l.durationMinutes, 0) / logs.length : 0;
    const avgQuality = logs.length ? logs.reduce((a, l) => a + l.quality, 0) / logs.length : 0;

    res.json({ success: true, data: { logs, avgDuration: Math.round(avgDuration), avgQuality: parseFloat(avgQuality.toFixed(1)) } });
  } catch (e) { next(e); }
};

// POST /api/sleep
export const createSleepLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bedTime, wakeTime, quality, deepSleep, remSleep, awakenings, notes, date } = req.body;

    const bed = new Date(bedTime);
    const wake = new Date(wakeTime);
    const durationMinutes = Math.round((wake.getTime() - bed.getTime()) / 60000);

    const logDate = date ? new Date(date) : wake;
    logDate.setHours(0, 0, 0, 0);

    const log = await prisma.sleepLog.upsert({
      where: { userId_date: { userId: req.user!.id, date: logDate } },
      update: { bedTime: bed, wakeTime: wake, durationMinutes, quality, deepSleep, remSleep, awakenings, notes },
      create: { userId: req.user!.id, date: logDate, bedTime: bed, wakeTime: wake, durationMinutes, quality, deepSleep, remSleep, awakenings, notes },
    });

    res.status(201).json({ success: true, data: log });
  } catch (e) { next(e); }
};

// PUT /api/sleep/:id
export const updateSleepLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const log = await prisma.sleepLog.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: req.body,
    });
    res.json({ success: true, data: log });
  } catch (e) { next(e); }
};

// DELETE /api/sleep/:id
export const deleteSleepLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.sleepLog.deleteMany({ where: { id: req.params.id, userId: req.user!.id } });
    res.json({ success: true, message: 'Sleep log deleted' });
  } catch (e) { next(e); }
};
