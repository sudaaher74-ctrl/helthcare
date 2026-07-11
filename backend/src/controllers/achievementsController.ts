import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

// GET /api/achievements
export const getAchievements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [all, unlocked] = await Promise.all([
      prisma.achievement.findMany(),
      prisma.userAchievement.findMany({
        where: { userId: req.user!.id },
        include: { achievement: true },
        orderBy: { unlockedAt: 'desc' },
      }),
    ]);

    const unlockedIds = new Set(unlocked.map((u) => u.achievementId));
    const result = all.map((a) => ({
      ...a,
      isUnlocked: unlockedIds.has(a.id),
      unlockedAt: unlocked.find((u) => u.achievementId === a.id)?.unlockedAt || null,
    }));

    res.json({ success: true, data: { achievements: result, totalUnlocked: unlocked.length, totalPossible: all.length } });
  } catch (e) { next(e); }
};

// POST /api/achievements/seed — Admin: seed default achievements
export const seedAchievements = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const achievements = [
      { key: 'FIRST_HABIT', name: 'First Step', description: 'Complete your first habit', icon: '⭐', category: 'HABIT', xpReward: 50, rarity: 'COMMON' },
      { key: 'STREAK_7', name: 'Week Warrior', description: '7-day habit streak', icon: '🔥', category: 'HABIT', xpReward: 100, rarity: 'UNCOMMON' },
      { key: 'STREAK_30', name: 'Monthly Master', description: '30-day habit streak', icon: '💎', category: 'HABIT', xpReward: 300, rarity: 'RARE' },
      { key: 'STREAK_100', name: 'Century Club', description: '100-day habit streak', icon: '🏆', category: 'HABIT', xpReward: 1000, rarity: 'LEGENDARY' },
      { key: 'FIRST_WORKOUT', name: 'Iron Will', description: 'Log your first workout', icon: '💪', category: 'WORKOUT', xpReward: 75, rarity: 'COMMON' },
      { key: 'WORKOUT_STREAK_7', name: 'Consistent Lifter', description: '7-day workout streak', icon: '🏋️', category: 'WORKOUT', xpReward: 200, rarity: 'UNCOMMON' },
      { key: 'FIRST_WEIGHT_GAIN', name: 'Growing Stronger', description: 'Gain your first 0.5kg', icon: '📈', category: 'HABIT', xpReward: 150, rarity: 'UNCOMMON' },
      { key: 'NUTRITION_WEEK', name: 'Nutrition Champion', description: 'Hit all macros for 7 days', icon: '🥗', category: 'NUTRITION', xpReward: 250, rarity: 'RARE' },
      { key: 'DISCIPLINE_MASTER', name: 'Discipline Master', description: '90%+ habit rate for 30 days', icon: '🎯', category: 'HABIT', xpReward: 500, rarity: 'EPIC' },
      { key: 'PRODUCTIVITY_MASTER', name: 'Productivity Master', description: 'Complete 50 tasks', icon: '✅', category: 'PRODUCTIVITY', xpReward: 300, rarity: 'RARE' },
      { key: 'SLEEP_WEEK', name: 'Sleep Champion', description: '8+ hours sleep for 7 days', icon: '😴', category: 'SLEEP', xpReward: 150, rarity: 'UNCOMMON' },
      { key: 'FITNESS_CHAMPION', name: 'Fitness Champion', description: '50 workouts logged', icon: '🏆', category: 'WORKOUT', xpReward: 500, rarity: 'EPIC' },
      { key: 'GOAL_ACHIEVED', name: 'Goal Getter', description: 'Complete your first goal', icon: '🎉', category: 'GENERAL', xpReward: 200, rarity: 'UNCOMMON' },
      { key: 'WEIGHT_TARGET', name: 'Target Reached', description: 'Reach your target weight', icon: '🎯', category: 'HABIT', xpReward: 1000, rarity: 'LEGENDARY' },
    ];

    for (const a of achievements) {
      await prisma.achievement.upsert({
        where: { key: a.key },
        update: {
          ...a,
          category: a.category as any,
          rarity: a.rarity as any,
        },
        create: a as any,
      });
    }

    res.json({ success: true, message: `Seeded ${achievements.length} achievements` });
  } catch (e) { next(e); }
};
