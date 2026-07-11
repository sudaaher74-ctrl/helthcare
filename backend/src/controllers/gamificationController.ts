import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

// Helper function to calculate XP required for a given level (exponential scaling)
export const calculateXPForLevel = (level: number) => {
  return Math.floor(1000 * Math.pow(1.5, level - 1));
};

// GET /api/gamification/status
export const getGamificationStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        xp: true,
        level: true,
        lifePoints: true,
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const nextLevelXp = calculateXPForLevel(user.level);

    res.json({
      success: true,
      data: {
        ...user,
        nextLevelXp,
        progressPercent: Math.min(100, (user.xp / nextLevelXp) * 100)
      }
    });
  } catch (e) {
    next(e);
  }
};

// POST /api/gamification/reward
export const addGamificationReward = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { xpAmount, lifePointsAmount, reason } = req.body;
    
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let newXp = (user.xp || 0) + (xpAmount || 0);
    let newLevel = user.level || 1;
    let nextLevelXp = calculateXPForLevel(newLevel);
    let leveledUp = false;

    // Check for level up
    while (newXp >= nextLevelXp) {
      newXp -= nextLevelXp;
      newLevel++;
      leveledUp = true;
      nextLevelXp = calculateXPForLevel(newLevel);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        xp: newXp,
        level: newLevel,
        lifePoints: { increment: lifePointsAmount || 0 }
      },
      select: { xp: true, level: true, lifePoints: true }
    });

    res.json({
      success: true,
      data: {
        ...updatedUser,
        leveledUp,
        nextLevelXp,
        progressPercent: Math.min(100, (updatedUser.xp / nextLevelXp) * 100),
        reason
      }
    });
  } catch (e) {
    next(e);
  }
};
