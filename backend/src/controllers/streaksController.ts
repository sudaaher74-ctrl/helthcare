import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

// GET /api/streaks
export const getStreaks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const streaks = await prisma.streak.findMany({ where: { userId: req.user!.id } });
    res.json({ success: true, data: streaks });
  } catch (e) { next(e); }
};
