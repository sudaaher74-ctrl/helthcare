import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

// GET /api/goals
export const getGoals = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.user!.id },
      include: { milestones: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: goals });
  } catch (e) { next(e); }
};

// POST /api/goals
export const createGoal = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, category, icon, color, targetValue, unit, targetDate, milestones } = req.body;
    const goal = await prisma.goal.create({
      data: {
        userId: req.user!.id,
        title,
        description,
        category,
        icon: icon || '🎯',
        color: color || '#6366f1',
        targetValue,
        unit,
        targetDate: targetDate ? new Date(targetDate) : undefined,
        milestones: {
          create: (milestones || []).map((m: any, i: number) => ({
            title: m.title,
            targetValue: m.targetValue,
            sortOrder: i,
          })),
        },
      },
      include: { milestones: true },
    });
    res.status(201).json({ success: true, data: goal });
  } catch (e) { next(e); }
};

// PUT /api/goals/:id
export const updateGoal = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = { ...req.body };
    if (data.targetDate) data.targetDate = new Date(data.targetDate);
    if (data.status === 'COMPLETED' && !data.completedAt) data.completedAt = new Date();

    const goal = await prisma.goal.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data,
    });
    res.json({ success: true, data: goal });
  } catch (e) { next(e); }
};

// DELETE /api/goals/:id
export const deleteGoal = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.goal.deleteMany({ where: { id: req.params.id, userId: req.user!.id } });
    res.json({ success: true, message: 'Goal deleted' });
  } catch (e) { next(e); }
};

// PUT /api/goals/:id/milestones/:milestoneId
export const updateMilestone = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { milestoneId } = req.params;
    const { isCompleted } = req.body;
    const milestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: { isCompleted, completedAt: isCompleted ? new Date() : null },
    });
    res.json({ success: true, data: milestone });
  } catch (e) { next(e); }
};
