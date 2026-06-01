import { Router } from 'express';
import passport from 'passport';
import { register, login, refreshToken, getMe, logout, googleCallback } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', register as any);
router.post('/login', login as any);
router.post('/refresh', refreshToken as any);
router.post('/logout', logout as any);
router.get('/me', authenticate, getMe);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  googleCallback
);

export default router;
