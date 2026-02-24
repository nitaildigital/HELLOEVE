import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../lib/prisma.js';
import { registerSchema, loginSchema, googleAuthSchema, validate } from '../utils/validation.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, revokeRefreshToken, revokeAllUserTokens } from '../utils/tokens.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { sendWelcomeEmail } from '../services/email.js';
import { PLAN_LIMITS } from '../middleware/planGuard.js';

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password, name } = validate(registerSchema, req.body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        creditBalance: {
          create: { monthly: PLAN_LIMITS.STARTER.monthlyCredits, purchased: 0 },
        },
      },
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    sendWelcomeEmail(email, name).catch(console.error);

    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = validate(loginSchema, req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    res.json({
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/google', authLimiter, async (req: Request, res: Response) => {
  try {
    const { idToken } = validate(googleAuthSchema, req.body);

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      res.status(400).json({ error: 'Invalid Google token' });
      return;
    }

    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId: payload.sub }, { email: payload.email }] },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name || '',
          googleId: payload.sub,
          avatarUrl: payload.picture,
          creditBalance: {
            create: { monthly: PLAN_LIMITS.STARTER.monthlyCredits, purchased: 0 },
          },
        },
      });
      sendWelcomeEmail(payload.email, payload.name || '').catch(console.error);
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: payload.sub, avatarUrl: user.avatarUrl || payload.picture },
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    res.json({
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token required' });
      return;
    }

    const record = await verifyRefreshToken(refreshToken);
    if (!record) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: record.userId } });
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    await revokeRefreshToken(refreshToken);
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = await generateRefreshToken(user);

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

router.post('/logout', authenticate, async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true, email: true, name: true, avatarUrl: true, phone: true,
        plan: true, role: true, businessField: true, location: true,
        createdAt: true,
        creditBalance: { select: { monthly: true, purchased: true, lastReset: true } },
        addons: { where: { active: true }, select: { type: true } },
      },
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
