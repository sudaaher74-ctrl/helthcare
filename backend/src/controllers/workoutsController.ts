import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

// GET /api/workouts
export const getWorkouts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { limit = 20, date } = req.query;
    const where: any = { userId: req.user!.id };
    if (date) { const d = new Date(date as string); d.setHours(0, 0, 0, 0); where.date = d; }

    const sessions = await prisma.workoutSession.findMany({
      where,
      include: { exercises: { include: { sets: true }, orderBy: { sortOrder: 'asc' } } },
      orderBy: { date: 'desc' },
      take: parseInt(limit as string),
    });
    res.json({ success: true, data: sessions });
  } catch (e) { next(e); }
};

// POST /api/workouts
export const createWorkout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, category, date, startTime, endTime, durationMinutes, caloriesBurned, notes, mood, exercises } = req.body;
    const workoutDate = date ? new Date(date) : new Date();
    workoutDate.setHours(0, 0, 0, 0);

    const session = await prisma.workoutSession.create({
      data: {
        userId: req.user!.id,
        name,
        category,
        date: workoutDate,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        durationMinutes,
        caloriesBurned,
        notes,
        mood,
        isCompleted: true,
        exercises: {
          create: (exercises || []).map((ex: any, i: number) => ({
            name: ex.name,
            muscleGroup: ex.muscleGroup,
            category: ex.category || 'STRENGTH',
            notes: ex.notes,
            sortOrder: i,
            sets: {
              create: (ex.sets || []).map((s: any, si: number) => ({
                setNumber: si + 1,
                reps: s.reps,
                weight: s.weight,
                duration: s.duration,
                distance: s.distance,
                restSeconds: s.restSeconds,
                isWarmup: s.isWarmup || false,
              })),
            },
          })),
        },
      },
      include: { exercises: { include: { sets: true } } },
    });

    // Update workout streak
    await updateWorkoutStreak(req.user!.id);

    res.status(201).json({ success: true, data: session });
  } catch (e) { next(e); }
};

// PUT /api/workouts/:id
export const updateWorkout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { exercises, ...data } = req.body;
    const session = await prisma.workoutSession.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data,
    });
    res.json({ success: true, data: session });
  } catch (e) { next(e); }
};

// DELETE /api/workouts/:id
export const deleteWorkout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.workoutSession.deleteMany({ where: { id: req.params.id, userId: req.user!.id } });
    res.json({ success: true, message: 'Workout deleted' });
  } catch (e) { next(e); }
};

// GET /api/workouts/stats
export const getWorkoutStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sessions = await prisma.workoutSession.findMany({
      where: { userId: req.user!.id, date: { gte: thirtyDaysAgo }, isCompleted: true },
    });

    const byCategory = sessions.reduce((acc: any, s) => {
      acc[s.category] = (acc[s.category] || 0) + 1;
      return acc;
    }, {});

    const totalMinutes = sessions.reduce((a, s) => a + (s.durationMinutes || 0), 0);
    const totalCalories = sessions.reduce((a, s) => a + (s.caloriesBurned || 0), 0);

    res.json({ success: true, data: { totalSessions: sessions.length, byCategory, totalMinutes, totalCalories } });
  } catch (e) { next(e); }
};

async function updateWorkoutStreak(userId: string) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const streak = await prisma.streak.findUnique({ where: { userId_type: { userId, type: 'WORKOUT' } } });
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);

  let newStreak = 1;
  if (streak?.lastLoggedDate) {
    const last = new Date(streak.lastLoggedDate); last.setHours(0, 0, 0, 0);
    if (last.getTime() === yesterday.getTime()) newStreak = (streak.currentStreak || 0) + 1;
    else if (last.getTime() === today.getTime()) return;
  }

  await prisma.streak.upsert({
    where: { userId_type: { userId, type: 'WORKOUT' } },
    update: { currentStreak: newStreak, longestStreak: Math.max(newStreak, streak?.longestStreak || 0), lastLoggedDate: today },
    create: { userId, type: 'WORKOUT', currentStreak: 1, longestStreak: 1, lastLoggedDate: today },
  });
}
