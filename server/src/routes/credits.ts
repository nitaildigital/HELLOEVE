import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/balance', authenticate, async (req: Request, res: Response) => {
  try {
    let balance = await prisma.creditBalance.findUnique({ where: { userId: req.user!.userId } });
    if (!balance) {
      balance = await prisma.creditBalance.create({
        data: { userId: req.user!.userId, monthly: 5, purchased: 0 },
      });
    }
    res.json({
      monthly: balance.monthly,
      purchased: balance.purchased,
      total: balance.monthly + balance.purchased,
      lastReset: balance.lastReset,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch credit balance' });
  }
});

router.get('/history', authenticate, async (req: Request, res: Response) => {
  try {
    const { limit = '50', offset = '0' } = req.query;
    const transactions = await prisma.creditTransaction.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch credit history' });
  }
});

router.post('/purchase', authenticate, async (req: Request, res: Response) => {
  try {
    const { pack } = req.body;
    const packs: Record<string, number> = {
      PACK_10: 10,
      PACK_30: 30,
      PACK_100: 100,
    };

    const credits = packs[pack];
    if (!credits) {
      res.status(400).json({ error: 'Invalid pack. Use PACK_10, PACK_30, or PACK_100' });
      return;
    }

    // In production, this would go through Stripe first
    const balance = await prisma.creditBalance.upsert({
      where: { userId: req.user!.userId },
      update: { purchased: { increment: credits } },
      create: { userId: req.user!.userId, monthly: 5, purchased: credits },
    });

    await prisma.creditTransaction.create({
      data: {
        userId: req.user!.userId,
        type: 'PURCHASE',
        amount: credits,
        balance: balance.monthly + balance.purchased,
        note: `Purchased ${pack}`,
      },
    });

    res.json({
      message: `${credits} credits added`,
      balance: { monthly: balance.monthly, purchased: balance.purchased, total: balance.monthly + balance.purchased },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to purchase credits' });
  }
});

export default router;
