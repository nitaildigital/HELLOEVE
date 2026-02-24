import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { revokeAllUserTokens } from '../utils/tokens.js';

const router = Router();

router.get('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true, email: true, name: true, avatarUrl: true, phone: true,
        plan: true, role: true, businessField: true, location: true, vatNumber: true,
        createdAt: true, updatedAt: true,
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const { name, phone, businessField, location, vatNumber, avatarUrl } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(businessField !== undefined && { businessField }),
        ...(location !== undefined && { location }),
        ...(vatNumber !== undefined && { vatNumber }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      select: {
        id: true, email: true, name: true, avatarUrl: true, phone: true,
        plan: true, role: true, businessField: true, location: true, vatNumber: true,
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.put('/password', authenticate, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user?.passwordHash) {
      res.status(400).json({ error: 'No password set (Google account)' });
      return;
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    await revokeAllUserTokens(user.id);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update password' });
  }
});

router.delete('/account', authenticate, async (req: Request, res: Response) => {
  try {
    await revokeAllUserTokens(req.user!.userId);
    await prisma.user.delete({ where: { id: req.user!.userId } });
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
