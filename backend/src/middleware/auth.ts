import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token && token !== 'mock-token') {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production') as {
            id: string;
            email: string;
            name: string;
          };
          const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, name: true },
          });
          if (user) {
            req.user = user;
            return next();
          }
        } catch (jwtErr: any) {
          if (jwtErr.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, code: 'TOKEN_EXPIRED', message: 'Token expired' });
          }
          return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }
      }
    }

    // Fallback for personal / local development mode
    let user = await prisma.user.findFirst({ select: { id: true, email: true, name: true } });

    if (!user) {
      req.user = {
        id: '64d26b6f0000000000000000',
        email: 'personal@sankalp.local',
        name: 'Personal User',
      };
      return next();
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error in auth' });
  }
};
