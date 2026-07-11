import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

// GET /api/weight
export const getWeightLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 30 } = req.query;
    const logs = await prisma.weightLog.findMany({
      where: { userId: req.user!.id },
      orderBy: { date: 'desc' },
      take: parseInt(limit as string),
    });

    // Forecasting
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { targetWeight: true },
    });

    let forecast = null;
    if (logs.length >= 2 && user?.targetWeight) {
      const recent = logs.slice(0, 7);
      const weeklyGain = recent.length > 1
        ? (recent[0].weight - recent[recent.length - 1].weight) / (recent.length - 1) * 7
        : 0;
      if (weeklyGain > 0) {
        const remaining = user.targetWeight - logs[0].weight;
        const weeksToGoal = remaining / weeklyGain;
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + Math.round(weeksToGoal * 7));
        forecast = { weeklyGain: parseFloat(weeklyGain.toFixed(2)), estimatedDate: targetDate, weeksRemaining: Math.round(weeksToGoal) };
      }
    }

    res.json({ success: true, data: { logs, forecast } });
  } catch (e) { next(e); }
};

// POST /api/weight
export const createWeightLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { weight, bodyFat, muscleMass, notes, date } = req.body;
    const logDate = date ? new Date(date) : new Date();
    logDate.setHours(0, 0, 0, 0);

    const log = await prisma.weightLog.upsert({
      where: { userId_date: { userId: req.user!.id, date: logDate } },
      update: { weight, bodyFat, muscleMass, notes },
      create: { userId: req.user!.id, weight, bodyFat, muscleMass, notes, date: logDate },
    });

    // Update user's currentWeight
    await prisma.user.update({ where: { id: req.user!.id }, data: { currentWeight: weight } });

    res.status(201).json({ success: true, data: log });
  } catch (e) { next(e); }
};

// PUT /api/weight/:id
export const updateWeightLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const log = await prisma.weightLog.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: req.body,
    });
    res.json({ success: true, data: log });
  } catch (e) { next(e); }
};

// DELETE /api/weight/:id
export const deleteWeightLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.weightLog.deleteMany({ where: { id: req.params.id, userId: req.user!.id } });
    res.json({ success: true, message: 'Weight log deleted' });
  } catch (e) { next(e); }
};
