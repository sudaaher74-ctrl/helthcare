import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

// GET /api/daily-checkin
export const getDailyCheckin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkin = await prisma.dailyCheckIn.findUnique({
      where: {
        userId_date: {
          userId: req.user!.id,
          date: today
        }
      }
    });

    res.json({ success: true, data: checkin });
  } catch (e) {
    next(e);
  }
};

// POST /api/daily-checkin
export const logDailyCheckin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { mood, notes } = req.body;
    
    if (mood < 1 || mood > 4) {
      return res.status(400).json({ success: false, message: 'Mood must be between 1 and 4' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkin = await prisma.dailyCheckIn.upsert({
      where: {
        userId_date: {
          userId: req.user!.id,
          date: today
        }
      },
      update: { mood, notes },
      create: {
        userId: req.user!.id,
        date: today,
        mood,
        notes
      }
    });

    res.json({ success: true, data: checkin, message: 'Daily check-in saved' });
  } catch (e) {
    next(e);
  }
};
