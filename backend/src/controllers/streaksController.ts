import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

// GET /api/streaks
export const getStreaks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const streaks = await prisma.streak.findMany({ where: { userId: req.user!.id } });
    res.json({ success: true, data: streaks });
  } catch (e) { next(e); }
};
