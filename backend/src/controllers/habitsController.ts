import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

// GET /api/habits
export const getHabits = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const habits = await prisma.habit.findMany({
      where: { userId: req.user!.id, isActive: true },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });
    res.json({ success: true, data: habits });
  } catch (e) { next(e); }
};

// GET /api/habits/today
export const getTodayHabits = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const habits = await prisma.habit.findMany({
      where: { userId: req.user!.id, isActive: true },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
      include: {
        logs: {
          where: { date: today },
        },
      },
    });

    const result = habits.map((h) => ({
      ...h,
      completedToday: h.logs.length > 0 && h.logs[0].completed,
      logId: h.logs[0]?.id || null,
    }));

    res.json({ success: true, data: result });
  } catch (e) { next(e); }
};

// POST /api/habits
export const createHabit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, category, icon, color, frequency, reminderTime } = req.body;
    const habit = await prisma.habit.create({
      data: { userId: req.user!.id, name, description, category, icon: icon || '⭐',
               color: color || '#6366f1', frequency: frequency || 'DAILY', reminderTime },
    });
    res.status(201).json({ success: true, data: habit });
  } catch (e) { next(e); }
};

// PUT /api/habits/:id
export const updateHabit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const habit = await prisma.habit.updateMany({
      where: { id, userId: req.user!.id },
      data: req.body,
    });
    res.json({ success: true, data: habit });
  } catch (e) { next(e); }
};

// DELETE /api/habits/:id
export const deleteHabit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.habit.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: { isActive: false },
    });
    res.json({ success: true, message: 'Habit deleted' });
  } catch (e) { next(e); }
};

// POST /api/habits/:id/complete
export const completeHabit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { date, completed } = req.body;
    const logDate = date ? new Date(date) : new Date();
    logDate.setHours(0, 0, 0, 0);

    const log = await prisma.habitLog.upsert({
      where: { habitId_date: { habitId: id, date: logDate } },
      update: { completed, completedAt: completed ? new Date() : null },
      create: { habitId: id, userId: req.user!.id, date: logDate, completed, completedAt: completed ? new Date() : null },
    });

    // Update habit streak
    if (completed) {
      await updateHabitStreak(req.user!.id);
    }

    res.json({ success: true, data: log });
  } catch (e) { next(e); }
};

// GET /api/habits/stats
export const getHabitStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { period = 'week' } = req.query;
    const days = period === 'month' ? 30 : period === 'year' ? 365 : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await prisma.habitLog.findMany({
      where: { userId: req.user!.id, date: { gte: startDate } },
      include: { habit: { select: { name: true, category: true, color: true } } },
    });

    const totalPossible = logs.length;
    const completed = logs.filter((l) => l.completed).length;

    res.json({
      success: true,
      data: {
        completionRate: totalPossible ? Math.round((completed / totalPossible) * 100) : 0,
        totalCompleted: completed,
        totalPossible,
        logs,
      },
    });
  } catch (e) { next(e); }
};

async function updateHabitStreak(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const streak = await prisma.streak.findUnique({ where: { userId_type: { userId, type: 'HABIT' } } });

  const lastDate = streak?.lastLoggedDate;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let newStreak = 1;
  if (lastDate) {
    const lastDateOnly = new Date(lastDate);
    lastDateOnly.setHours(0, 0, 0, 0);
    if (lastDateOnly.getTime() === yesterday.getTime()) {
      newStreak = (streak?.currentStreak || 0) + 1;
    } else if (lastDateOnly.getTime() === today.getTime()) {
      return; // already logged today
    }
  }

  await prisma.streak.upsert({
    where: { userId_type: { userId, type: 'HABIT' } },
    update: {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, streak?.longestStreak || 0),
      lastLoggedDate: today,
    },
    create: { userId, type: 'HABIT', currentStreak: 1, longestStreak: 1, lastLoggedDate: today },
  });
}
