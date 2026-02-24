import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import crypto from 'crypto';

const router = Router();

router.post('/register', authenticate, async (req: Request, res: Response) => {
  try {
    const existing = await prisma.partner.findUnique({ where: { userId: req.user!.userId } });
    if (existing) {
      res.json(existing);
      return;
    }

    const referralCode = crypto.randomBytes(6).toString('hex').toUpperCase();
    const partner = await prisma.partner.create({
      data: {
        userId: req.user!.userId,
        referralCode,
        commissionRate: 0.20,
      },
    });
    res.status(201).json(partner);
  } catch (error) {
    res.status(500).json({ error: 'Failed to register as partner' });
  }
});

router.get('/dashboard', authenticate, async (req: Request, res: Response) => {
  try {
    const partner = await prisma.partner.findUnique({
      where: { userId: req.user!.userId },
      include: {
        referrals: {
          include: { referredUser: { select: { email: true, plan: true, createdAt: true } } },
          orderBy: { createdAt: 'desc' },
        },
        payouts: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!partner) {
      res.status(404).json({ error: 'Not registered as partner' });
      return;
    }

    const monthlyEarnings = partner.referrals
      .filter(r => r.isActive)
      .reduce((sum, r) => sum + r.commission, 0);

    res.json({
      partner: {
        referralCode: partner.referralCode,
        tier: partner.tier,
        commissionRate: partner.commissionRate,
        totalEarnings: partner.totalEarnings,
        monthlyEarnings,
      },
      referrals: partner.referrals,
      payouts: partner.payouts,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch partner dashboard' });
  }
});

router.post('/request-payout', authenticate, async (req: Request, res: Response) => {
  try {
    const partner = await prisma.partner.findUnique({ where: { userId: req.user!.userId } });
    if (!partner) {
      res.status(404).json({ error: 'Not registered as partner' });
      return;
    }

    const unpaidAmount = partner.totalEarnings;
    const pendingPayouts = await prisma.partnerPayout.aggregate({
      where: { partnerId: partner.id, status: { in: ['PENDING', 'PROCESSING'] } },
      _sum: { amount: true },
    });

    const available = unpaidAmount - (pendingPayouts._sum.amount || 0);
    if (available <= 0) {
      res.status(400).json({ error: 'No available balance for payout' });
      return;
    }

    const payout = await prisma.partnerPayout.create({
      data: {
        partnerId: partner.id,
        amount: available,
        method: req.body.method || 'paypal',
      },
    });

    res.json(payout);
  } catch (error) {
    res.status(500).json({ error: 'Failed to request payout' });
  }
});

// Track referral (public, used during registration)
router.get('/track/:code', async (req: Request, res: Response) => {
  try {
    const partner = await prisma.partner.findUnique({ where: { referralCode: req.params.code } });
    if (!partner?.isActive) {
      res.status(404).json({ error: 'Invalid referral code' });
      return;
    }
    res.json({ valid: true, discount: '10% off first month' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate referral' });
  }
});

export default router;
