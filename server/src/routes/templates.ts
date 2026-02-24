import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { tier, category, siteType, search } = req.query;
    const where: any = { isActive: true, isApproved: true };
    if (tier) where.tier = tier;
    if (category) where.category = category;
    if (siteType) where.siteTypes = { has: siteType };
    if (search) where.name = { contains: search as string, mode: 'insensitive' };

    const templates = await prisma.template.findMany({
      where,
      include: { designer: { select: { profileName: true, rating: true } } },
      orderBy: { purchaseCount: 'desc' },
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const template = await prisma.template.findUnique({
      where: { id: req.params.id },
      include: { designer: { select: { profileName: true, rating: true, bio: true } } },
    });
    if (!template) { res.status(404).json({ error: 'Template not found' }); return; }
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

router.post('/:id/purchase', authenticate, async (req: Request, res: Response) => {
  try {
    const template = await prisma.template.findUnique({ where: { id: req.params.id } });
    if (!template) { res.status(404).json({ error: 'Template not found' }); return; }
    if (template.tier === 'CORE') {
      res.json({ message: 'Core templates are free', templateId: template.id });
      return;
    }

    const existing = await prisma.templatePurchase.findUnique({
      where: { userId_templateId: { userId: req.user!.userId, templateId: template.id } },
    });
    if (existing) {
      res.json({ message: 'Already purchased', templateId: template.id });
      return;
    }

    await prisma.$transaction([
      prisma.templatePurchase.create({
        data: { userId: req.user!.userId, templateId: template.id, amount: template.price },
      }),
      prisma.template.update({
        where: { id: template.id },
        data: { purchaseCount: { increment: 1 } },
      }),
    ]);

    res.json({ message: 'Template purchased', templateId: template.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to purchase template' });
  }
});

// Designer submission
router.post('/submit', authenticate, async (req: Request, res: Response) => {
  try {
    const designer = await prisma.designer.findUnique({ where: { userId: req.user!.userId } });
    if (!designer) {
      res.status(403).json({ error: 'You must be a registered designer' });
      return;
    }

    const { name, slug, category, siteTypes, price, previewUrl, thumbnailUrl, designTokens } = req.body;
    const template = await prisma.template.create({
      data: {
        name, slug, category,
        tier: 'MARKETPLACE',
        siteTypes: siteTypes || [],
        price: price || 0,
        previewUrl, thumbnailUrl, designTokens,
        designerId: designer.id,
        isApproved: false,
      },
    });
    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit template' });
  }
});

export default router;
