import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

// GET /api/analytics?period=week|month|year
export const getAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { period = 'week' } = req.query;
    const days = period === 'year' ? 365 : period === 'month' ? 30 : 7;
    const startDate = new Date(); startDate.setDate(startDate.getDate() - days); startDate.setHours(0, 0, 0, 0);
    const userId = req.user!.id;

    const [weightLogs, sleepLogs, habitLogs, habits, workoutSessions, meals] = await Promise.all([
      prisma.weightLog.findMany({ where: { userId, date: { gte: startDate } }, orderBy: { date: 'asc' } }),
      prisma.sleepLog.findMany({ where: { userId, date: { gte: startDate } }, orderBy: { date: 'asc' } }),
      prisma.habitLog.findMany({ where: { userId, date: { gte: startDate } }, include: { habit: true } }),
      prisma.habit.findMany({ where: { userId, isActive: true } }),
      prisma.workoutSession.findMany({ where: { userId, date: { gte: startDate }, isCompleted: true }, orderBy: { date: 'asc' } }),
      prisma.meal.findMany({ where: { userId, date: { gte: startDate } }, orderBy: { date: 'asc' } }),
    ]);

    // Nutrition daily aggregation
    const nutritionByDay: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {};
    for (const meal of meals) {
      const key = meal.date.toISOString().split('T')[0];
      if (!nutritionByDay[key]) nutritionByDay[key] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      nutritionByDay[key].calories += meal.totalCalories;
      nutritionByDay[key].protein += meal.totalProtein;
      nutritionByDay[key].carbs += meal.totalCarbs;
      nutritionByDay[key].fat += meal.totalFat;
    }

    // Habit completion by day
    const habitsByDay: Record<string, { completed: number; total: number }> = {};
    for (const log of habitLogs) {
      const key = log.date.toISOString().split('T')[0];
      if (!habitsByDay[key]) habitsByDay[key] = { completed: 0, total: 0 };
      habitsByDay[key].total += 1;
      if (log.completed) habitsByDay[key].completed += 1;
    }

    const avgSleep = sleepLogs.length ? sleepLogs.reduce((a, l) => a + l.durationMinutes, 0) / sleepLogs.length : 0;
    const avgQuality = sleepLogs.length ? sleepLogs.reduce((a, l) => a + l.quality, 0) / sleepLogs.length : 0;

    res.json({
      success: true,
      data: {
        period,
        weight: { data: weightLogs.map((w) => ({ date: w.date, value: w.weight })) },
        sleep: {
          data: sleepLogs.map((s) => ({ date: s.date, hours: parseFloat((s.durationMinutes / 60).toFixed(1)), quality: s.quality })),
          avgHours: parseFloat((avgSleep / 60).toFixed(1)),
          avgQuality: parseFloat(avgQuality.toFixed(1)),
        },
        habits: {
          data: Object.entries(habitsByDay).map(([date, d]) => ({
            date, rate: d.total ? Math.round((d.completed / d.total) * 100) : 0,
          })),
          totalHabits: habits.length,
        },
        workouts: {
          data: workoutSessions.map((w) => ({ date: w.date, category: w.category, duration: w.durationMinutes || 0 })),
          totalSessions: workoutSessions.length,
          totalMinutes: workoutSessions.reduce((a, w) => a + (w.durationMinutes || 0), 0),
        },
        nutrition: {
          data: Object.entries(nutritionByDay).map(([date, d]) => ({ date, ...d })),
        },
      },
    });
  } catch (e) { next(e); }
};
