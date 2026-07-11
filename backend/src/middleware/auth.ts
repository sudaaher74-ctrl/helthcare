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
      // Mock user for local testing without replica set
      req.user = {
        id: '64d26b6f0000000000000000', // valid ObjectId
        email: 'personal@sankalp.local',
        name: 'Personal User',
      };
      return next();
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
