import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../utils/prisma';

export const configurePassport = () => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('[Passport] Google OAuth not configured — skipping Google strategy.');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error('No email from Google'), undefined);

          let user = await prisma.user.findUnique({ where: { googleId: profile.id } });

          if (!user) {
            user = await prisma.user.findUnique({ where: { email } });
            if (user) {
              user = await prisma.user.update({
                where: { email },
                data: { googleId: profile.id, avatar: profile.photos?.[0]?.value },
              });
            } else {
              user = await prisma.user.create({
                data: {
                  email,
                  name: profile.displayName || email.split('@')[0],
                  googleId: profile.id,
                  avatar: profile.photos?.[0]?.value,
                  isOnboarded: false,
                },
              });
            }
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
};
