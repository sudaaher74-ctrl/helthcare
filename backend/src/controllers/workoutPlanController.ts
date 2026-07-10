import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { EXERCISES, buildDefaultPlanDays } from '../data/exerciseLibrary';

// GET /api/workout-plan — returns the user's active weekly plan, seeding a
// sensible default the first time.
export const getPlan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    let plan = await prisma.workoutPlan.findFirst({ where: { userId, active: true } });

    if (!plan) {
      plan = await prisma.workoutPlan.create({
        data: {
          userId,
          name: 'My Weekly Plan',
          goal: 'GENERAL',
          level: 'BEGINNER',
          active: true,
          days: buildDefaultPlanDays() as any,
        },
      });
    }

    res.json({ success: true, data: plan });
  } catch (e) { next(e); }
};

// PUT /api/workout-plan — replace the plan's meta + days.
export const updatePlan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { name, goal, level, days } = req.body;

    const existing = await prisma.workoutPlan.findFirst({ where: { userId, active: true } });
    if (!existing) return res.status(404).json({ success: false, message: 'No active plan' });

    const plan = await prisma.workoutPlan.update({
      where: { id: existing.id },
      data: {
        ...(name !== undefined && { name }),
        ...(goal !== undefined && { goal }),
        ...(level !== undefined && { level }),
        ...(days !== undefined && { days }),
      },
    });

    res.json({ success: true, data: plan });
  } catch (e) { next(e); }
};

// POST /api/workout-plan/reset — restore the default Mon–Sat split.
export const resetPlan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const existing = await prisma.workoutPlan.findFirst({ where: { userId, active: true } });

    if (existing) {
      const plan = await prisma.workoutPlan.update({
        where: { id: existing.id },
        data: { days: buildDefaultPlanDays() as any },
      });
      return res.json({ success: true, data: plan });
    }

    const plan = await prisma.workoutPlan.create({
      data: { userId, active: true, days: buildDefaultPlanDays() as any },
    });
    res.json({ success: true, data: plan });
  } catch (e) { next(e); }
};

// GET /api/workout-plan/library — the exercise catalog for building/editing days.
export const getLibrary = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true, data: Object.values(EXERCISES) });
  } catch (e) { next(e); }
};
