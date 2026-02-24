import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/request', authenticate, async (req: Request, res: Response) => {
  try {
    const { siteId } = req.body;
    const site = await prisma.site.findFirst({
      where: { id: siteId, userId: req.user!.userId },
    });
    if (!site) { res.status(404).json({ error: 'Site not found' }); return; }

    // Check minimum 3 months subscription
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (user) {
      const monthsActive = Math.floor((Date.now() - user.createdAt.getTime()) / (30 * 86400000));
      if (monthsActive < 3) {
        res.status(403).json({
          error: 'Exit Package requires at least 3 months of active subscription',
          monthsActive,
          monthsRequired: 3,
        });
        return;
      }
    }

    const existing = await prisma.exitRequest.findFirst({
      where: { userId: req.user!.userId, siteId, status: { in: ['PENDING', 'PROCESSING'] } },
    });
    if (existing) {
      res.json({ message: 'Request already in progress', request: existing });
      return;
    }

    const request = await prisma.exitRequest.create({
      data: {
        userId: req.user!.userId,
        siteId,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 86400000),
      },
    });

    res.status(201).json({
      message: 'Exit package request created. Estimated 48 hours for preparation.',
      request,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create exit request' });
  }
});

router.get('/status', authenticate, async (req: Request, res: Response) => {
  try {
    const requests = await prisma.exitRequest.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exit requests' });
  }
});

router.get('/download/:requestId', authenticate, async (req: Request, res: Response) => {
  try {
    const request = await prisma.exitRequest.findFirst({
      where: { id: req.params.requestId, userId: req.user!.userId, status: 'READY' },
    });
    if (!request?.downloadUrl) {
      res.status(404).json({ error: 'Download not available' });
      return;
    }
    if (request.expiresAt && request.expiresAt < new Date()) {
      res.status(410).json({ error: 'Download link expired' });
      return;
    }

    await prisma.exitRequest.update({ where: { id: request.id }, data: { status: 'DOWNLOADED' } });
    res.json({ downloadUrl: request.downloadUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get download' });
  }
});

// Free export: content + leads (always available)
router.get('/content/:siteId', authenticate, async (req: Request, res: Response) => {
  try {
    const site = await prisma.site.findFirst({
      where: { id: req.params.siteId, userId: req.user!.userId },
      include: {
        pages: true, services: true, contact: true,
        leads: { select: { name: true, email: true, phone: true, message: true, createdAt: true } },
      },
    });
    if (!site) { res.status(404).json({ error: 'Site not found' }); return; }

    res.json({
      business: { name: site.businessName, nameEn: site.businessNameEn, type: site.type, about: site.about },
      contact: site.contact,
      services: site.services,
      pages: site.pages.map(p => ({ title: p.title, slug: p.slug, sections: p.sections, seo: { title: p.seoTitle, description: p.seoDescription } })),
      leads: site.leads,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to export content' });
  }
});

export default router;
