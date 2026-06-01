import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const generateTokens = (user: { id: string; email: string; name: string }) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET!,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as any }
  );
  return { accessToken, refreshToken };
};

const userSelect = {
  id: true, email: true, name: true, avatar: true, age: true, gender: true,
  height: true, currentWeight: true, targetWeight: true, activityLevel: true,
  dailyCalorieGoal: true, dailyProteinGoal: true, dailyCarbGoal: true,
  dailyFatGoal: true, dailyWaterGoal: true, dailyFiberGoal: true,
  theme: true, timezone: true, isOnboarded: true, createdAt: true,
};

// POST /api/auth/register
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      throw new AppError('Email, password, and name are required', 400);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('Email already registered', 409);

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
      select: userSelect,
    });

    // Create default streaks
    await prisma.streak.createMany({
      data: ['HABIT', 'WORKOUT', 'DIET', 'SLEEP', 'PRODUCTIVITY'].map((type) => ({
        userId: user.id,
        type: type as any,
      })),
    });

    const { accessToken, refreshToken } = generateTokens(user);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    res.status(201).json({ success: true, data: { user, accessToken, refreshToken } });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new AppError('Email and password are required', 400);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) throw new AppError('Invalid credentials', 401);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new AppError('Invalid credentials', 401);

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const { accessToken, refreshToken } = generateTokens(user);
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    });

    const safeUser = await prisma.user.findUnique({ where: { id: user.id }, select: userSelect });
    res.json({ success: true, data: { user: safeUser, accessToken, refreshToken } });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/refresh
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) throw new AppError('Refresh token required', 400);

    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id }, select: userSelect });
    if (!user) throw new AppError('User not found', 404);

    const tokens = generateTokens(user);

    await prisma.refreshToken.delete({ where: { token } });
    await prisma.refreshToken.create({
      data: { token: tokens.refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    });

    res.json({ success: true, data: tokens });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: userSelect });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/google/callback — called by passport
export const googleCallback = async (req: AuthRequest, res: Response) => {
  const user = req.user as any;
  if (!user) return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);

  const { accessToken, refreshToken } = generateTokens(user);
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  });

  const redirectUrl = `${process.env.CLIENT_URL}/auth/callback?token=${accessToken}&refresh=${refreshToken}&onboarded=${user.isOnboarded}`;
  res.redirect(redirectUrl);
};
