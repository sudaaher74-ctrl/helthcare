import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // For personal use, we bypass JWT and always attach the single default user
    let user = await prisma.user.findFirst();

    if (!user) {
      // Create the default personal user if database is completely empty
      user = await prisma.user.create({
        data: {
          email: 'personal@lifeos.local',
          name: 'Personal User',
          isOnboarded: false,
          theme: 'DARK',
          activityLevel: 'MODERATE',
        }
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
    };
    
    next();
  } catch (error) {
    console.error('Mock Auth Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error in auth' });
  }
};
