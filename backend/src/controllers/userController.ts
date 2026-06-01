import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const userSelect = {
  id: true, email: true, name: true, avatar: true, age: true, gender: true,
  height: true, currentWeight: true, targetWeight: true, activityLevel: true,
  dailyCalorieGoal: true, dailyProteinGoal: true, dailyCarbGoal: true,
  dailyFatGoal: true, dailyWaterGoal: true, dailyFiberGoal: true,
  theme: true, timezone: true, isOnboarded: true, notificationsEnabled: true, createdAt: true,
};

// GET /api/user/profile
export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: userSelect });
    res.json({ success: true, data: user });
  } catch (e) { next(e); }
};

// PUT /api/user/profile
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const allowed = [
      'name', 'age', 'gender', 'height', 'currentWeight', 'targetWeight',
      'activityLevel', 'dailyCalorieGoal', 'dailyProteinGoal', 'dailyCarbGoal',
      'dailyFatGoal', 'dailyWaterGoal', 'dailyFiberGoal', 'avatar', 'timezone',
      'theme', 'notificationsEnabled', 'isOnboarded',
    ];
    const data: Record<string, any> = {};
    allowed.forEach((key) => { if (req.body[key] !== undefined) data[key] = req.body[key]; });

    const user = await prisma.user.update({ where: { id: req.user!.id }, data, select: userSelect });
    res.json({ success: true, data: user });
  } catch (e) { next(e); }
};

// POST /api/user/complete-onboarding
export const completeOnboarding = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, age, gender, height, currentWeight, targetWeight, activityLevel,
            dailyCalorieGoal, dailyProteinGoal } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name, age, gender, height, currentWeight, targetWeight, activityLevel,
               dailyCalorieGoal, dailyProteinGoal, isOnboarded: true },
      select: userSelect,
    });

    // Seed default habits
    const defaultHabits = [
      { name: 'Wake Up Before 6 AM', category: 'MORNING', icon: '⏰', color: '#f59e0b' },
      { name: 'Drink Water (Morning)', category: 'MORNING', icon: '💧', color: '#06b6d4' },
      { name: 'Meditation', category: 'MORNING', icon: '🧘', color: '#8b5cf6' },
      { name: 'Reading', category: 'MORNING', icon: '📚', color: '#10b981' },
      { name: 'Deep Work Session', category: 'PRODUCTIVITY', icon: '🎯', color: '#6366f1' },
      { name: 'Business Work', category: 'PRODUCTIVITY', icon: '💼', color: '#3b82f6' },
      { name: 'Learning / Skill Development', category: 'PRODUCTIVITY', icon: '🧠', color: '#f97316' },
      { name: 'Gym Workout', category: 'HEALTH', icon: '💪', color: '#ef4444' },
      { name: 'Protein Intake Goal', category: 'HEALTH', icon: '🥩', color: '#dc2626' },
      { name: 'Healthy Meals', category: 'HEALTH', icon: '🥗', color: '#22c55e' },
      { name: 'Water Goal (2L+)', category: 'HEALTH', icon: '🌊', color: '#0ea5e9' },
      { name: 'Daily Reflection', category: 'NIGHT', icon: '📝', color: '#a855f7' },
      { name: 'Plan Tomorrow', category: 'NIGHT', icon: '📅', color: '#ec4899' },
      { name: 'Sleep Before 11 PM', category: 'NIGHT', icon: '🌙', color: '#1e40af' },
    ];

    await prisma.habit.createMany({
      data: defaultHabits.map((h, i) => ({
        ...h,
        userId: user.id,
        category: h.category as any,
        sortOrder: i,
      })),
    });

    res.json({ success: true, data: user, message: 'Onboarding complete!' });
  } catch (e) { next(e); }
};
