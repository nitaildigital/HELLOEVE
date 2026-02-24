import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { requirePlan } from '../middleware/planGuard.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { vibeDesignSchema, designTokensSchema, validate } from '../utils/validation.js';
import { generateVibeDesign } from '../services/gemini.js';

const router = Router();

router.get('/:siteId', authenticate, async (req: Request, res: Response) => {
  try {
    const site = await prisma.site.findFirst({ where: { id: req.params.siteId, userId: req.user!.userId } });
    if (!site) { res.status(404).json({ error: 'Site not found' }); return; }

    let tokens = await prisma.designTokens.findUnique({ where: { siteId: req.params.siteId } });
    if (!tokens) {
      tokens = await prisma.designTokens.create({ data: { siteId: req.params.siteId } });
    }
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch design tokens' });
  }
});

router.put('/:siteId', authenticate, async (req: Request, res: Response) => {
  try {
    const data = validate(designTokensSchema, req.body);
    const tokens = await prisma.designTokens.upsert({
      where: { siteId: req.params.siteId },
      update: data,
      create: { siteId: req.params.siteId, ...data },
    });
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update design tokens' });
  }
});

router.post('/vibe', authenticate, requirePlan('PRO'), aiLimiter, async (req: Request, res: Response) => {
  try {
    const { prompt, siteId } = validate(vibeDesignSchema, req.body);

    const site = await prisma.site.findFirst({
      where: { id: siteId, userId: req.user!.userId },
      include: { designTokens: true },
    });
    if (!site) { res.status(404).json({ error: 'Site not found' }); return; }

    // Check credits
    const balance = await prisma.creditBalance.findUnique({ where: { userId: req.user!.userId } });
    const totalCredits = (balance?.monthly || 0) + (balance?.purchased || 0);
    if (totalCredits <= 0) {
      res.status(403).json({ error: 'No credits remaining', creditsRemaining: 0 });
      return;
    }

    const currentTokens = site.designTokens || {};
    const newTokens = await generateVibeDesign(prompt, {
      backgroundColor: (currentTokens as any).backgroundColor || '#FFFFFF',
      textColor: (currentTokens as any).textColor || '#14181f',
      primaryColor: (currentTokens as any).primaryColor || '#e33670',
      borderRadius: (currentTokens as any).borderRadius || '1rem',
      shadow: (currentTokens as any).shadow || 'shadow-2xl',
      spacing: (currentTokens as any).spacing || '4rem',
    });

    const updated = await prisma.designTokens.upsert({
      where: { siteId },
      update: newTokens,
      create: { siteId, ...newTokens },
    });

    // Deduct credit (monthly first, then purchased)
    if (balance) {
      if (balance.monthly > 0) {
        await prisma.creditBalance.update({ where: { userId: req.user!.userId }, data: { monthly: { decrement: 1 } } });
      } else {
        await prisma.creditBalance.update({ where: { userId: req.user!.userId }, data: { purchased: { decrement: 1 } } });
      }
      await prisma.creditTransaction.create({
        data: {
          userId: req.user!.userId,
          type: 'VIBE_DESIGN',
          amount: -1,
          balance: totalCredits - 1,
          note: prompt.slice(0, 100),
        },
      });
    }

    res.json({ tokens: updated, creditsRemaining: totalCredits - 1 });
  } catch (error) {
    console.error('Vibe Design error:', error);
    res.status(500).json({ error: 'Vibe Design generation failed' });
  }
});

export default router;
